"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/features/teacher/components/CourseCard";
import { useTeacherDashboard } from "@/features/teacher/hooks/useDashboard";
import { usePendingTasks } from "@/hooks/usePendingTasks";
import { AlertCircle, RefreshCw } from "lucide-react";

export function MyCourses() {
  const { data, isLoading, error, refetch, isRefetching, isFetching } =
    useTeacherDashboard();

  const { refetch: refetchPendingTasks } = usePendingTasks();

  const update = () => {
    refetchPendingTasks();
    refetch();
  };

  if (isLoading && isFetching) {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al cargar
            </CardTitle>
            <CardDescription>
              No se pudo cargar la información del dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { teacherCourses } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis cursos</h1>
          <p className="text-muted-foreground">
            Resumen de tus cursos y tareas en Google Classroom como maestro
          </p>
        </div>
        <Button
          onClick={() => update()}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teacherCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
