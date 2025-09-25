"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { StudentProgress } from "@/features/progress/services/progressService"
import { useClientOnly } from "@/hooks/useClientOnly"

type Props = {
  title?: string
  data: StudentProgress[]
}

export function ProgressTable({ title = "Progreso de alumnos", data }: Props) {
  const isClient = useClientOnly()
  
  return (
    <div className="w-full">
      <Table>
        <TableCaption>{title}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead className="w-56">% Avance</TableHead>
            <TableHead>Promedio</TableHead>
            <TableHead>Última entrega</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Sin datos disponibles
              </TableCell>
            </TableRow>
          )}
          {data.map((s) => (
            <TableRow key={s.userId}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-40 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-2 bg-blue-600 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, s.progressPct))}%` }}
                      aria-label={`Avance ${s.progressPct}%`}
                    />
                  </div>
                  <span className="tabular-nums text-sm text-muted-foreground">{s.progressPct}%</span>
                </div>
              </TableCell>
              <TableCell>
                {s.averageGrade === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <span className="tabular-nums">{s.averageGrade}</span>
                )}
              </TableCell>
              <TableCell>
                {s.lastSubmissionAt ? (
                  <time
                    className="text-sm tabular-nums"
                    dateTime={s.lastSubmissionAt}
                    title={isClient ? formatDateTimeTooltip(s.lastSubmissionAt) : s.lastSubmissionAt}
                  >
                    {isClient ? formatRelativeDate(s.lastSubmissionAt) : formatStaticDate(s.lastSubmissionAt)}
                  </time>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function formatRelativeDate(iso: string) {
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

function formatStaticDate(iso: string) {
  // Return a static, server-safe date format that won't cause hydration mismatches
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

function formatDateTimeTooltip(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString()
}
