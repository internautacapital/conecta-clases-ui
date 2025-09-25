"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"

export function NotificationBell() {
  const { items, count, isLoading, isError, refetch } = useNotifications()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest?.("[data-notification-bell]")) {
        setOpen(false)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  return (
    <div className="relative" data-notification-bell>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Notificaciones"
        className="relative inline-flex items-center justify-center rounded-md border px-2.5 py-2 hover:bg-gray-50 cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-md border bg-white shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-medium">Anuncios de Classroom</div>
            <button onClick={() => refetch()} className="text-xs text-blue-600 hover:underline cursor-pointer">Actualizar</button>
          </div>
          <div className="max-h-96 overflow-auto">
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground">Cargando…</div>
            )}
            {isError && (
              <div className="p-4 text-sm text-red-600">Error al cargar notificaciones</div>
            )}
            {!isLoading && !isError && items.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Sin notificaciones</div>
            )}
            <ul className="divide-y">
              {items.map((n) => (
                <li key={`${n.courseId}-${n.id}`} className="p-3 hover:bg-gray-50">
                  <a
                    href={n.alternateLink || `https://classroom.google.com/c/${n.courseId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="text-sm font-medium truncate">{n.courseName}</div>
                    <div className="mt-1 text-sm text-gray-700 line-clamp-2">
                      {n.text || "(Sin contenido)"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {n.creationTime ? formatRelativeDate(n.creationTime) : ""}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function formatRelativeDate(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (minutes < 1) return "ahora"
  if (minutes < 60) return `${minutes} min`
  if (hours < 24) return `${hours} h`
  return `${days} d`
}
