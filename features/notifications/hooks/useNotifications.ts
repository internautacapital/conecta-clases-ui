"use client"

import { useQuery } from "@tanstack/react-query"

export type NotificationItem = {
  id?: string | null
  courseId: string
  courseName: string
  text: string
  alternateLink: string | null
  state: string | null
  creationTime: string | null
  updateTime: string | null
}

async function fetchAnnouncements(): Promise<NotificationItem[]> {
  const res = await fetch("/api/notifications", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to load announcements")
  }
  const data = await res.json()
  return (data.announcements ?? []) as NotificationItem[]
}

export function useNotifications() {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchAnnouncements,
    refetchInterval: 60_000, // refresh every 60s
  })

  const items = query.data ?? []
  const count = items.length

  return {
    ...query,
    items,
    count,
  }
}
