import { google } from "googleapis"
import type { classroom_v1 } from "googleapis"

const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
)

let currentAccessToken: string | null = null

export function setAccessToken(token: string) {
  currentAccessToken = token
  oauth2Client.setCredentials({ access_token: token })
}

export type AnnouncementReply = {
  id?: string | null
  creationTime?: string | null
  updateTime?: string | null
}

export async function getAnnouncementReplies(courseId: string, announcementId: string): Promise<AnnouncementReply[]> {
  requireAuth()
  const classroom = getClassroom()
  const items: AnnouncementReply[] = []
  let pageToken: string | undefined
  do {
    const repliesApi = (classroom.courses.announcements as any).replies
    const res = await repliesApi.list({
      courseId,
      announcementId,
      pageSize: 100,
      pageToken,
    })
    const replies = (res.data as any).replies ?? []
    for (const r of replies) {
      items.push({
        id: r.id,
        creationTime: r.creationTime || undefined,
        updateTime: r.updateTime || undefined,
      })
    }
    pageToken = (res.data as any).nextPageToken || undefined
  } while (pageToken)
  return items
}

export type Announcement = {
  id?: string | null
  courseId: string
  text?: string | null
  alternateLink?: string | null
  state?: string | null
  creationTime?: string | null
  updateTime?: string | null
}

export async function getAnnouncements(courseId: string): Promise<Announcement[]> {
  requireAuth()
  const classroom = getClassroom()
  const items: Announcement[] = []
  let pageToken: string | undefined
  do {
    const res = await classroom.courses.announcements.list({
      courseId,
      pageSize: 100,
      pageToken,
    })
    const anns = res.data.announcements ?? []
    for (const a of anns) {
      items.push({
        id: a.id,
        courseId,
        text: a.text,
        alternateLink: a.alternateLink,
        state: a.state as string | undefined,
        creationTime: a.creationTime || undefined,
        updateTime: a.updateTime || undefined,
      })
    }
    pageToken = res.data.nextPageToken || undefined
  } while (pageToken)
  return items
}

function requireAuth() {
  if (!currentAccessToken) {
    throw new Error("Google OAuth access token is not set. Call setAccessToken(token) first.")
  }
}

function getClassroom(): classroom_v1.Classroom {
  return google.classroom({ version: "v1", auth: oauth2Client })
}

export async function getCourses(userEmail: string) {
  requireAuth()
  const classroom = getClassroom()
  // List active courses for the authenticated user
  const res = await classroom.courses.list({
    courseStates: ["ACTIVE"],
    pageSize: 100,
  })
  return res.data.courses ?? []
}

export async function getCourseWork(courseId: string) {
  requireAuth()
  const classroom = getClassroom()
  const res = await classroom.courses.courseWork.list({
    courseId,
    pageSize: 100,
  })
  return res.data.courseWork ?? []
}

export async function getStudentSubmissions(courseId: string, courseworkId: string, userId?: string) {
  requireAuth()
  const classroom = getClassroom()
  const res = await classroom.courses.courseWork.studentSubmissions.list({
    courseId,
    courseWorkId: courseworkId,
    // If provided, fetch for a specific user; otherwise fetch all
    userId: userId ?? undefined,
    pageSize: 100,
  })
  return res.data.studentSubmissions ?? []
}

export async function getStudents(courseId: string) {
  requireAuth()
  const classroom = getClassroom()
  const students: Array<{ userId: string; name: string }> = []
  let pageToken: string | undefined
  do {
    const res = await classroom.courses.students.list({
      courseId,
      pageSize: 100,
      pageToken,
    })
    const items = res.data.students ?? []
    for (const s of items) {
      const userId = s.userId || s.profile?.id
      const name = s.profile?.name?.fullName || s.profile?.name?.givenName || "Desconocido"
      if (userId) {
        students.push({ userId, name })
      }
    }
    pageToken = res.data.nextPageToken || undefined
  } while (pageToken)
  return students
}
