"use client"

import { useSession } from "next-auth/react"

export function QuickActions() {
  const { data: session } = useSession()

  const quickActions = [
    {
      title: 'Google Classroom',
      description: 'Accede a todas tus clases',
      icon: '🎓',
      url: 'https://classroom.google.com',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Ver Progreso',
      description: 'Revisa tu avance detallado',
      icon: '📊',
      url: '/dashboard/progress',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Métricas',
      description: 'Estadísticas de rendimiento',
      icon: '📈',
      url: '/dashboard/metrics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Google Drive',
      description: 'Archivos y documentos',
      icon: '📁',
      url: 'https://drive.google.com',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    }
  ]

  const supportActions = [
    {
      title: 'Soporte Técnico',
      description: 'Ayuda con la plataforma',
      icon: '🛠️',
      action: () => {
        if (session?.user?.email) {
          window.location.href = `mailto:soporte@gmail.com?subject=Soporte técnico - ${session.user.name}&body=Necesito ayuda con...`
        }
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.url}
              target={action.url.startsWith('http') ? '_blank' : '_self'}
              rel={action.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`${action.color} text-white p-4 rounded-lg transition-colors group`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <h3 className="font-medium text-sm">{action.title}</h3>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Support Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas Ayuda?</h2>
        
        <div className="space-y-3">
          {supportActions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{action.icon}</span>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">ℹ️</span>
            <p className="text-gray-700 text-sm">
              <strong>Conecta Clases</strong> - Formación en habilidades digitales para jóvenes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
