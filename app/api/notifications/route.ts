import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { setAccessToken, getCourses, getAnnouncements } from "@/lib/google"

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

    const courses = await getCourses(session.user?.email || "")

    const all = await Promise.all(
      (courses || []).map(async (c) => {
        if (!c.id) return [] as any[]
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
  } catch (error: any) {
    console.error("/api/notifications error:", error)
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 })
  }
}
