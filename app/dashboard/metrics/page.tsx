import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { setAccessToken, getCourses } from "@/lib/google"
import { getCourseMetrics } from "@/features/metrics/services/metricsService"
import { MetricsCharts } from "@/features/metrics/components/MetricsCharts"

export const dynamic = "force-dynamic"

export default async function MetricsPage({
  searchParams,
}: {
  searchParams?: Promise<{ courseId?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const accessToken = session?.accessToken
  if (!accessToken) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Falta token de acceso</h1>
        <p className="text-muted-foreground">Vuelve a iniciar sesión para otorgar permisos de Google Classroom.</p>
      </div>
    )
  }

  setAccessToken(accessToken)

  const params = await searchParams
  const courseId = params?.courseId

  if (!courseId) {
    // If no course selected, show a simple list of available courses to choose
    const courses = await getCourses(session.user?.email || "")

    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Métricas - Selecciona un curso</h1>
        {courses.length === 0 ? (
          <p className="text-muted-foreground">No se encontraron cursos activos.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <li key={c.id} className="border rounded-md p-4 hover:shadow-sm transition">
                <div className="font-medium mb-2">{c.name}</div>
                <div className="text-sm text-muted-foreground mb-3">{c.section || c.descriptionHeading || ""}</div>
                <a
                  href={`?courseId=${encodeURIComponent(c.id!)}`}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Ver métricas
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const metrics = await getCourseMetrics(courseId)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Métricas del curso</h1>
        <a
          href="/dashboard/metrics"
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Seleccionar otro curso
        </a>
      </div>
      <MetricsCharts metrics={metrics} />
    </div>
  )
}
