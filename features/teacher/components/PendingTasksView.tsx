"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastNotification } from "@/components/ui/Toast";
import { useSendMassReminderMutation } from "@/features/teacher/hooks/useSendMassReminderMutation";
import { useSendReminderMutation } from "@/features/teacher/hooks/useSendReminderMutation";
import { usePendingTasks } from "@/hooks/usePendingTasks";
import {
  AlertCircle,
  Calendar,
  Mail,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import React from "react";

export function PendingTasksView() {
  const { data, isLoading, error, refetch, isFetching } = usePendingTasks();

  const [open, setOpen] = React.useState(false);
  const [sendingTaskId, setSendingTaskId] = React.useState<string | null>(null);
  const [toastData, setToastData] = React.useState<{
    title: string;
    description?: string;
    emailStats?: {
      sent?: number;
      failed?: number;
      skipped?: number;
      totalTasks?: number;
    };
    variant?: "success" | "warning" | "error";
  }>({ title: "Correos enviados" });

  const {
    mutate: sendReminder,
    isPending,
    isError,
    isSuccess,
    data: reminderData,
  } = useSendReminderMutation();

  const {
    mutate: sendMassReminder,
    isPending: isMassPending,
    isError: isMassError,
    isSuccess: isMassSuccess,
    data: massReminderData,
  } = useSendMassReminderMutation();

  // Handle success state for individual reminder
  React.useEffect(() => {
    if (isSuccess && reminderData) {
      setSendingTaskId(null);

      const variant =
        reminderData.failed && reminderData.failed > 0 ? "warning" : "success";
      setToastData({
        title: "Recordatorio enviado",
        description: reminderData.message,
        emailStats: {
          sent: reminderData.sentTo,
          failed: reminderData.failed,
          skipped: reminderData.skipped,
        },
        variant,
      });

      setOpen(true);
    }
  }, [isSuccess, reminderData]);

  // Handle success state for mass reminder
  React.useEffect(() => {
    if (isMassSuccess && massReminderData) {
      setSendingTaskId(null);

      const variant = massReminderData.failed > 0 ? "warning" : "success";
      setToastData({
        title: "Recordatorios masivos enviados",
        description: massReminderData.message,
        emailStats: {
          sent: massReminderData.sentTo,
          failed: massReminderData.failed,
          skipped: massReminderData.skipped,
          totalTasks: massReminderData.totalTasks,
        },
        variant,
      });

      setOpen(true);
    }
  }, [isMassSuccess, massReminderData]);

  React.useEffect(() => {
    if (isError) {
      setSendingTaskId(null);
    }
  }, [isError]);

  if (isLoading && isFetching) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64 bg-gray-200" />
          <Skeleton className="h-10 w-32 bg-gray-200" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-gray-200" />
              <Skeleton className="h-4 w-1/2 bg-gray-200" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full bg-gray-200" />
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
        <div className="flex gap-2">
          <Button
            onClick={() => {
              sendMassReminder({
                tasks: pendingTasks.map((task) => ({
                  taskId: task.taskId,
                  taskTitle: task.taskTitle,
                  courseName: task.courseName,
                  dueDate: task.dueDate,
                  students: task.pendingStudents,
                })),
              });
            }}
            disabled={isMassPending || totalPendingStudents === 0}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar a Todos ({totalPendingStudents})
          </Button>
        </div>
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
                      setSendingTaskId(task.taskId);
                      sendReminder({
                        taskId: task.taskId,
                        taskTitle: task.taskTitle,
                        courseName: task.courseName,
                        dueDate: task.dueDate,
                        students: task.pendingStudents,
                      });
                    }}
                    disabled={isPending && sendingTaskId === task.taskId}
                    size="sm"
                  >
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Recordatorio ({task.pendingStudents.length})
                    </div>
                  </Button>
                </div>
                {isError && (
                  <div className="text-sm text-red-500">
                    Error al enviar recordatorio
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mass reminder error */}
      {isMassError && (
        <Card className="border-red-500">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">
                Error al enviar recordatorios masivos. Por favor, intenta de
                nuevo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <ToastNotification
        open={open}
        setOpen={setOpen}
        title={toastData.title}
        description={toastData.description}
        emailStats={toastData.emailStats}
        variant={toastData.variant}
      />
    </div>
  );
}
