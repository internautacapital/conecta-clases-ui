import { authOptions } from "@/lib/auth";
import { createErrorResponse } from "@/lib/errorMiddleware";
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

    // Validate required fields
    if (!taskId || !taskTitle || !courseName || !students || students.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Filter students with valid email addresses
    const studentsWithEmail = students.filter(student => student.email);
    
    if (studentsWithEmail.length === 0) {
      return NextResponse.json(
        { error: "No students with valid email addresses found" },
        { status: 400 }
      );
    }

    // TODO: Implement actual email sending logic
    // This is where you would integrate with your email service (SendGrid, Nodemailer, etc.)
    
    // Email template (for future implementation)
    const emailTemplate = {
      subject: `Recordatorio: ${taskTitle} - ${courseName}`,
      body: `
        Hola,

        Este es un recordatorio de que tienes una tarea pendiente:

        Curso: ${courseName}
        Tarea: ${taskTitle}
        ${dueDate ? `Fecha de entrega: ${new Date(dueDate).toLocaleDateString('es-ES')}` : ''}

        Por favor, completa y entrega tu tarea lo antes posible.

        Saludos,
        ${session.user?.name || 'Tu profesor'}
      `
    };

    // For now, we'll simulate the email sending
    console.log("Sending reminder emails:", {
      taskTitle,
      courseName,
      dueDate,
      recipients: studentsWithEmail.map(s => s.email),
      teacherEmail: session.user?.email,
      teacherName: session.user?.name,
      emailTemplate
    });

    // Here you would actually send the emails
    // Example with a hypothetical email service:
    /*
    const emailService = new EmailService();
    const emailPromises = studentsWithEmail.map(student => 
      emailService.send({
        to: student.email!,
        subject: emailSubject,
        text: emailBody,
        from: session.user?.email || 'noreply@conectaclases.com'
      })
    );
    
    await Promise.all(emailPromises);
    */

    // Simulate delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: `Recordatorios enviados a ${studentsWithEmail.length} estudiantes`,
      sentTo: studentsWithEmail.length,
      skipped: students.length - studentsWithEmail.length
    });

  } catch (error: unknown) {
    console.error("/api/send-reminder error:", error);
    return createErrorResponse(error as Error, 500);
  }
}
