import { authOptions } from "@/lib/auth"
import { createErrorResponse } from "@/lib/errorMiddleware"
import { getAnnouncements, getCourses, setAccessToken } from "@/lib/google"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

type NotificationItem = {
  id: string | undefined;
  courseId: string;
  courseName: string;
  text: string;
  alternateLink: string | null;
  state: string | null;
  creationTime: string | null;
  updateTime: string | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = session.accessToken
    if (!accessToken) {
      return NextResponse.json({ error: "Missing Google access token in session" }, { status: 400 })
    }

    setAccessToken(accessToken)

    const courses = await getCourses()

    const all = await Promise.all(
      (courses || []).map(async (c) => {
        if (!c.id) return [] as NotificationItem[]
        const anns = await getAnnouncements(c.id)
        return anns.map((a) => ({
          id: a.id,
          courseId: c.id!,
          courseName: c.name || "Curso",
          text: a.text || "",
          alternateLink: a.alternateLink || null,
          state: a.state || null,
          creationTime: a.creationTime || null,
          updateTime: a.updateTime || null,
        }))
      })
    )

    const flat = all.flat()
    flat.sort((a, b) => {
      const ta = a.creationTime ? new Date(a.creationTime).getTime() : 0
      const tb = b.creationTime ? new Date(b.creationTime).getTime() : 0
      return tb - ta
    })

    return NextResponse.json({ announcements: flat })
  } catch (error: unknown) {
    console.error("/api/notifications error:", error)
    // Si es un error 500, forzar logout
    return createErrorResponse(error, 500, true)
  }
}
