'use client';

import type {
  CourseStudentProgress,
  StudentProgress,
  StudentTaskSubmission,
} from '@/app/api/student-progress/route';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStudentProgress } from '@/features/teacher/hooks/useStudentProgress';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import React from 'react';

function getSubmissionStateBadge(state: string) {
  switch (state) {
    case 'TURNED_IN':
      return (
        <Badge variant='default' className='bg-blue-500'>
          Entregado
        </Badge>
      );
    case 'RETURNED':
      return (
        <Badge variant='default' className='bg-green-500'>
          Calificado
        </Badge>
      );
    case 'RECLAIMED_BY_STUDENT':
      return <Badge variant='secondary'>Reclamado</Badge>;
    case 'CREATED':
      return <Badge variant='outline'>En progreso</Badge>;
    case 'NEW':
    case 'NOT_SUBMITTED':
    default:
      return <Badge variant='destructive'>Pendiente</Badge>;
  }
}

function StudentTasksTable({
  submissions,
}: {
  submissions: StudentTaskSubmission[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarea</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Calificación</TableHead>
          <TableHead>Fecha límite</TableHead>
          <TableHead>Entregado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map(submission => (
          <TableRow key={submission.taskId}>
            <TableCell className='font-medium'>{submission.taskTitle}</TableCell>
            <TableCell>
              <div className='flex items-center gap-2'>
                {getSubmissionStateBadge(submission.state)}
                {submission.late && (
                  <Badge variant='outline' className='text-orange-500 border-orange-500'>
                    Tarde
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {submission.assignedGrade !== undefined ? (
                <span className='font-medium'>
                  {submission.assignedGrade}/{submission.maxPoints || 100}
                </span>
              ) : (
                <span className='text-muted-foreground'>-</span>
              )}
            </TableCell>
            <TableCell>
              {submission.dueDate ? (
                new Date(submission.dueDate).toLocaleDateString('es-ES')
              ) : (
                <span className='text-muted-foreground'>Sin fecha</span>
              )}
            </TableCell>
            <TableCell>
              {submission.submittedAt ? (
                new Date(submission.submittedAt).toLocaleDateString('es-ES')
              ) : (
                <span className='text-muted-foreground'>-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StudentCard({ student }: { student: StudentProgress }) {
  const [expanded, setExpanded] = React.useState(false);

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className='mb-3'>
      <CardHeader className='py-3'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => setExpanded(!expanded)}
        >
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-8 h-8 rounded-full bg-muted'>
              <GraduationCap className='h-4 w-4' />
            </div>
            <div>
              <CardTitle className='text-base'>{student.name}</CardTitle>
              {student.email && (
                <CardDescription className='text-xs'>
                  {student.email}
                </CardDescription>
              )}
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Progreso:</span>
                <span
                  className={`font-semibold ${getProgressColor(student.completionRate)}`}
                >
                  {student.completionRate.toFixed(0)}%
                </span>
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>
                  {student.completedTasks}/{student.totalTasks} tareas
                </span>
                {student.averageGrade !== undefined && (
                  <>
                    <span>•</span>
                    <span>Promedio: {student.averageGrade.toFixed(1)}%</span>
                  </>
                )}
              </div>
            </div>
            {expanded ? (
              <ChevronDown className='h-5 w-5 text-muted-foreground' />
            ) : (
              <ChevronRight className='h-5 w-5 text-muted-foreground' />
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className='pt-0'>
          <div className='space-y-4'>
            {/* Progress bar */}
            <div className='space-y-2'>
              <Progress value={student.completionRate} className='h-2' />
            </div>

            {/* Stats grid */}
            <div className='grid grid-cols-4 gap-2 text-center'>
              <div className='p-2 bg-muted rounded-md'>
                <div className='text-lg font-semibold'>{student.totalTasks}</div>
                <div className='text-xs text-muted-foreground'>Total</div>
              </div>
              <div className='p-2 bg-muted rounded-md'>
                <div className='text-lg font-semibold text-green-600'>
                  {student.completedTasks}
                </div>
                <div className='text-xs text-muted-foreground'>Completadas</div>
              </div>
              <div className='p-2 bg-muted rounded-md'>
                <div className='text-lg font-semibold text-yellow-600'>
                  {student.pendingTasks}
                </div>
                <div className='text-xs text-muted-foreground'>Pendientes</div>
              </div>
              <div className='p-2 bg-muted rounded-md'>
                <div className='text-lg font-semibold text-blue-600'>
                  {student.gradedTasks}
                </div>
                <div className='text-xs text-muted-foreground'>Calificadas</div>
              </div>
            </div>

            {/* Tasks table */}
            {student.submissions.length > 0 && (
              <div className='border rounded-md overflow-hidden'>
                <StudentTasksTable submissions={student.submissions} />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function CourseProgressCard({ course }: { course: CourseStudentProgress }) {
  const [expanded, setExpanded] = React.useState(true);

  const averageCompletion =
    course.students.length > 0
      ? course.students.reduce((sum, s) => sum + s.completionRate, 0) /
        course.students.length
      : 0;

  const studentsWithPending = course.students.filter(
    s => s.pendingTasks > 0
  ).length;

  return (
    <Card className='mb-6'>
      <CardHeader>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <CardTitle className='text-xl flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              {course.courseName}
            </CardTitle>
            {course.section && (
              <CardDescription>Sección: {course.section}</CardDescription>
            )}
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium'>{course.totalStudents}</span>
                  <span className='text-sm text-muted-foreground'>
                    estudiantes
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <TrendingUp className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium'>
                    {averageCompletion.toFixed(0)}%
                  </span>
                  <span className='text-sm text-muted-foreground'>promedio</span>
                </div>
              </div>
              {studentsWithPending > 0 && (
                <div className='text-sm text-yellow-600 mt-1'>
                  {studentsWithPending} estudiantes con tareas pendientes
                </div>
              )}
            </div>
            {expanded ? (
              <ChevronDown className='h-5 w-5 text-muted-foreground' />
            ) : (
              <ChevronRight className='h-5 w-5 text-muted-foreground' />
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          {/* Course summary */}
          <div className='grid grid-cols-3 gap-4 mb-6'>
            <div className='p-4 bg-muted rounded-lg text-center'>
              <div className='flex items-center justify-center mb-2'>
                <BookOpen className='h-5 w-5 text-muted-foreground' />
              </div>
              <div className='text-2xl font-bold'>{course.totalTasks}</div>
              <div className='text-sm text-muted-foreground'>Tareas totales</div>
            </div>
            <div className='p-4 bg-muted rounded-lg text-center'>
              <div className='flex items-center justify-center mb-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
              <div className='text-2xl font-bold text-green-600'>
                {course.students.filter(s => s.completionRate === 100).length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Estudiantes al día
              </div>
            </div>
            <div className='p-4 bg-muted rounded-lg text-center'>
              <div className='flex items-center justify-center mb-2'>
                <Clock className='h-5 w-5 text-yellow-600' />
              </div>
              <div className='text-2xl font-bold text-yellow-600'>
                {studentsWithPending}
              </div>
              <div className='text-sm text-muted-foreground'>
                Con tareas pendientes
              </div>
            </div>
          </div>

          {/* Students list */}
          <div>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Progreso por estudiante
            </h3>
            {course.students.map(student => (
              <StudentCard key={student.userId} student={student} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function StudentProgressView() {
  const { data, isLoading, error, refetch, isRefetching, isFetching } =
    useStudentProgress();

  if (isLoading && isFetching) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-64 bg-gray-200' />
          <Skeleton className='h-10 w-32 bg-gray-200' />
        </div>
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-6 w-3/4 bg-gray-200' />
              <Skeleton className='h-4 w-1/2 bg-gray-200' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-40 w-full bg-gray-200' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center'>
            <AlertCircle className='h-12 w-12 mx-auto text-red-500 mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              Error al cargar progreso de estudiantes
            </h3>
            <p className='text-muted-foreground mb-4'>
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <Button onClick={() => refetch()} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { courses, totalStudents, overallAverageCompletion } = data;

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center'>
            <Users className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Sin estudiantes</h3>
            <p className='text-muted-foreground'>
              No hay estudiantes asignados en tus cursos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between pt-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Progreso de Estudiantes
          </h1>
          <p className='text-muted-foreground'>
            {totalStudents} estudiantes en {courses.length} cursos • Promedio
            general: {overallAverageCompletion.toFixed(0)}%
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant='outline'
          size='sm'
          disabled={isRefetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Overall stats */}
      <div className='grid grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-blue-100 rounded-full'>
                <Users className='h-6 w-6 text-blue-600' />
              </div>
              <div>
                <div className='text-2xl font-bold'>{totalStudents}</div>
                <div className='text-sm text-muted-foreground'>
                  Total estudiantes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-green-100 rounded-full'>
                <TrendingUp className='h-6 w-6 text-green-600' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {overallAverageCompletion.toFixed(0)}%
                </div>
                <div className='text-sm text-muted-foreground'>
                  Promedio completado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-green-100 rounded-full'>
                <CheckCircle className='h-6 w-6 text-green-600' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {courses.reduce(
                    (sum, c) =>
                      sum + c.students.filter(s => s.completionRate === 100).length,
                    0
                  )}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Estudiantes al día
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-yellow-100 rounded-full'>
                <Clock className='h-6 w-6 text-yellow-600' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {courses.reduce(
                    (sum, c) =>
                      sum + c.students.filter(s => s.pendingTasks > 0).length,
                    0
                  )}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Con pendientes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses with student progress */}
      <div>
        {courses.map(course => (
          <CourseProgressCard key={course.courseId} course={course} />
        ))}
      </div>
    </div>
  );
}
