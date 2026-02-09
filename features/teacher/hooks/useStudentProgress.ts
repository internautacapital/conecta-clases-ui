'use client';

import type { StudentProgressResponse } from '@/app/api/student-progress/route';
import { useQuery } from '@tanstack/react-query';

async function fetchStudentProgress(): Promise<StudentProgressResponse> {
  const res = await fetch('/api/student-progress', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load student progress data');
  }
  return res.json();
}

export function useStudentProgress() {
  const query = useQuery({
    queryKey: ['student-progress'],
    queryFn: fetchStudentProgress,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // consider data stale after 2 minutes
  });

  return {
    ...query,
    data: query.data || {
      courses: [],
      totalStudents: 0,
      overallAverageCompletion: 0,
    },
  };
}
