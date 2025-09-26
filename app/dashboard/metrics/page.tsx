import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { setAccessToken, getCourses } from "@/lib/google"
import { getCourseMetrics } from "@/features/metrics/services/metricsService"
import { MetricsCharts } from "@/features/metrics/components/MetricsCharts"
import { CourseSelector } from "@/components/ui/CourseSelector"

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
  const courses = await getCourses()
  
  if (courses.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Métricas</h1>
        <p className="text-muted-foreground">No se encontraron cursos activos.</p>
      </div>
    )
  }

  // Use the first course as default if no courseId is provided
  const firstCourseId = courses[0]?.id
  if (!firstCourseId && !params?.courseId) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Métricas</h1>
        <p className="text-muted-foreground">No se pudo obtener el ID del curso.</p>
      </div>
    )
  }
  
  const courseId = params?.courseId || firstCourseId!
  const metrics = await getCourseMetrics(courseId)
  const currentCourse = courses.find(c => c.id === courseId)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Métricas del curso</h1>
          <p className="text-muted-foreground mt-1">
            {currentCourse?.name}
          </p>
        </div>
        <CourseSelector 
          courses={courses} 
          currentCourseId={courseId} 
          basePath="/dashboard/metrics" 
        />
      </div>
      <MetricsCharts metrics={metrics} loading={false} />
    </div>
  )
}
