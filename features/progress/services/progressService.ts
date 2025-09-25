import { getCourseWork, getStudentSubmissions, getStudents } from "@/lib/google"

export type StudentProgress = {
  userId: string
  name: string
  progressPct: number
  averageGrade: number | null
  lastSubmissionAt: string | null
}

// Counts a submission as delivered if state is TURNED_IN or RETURNED
function isDelivered(state?: string | null) {
  if (!state) return false
  const s = state.toUpperCase()
  return s === "TURNED_IN" || s === "RETURNED"
}

export async function getCourseProgress(courseId: string): Promise<StudentProgress[]> {
  // Fetch roster and coursework for the course
  const [students, courseworks] = await Promise.all([
    getStudents(courseId),
    getCourseWork(courseId),
  ])

  const totalTasks = courseworks.length || 0

  const results: StudentProgress[] = []

  for (const student of students) {
    let delivered = 0
    const grades: number[] = []
    let lastSubmissionAt: string | null = null

    // Iterate each coursework to get this student's submission
    for (const cw of courseworks) {
      if (!cw.id) continue
      const subs = await getStudentSubmissions(courseId, cw.id, student.userId)
      const sub = subs?.[0]
      if (!sub) continue

      if (isDelivered(sub.state)) {
        delivered += 1
      }

      const grade = (sub.assignedGrade ?? sub.draftGrade) as number | undefined
      if (typeof grade === "number") {
        grades.push(grade)
      }

      const t = sub.updateTime || (sub as any).creationTime
      if (t && (!lastSubmissionAt || new Date(t) > new Date(lastSubmissionAt))) {
        lastSubmissionAt = t
      }
    }

    const progressPct = totalTasks > 0 ? Math.round((delivered / totalTasks) * 100) : 0
    const averageGrade = grades.length ? Number((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)) : null

    results.push({
      userId: student.userId,
      name: student.name,
      progressPct,
      averageGrade,
      lastSubmissionAt,
    })
  }

  // Sort by name asc
  results.sort((a, b) => a.name.localeCompare(b.name))
  return results
}
