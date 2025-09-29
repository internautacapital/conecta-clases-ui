import { PendingTasksView } from "@/features/teacher/components/PendingTasksView";
import { MyCourses } from "@/features/teacher/components/Dashboard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const accessToken = session?.accessToken;
  if (!accessToken) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Falta token de acceso</h1>
          <p className="text-muted-foreground mb-6">
            Vuelve a iniciar sesión para otorgar permisos de Google Classroom.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <MyCourses />
      <PendingTasksView />
    </div>
  );
}
