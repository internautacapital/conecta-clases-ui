"use client"

import { useQuery } from "@tanstack/react-query"
import type { DashboardData } from "@/app/api/dashboard/route"

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to load dashboard data")
  }
  return res.json()
}

export function useDashboard() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // consider data stale after 2 minutes
  })

  return {
    ...query,
    data: query.data || {
      teacherCourses: [],
      studentCourses: [],
      totalCourses: 0,
      totalAssignments: 0,
      completedAssignments: 0,
      pendingAssignments: 0
    }
  }
}
