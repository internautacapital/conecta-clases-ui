'use client';

import type { CourseMetrics } from '@/features/metrics/services/metricsService';
import { useClientOnly } from '@/hooks/useClientOnly';
import { Bell, BookOpen, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Props = {
  metrics: CourseMetrics;
  loading?: boolean;
};

export function MetricsCharts({ metrics, loading }: Props) {
  const isClient = useClientOnly();

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center'>
          <span className='text-gray-500'>Cargando gráficos...</span>
        </div>
        <div className='h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center'>
          <span className='text-gray-500'>Cargando gráficos...</span>
        </div>
      </div>
    );
  }

  // Show placeholder during SSR to prevent hydration mismatches with Recharts
  if (!isClient) {
    return (
      <div className='space-y-4 sm:space-y-8'>
        {/* Summary Cards - Safe to render on server */}
        <div
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
          data-tour='metrics-summary'
        >
          <div className='bg-white p-4 sm:p-6 rounded-lg border'>
            <div className='text-xl sm:text-2xl font-bold text-blue-600'>
              {metrics.totalStudents}
            </div>
            <div className='text-xs sm:text-sm text-gray-600'>
              Total estudiantes
            </div>
          </div>
          <div className='bg-white p-4 sm:p-6 rounded-lg border'>
            <div className='text-xl sm:text-2xl font-bold text-green-600'>
              {metrics.totalAssignments}
            </div>
            <div className='text-xs sm:text-sm text-gray-600'>Total tareas</div>
          </div>
          <div className='bg-white p-4 sm:p-6 rounded-lg border'>
            <div className='text-xl sm:text-2xl font-bold text-purple-600'>
              {metrics.totalAnnouncements}
            </div>
            <div className='text-xs sm:text-sm text-gray-600'>
              Total anuncios
            </div>
          </div>
        </div>

        {/* Chart Placeholders */}
        <div className='bg-white p-4 sm:p-6 rounded-lg border'>
          <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
            Asistencia Semanal (%)
          </h3>
          <div className='h-60 sm:h-80 bg-gray-50 rounded-lg flex items-center justify-center'>
            <span className='text-gray-500 text-sm'>Cargando gráfico...</span>
          </div>
        </div>

        <div className='bg-white p-4 sm:p-6 rounded-lg border'>
          <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
            Entregas Semanales
          </h3>
          <div className='h-60 sm:h-80 bg-gray-50 rounded-lg flex items-center justify-center'>
            <span className='text-gray-500 text-sm'>Cargando gráfico...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Summary Cards */}
      <div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
        data-tour='metrics-summary'
      >
        <div className='bg-white p-4 sm:p-6 rounded-lg shadow border'>
          <div className='flex items-center'>
            <Users className='h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0' />
            <div className='ml-3 sm:ml-4 min-w-0'>
              <p className='text-xs sm:text-sm font-medium text-gray-600'>
                Total Estudiantes
              </p>
              <p className='text-xl sm:text-2xl font-bold text-gray-900'>
                {metrics.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white p-4 sm:p-6 rounded-lg shadow border'>
          <div className='flex items-center'>
            <BookOpen className='h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0' />
            <div className='ml-3 sm:ml-4 min-w-0'>
              <p className='text-xs sm:text-sm font-medium text-gray-600'>
                Total Tareas
              </p>
              <p className='text-xl sm:text-2xl font-bold text-gray-900'>
                {metrics.totalAssignments}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white p-4 sm:p-6 rounded-lg shadow border'>
          <div className='flex items-center'>
            <Bell className='h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0' />
            <div className='ml-3 sm:ml-4 min-w-0'>
              <p className='text-xs sm:text-sm font-medium text-gray-600'>
                Total Anuncios
              </p>
              <p className='text-xl sm:text-2xl font-bold text-gray-900'>
                {metrics.totalAnnouncements}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Bar Chart */}
      <div
        className='bg-white p-4 sm:p-6 rounded-lg border'
        data-tour='metrics-charts'
      >
        <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
          Asistencia Semanal (%)
        </h3>
        <ResponsiveContainer width='100%' height={250} className='sm:h-[300px]'>
          <BarChart data={metrics.weeklyData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='weekLabel'
              tick={{ fontSize: 10 }}
              className='sm:text-xs'
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className='sm:text-xs'
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Asistencia']}
              labelFormatter={label => `${label}`}
            />
            <Bar
              dataKey='attendancePercent'
              fill='#3B82F6'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Submissions Line Chart */}
      <div className='bg-white p-4 sm:p-6 rounded-lg border'>
        <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
          Entregas Semanales
        </h3>
        <ResponsiveContainer width='100%' height={250} className='sm:h-[300px]'>
          <LineChart data={metrics.weeklyData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='weekLabel'
              tick={{ fontSize: 10 }}
              className='sm:text-xs'
            />
            <YAxis tick={{ fontSize: 10 }} className='sm:text-xs' />
            <Tooltip
              formatter={(value: number) => [value, 'Entregas']}
              labelFormatter={label => `${label}`}
            />
            <Line
              type='monotone'
              dataKey='submissionsCount'
              stroke='#10B981'
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className='flex justify-center mt-4'>
          <div className='flex items-center'>
            <div className='w-4 h-4 bg-green-500 rounded mr-2'></div>
            <span className='text-sm text-gray-600'>Entregas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
