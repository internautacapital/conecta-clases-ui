'use client';

import type { DashboardCourse } from '@/app/api/dashboard/route';
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
import {
  BookOpen,
  CheckCircle,
  Clock,
  ExternalLink,
  GraduationCap,
  UserCheck,
} from 'lucide-react';

interface CourseCardProps {
  course: DashboardCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  const completionRate =
    course.totalAssignments > 0
      ? (course.completedAssignments / course.totalAssignments) * 100
      : 0;

  const getRoleIcon = (role: 'teacher' | 'student') => {
    return role === 'teacher' ? UserCheck : GraduationCap;
  };

  const getRoleBadgeVariant = (role: 'teacher' | 'student') => {
    return role === 'teacher' ? 'default' : 'secondary';
  };

  const RoleIcon = getRoleIcon(course.role);

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1 flex-1'>
            <CardTitle className='text-lg leading-tight'>
              {course.name}
            </CardTitle>
            {course.section && (
              <CardDescription className='text-sm'>
                Sección: {course.section}
              </CardDescription>
            )}
            {course.room && (
              <CardDescription className='text-sm'>
                Aula: {course.room}
              </CardDescription>
            )}
          </div>
          <Badge variant={getRoleBadgeVariant(course.role)} className='ml-2'>
            <RoleIcon className='h-3 w-3 mr-1' />
            {course.role === 'teacher' ? 'Profesor' : 'Estudiante'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Progress Bar */}
        {course.totalAssignments > 0 && (
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Progreso</span>
              <span className='font-medium'>{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} className='h-2' />
          </div>
        )}

        {/* Stats */}
        <div className='grid grid-cols-3 gap-2 text-center'>
          <div className='space-y-1'>
            <div className='flex items-center justify-center'>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </div>
            <div className='text-lg font-semibold'>
              {course.totalAssignments}
            </div>
            <div className='text-xs text-muted-foreground'>Tareas</div>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center justify-center'>
              <CheckCircle className='h-4 w-4 text-green-600' />
            </div>
            <div className='text-lg font-semibold text-green-600'>
              {course.completedAssignments}
            </div>
            <div className='text-xs text-muted-foreground'>
              {course.role === 'teacher' ? 'Entregadas' : 'Completadas'}
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center justify-center'>
              <Clock className='h-4 w-4 text-yellow-600' />
            </div>
            <div className='text-lg font-semibold text-yellow-600'>
              {course.pendingAssignments}
            </div>
            <div className='text-xs text-muted-foreground'>Pendientes</div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-2 pt-2'>
          {course.alternateLink && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.open(course.alternateLink, '_blank')}
            >
              Ver en Google Classroom
              <ExternalLink className='h-4 w-4 mx-2' />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
