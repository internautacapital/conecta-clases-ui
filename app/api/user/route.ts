import { authOptions } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errorMiddleware';
import { getCourses, setAccessToken } from '@/lib/google';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export type NotificationItem = {
  id: string | undefined;
  courseId: string;
  courseName: string;
  text: string;
  alternateLink: string | null;
  state: string | null;
  creationTime: string | null;
  updateTime: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing Google access token in session' },
        { status: 400 }
      );
    }

    setAccessToken(accessToken);

    const userId = session.user?.id;
    const courses = await getCourses();

    const isTeacher = courses.some(c => {
      return c.ownerId === userId;
    });

    const isStudent = courses.length > 0;

    const roles: string[] = [];
    if (isTeacher) roles.push('teacher');
    if (isStudent) roles.push('student');

    return NextResponse.json({ roles });
  } catch (error: unknown) {
    console.error('/api/user error:', error);
    return createErrorResponse(error as Error, 500, true);
  }
}
