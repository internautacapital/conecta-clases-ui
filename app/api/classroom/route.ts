import { authOptions } from "@/lib/auth";
import { getCourses, setAccessToken } from "@/lib/google";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/errorMiddleware";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Google access token in session" },
        { status: 400 }
      );
    }

    setAccessToken(accessToken);

    const courses = await getCourses();

    return NextResponse.json({ courses });
  } catch (error: unknown) {
    console.error("/api/classroom error:", error);
    return createErrorResponse(error, 500, true);
  }
}
