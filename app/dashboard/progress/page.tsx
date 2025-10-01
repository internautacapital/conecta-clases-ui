import { CourseSelector } from '@/components/ui/CourseSelector';
import { ProgressTable } from '@/features/progress/components/ProgressTable';
import { getCourseProgress } from '@/features/progress/services/progressService';
import { authOptions } from '@/lib/auth';
import { getCourses, setAccessToken } from '@/lib/google';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProgressPage({
  searchParams,
}: {
  searchParams?: Promise<{ courseId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const accessToken = session?.accessToken;
  if (!accessToken) {
    return (
      <div className='p-4 sm:p-6'>
        <h1 className='text-lg sm:text-xl font-semibold'>
          Falta token de acceso
        </h1>
        <p className='text-muted-foreground text-sm sm:text-base'>
          Vuelve a iniciar sesión para otorgar permisos de Google Classroom.
        </p>
      </div>
    );
  }

  setAccessToken(accessToken);

  const params = await searchParams;
  const courses = await getCourses();

  if (courses.length === 0) {
    return (
      <div className='max-w-5xl mx-auto p-4 sm:p-6'>
        <h1 className='text-xl sm:text-2xl font-bold mb-4'>Progreso</h1>
        <p className='text-muted-foreground text-sm sm:text-base'>
          No se encontraron cursos activos.
        </p>
      </div>
    );
  }

  // Use the first course as default if no courseId is provided
  const courseId = params?.courseId || courses[0].id;

  // Ensure courseId is valid before proceeding
  if (!courseId) {
    return (
      <div className='max-w-5xl mx-auto p-4 sm:p-6'>
        <h1 className='text-xl sm:text-2xl font-bold mb-4'>Progreso</h1>
        <p className='text-muted-foreground text-sm sm:text-base'>
          Error: ID del curso no válido.
        </p>
      </div>
    );
  }

  const data = await getCourseProgress(courseId);
  const currentCourse = courses.find(c => c.id === courseId);

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6'>
      <div className='flex items-start justify-between flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <h1 className='text-xl sm:text-2xl font-bold'>Progreso del curso</h1>
          <p className='text-muted-foreground mt-1 text-sm sm:text-base'>
            {currentCourse?.name}
          </p>
        </div>
        <div className='w-full sm:w-auto'>
          <CourseSelector
            courses={courses}
            currentCourseId={courseId}
            basePath='/dashboard/progress'
          />
        </div>
      </div>
      <ProgressTable data={data} />
    </div>
  );
}
