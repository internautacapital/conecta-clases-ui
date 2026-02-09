import type { classroom_v1 } from 'googleapis';
import { google } from 'googleapis';

const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

let currentAccessToken: string | null = null;

export function setAccessToken(token: string) {
  currentAccessToken = token;
  oauth2Client.setCredentials({ access_token: token });
}

export type AnnouncementReply = {
  id?: string | null;
  creationTime?: string | null;
  updateTime?: string | null;
};

export type Announcement = {
  id?: string | null;
  courseId: string;
  text?: string | null;
  alternateLink?: string | null;
  state?: string | null;
  creationTime?: string | null;
  updateTime?: string | null;
};

export type StateHistory = {
  state?: string | null;
  stateTimestamp?: string | null;
  actorUserId?: string | null;
};

export type SubmissionHistory = {
  stateHistory?: StateHistory | null;
};

export type SubmissionComment = {
  id?: string | null;
  authorId?: string | null;
  creationTime?: string | null;
  comment?: string | null;
};

export type StudentSubmission = {
  id?: string | null;
  userId?: string | null;
  courseId: string;
  courseWorkId: string;
  state:
    | 'SUBMISSION_STATE_UNSPECIFIED'
    | 'NEW'
    | 'CREATED'
    | 'TURNED_IN'
    | 'RETURNED'
    | 'RECLAIMED_BY_STUDENT'
    | string;
  assignedGrade?: number | null;
  draftGrade?: number | null;
  alternateLink?: string | null;
  creationTime?: string | null;
  updateTime?: string | null;
  late?: boolean | null;
  submissionHistory?: SubmissionHistory[] | null;
  comments?: SubmissionComment[] | null;
};

