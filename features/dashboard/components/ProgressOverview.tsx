"use client"

import type { StudentDashboardData } from "../services/studentDashboardService"

type Props = {
  data: StudentDashboardData
}

export function ProgressOverview({ data }: Props) {
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500"
    if (percent >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getProgressTextColor = (percent: number) => {
    if (percent >= 80) return "text-green-700"
    if (percent >= 60) return "text-yellow-700"
    return "text-red-700"
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Mi Progreso General</h2>
        <div className={`text-2xl font-bold ${getProgressTextColor(data.overallProgress)}`}>
          {data.overallProgress}%
        </div>
      </div>
      
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso total</span>
          <span>{data.completedAssignments} de {data.totalAssignments} tareas</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(data.overallProgress)}`}
            style={{ width: `${data.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Course Progress List */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 mb-3">Progreso por curso</h3>
        {data.courses.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay cursos disponibles</p>
        ) : (
          data.courses.map((course) => (
            <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {course.courseName}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(course.progressPercent)}`}
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 min-w-0">
                    {course.completedAssignments}/{course.totalAssignments}
                  </span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className={`text-sm font-semibold ${getProgressTextColor(course.progressPercent)}`}>
                  {course.progressPercent}%
                </div>
                {course.averageGrade && (
                  <div className="text-xs text-gray-500">
                    Prom: {course.averageGrade}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.totalCourses}</div>
          <div className="text-xs text-gray-600">Cursos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{data.completedAssignments}</div>
          <div className="text-xs text-gray-600">Completadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{data.totalAssignments - data.completedAssignments}</div>
          <div className="text-xs text-gray-600">Pendientes</div>
        </div>
      </div>
    </div>
  )
}
