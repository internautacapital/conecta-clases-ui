"use client";

import { usePageLoader } from "@/hooks/usePageLoader";
import { Suspense } from "react";

export function PageLoaderContent() {
  const loading = usePageLoader();

  if (!loading) return null;

  return (
    <div className="page-loader-mobile">
      <div className="flex flex-col items-center space-y-6 p-8 rounded-2xl bg-white shadow-xl border">
        {/* Logo */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">CC</span>
        </div>

        {/* Spinner */}
        <div className="relative">
          <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Cargando...</p>
          <p className="text-xs text-gray-500 mt-1">Semillero Digital</p>
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderContent />
    </Suspense>
  );
}
