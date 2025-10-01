import { authOptions } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errorMiddleware';
import {
  getCoursesWithRoles,
  getCourseWork,
  getStudents,
  getStudentSubmissions,
  setAccessToken,
} from '@/lib/google';
import type { classroom_v1 } from 'googleapis';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// Helper function to safely convert Google API string values that can be null to undefined
function convertNullToUndefined(
  value: string | null | undefined
): string | undefined {
  return value ?? undefined;
}

// Helper function to convert Google's Schema$Date to our expected format
function convertSchemaDate(schemaDate: classroom_v1.Schema$Date | undefined):
  | {
      year?: number;
      month?: number;
      day?: number;
    }
  | undefined {
  if (!schemaDate) return undefined;

  return {
    year: schemaDate.year ?? undefined,
    month: schemaDate.month ?? undefined,
    day: schemaDate.day ?? undefined,
  };
}

export type CourseWorkWithSubmissions = {
  id: string;
  title: string;
  description?: string;
  materials?: classroom_v1.Schema$Material[];
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
  };
  maxPoints?: number;
  workType?: string;
  submissionModificationMode?: string;
  totalSubmissions: number;
  turnedInSubmissions: number;
  gradedSubmissions: number;
  userSubmission?: {
    id: string;
    state: string;
    updateTime?: string;
    submissionHistory?: Array<{
      stateHistory?: {
        state?: string;
        stateTimestamp?: string;
        actorUserId?: string;
      } | null;
    }> | null;
  };
};

export type DashboardCourse = {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  alternateLink?: string;
  role: 'teacher' | 'student';
  courseWork: CourseWorkWithSubmissions[];
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
};

export type UserInfo = {
  teacherCourses: DashboardCourse[];
  studentCourses: DashboardCourse[];
  totalCourses: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing Google access token in session' },
        { status: 400 }
      );
    }

    const userEmail = session.user?.id;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing user email in session' },
        { status: 400 }
      );
    }

    setAccessToken(accessToken);

    // Get courses with roles
    const coursesWithRoles = await getCoursesWithRoles(userEmail);
    const teacherCourses: DashboardCourse[] = [];
    const studentCourses: DashboardCourse[] = [];

    // Process each course
    for (const course of coursesWithRoles) {
      try {
        // Get course work
        const courseWork = await getCourseWork(course.id);
        const courseWorkWithSubmissions: CourseWorkWithSubmissions[] = [];

        for (const work of courseWork) {
          if (!work.id) continue;

          try {
            // Get all submissions for this assignment
            const allSubmissions = await getStudentSubmissions(
              course.id,
              work.id
            );

            // Count submissions by state
            const totalSubmissions = allSubmissions.length;
            const turnedInSubmissions = allSubmissions.filter(
              s => s.state === 'TURNED_IN' || s.state === 'RETURNED'
            ).length;
            const gradedSubmissions = allSubmissions.filter(
              s => s.state === 'RETURNED'
            ).length;

            // Find user's submission if they are a student
            let userSubmission = undefined;
            if (course.role === 'student') {
              // Get all students to find the user's ID
              const students = await getStudents(course.id);
              const currentUser = students.find(s => s.email === userEmail);

              if (currentUser) {
                const userSub = allSubmissions.find(
                  s => s.userId === currentUser.userId
                );
                if (userSub) {
                  // Convert submission history to match our type definition
                  const convertedSubmissionHistory =
                    userSub.submissionHistory?.map(history => ({
                      stateHistory: history.stateHistory
                        ? {
                            state: convertNullToUndefined(
                              history.stateHistory.state
                            ),
                            stateTimestamp: convertNullToUndefined(
                              history.stateHistory.stateTimestamp
                            ),
                            actorUserId: convertNullToUndefined(
                              history.stateHistory.actorUserId
                            ),
                          }
                        : null,
                    })) || undefined;

                  userSubmission = {
                    id: userSub.id || '',
                    state: userSub.state || 'NEW',
                    updateTime: userSub.updateTime || undefined,
                    submissionHistory: convertedSubmissionHistory,
                  };
                }
              }
            }

            courseWorkWithSubmissions.push({
              id: work.id,
              title: work.title || 'Tarea sin título',
              description: work.description || undefined,
              materials: work.materials || undefined,
              state: work.state || undefined,
              alternateLink: work.alternateLink || undefined,
              creationTime: work.creationTime || undefined,
              updateTime: work.updateTime || undefined,
              dueDate: convertSchemaDate(work.dueDate),
              dueTime: work.dueTime
                ? {
                    hours: work.dueTime.hours ?? undefined,
                    minutes: work.dueTime.minutes ?? undefined,
                  }
                : undefined,
              maxPoints: work.maxPoints || undefined,
              workType: work.workType || undefined,
              submissionModificationMode:
                work.submissionModificationMode || undefined,
              totalSubmissions,
              turnedInSubmissions,
              gradedSubmissions,
              userSubmission,
            });
          } catch (error) {
            console.error(`Error processing courseWork ${work.id}:`, error);
            // Continue with other assignments even if one fails
          }
        }

        // Calculate statistics
        const totalAssignments = courseWorkWithSubmissions.length;

        let completedAssignments = 0;
        let pendingAssignments = 0;

        if (course.role === 'student') {
          completedAssignments = courseWorkWithSubmissions.filter(
            cw =>
              cw.userSubmission &&
              (cw.userSubmission.state === 'TURNED_IN' ||
                cw.userSubmission.state === 'RETURNED')
          ).length;
          pendingAssignments = totalAssignments - completedAssignments;
        } else {
          // For teachers, show overall class completion
          completedAssignments = courseWorkWithSubmissions.reduce(
            (acc, cw) => acc + cw.turnedInSubmissions,
            0
          );
          pendingAssignments = courseWorkWithSubmissions.reduce(
            (acc, cw) => acc + (cw.totalSubmissions - cw.turnedInSubmissions),
            0
          );
        }
        const dashboardCourse: DashboardCourse = {
          id: course.id,
          name: course.name,
          section: course.section,
          description: course.description,
          room: course.room,
          alternateLink: course.alternateLink,
          role: course.role,
          courseWork: courseWorkWithSubmissions,
          totalAssignments,
          completedAssignments,
          pendingAssignments,
        };

        if (course.role === 'teacher') {
          teacherCourses.push(dashboardCourse);
        } else {
          studentCourses.push(dashboardCourse);
        }
      } catch (error) {
        console.error(`Error processing course ${course.id}:`, error);
        // Continue with other courses even if one fails
      }
    }

    // Calculate overall statistics
    const totalCourses = teacherCourses.length + studentCourses.length;
    const totalAssignments = [...teacherCourses, ...studentCourses].reduce(
      (acc, course) => acc + course.totalAssignments,
      0
    );
    const completedAssignments = [...teacherCourses, ...studentCourses].reduce(
      (acc, course) => acc + course.completedAssignments,
      0
    );
    const pendingAssignments = [...teacherCourses, ...studentCourses].reduce(
      (acc, course) => acc + course.pendingAssignments,
      0
    );

    const dashboardData: UserInfo = {
      teacherCourses,
      studentCourses,
      totalCourses,
      totalAssignments,
      completedAssignments,
      pendingAssignments,
    };

    return NextResponse.json(dashboardData);
  } catch (error: unknown) {
    console.error('/api/dashboard error:', error);
    return createErrorResponse(error as Error, 500, true);
  }
}
