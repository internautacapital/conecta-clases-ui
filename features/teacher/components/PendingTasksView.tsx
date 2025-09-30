"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingTasks } from "@/hooks/usePendingTasks";
import { AlertCircle, Calendar, Mail, RefreshCw, Users } from "lucide-react";
import { useState } from "react";

export function PendingTasksView() {
  const { data, isLoading, error, refetch, isRefetching } = usePendingTasks();

  const [sendingEmails, setSendingEmails] = useState<string[]>([]);

  const handleSendReminder = async (
    taskId: string,
    taskTitle: string,
    courseName: string,
    dueDate: string | undefined,
    students: Array<{ email?: string; name: string }>
  ) => {
    setSendingEmails((prev) => [...prev, taskId]);

    try {
      const response = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          taskTitle,
          courseName,
          dueDate,
          students,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        let message = `✅ ${result.message}`;
        if (result.skipped > 0) {
          message += ` (${result.skipped} estudiantes sin email)`;
        }
        if (result.failed > 0) {
          message += `\n⚠️ ${result.failed} correos fallaron`;
        }
        console.log("message :>> ", message);
      } else {
        throw new Error(result.message || "Error desconocido");
      }
    } catch (error) {
      console.error("Error sending reminders:", error);
    } finally {
      setSendingEmails((prev) => prev.filter((id) => id !== taskId));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error al cargar tareas pendientes
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingTasks = data?.pendingTasks || [];
  const totalPendingStudents = pendingTasks.reduce(
    (sum, task) => sum + task.pendingStudents.length,
    0
  );

  if (pendingTasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Excelente!</h3>
            <p className="text-muted-foreground">
              No hay tareas pendientes en tus cursos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-bold">Tareas Pendientes</h1>
          <p className="text-muted-foreground">
            {pendingTasks.length} tareas con {totalPendingStudents} estudiantes
            pendientes
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isRefetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Tasks list */}
      <div className="space-y-4">
        {pendingTasks.map((task) => (
          <Card key={`${task.courseId}-${task.taskId}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{task.taskTitle}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{task.courseName}</Badge>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Vence:{" "}
                          {new Date(task.dueDate).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="destructive">
                  {task.pendingStudents.length} pendientes
                </Badge>
              </div>
              {task.taskDescription && (
                <p className="text-sm text-muted-foreground mt-2">
                  {task.taskDescription}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Students list */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Estudiantes con tareas pendientes:
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {task.pendingStudents.map((student) => (
                      <div
                        key={student.userId}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {student.name}
                          </p>
                          {student.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {student.email}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            student.submissionState === "NOT_SUBMITTED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="ml-2 text-xs"
                        >
                          {student.submissionState === "NOT_SUBMITTED"
                            ? "Sin entregar"
                            : student.submissionState === "NEW"
                            ? "Nuevo"
                            : student.submissionState === "CREATED"
                            ? "Creado"
                            : student.submissionState === "RECLAIMED_BY_STUDENT"
                            ? "Reclamado"
                            : student.submissionState}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Send reminder button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      handleSendReminder(
                        task.taskId,
                        task.taskTitle,
                        task.courseName,
                        task.dueDate,
                        task.pendingStudents
                      );
                    }}
                    disabled={sendingEmails.includes(task.taskId)}
                    size="sm"
                  >
                    {sendingEmails.includes(task.taskId) ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Recordatorio ({task.pendingStudents.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
