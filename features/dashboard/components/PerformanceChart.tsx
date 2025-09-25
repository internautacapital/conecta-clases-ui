"use client"

import { useClientOnly } from "@/hooks/useClientOnly"
import type { StudentDashboardData } from "../services/studentDashboardService"

type Props = {
  data: StudentDashboardData
}

export function PerformanceChart({ data }: Props) {
  const isClient = useClientOnly()

  // Calculate average grade across all courses
  const coursesWithGrades = data.courses.filter(c => c.averageGrade !== undefined)
  const overallGrade = coursesWithGrades.length > 0 
    ? coursesWithGrades.reduce((sum, c) => sum + c.averageGrade!, 0) / coursesWithGrades.length
    : 0

  const getGradeColor = (grade: number) => {
    if (grade >= 4.0) return 'text-green-600'
    if (grade >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeBgColor = (grade: number) => {
    if (grade >= 4.0) return 'bg-green-100'
    if (grade >= 3.0) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getPerformanceMessage = (grade: number, progress: number) => {
    if (grade >= 4.0 && progress >= 80) return '¡Excelente trabajo! Sigue así 🌟'
    if (grade >= 3.5 && progress >= 70) return '¡Muy bien! Vas por buen camino 👍'
    if (grade >= 3.0 && progress >= 60) return 'Buen progreso, puedes mejorar 📈'
    if (progress >= 50) return 'Necesitas ponerte al día con las tareas 📚'
    return 'Es importante que te enfoques en completar tus asignaciones ⚠️'
  }

  // Show placeholder during SSR
  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Rendimiento</h2>
        <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Cargando rendimiento...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Rendimiento</h2>
      
      {coursesWithGrades.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500">Aún no hay calificaciones disponibles</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Performance */}
          <div className={`p-4 rounded-lg ${getGradeBgColor(overallGrade)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Promedio General</span>
              <span className={`text-2xl font-bold ${getGradeColor(overallGrade)}`}>
                {overallGrade.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {getPerformanceMessage(overallGrade, data.overallProgress)}
            </p>
          </div>

          {/* Course Grades */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Calificaciones por curso</h3>
            {coursesWithGrades.map((course) => (
              <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {course.courseName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {course.completedAssignments} de {course.totalAssignments} tareas completadas
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getGradeColor(course.averageGrade!)}`}>
                    {course.averageGrade!.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {course.progressPercent}% progreso
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">💡</span>
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-1">Tips para mejorar</h4>
                <ul className="text-blue-800 text-xs space-y-1">
                  <li>• Completa las tareas antes de la fecha límite</li>
                  <li>• Participa activamente en las clases</li>
                  <li>• Revisa el material adicional proporcionado</li>
                  <li>• No dudes en preguntar si tienes dudas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
