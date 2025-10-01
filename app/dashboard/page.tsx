import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setAccessToken } from '@/lib/google';
import { getStudentDashboardData } from '@/features/dashboard/services/studentDashboardService';
import { ProgressOverview } from '@/features/dashboard/components/ProgressOverview';
import { NotificationPanel } from '@/features/dashboard/components/NotificationPanel';
import { UpcomingAssignments } from '@/features/dashboard/components/UpcomingAssignments';
import { QuickActions } from '@/features/dashboard/components/QuickActions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const accessToken = session?.accessToken;
  if (!accessToken) {
    return (
      <div className='p-6'>
        <h1 className='text-xl font-semibold'>Falta token de acceso</h1>
        <p className='text-muted-foreground'>
          Vuelve a iniciar sesión para otorgar permisos de Google Classroom.
        </p>
      </div>
    );
  }

  setAccessToken(accessToken);

  // Get student dashboard data
  const dashboardData = await getStudentDashboardData();

  return (
    <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          ¡Hola, {session.user?.name?.split(' ')[0] || 'Estudiante'}! 👋
        </h1>
        <p className='text-gray-600 mt-2'>
          Aquí tienes un resumen de tu progreso en Semillero Digital
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Progress Overview - Most Important */}
          <ProgressOverview data={dashboardData} />

          {/* Notifications Panel */}
          <NotificationPanel />

          {/* Upcoming Assignments */}
          <UpcomingAssignments
            assignments={dashboardData.upcomingAssignments}
          />
        </div>

        {/* Right Column - Secondary Content */}
        <div className='space-y-6'>
          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>

      {/* Footer Message */}
      <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <span className='text-blue-600'>🎯</span>
          <p className='text-blue-800 text-sm'>
            <strong>Semillero Digital</strong> te ayuda a complementar Google
            Classroom con seguimiento consolidado de progreso y comunicación
            clara.
          </p>
        </div>
      </div>
    </div>
  );
}
