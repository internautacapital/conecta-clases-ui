"use client"

import { useClientOnly } from "@/hooks/useClientOnly"
import type { Assignment } from "../services/studentDashboardService"

type Props = {
  assignments: Assignment[]
}

export function UpcomingAssignments({ assignments }: Props) {
  const isClient = useClientOnly()

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate || !isClient) return null
    
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const getUrgencyColor = (daysUntilDue: number | null) => {
    if (daysUntilDue === null) return 'border-gray-200 bg-gray-50'
    if (daysUntilDue <= 1) return 'border-red-200 bg-red-50'
    if (daysUntilDue <= 3) return 'border-yellow-200 bg-yellow-50'
    return 'border-green-200 bg-green-50'
  }

  const getUrgencyText = (daysUntilDue: number | null) => {
    if (daysUntilDue === null) return 'Sin fecha límite'
    if (daysUntilDue < 0) return 'Vencida'
    if (daysUntilDue === 0) return 'Vence hoy'
    if (daysUntilDue === 1) return 'Vence mañana'
    return `${daysUntilDue} días restantes`
  }

  const getUrgencyTextColor = (daysUntilDue: number | null) => {
    if (daysUntilDue === null) return 'text-gray-600'
    if (daysUntilDue <= 1) return 'text-red-700'
    if (daysUntilDue <= 3) return 'text-yellow-700'
    return 'text-green-700'
  }

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate || !isClient) return 'Sin fecha'
    
    const date = new Date(dueDate)
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Próximas Entregas</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {assignments.length} pendientes
        </span>
      </div>

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-gray-500">¡Excelente! No tienes entregas pendientes.</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const daysUntilDue = getDaysUntilDue(assignment.dueDate)
            
            return (
              <div
                key={assignment.id}
                className={`border rounded-lg p-4 ${getUrgencyColor(daysUntilDue)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      {assignment.courseName}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDueDate(assignment.dueDate)}
                      </span>
                      <span className={`text-xs font-medium ${getUrgencyTextColor(daysUntilDue)}`}>
                        {getUrgencyText(daysUntilDue)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <a
                      href={`https://classroom.google.com/c/${assignment.courseId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Ir a tarea
                    </a>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {assignments.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Organiza tu tiempo y completa las tareas más urgentes primero.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
