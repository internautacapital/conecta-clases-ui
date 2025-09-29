import { authOptions } from "@/lib/auth";
import { createErrorResponse } from "@/lib/errorMiddleware";
import {
  sendBatchGmailMessages,
  setGmailAccessToken,
  type EmailMessage,
} from "@/lib/gmail";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export type ReminderRequest = {
  taskId: string;
  taskTitle: string;
  courseName: string;
  dueDate?: string;
  students: Array<{
    name: string;
    email?: string;
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ReminderRequest = await request.json();
    const { taskId, taskTitle, courseName, dueDate, students } = body;

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Google access token in session" },
        { status: 400 }
      );
    }
    if (
      !taskId ||
      !taskTitle ||
      !courseName ||
      !students ||
      students.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const studentsWithEmail = students.filter((student) => student.email);

    if (studentsWithEmail.length === 0) {
      return NextResponse.json(
        { error: "No students with valid email addresses found" },
        { status: 400 }
      );
    }

    setGmailAccessToken(accessToken);

    const emailSubject = `Recordatorio: ${taskTitle} - ${courseName}`;
    const emailBody = `Hola,

Este es un recordatorio de que tienes una tarea pendiente:

Curso: ${courseName}
Tarea: ${taskTitle}${
      dueDate
        ? `
Fecha de entrega: ${new Date(dueDate).toLocaleDateString("es-ES")}`
        : ""
    }

Por favor, completa y entrega tu tarea lo antes posible.

Saludos,
${session.user?.name || "Tu profesor"}

---
Este mensaje fue enviado automáticamente desde Conecta Clases.`;

    // Prepare email messages for each student
    const emailMessages: EmailMessage[] = studentsWithEmail.map((student) => ({
      to: [student.email!],
      subject: emailSubject,
      body: emailBody,
      from: session.user?.email || undefined,
    }));

    console.log("Sending reminder emails:", {
      taskTitle,
      courseName,
      dueDate,
      recipients: studentsWithEmail.map((s) => s.email),
      teacherEmail: session.user?.email,
      teacherName: session.user?.name,
      totalEmails: emailMessages.length,
    });

    // Send emails using Gmail API
    const results = await sendBatchGmailMessages(emailMessages, 500); // 500ms delay between emails

    if (results.failed > 0) {
      console.error("Some emails failed to send:", results.errors);
    }

    return NextResponse.json({
      success: results.sent > 0,
      message:
        results.failed === 0
          ? `Recordatorios enviados exitosamente a ${results.sent} estudiantes`
          : `Se enviaron ${results.sent} recordatorios, ${results.failed} fallaron`,
      sentTo: results.sent,
      failed: results.failed,
      skipped: students.length - studentsWithEmail.length,
      errors: results.errors,
    });
  } catch (error: unknown) {
    console.error("/api/send-reminder error:", error);
    return createErrorResponse(error as Error, 500);
  }
}
