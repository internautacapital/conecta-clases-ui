"use client"

import type { Assignment } from "@/features/dashboard/services/studentDashboardService"
import { useClientOnly } from "@/hooks/useClientOnly"

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

  const getUrgencyColor = (daysUntilDue: number | null, status: 'pending' | 'submitted' | 'late') => {
    if (status === 'submitted') return 'border-green-300 bg-green-100'
    if (status === 'late') return 'border-red-300 bg-red-100'
    if (daysUntilDue === null) return 'border-gray-200 bg-gray-50'
    if (daysUntilDue <= 1) return 'border-red-200 bg-red-50'
    if (daysUntilDue <= 3) return 'border-yellow-200 bg-yellow-50'
    return 'border-green-200 bg-green-50'
  }

  const getUrgencyText = (daysUntilDue: number | null, status: 'pending' | 'submitted' | 'late') => {
    if (status === 'submitted') return 'Completada'
    if (status === 'late') return 'Atrasada'
    if (daysUntilDue === null) return 'Sin fecha límite'
    if (daysUntilDue < 0) return 'Vencida'
    if (daysUntilDue === 0) return 'Vence hoy'
    if (daysUntilDue === 1) return 'Vence mañana'
    return `${daysUntilDue} días restantes`
  }

  const getStatusBadge = (status: 'pending' | 'submitted' | 'late', submissionState?: string) => {
    const getStatusInfo = () => {
      switch (status) {
        case 'late':
          return { text: 'Atrasada', color: 'bg-red-100 text-red-800' }
        case 'submitted':
          return { text: 'Entregada', color: 'bg-green-100 text-green-800' }
        default:
          return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' }
      }
    }

    const { text, color } = getStatusInfo()
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    )
  }

  const getUrgencyTextColor = (daysUntilDue: number | null, status: 'pending' | 'submitted' | 'late') => {
    if (status === 'submitted') return 'text-green-700'
    if (status === 'late') return 'text-red-700'
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

  const pendingCount = assignments.filter(a => a.status === 'pending' || a.status === 'late').length
  const completedCount = assignments.filter(a => a.status === 'submitted').length

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap flex-col md:flex-row items-start">
        <h2 className="text-xl font-semibold text-gray-900 ">Mis Tareas</h2>
        <div className="flex gap-2 mt-2 md:mt-0">
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingCount} pendientes
            </span>
          )}
          {completedCount > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {completedCount} completadas
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-500">No hay tareas disponibles en este momento.</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const daysUntilDue = getDaysUntilDue(assignment.dueDate)
            
            return (
              <div
                key={assignment.id}
                className={`border rounded-lg p-4 ${getUrgencyColor(daysUntilDue, assignment.status)}`}
              >
                <div className="flex justify-between flex-col md:flex-row items-end md:items-start">
                  <div className="flex-1 w-full">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-gray-600 text-xs">
                        {assignment.courseName}
                      </p>
                      {getStatusBadge(assignment.status, assignment.submissionState)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDueDate(assignment.dueDate)}
                      </span>
                      <span className={`text-xs font-medium ${getUrgencyTextColor(daysUntilDue, assignment.status)}`}>
                        {getUrgencyText(daysUntilDue, assignment.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 ">
                    {assignment.alternateLink ? (
                      <a
                        href={assignment.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition-colors"
                      >
                        Ir a tarea
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-400 text-white text-xs font-medium rounded-full cursor-not-allowed">
                        Sin enlace
                      </span>
                    )}
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