export async function getAnnouncements(
  courseId: string
): Promise<Announcement[]> {
  requireAuth();
  const classroom = getClassroom();
  const items: Announcement[] = [];
  let pageToken: string | undefined;
  do {
    const res = await classroom.courses.announcements.list({
      courseId,
      pageSize: 100,
      pageToken,
    });
    const anns = res.data.announcements ?? [];
    for (const a of anns) {
      items.push({
        id: convertNullToUndefined(a.id),
        courseId,
        text: convertNullToUndefined(a.text),
        alternateLink: convertNullToUndefined(a.alternateLink),
        state: convertNullToUndefined(a.state),
        creationTime: convertNullToUndefined(a.creationTime),
        updateTime: convertNullToUndefined(a.updateTime),
      });
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  return items;
}

function requireAuth() {
  if (!currentAccessToken) {
    throw new Error(
      'Google OAuth access token is not set. Call setAccessToken(token) first.'
    );
  }
}

function getClassroom(): classroom_v1.Classroom {
  return google.classroom({ version: 'v1', auth: oauth2Client });
}

// Helper function to safely convert Google API string values that can be null to undefined
function convertNullToUndefined(
  value: string | null | undefined
): string | undefined {
  return value ?? undefined;
}

export async function getUserProfile(userId: string) {
  requireAuth();
  const classroom = getClassroom();
  const userProfile = await classroom.userProfiles.get({
    userId: userId,
  });
  return userProfile.data;
}

export async function getCourses() {
  requireAuth();
  const classroom = getClassroom();

  // List active courses for the authenticated user
  const res = await classroom.courses.list({
    courseStates: ['ACTIVE'],
    pageSize: 100,
  });
  return res.data.courses ?? [];
}

export async function getCourseWork(courseId: string) {
  requireAuth();
  const classroom = getClassroom();
  const res = await classroom.courses.courseWork.list({
    courseId,
    pageSize: 100,
  });
  return res.data.courseWork ?? [];
}

export async function getStudentSubmissions(
  courseId: string,
  courseworkId: string,
  userId?: string
): Promise<StudentSubmission[]> {
  requireAuth();
  const classroom = getClassroom();
  const res = await classroom.courses.courseWork.studentSubmissions.list({
    courseId,
    courseWorkId: courseworkId,
    // If provided, fetch for a specific user; otherwise fetch all
    userId: userId ?? undefined,
    pageSize: 100,
  });

  const submissions = res.data.studentSubmissions ?? [];

  return submissions.map(sub => {
    // Ensure state is properly set, default to 'NEW' if undefined
    const submissionState = sub.state || 'NEW';

    // Process submission history
    const submissionHistory =
      sub.submissionHistory?.map(history => ({
        stateHistory: history.stateHistory
          ? {
              state: convertNullToUndefined(history.stateHistory.state),
              stateTimestamp: convertNullToUndefined(
                history.stateHistory.stateTimestamp
              ),
              actorUserId: convertNullToUndefined(
                history.stateHistory.actorUserId
              ),
            }
          : null,
      })) || null;

    return {
      id: convertNullToUndefined(sub.id),
      userId: convertNullToUndefined(sub.userId),
      courseId,
      courseWorkId: courseworkId,
      state: submissionState as
        | 'SUBMISSION_STATE_UNSPECIFIED'
        | 'NEW'
        | 'CREATED'
        | 'TURNED_IN'
        | 'RETURNED'
        | 'RECLAIMED_BY_STUDENT'
        | string,
      assignedGrade: sub.assignedGrade ?? undefined,
      draftGrade: sub.draftGrade ?? undefined,
      alternateLink: convertNullToUndefined(sub.alternateLink),
      creationTime: convertNullToUndefined(sub.creationTime),
      updateTime: convertNullToUndefined(sub.updateTime),
      late: sub.late ?? undefined,
      submissionHistory,
    };
  });
}

export async function getCurrentUserProfile() {
  requireAuth();
  const classroom = getClassroom();

  try {
    const res = await classroom.userProfiles.get({
      userId: 'me',
    });

    return {
      userId: convertNullToUndefined(res.data.id),
      name: convertNullToUndefined(res.data.name?.fullName),
      email: convertNullToUndefined(res.data.emailAddress),
    };
  } catch (error) {
    console.error('Failed to get current user profile:', error);
    throw error;
  }
}

export async function getStudents(courseId: string) {
  requireAuth();
  const classroom = getClassroom();
  const students: Array<{ userId: string; name: string; email?: string }> = [];
  let pageToken: string | undefined;
  do {
    const res = await classroom.courses.students.list({
      courseId,
      pageSize: 100,
      pageToken,
    });
    const items = res.data.students ?? [];
    for (const s of items) {
      const userId = s.userId || s.profile?.id;
      const name =
        s.profile?.name?.fullName ||
        s.profile?.name?.givenName ||
        'Desconocido';
      const email = convertNullToUndefined(s.profile?.emailAddress);
      if (userId) {
        students.push({ userId, name, email });
      }
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  return students;
}

export async function getTeachers(courseId: string) {
  requireAuth();
  const classroom = getClassroom();
  const teachers: Array<{ userId: string; name: string; email?: string }> = [];
  let pageToken: string | undefined;
  do {
    const res = await classroom.courses.teachers.list({
      courseId,
      pageSize: 100,
      pageToken,
    });
    const items = res.data.teachers ?? [];
    for (const t of items) {
      const userId = t.userId || t.profile?.id;
      const name =
        t.profile?.name?.fullName ||
        t.profile?.name?.givenName ||
        'Desconocido';
      const email = convertNullToUndefined(t.profile?.emailAddress);
      if (userId) {
        teachers.push({ userId, name, email });
      }
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  return teachers;
}

export async function getUserRole(
  courseId: string,
  userEmail: string
): Promise<'teacher' | 'student' | null> {
  requireAuth();

  try {
    // Check if user is a teacher
    const teachers = await getTeachers(courseId);
    const isTeacher = teachers.some(t => t.userId === userEmail);
    if (isTeacher) return 'teacher';

    // Check if user is a student
    const students = await getStudents(courseId);
    const isStudent = students.some(s => s.userId === userEmail);
    if (isStudent) return 'student';

    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export type CourseWithRole = {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState?: string;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  teacherFolder?: {
    id?: string;
    title?: string;
    alternateLink?: string;
  };
  guardiansEnabled?: boolean;
  calendarId?: string;
  role: 'teacher' | 'student';
};

export async function getSubmissionComments(
  courseId: string,
  courseWorkId: string,
  submissionId: string
): Promise<SubmissionComment[]> {
  requireAuth();
  const classroom = getClassroom();

  try {
    // NOTA: La Google Classroom API no expone comentarios privados directamente
    // Los comentarios entre profesor-estudiante no están disponibles via API REST
    // Esta función está preparada para futuras actualizaciones de la API

    const res = await classroom.courses.courseWork.studentSubmissions.get({
      courseId,
      courseWorkId,
      id: submissionId,
    });

    const submission = res.data;
    if (!submission) return [];

    // Por ahora, retornamos un array vacío ya que los comentarios privados
    // no están disponibles en la API actual de Google Classroom
    const comments: SubmissionComment[] = [];

    // Si en el futuro Google añade soporte para comentarios,
    // la implementación iría aquí

    return comments;
  } catch (error) {
    console.error('Failed to get submission comments:', error);
    return [];
  }
}

export async function getStudentSubmissionWithComments(
  courseId: string,
  courseWorkId: string,
  submissionId: string
): Promise<StudentSubmission | null> {
  requireAuth();
  const classroom = getClassroom();

  try {
    const res = await classroom.courses.courseWork.studentSubmissions.get({
      courseId,
      courseWorkId,
      id: submissionId,
    });

    const sub = res.data;
    if (!sub) return null;

    // Get comments for this submission (actualmente vacío debido a limitaciones de la API)
    const comments = await getSubmissionComments(
      courseId,
      courseWorkId,
      submissionId
    );

    // Process submission history
    const submissionHistory =
      sub.submissionHistory?.map(history => ({
        stateHistory: history.stateHistory
          ? {
              state: convertNullToUndefined(history.stateHistory.state),
              stateTimestamp: convertNullToUndefined(
                history.stateHistory.stateTimestamp
              ),
              actorUserId: convertNullToUndefined(
                history.stateHistory.actorUserId
              ),
            }
          : null,
      })) || null;

    return {
      id: convertNullToUndefined(sub.id),
      userId: convertNullToUndefined(sub.userId),
      courseId,
      courseWorkId,
      state: (sub.state || 'NEW') as
        | 'SUBMISSION_STATE_UNSPECIFIED'
        | 'NEW'
        | 'CREATED'
        | 'TURNED_IN'
        | 'RETURNED'
        | 'RECLAIMED_BY_STUDENT'
        | string,
      assignedGrade: sub.assignedGrade ?? undefined,
      draftGrade: sub.draftGrade ?? undefined,
      alternateLink: convertNullToUndefined(sub.alternateLink),
      creationTime: convertNullToUndefined(sub.creationTime),
      updateTime: convertNullToUndefined(sub.updateTime),
      late: sub.late ?? undefined,
      submissionHistory,
      comments,
    };
  } catch (error) {
    console.error('Failed to get student submission with comments:', error);
    return null;
  }
}

/**
 * Obtiene información detallada de feedback disponible para una submission
 * Incluye toda la información de feedback que la API permite acceder
 */
export async function getSubmissionFeedback(
  courseId: string,
  courseWorkId: string,
  submissionId: string
): Promise<{
  hasGrade: boolean;
  assignedGrade?: number;
  draftGrade?: number;
  isReturned: boolean;
  returnTime?: string;
  lastUpdateTime?: string;
  feedbackAvailable: boolean;
}> {
  requireAuth();
  const classroom = getClassroom();

  try {
    const res = await classroom.courses.courseWork.studentSubmissions.get({
      courseId,
      courseWorkId,
      id: submissionId,
    });

    const sub = res.data;
    if (!sub) {
      return {
        hasGrade: false,
        isReturned: false,
        feedbackAvailable: false,
      };
    }

    const hasGrade =
      sub.assignedGrade !== null && sub.assignedGrade !== undefined;
    const isReturned = sub.state === 'RETURNED';

    // Buscar el timestamp de cuando fue devuelto
    let returnTime: string | undefined;
    if (sub.submissionHistory) {
      const returnedEntry = sub.submissionHistory
        .reverse() // Más reciente primero
        .find(history => history.stateHistory?.state === 'RETURNED');
      returnTime = returnedEntry?.stateHistory?.stateTimestamp || undefined;
    }

    return {
      hasGrade,
      assignedGrade: sub.assignedGrade ?? undefined,
      draftGrade: sub.draftGrade ?? undefined,
      isReturned,
      returnTime: convertNullToUndefined(returnTime),
      lastUpdateTime: convertNullToUndefined(sub.updateTime),
      feedbackAvailable: hasGrade || isReturned,
    };
  } catch (error) {
    console.error('Failed to get submission feedback:', error);
    return {
      hasGrade: false,
      isReturned: false,
      feedbackAvailable: false,
    };
  }
}

export async function getCoursesWithRoles(
  userEmail: string
): Promise<CourseWithRole[]> {
  requireAuth();
  const courses = await getCourses();
  const coursesWithRoles: CourseWithRole[] = [];
  for (const course of courses) {
    if (!course.id) continue;
    const role = await getUserRole(course.id, userEmail);
    if (role) {
      coursesWithRoles.push({
        id: course.id,
        name: course.name || 'Curso sin nombre',
        section: convertNullToUndefined(course.section),
        description: convertNullToUndefined(course.description),
        room: convertNullToUndefined(course.room),
        ownerId: convertNullToUndefined(course.ownerId),
        creationTime: convertNullToUndefined(course.creationTime),
        updateTime: convertNullToUndefined(course.updateTime),
        enrollmentCode: convertNullToUndefined(course.enrollmentCode),
        courseState: convertNullToUndefined(course.courseState),
        alternateLink: convertNullToUndefined(course.alternateLink),
        teacherGroupEmail: convertNullToUndefined(course.teacherGroupEmail),
        courseGroupEmail: convertNullToUndefined(course.courseGroupEmail),
        teacherFolder: course.teacherFolder
          ? {
              id: convertNullToUndefined(course.teacherFolder.id),
              title: convertNullToUndefined(course.teacherFolder.title),
              alternateLink: convertNullToUndefined(
                course.teacherFolder.alternateLink
              ),
            }
          : undefined,
        guardiansEnabled: course.guardiansEnabled ?? undefined,
        calendarId: convertNullToUndefined(course.calendarId),
        role,
      });
    }
  }

  return coursesWithRoles;
}
