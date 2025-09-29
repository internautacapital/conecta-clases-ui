import { getCourseMetrics } from "@/features/metrics/services/metricsService";
import { authOptions } from "@/lib/auth";
import { setAccessToken } from "@/lib/google";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/errorMiddleware";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId parameter is required" },
        { status: 400 }
      );
    }

    setAccessToken(accessToken);

    const metrics = await getCourseMetrics(courseId);

    return NextResponse.json({ metrics });
  } catch (error: unknown) {
    console.error("/api/metrics error:", error);
    // Si es un error 500, forzar logout
    return createErrorResponse(error as Error, 500, true);
  }
}
