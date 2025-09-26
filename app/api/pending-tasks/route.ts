import { authOptions } from "@/lib/auth";
import { createErrorResponse } from "@/lib/errorMiddleware";
import {
  getCourses,
  getCourseWork,
  getStudentSubmissions,
  getStudents,
  setAccessToken,
  type StudentSubmission,
  getUserProfile,
} from "@/lib/google";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type PendingTask = {
  courseId: string;
  courseName: string;
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  pendingStudents: Array<{
    userId: string;
    name: string;
    email?: string;
    submissionState: string;
  }>;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Google access token in session" },
        { status: 400 }
      );
    }

    setAccessToken(accessToken);

    // Get all courses where user is a teacher
    const courses = await getCourses();
    const teacherCourses = courses.filter(
      (course) => course.teacherFolder || course.ownerId === session.user?.email
    );

    const pendingTasks: PendingTask[] = [];

    // For each teacher course, get coursework and check for pending submissions
    for (const course of teacherCourses) {
      if (!course.id) continue;

      try {
        // Get all coursework for this course
        const courseWork = await getCourseWork(course.id);

        // Get all students in this course
        const students = await getStudents(course.id);

        // For each coursework, check for pending submissions
        for (const work of courseWork) {
          if (!work.id) continue;

          try {
            // Get all submissions for this coursework
            const submissions = await getStudentSubmissions(course.id, work.id);

            // Helper function to get email from userId or student data
            const getStudentEmail = (
              student: { userId: string; name: string; email?: string },
              submission: StudentSubmission | undefined
            ) => {
              // First try student.email from the students list
              if (student.email) return student.email;

              // If userId looks like an email, use it
              if (student.userId && student.userId.includes("@")) {
                return student.userId;
              }

              // If submission userId looks like an email, use it
              if (submission?.userId && submission.userId.includes("@")) {
                return submission.userId;
              }

              return undefined;
            };

            // Find students with pending submissions and get their details
            const pendingStudentsPromises = students
              .filter((student) => {
                const submission = submissions.find(
                  (sub) => sub.userId === student.userId
                );

                // If no submission found, it's pending
                if (!submission) return true;

                // Check if submission state indicates it's pending
                const pendingStates = [
                  "NEW",
                  "CREATED",
                  "RECLAIMED_BY_STUDENT",
                ];
                return pendingStates.includes(submission.state || "NEW");
              })
              .map(async (student) => {
                const submission = submissions.find(
                  (sub) => sub.userId === student.userId
                );

                const userProfile = await getUserProfile(student.userId);

                return {
                  userId: student.userId,
                  name: student.name,
                  email: userProfile?.emailAddress ?? "",
                  submissionState: submission?.state || "NOT_SUBMITTED",
                };
              });

            // Resolve all promises to get the actual pending students data
            const pendingStudents = await Promise.all(pendingStudentsPromises);

            // Only add to pending tasks if there are students with pending work
            if (pendingStudents.length > 0) {
              pendingTasks.push({
                courseId: course.id,
                courseName: course.name || "Curso sin nombre",
                taskId: work.id,
                taskTitle: work.title || "Tarea sin título",
                taskDescription: work.description || undefined,
                dueDate: work.dueDate
                  ? `${work.dueDate.year}-${String(work.dueDate.month).padStart(
                      2,
                      "0"
                    )}-${String(work.dueDate.day).padStart(2, "0")}`
                  : undefined,
                pendingStudents,
              });
            }
          } catch (error) {
            console.error(
              `Error processing coursework ${work.id} in course ${course.id}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error(`Error processing course ${course.id}:`, error);
      }
    }

    // Sort by due date (closest first) and then by course name
    pendingTasks.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return a.courseName.localeCompare(b.courseName);
    });

    return NextResponse.json({ pendingTasks });
  } catch (error: unknown) {
    console.error("/api/pending-tasks error:", error);
    return createErrorResponse(error as Error, 500, true);
  }
}
