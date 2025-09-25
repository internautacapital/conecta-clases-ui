import { ProgressTable } from "@/features/progress/components/ProgressTable"
import { getCourseProgress } from "@/features/progress/services/progressService"
import { authOptions } from "@/lib/auth"
import { getCourses, setAccessToken } from "@/lib/google"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { CourseSelector } from "@/components/ui/CourseSelector"

export const dynamic = "force-dynamic"

export default async function ProgressPage({
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
  const courses = await getCourses(session.user?.email || "")
  
  if (courses.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Progreso</h1>
        <p className="text-muted-foreground">No se encontraron cursos activos.</p>
      </div>
    )
  }

  // Use the first course as default if no courseId is provided
  const courseId = params?.courseId || courses[0]?.id!
  const data = await getCourseProgress(courseId)
  const currentCourse = courses.find(c => c.id === courseId)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progreso del curso</h1>
          <p className="text-muted-foreground mt-1">
            {currentCourse?.name}
          </p>
        </div>
        <CourseSelector 
          courses={courses} 
          currentCourseId={courseId} 
          basePath="/dashboard/progress" 
        />
      </div>
      <ProgressTable data={data} />
    </div>
  )
}
