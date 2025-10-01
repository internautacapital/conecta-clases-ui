import { useQuery } from '@tanstack/react-query';
import type { PendingTask } from '@/app/api/pending-tasks/route';

async function fetchPendingTasks(): Promise<{ pendingTasks: PendingTask[] }> {
  const response = await fetch('/api/pending-tasks');

  if (!response.ok) {
    throw new Error(`Error fetching pending tasks: ${response.statusText}`);
  }

  return response.json();
}

export function usePendingTasks() {
  return useQuery({
    queryKey: ['pending-tasks'],
    queryFn: fetchPendingTasks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
