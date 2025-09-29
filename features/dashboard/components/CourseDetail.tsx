"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DashboardCourse, CourseWorkWithSubmissions } from "@/app/api/dashboard/route"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ExternalLink, 
  FileText, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  UserCheck
} from "lucide-react"

interface CourseDetailProps {
  course: DashboardCourse
  onBack: () => void
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return null
    }
  }

  const formatDueDate = (dueDate?: { year?: number; month?: number; day?: number }, dueTime?: { hours?: number; minutes?: number }) => {
    if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) return null
    
    try {
      const date = new Date(dueDate.year, dueDate.month - 1, dueDate.day)
      let result = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      
      if (dueTime && dueTime.hours !== undefined && dueTime.minutes !== undefined) {
        result += ` a las ${dueTime.hours.toString().padStart(2, '0')}:${dueTime.minutes.toString().padStart(2, '0')}`
      }
      
      return result
    } catch {
      return null
    }
  }

  const getTurnedInTimestamp = (userSubmission?: CourseWorkWithSubmissions['userSubmission']): string | undefined => {
    if (!userSubmission?.submissionHistory) return undefined
    
    // Find the state history entry where the submission was turned in
    for (const history of userSubmission.submissionHistory) {
      if (history.stateHistory?.state === 'TURNED_IN' && history.stateHistory?.stateTimestamp) {
        return history.stateHistory.stateTimestamp
      }
    }
    
    return undefined
  }

  const getSubmissionStatusBadge = (work: CourseWorkWithSubmissions) => {
    if (course.role === 'student') {
      if (!work.userSubmission) {
        return <Badge variant="secondary">Sin entregar</Badge>
      }
      
      switch (work.userSubmission.state) {
        case 'TURNED_IN':
          return <Badge variant="default" className="bg-blue-100 text-blue-800">Entregada</Badge>
        case 'RETURNED':
          return <Badge variant="default" className="bg-green-100 text-green-800">Calificada</Badge>
        case 'CREATED':
          return <Badge variant="outline">En progreso</Badge>
        default:
          return <Badge variant="secondary">Sin entregar</Badge>
      }
    } else {
      // Teacher view - show class statistics
      const percentage = work.totalSubmissions > 0 ? (work.turnedInSubmissions / work.totalSubmissions) * 100 : 0
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {work.turnedInSubmissions}/{work.totalSubmissions} entregadas
          </Badge>
          <span className="text-sm text-muted-foreground">
            ({percentage.toFixed(0)}%)
          </span>
        </div>
      )
    }
  }

  const getStatusIcon = (work: CourseWorkWithSubmissions) => {
    if (course.role === 'student') {
      if (!work.userSubmission || work.userSubmission.state === 'NEW') {
        return <XCircle className="h-4 w-4 text-red-500" />
      }
      if (work.userSubmission.state === 'TURNED_IN' || work.userSubmission.state === 'RETURNED') {
        return <CheckCircle className="h-4 w-4 text-green-500" />
      }
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    } else {
      const percentage = work.totalSubmissions > 0 ? (work.turnedInSubmissions / work.totalSubmissions) * 100 : 0
      if (percentage >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />
      if (percentage >= 50) return <AlertCircle className="h-4 w-4 text-yellow-500" />
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const RoleIcon = course.role === 'teacher' ? UserCheck : GraduationCap

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-xl">{course.name}</CardTitle>
              <Badge variant={course.role === 'teacher' ? 'default' : 'secondary'}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {course.role === 'teacher' ? 'Profesor' : 'Estudiante'}
              </Badge>
            </div>
            <div className="space-y-1">
              {course.section && (
                <CardDescription>Sección: {course.section}</CardDescription>
              )}
              {course.room && (
                <CardDescription>Aula: {course.room}</CardDescription>
              )}
              {course.description && (
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              )}
            </div>
          </div>
          {course.alternateLink && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(course.alternateLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir en Classroom
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{course.totalAssignments}</div>
            <div className="text-sm text-muted-foreground">Total Tareas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{course.completedAssignments}</div>
            <div className="text-sm text-muted-foreground">
              {course.role === 'teacher' ? 'Entregadas' : 'Completadas'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{course.pendingAssignments}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Course Work List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tareas y Actividades</h3>
          
          {course.courseWork.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No hay tareas</h4>
              <p className="text-muted-foreground">
                Este curso no tiene tareas asignadas aún.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {course.courseWork.map((work) => (
                  <Card key={work.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(work)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{work.title}</h4>
                            {work.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {work.description}
                              </p>
                            )}
                          </div>
                          {getSubmissionStatusBadge(work)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {work.creationTime && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Creada: {formatDate(work.creationTime)}</span>
                            </div>
                          )}
                          
                          {formatDueDate(work.dueDate, work.dueTime) && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Vence: {formatDueDate(work.dueDate, work.dueTime)}</span>
                            </div>
                          )}
                          
                          {work.maxPoints && (
                            <div className="flex items-center gap-1">
                              <span>Puntos: {work.maxPoints}</span>
                            </div>
                          )}
                        </div>

                        {course.role === 'teacher' && work.totalSubmissions > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3" />
                            <span>
                              {work.turnedInSubmissions} de {work.totalSubmissions} estudiantes han entregado
                            </span>
                            {work.gradedSubmissions > 0 && (
                              <span className="text-muted-foreground">
                                ({work.gradedSubmissions} calificadas)
                              </span>
                            )}
                          </div>
                        )}

                        {course.role === 'student' && work.userSubmission && getTurnedInTimestamp(work.userSubmission) && (
                          <div className="text-sm text-muted-foreground">
                            Entregada: {formatDate(getTurnedInTimestamp(work.userSubmission) ?? undefined)}
                          </div>
                        )}

                        {work.alternateLink && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(work.alternateLink, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver en Classroom
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
