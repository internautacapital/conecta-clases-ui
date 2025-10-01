'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { StudentProgress } from '@/features/progress/services/progressService';
import { useClientOnly } from '@/hooks/useClientOnly';

type Props = {
  title?: string;
  data: StudentProgress[];
};

export function ProgressTable({ title = 'Progreso de alumnos', data }: Props) {
  const isClient = useClientOnly();

  return (
    <div className='w-full'>
      {/* Mobile Card View */}
      <div className='block sm:hidden space-y-3'>
        {data.length === 0 ? (
          <div className='text-center text-muted-foreground py-8'>
            Sin datos disponibles
          </div>
        ) : (
          data.map(s => (
            <div
              key={s.userId}
              className='bg-white border rounded-lg p-4 space-y-3'
            >
              <div className='flex items-center justify-between'>
                <h3 className='font-medium text-sm'>{s.name}</h3>
                <span className='text-xs text-muted-foreground'>
                  {s.averageGrade === null ? '—' : s.averageGrade}
                </span>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Avance</span>
                  <span className='tabular-nums'>{s.progressPct}%</span>
                </div>
                <div className='h-2 w-full rounded bg-gray-200 overflow-hidden'>
                  <div
                    className='h-2 bg-blue-600 transition-all'
                    style={{
                      width: `${Math.min(100, Math.max(0, s.progressPct))}%`,
                    }}
                    aria-label={`Avance ${s.progressPct}%`}
                  />
                </div>
              </div>

              {s.lastSubmissionAt && (
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Última entrega</span>
                  <time
                    className='tabular-nums'
                    dateTime={s.lastSubmissionAt}
                    title={
                      isClient
                        ? formatDateTimeTooltip(s.lastSubmissionAt)
                        : s.lastSubmissionAt
                    }
                  >
                    {isClient
                      ? formatRelativeDate(s.lastSubmissionAt)
                      : formatStaticDate(s.lastSubmissionAt)}
                  </time>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className='hidden sm:block'>
        <Table>
          <TableCaption className='text-sm'>{title}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='text-xs sm:text-sm'>Alumno</TableHead>
              <TableHead className='w-48 sm:w-56 text-xs sm:text-sm'>
                % Avance
              </TableHead>
              <TableHead className='text-xs sm:text-sm'>Promedio</TableHead>
              <TableHead className='text-xs sm:text-sm'>
                Última entrega
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-center text-muted-foreground py-8'
                >
                  Sin datos disponibles
                </TableCell>
              </TableRow>
            )}
            {data.map(s => (
              <TableRow key={s.userId}>
                <TableCell className='font-medium text-xs sm:text-sm'>
                  {s.name}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <div className='h-2 w-32 sm:w-40 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden'>
                      <div
                        className='h-2 bg-blue-600 transition-all'
                        style={{
                          width: `${Math.min(100, Math.max(0, s.progressPct))}%`,
                        }}
                        aria-label={`Avance ${s.progressPct}%`}
                      />
                    </div>
                    <span className='tabular-nums text-xs sm:text-sm text-muted-foreground'>
                      {s.progressPct}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className='text-xs sm:text-sm'>
                  {s.averageGrade === null ? (
                    <span className='text-muted-foreground'>—</span>
                  ) : (
                    <span className='tabular-nums'>{s.averageGrade}</span>
                  )}
                </TableCell>
                <TableCell className='text-xs sm:text-sm'>
                  {s.lastSubmissionAt ? (
                    <time
                      className='tabular-nums'
                      dateTime={s.lastSubmissionAt}
                      title={
                        isClient
                          ? formatDateTimeTooltip(s.lastSubmissionAt)
                          : s.lastSubmissionAt
                      }
                    >
                      {isClient
                        ? formatRelativeDate(s.lastSubmissionAt)
                        : formatStaticDate(s.lastSubmissionAt)}
                    </time>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatRelativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} h`;
  return `${days} d`;
}

function formatStaticDate(iso: string) {
  // Return a static, server-safe date format that won't cause hydration mismatches
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTimeTooltip(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}
