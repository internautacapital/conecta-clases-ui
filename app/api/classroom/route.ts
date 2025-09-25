import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCourses, setAccessToken } from "@/lib/google"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = session.accessToken
    const userEmail = session.user?.email || ""

    if (!accessToken) {
      return NextResponse.json({ error: "Missing Google access token in session" }, { status: 400 })
    }

    setAccessToken(accessToken)

    const courses = await getCourses(userEmail)

    return NextResponse.json({ courses })
  } catch (error: any) {
    console.error("/api/classroom error:", error)
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 })
  }
}
