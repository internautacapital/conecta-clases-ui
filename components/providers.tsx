"use client";

import { LoadingProvider } from "@/contexts/LoadingContext";
import { TourProvider } from "@/contexts/TourContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toast } from "radix-ui";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Toast.Provider swipeDirection="right">
          <LoadingProvider>
            <TourProvider>{children}</TourProvider>
          </LoadingProvider>
        </Toast.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
