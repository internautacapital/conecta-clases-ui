"use client";

import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

export function useHasTeacherCourses() {
  const { data, isLoading } = useDashboard();

  return {
    hasTeacherCourses: data.teacherCourses.length > 0,
    isLoading,
  };
}
