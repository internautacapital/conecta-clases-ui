import { authOptions } from "@/lib/auth";
import { createErrorResponse } from "@/lib/errorMiddleware";
import {
  sendBatchGmailMessages,
  setGmailAccessToken,
  type EmailMessage,
} from "@/lib/gmail";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export type MassReminderRequest = {
  tasks: Array<{
    taskId: string;
    taskTitle: string;
    courseName: string;
    dueDate?: string;
    students: Array<{
      name: string;
      email?: string;
    }>;
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: MassReminderRequest = await request.json();
    const { tasks } = body;

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Google access token in session" },
        { status: 400 }
      );
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json(
        { error: "No tasks provided" },
        { status: 400 }
      );
    }

    setGmailAccessToken(accessToken);

    // Collect all students with their corresponding tasks
    const studentTaskMap = new Map<
      string,
      {
        name: string;
        email: string;
        tasks: Array<{
          taskTitle: string;
          courseName: string;
          dueDate?: string;
        }>;
      }
    >();

    for (const task of tasks) {
      const studentsWithEmail = task.students.filter(
        (student) => student.email
      );

      for (const student of studentsWithEmail) {
        const email = student.email!;
        if (!studentTaskMap.has(email)) {
          studentTaskMap.set(email, {
            name: student.name,
            email: email,
            tasks: [],
          });
        }
        studentTaskMap.get(email)!.tasks.push({
          taskTitle: task.taskTitle,
          courseName: task.courseName,
          dueDate: task.dueDate,
        });
      }
    }

    if (studentTaskMap.size === 0) {
      return NextResponse.json(
        { error: "No students with valid email addresses found" },
        { status: 400 }
      );
    }

    // Create personalized emails for each student
    const emailMessages: EmailMessage[] = Array.from(
      studentTaskMap.values()
    ).map((studentData) => {
      const tasksList = studentData.tasks
        .map((task, index) => {
          return `${index + 1}. ${task.taskTitle} - ${task.courseName}${
            task.dueDate
              ? `\n   Fecha de entrega: ${new Date(task.dueDate).toLocaleDateString("es-ES")}`
              : ""
          }`;
        })
        .join("\n\n");

      const emailSubject =
        studentData.tasks.length === 1
          ? `Recordatorio: ${studentData.tasks[0].taskTitle}`
          : `Recordatorio: Tienes ${studentData.tasks.length} tareas pendientes`;

      const emailBody = `Hola ${studentData.name},

Este es un recordatorio de que tienes ${studentData.tasks.length === 1 ? "una tarea pendiente" : `${studentData.tasks.length} tareas pendientes`}:

${tasksList}

Por favor, completa y entrega tus tareas lo antes posible.

Saludos,
${session.user?.name || "Tu profesor"}

---
Este mensaje fue enviado automáticamente desde Conecta Clases.`;

      return {
        to: [studentData.email],
        subject: emailSubject,
        body: emailBody,
        from: session.user?.email || undefined,
      };
    });

    console.log("Sending mass reminder emails:", {
      totalTasks: tasks.length,
      totalStudents: studentTaskMap.size,
      totalEmails: emailMessages.length,
      teacherEmail: session.user?.email,
      teacherName: session.user?.name,
    });

    // Send emails using Gmail API with 500ms delay between emails
    const results = await sendBatchGmailMessages(emailMessages, 500);

    if (results.failed > 0) {
      console.error("Some emails failed to send:", results.errors);
    }

    // Count total students across all tasks (including duplicates)
    const totalStudentsInTasks = tasks.reduce(
      (sum, task) => sum + task.students.filter((s) => s.email).length,
      0
    );
    const skipped = totalStudentsInTasks - studentTaskMap.size;

    return NextResponse.json({
      success: results.sent > 0,
      message:
        results.failed === 0
          ? `Recordatorios enviados exitosamente a ${results.sent} estudiantes`
          : `Se enviaron ${results.sent} recordatorios, ${results.failed} fallaron`,
      sentTo: results.sent,
      failed: results.failed,
      skipped: skipped,
      totalTasks: tasks.length,
      errors: results.errors,
    });
  } catch (error: unknown) {
    console.error("/api/send-mass-reminder error:", error);
    return createErrorResponse(error as Error, 500);
  }
}
