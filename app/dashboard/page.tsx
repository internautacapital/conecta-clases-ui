'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Bienvenido al Dashboard!
              </h2>
              <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información de la Sesión
                </h3>
                <div className="space-y-2 text-left">
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Nombre:</strong> {session.user?.name || 'No disponible'}</p>
                  <p><strong>Rol:</strong> {session.user?.role}</p>
                </div>
              </div>
              
              {session.user?.role === 'profesor' && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    🎓 Tienes acceso como <strong>Profesor</strong>
                  </p>
                </div>
              )}
              
              {session.user?.role === 'coordinador' && (
                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-800">
                    👑 Tienes acceso como <strong>Coordinador</strong>
                  </p>
                </div>
              )}
              
              {session.user?.role === 'alumno' && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    📚 Tienes acceso como <strong>Alumno</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  )
}
