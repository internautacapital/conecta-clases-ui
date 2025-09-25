import { getCourseWork, getStudentSubmissions, getStudents, getAnnouncements, getAnnouncementReplies } from "@/lib/google"

export type WeeklyMetrics = {
  week: string // YYYY-MM-DD format (start of week)
  weekLabel: string // "Semana 1", "Semana 2", etc.
  attendancePercent: number
  submissionsCount: number
  participationCount: number
}

export type CourseMetrics = {
  weeklyData: WeeklyMetrics[]
  totalStudents: number
  totalAssignments: number
  totalAnnouncements: number
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
  return new Date(d.setDate(diff))
}

function formatWeekLabel(weekStart: Date, index: number): string {
  return `Semana ${index + 1}`
}

export async function getCourseMetrics(courseId: string): Promise<CourseMetrics> {
  // Fetch all necessary data
  const [students, courseworks, announcements] = await Promise.all([
    getStudents(courseId),
    getCourseWork(courseId),
    getAnnouncements(courseId),
  ])

  const totalStudents = students.length
  const totalAssignments = courseworks.length
  const totalAnnouncements = announcements.length

  // Group data by weeks (last 8 weeks)
  const now = new Date()
  const weeks: Date[] = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = getWeekStart(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000))
    weeks.push(weekStart)
  }

  const weeklyData: WeeklyMetrics[] = []

  for (let i = 0; i < weeks.length; i++) {
    const weekStart = weeks[i]
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    // Calculate submissions for this week
    let submissionsThisWeek = 0
    for (const cw of courseworks) {
      if (!cw.id) continue
      const submissions = await getStudentSubmissions(courseId, cw.id)
      for (const sub of submissions) {
        const subTime = sub.updateTime || sub.creationTime
        if (subTime) {
          const subDate = new Date(subTime)
          if (subDate >= weekStart && subDate < weekEnd) {
            submissionsThisWeek++
          }
        }
      }
    }

    // Calculate participation (announcement replies) for this week
    let participationThisWeek = 0
    for (const ann of announcements) {
      if (!ann.id) continue
      try {
        const replies = await getAnnouncementReplies(courseId, ann.id)
        for (const reply of replies) {
          const replyTime = reply.creationTime
          if (replyTime) {
            const replyDate = new Date(replyTime)
            if (replyDate >= weekStart && replyDate < weekEnd) {
              participationThisWeek++
            }
          }
        }
      } catch (error) {
        // Skip if replies API fails
        console.warn(`Failed to get replies for announcement ${ann.id}:`, error)
      }
    }

    // For attendance, we'll simulate based on submissions activity
    // In a real scenario, you'd have actual attendance data
    const attendancePercent = totalStudents > 0 
      ? Math.min(100, Math.round((submissionsThisWeek / Math.max(1, totalStudents * 0.7)) * 100))
      : 0

    weeklyData.push({
      week: weekStart.toISOString().split('T')[0],
      weekLabel: formatWeekLabel(weekStart, i),
      attendancePercent,
      submissionsCount: submissionsThisWeek,
      participationCount: participationThisWeek,
    })
  }

  return {
    weeklyData,
    totalStudents,
    totalAssignments,
    totalAnnouncements,
  }
}
