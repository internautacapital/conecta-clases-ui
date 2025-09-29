"use client";

import { HelpButton } from "@/components/ui/HelpButton";
import { LoadingLink } from "@/components/ui/LoadingLink";
import { useGetRole } from "@/hooks/useGetRole";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Presentation,
  TrendingUp,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import * as React from "react";
import { RoleBadge } from "./RoleBadge";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const { data, isLoading } = useGetRole();
  // Close menus when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) {
        setUserMenuOpen(false);
      }
      if (!target.closest("[data-mobile-menu]")) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const navigation = React.useMemo(() => {
    const baseNavigation = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Progreso", href: "/dashboard/progress", icon: TrendingUp },
      { name: "Métricas", href: "/dashboard/metrics", icon: BarChart3 },
    ];

    if (data?.roles?.includes("teacher")) {
      baseNavigation.push({
        name: "Tus Cursos",
        href: "/dashboard/teacher",
        icon: Presentation,
      });
    }

    return baseNavigation;
  }, [data]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8" data-tour="navbar">
          <LoadingLink href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-semibold text-gray-900">Conecta Clases</span>
          </LoadingLink>

          {session && (
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <LoadingLink
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    data-tour={
                      item.href === "/dashboard" ? "dashboard-link" : undefined
                    }
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.name}
                  </LoadingLink>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side - notifications, help, user menu */}
        <div className="flex items-center space-x-3">
          <RoleBadge isLoading={isLoading} roles={["teacher"]} />
          {/* Notifications */}
          {session && (
            <div data-tour="notifications">
              <NotificationBell />
            </div>
          )}

          {/* Help Button */}
          {session && (
            <HelpButton variant="inline" className="hidden md:flex" />
          )}

          {/* Login button - only show when not authenticated */}
          {!session && (
            <LoadingLink
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </LoadingLink>
          )}

          {/* User menu */}
          {session && (
            <div className="relative" data-user-menu data-tour="user-menu">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {getUserInitials(session.user?.name, session.user?.email)}
                </div>
                <span className="hidden sm:block text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user?.name || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user?.email}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {session.user?.role}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button - only show when authenticated */}
          {session && (
            <div className="md:hidden" data-mobile-menu>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation menu - only show when authenticated */}
      {session && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <LoadingLink
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconComponent className="w-5 h-5" />
                  {item.name}
                </LoadingLink>
              );
            })}

            {/* Help button in mobile menu */}
            {session && (
              <div className="px-3 py-2">
                <HelpButton variant="inline" className="w-full justify-start" />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
