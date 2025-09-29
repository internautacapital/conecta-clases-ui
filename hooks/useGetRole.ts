"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchUserRole(): Promise<{ roles: string[] }> {
  const res = await fetch("/api/user", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load user data");
  }
  return res.json();
}

export function useGetRole() {
  const query = useQuery({
    queryKey: ["user-info"],
    queryFn: fetchUserRole,
  });
  return {
    ...query,
    data: query.data,
  };
}
