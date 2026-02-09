import {
  getCourses,
  getCourseWork,
  getCurrentUserProfile,
  getStudentSubmissions,
  getSubmissionFeedback,
  type StudentSubmission,
} from '@/lib/google';

export type Assignment = {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate?: string;
  status: 'pending' | 'submitted' | 'late';
  submissionState?: string;
  alternateLink?: string;
  feedback?: {
    hasGrade: boolean;
    assignedGrade?: number;
    isReturned: boolean;
    returnTime?: string;
    feedbackAvailable: boolean;
    needsAttention: boolean;
  };
};

export type CourseProgress = {
  courseId: string;
  courseName: string;
  progressPercent: number;
  totalAssignments: number;
  completedAssignments: number;
  averageGrade?: number;
  alternateLink?: string;
};

export type StudentDashboardData = {
  overallProgress: number;
  courses: CourseProgress[];
  upcomingAssignments: Assignment[];
  recentGrades: Array<{
    courseName: string;
    grade: number;
    assignmentTitle: string;
    date: string;
  }>;
  totalCourses: number;
  totalAssignments: number;
  completedAssignments: number;
};

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  try {
    // Get current user profile to get the real userId
    const userProfile = await getCurrentUserProfile();
    const currentUserId = userProfile.userId;

    // Get all courses for the user
    const courses = await getCourses();

    const courseProgressPromises = courses.map(async course => {
      if (!course.id) return null;

      try {
        // Get coursework for this course
        const coursework = await getCourseWork(course.id);
        const totalAssignments = coursework.length;

        if (totalAssignments === 0) {
          return {
            courseId: course.id,
            courseName: course.name || 'Sin nombre',
            progressPercent: 100,
            totalAssignments: 0,
            completedAssignments: 0,
          };
        }

        // Get student submissions for each assignment
        let completedCount = 0;
        let totalGrades = 0;
        let gradeCount = 0;

        for (const work of coursework) {
          if (!work.id) continue;

          try {
            const submissions = await getStudentSubmissions(course.id, work.id);
            const userSubmission = submissions.find(
              sub => sub.userId === currentUserId
            );

            if (userSubmission) {
              // Check if assignment is completed based on state
              if (
                userSubmission.state === 'TURNED_IN' ||
                userSubmission.state === 'RETURNED'
              ) {
                completedCount++;
              }

              // If there's a grade, add it to average calculation
              if (
                userSubmission.assignedGrade !== undefined &&
                userSubmission.assignedGrade !== null
              ) {
                totalGrades += userSubmission.assignedGrade;
                gradeCount++;
              }
            }
          } catch (error) {
            console.warn(
              `Failed to get submissions for assignment ${work.id}:`,
              error
            );
          }
        }

        const progressPercent = Math.round(
          (completedCount / totalAssignments) * 100
        );
        const averageGrade =
          gradeCount > 0
            ? Math.round((totalGrades / gradeCount) * 100) / 100
            : undefined;

        return {
          courseId: course.id,
          courseName: course.name || 'Sin nombre',
          progressPercent,
          totalAssignments,
          completedAssignments: completedCount,
          averageGrade,
          alternateLink: course.alternateLink,
        };
      } catch (error) {
        console.warn(`Failed to get progress for course ${course.id}:`, error);
        return {
          courseId: course.id!,
          courseName: course.name || 'Sin nombre',
          progressPercent: 0,
          totalAssignments: 0,
          completedAssignments: 0,
          alternateLink: undefined,
        };
      }
    });

    const courseProgressResults = await Promise.all(courseProgressPromises);
    const courseProgress = courseProgressResults.filter(
      (cp): cp is CourseProgress => cp !== null
    );

    // Calculate overall progress
    const totalAssignments = courseProgress.reduce(
      (sum, cp) => sum + cp.totalAssignments,
      0
    );
    const totalCompleted = courseProgress.reduce(
      (sum, cp) => sum + cp.completedAssignments,
      0
    );
    const overallProgress =
      totalAssignments > 0
        ? Math.round((totalCompleted / totalAssignments) * 100)
        : 0;

    // Get upcoming assignments (simplified - would need more complex logic for real due dates)
    const upcomingAssignments: Assignment[] = [];
    for (const course of courses.slice(0, 3)) {
      // Limit to first 3 courses for performance
      if (!course.id) continue;

      try {
        const coursework = await getCourseWork(course.id);
        for (const work of coursework.slice(0, 2)) {
          // Limit assignments per course
          if (!work.id) continue;

          const submissions = await getStudentSubmissions(course.id, work.id);
          const userSubmission = submissions.find(
            sub => sub.userId === currentUserId
          );

          // Determine assignment status based on submission state
          const getAssignmentStatus = (
            submission?: StudentSubmission
          ): 'pending' | 'submitted' | 'late' => {
            if (!submission) return 'pending';
            switch (submission.state) {
              case 'TURNED_IN':
              case 'RETURNED':
                return 'submitted';
              case 'NEW':
              case 'CREATED':
              case 'SUBMISSION_STATE_UNSPECIFIED':
                return submission.late ? 'late' : 'pending';
              case 'RECLAIMED_BY_STUDENT':
                return 'pending'; // Student reclaimed, so it's pending again
              default:
                console.warn('Unknown submission state:', submission.state);
                return 'pending';
            }
          };

          const assignmentStatus = getAssignmentStatus(userSubmission);

          // Get feedback information if submission exists
          let feedback = undefined;
          if (userSubmission?.id) {
            try {
              const feedbackData = await getSubmissionFeedback(
                course.id,
                work.id,
                userSubmission.id
              );
              feedback = {
                ...feedbackData,
                needsAttention:
                  feedbackData.isReturned && !feedbackData.hasGrade,
              };
            } catch (error) {
              console.warn(
                `Failed to get feedback for assignment ${work.id}:`,
                error
              );
            }
          }

          // Include all assignments (both pending and completed) to show full status
          upcomingAssignments.push({
            id: work.id,
            title: work.title || 'Tarea sin título',
            courseId: course.id,
            courseName: course.name || 'Sin nombre',
            dueDate: work.dueDate
              ? `${work.dueDate.year}-${String(work.dueDate.month).padStart(
                  2,
                  '0'
                )}-${String(work.dueDate.day).padStart(2, '0')}`
              : undefined,
            status: assignmentStatus,
            submissionState: userSubmission?.state || 'NEW',
            alternateLink: work.alternateLink || undefined,
            feedback,
          });
        }
      } catch (error) {
        console.warn(
          `Failed to get upcoming assignments for course ${course.id}:`,
          error
        );
      }
    }

    // Sort upcoming assignments by due date
    upcomingAssignments.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    // Generate some recent grades (simplified)
    const recentGrades = courseProgress
      .filter(cp => cp.averageGrade !== undefined)
      .slice(0, 5)
      .map(cp => ({
        courseName: cp.courseName,
        grade: cp.averageGrade!,
        assignmentTitle: 'Promedio del curso',
        date: new Date().toISOString(),
      }));

    return {
      overallProgress,
      courses: courseProgress,
      upcomingAssignments: upcomingAssignments.slice(0, 5), // Limit to 5 most urgent
      recentGrades,
      totalCourses: courses.length,
      totalAssignments,
      completedAssignments: totalCompleted,
    };
  } catch (error) {
    console.error('Failed to get student dashboard data:', error);

    // Return empty data structure on error
    return {
      overallProgress: 0,
      courses: [],
      upcomingAssignments: [],
      recentGrades: [],
      totalCourses: 0,
      totalAssignments: 0,
      completedAssignments: 0,
    };
  }
}
