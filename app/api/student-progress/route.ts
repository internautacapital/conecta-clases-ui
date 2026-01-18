import { authOptions } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errorMiddleware';
import {
  getCourses,
  getCourseWork,
  getStudents,
  getStudentSubmissions,
  getUserProfile,
  setAccessToken,
} from '@/lib/google';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export type StudentTaskSubmission = {
  taskId: string;
  taskTitle: string;
  state: string;
  assignedGrade?: number;
  maxPoints?: number;
  late?: boolean;
  dueDate?: string;
  submittedAt?: string;
};

export type StudentProgress = {
  userId: string;
  name: string;
  email?: string;
  courseId: string;
  courseName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  gradedTasks: number;
  averageGrade?: number;
  completionRate: number;
  submissions: StudentTaskSubmission[];
};

export type CourseStudentProgress = {
  courseId: string;
  courseName: string;
  section?: string;
  totalStudents: number;
  totalTasks: number;
  students: StudentProgress[];
};

export type StudentProgressResponse = {
  courses: CourseStudentProgress[];
  totalStudents: number;
  overallAverageCompletion: number;
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

    setAccessToken(accessToken);

    // Get all courses where user is a teacher
    const courses = await getCourses();
    const teacherCourses = courses.filter(
      course => course.teacherFolder || course.ownerId === session.user?.email
    );

    const coursesProgress: CourseStudentProgress[] = [];
    let totalStudentsCount = 0;
    let totalCompletionSum = 0;

    for (const course of teacherCourses) {
      if (!course.id) continue;

      try {
        // Get all coursework for this course
        const courseWork = await getCourseWork(course.id);

        // Get all students in this course
        const students = await getStudents(course.id);

        const studentsProgress: StudentProgress[] = [];

        for (const student of students) {
          const submissions: StudentTaskSubmission[] = [];
          let totalGradePoints = 0;
          let totalMaxPoints = 0;
          let gradedCount = 0;
          let completedCount = 0;

          for (const work of courseWork) {
            if (!work.id) continue;

            try {
              // Get submission for this student
              const studentSubmissions = await getStudentSubmissions(
                course.id,
                work.id,
                student.userId
              );

              const submission = studentSubmissions[0];

              const isCompleted =
                submission?.state === 'TURNED_IN' ||
                submission?.state === 'RETURNED';
              const isGraded = submission?.state === 'RETURNED';

              if (isCompleted) completedCount++;

              if (isGraded && submission?.assignedGrade != null) {
                gradedCount++;
                totalGradePoints += submission.assignedGrade;
                totalMaxPoints += work.maxPoints || 100;
              }

              // Format due date
              let dueDateStr: string | undefined;
              if (work.dueDate) {
                dueDateStr = `${work.dueDate.year}-${String(work.dueDate.month).padStart(2, '0')}-${String(work.dueDate.day).padStart(2, '0')}`;
              }

              submissions.push({
                taskId: work.id,
                taskTitle: work.title || 'Tarea sin título',
                state: submission?.state || 'NOT_SUBMITTED',
                assignedGrade: submission?.assignedGrade ?? undefined,
                maxPoints: work.maxPoints ?? undefined,
                late: submission?.late ?? undefined,
                dueDate: dueDateStr,
                submittedAt: submission?.updateTime ?? undefined,
              });
            } catch (error) {
              console.error(
                `Error getting submission for student ${student.userId} in work ${work.id}:`,
                error
              );
            }
          }

          const totalTasks = courseWork.length;
          const pendingTasks = totalTasks - completedCount;
          const completionRate =
            totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
          const averageGrade =
            totalMaxPoints > 0
              ? (totalGradePoints / totalMaxPoints) * 100
              : undefined;

          // Get user profile for email
          let email = student.email;
          if (!email) {
            try {
              const profile = await getUserProfile(student.userId);
              email = profile?.emailAddress ?? undefined;
            } catch {
              // Ignore error, email is optional
            }
          }

          studentsProgress.push({
            userId: student.userId,
            name: student.name,
            email,
            courseId: course.id,
            courseName: course.name || 'Curso sin nombre',
            totalTasks,
            completedTasks: completedCount,
            pendingTasks,
            gradedTasks: gradedCount,
            averageGrade,
            completionRate,
            submissions,
          });

          totalCompletionSum += completionRate;
        }

        totalStudentsCount += students.length;

        // Sort students by completion rate (lowest first to highlight those who need attention)
        studentsProgress.sort((a, b) => a.completionRate - b.completionRate);

        coursesProgress.push({
          courseId: course.id,
          courseName: course.name || 'Curso sin nombre',
          section: course.section ?? undefined,
          totalStudents: students.length,
          totalTasks: courseWork.length,
          students: studentsProgress,
        });
      } catch (error) {
        console.error(`Error processing course ${course.id}:`, error);
      }
    }

    const overallAverageCompletion =
      totalStudentsCount > 0 ? totalCompletionSum / totalStudentsCount : 0;

    const response: StudentProgressResponse = {
      courses: coursesProgress,
      totalStudents: totalStudentsCount,
      overallAverageCompletion,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('/api/student-progress error:', error);
    return createErrorResponse(error as Error, 500, true);
  }
}
