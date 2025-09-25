"use client"

import type { CourseMetrics } from "@/features/metrics/services/metricsService"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useClientOnly } from "@/hooks/useClientOnly"

type Props = {
  metrics: CourseMetrics
  loading?: boolean
}

export function MetricsCharts({ metrics, loading }: Props) {
  const isClient = useClientOnly()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Cargando gráficos...</span>
        </div>
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Cargando gráficos...</span>
        </div>
      </div>
    )
  }

  // Show placeholder during SSR to prevent hydration mismatches with Recharts
  if (!isClient) {
    return (
      <div className="space-y-8">
        {/* Summary Cards - Safe to render on server */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalStudents}</div>
            <div className="text-sm text-gray-600">Total estudiantes</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{metrics.totalAssignments}</div>
            <div className="text-sm text-gray-600">Total tareas</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{metrics.totalAnnouncements}</div>
            <div className="text-sm text-gray-600">Total anuncios</div>
          </div>
        </div>

        {/* Chart Placeholders */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Asistencia Semanal (%)</h3>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Cargando gráfico...</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Entregas y Participación Semanal</h3>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Cargando gráfico...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalStudents}</div>
          <div className="text-sm text-gray-600">Total estudiantes</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{metrics.totalAssignments}</div>
          <div className="text-sm text-gray-600">Total tareas</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{metrics.totalAnnouncements}</div>
          <div className="text-sm text-gray-600">Total anuncios</div>
        </div>
      </div>

      {/* Attendance Bar Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Asistencia Semanal (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="weekLabel" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value}%`, "Asistencia"]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="attendancePercent" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Submissions and Participation Line Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Entregas y Participación Semanal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="weekLabel" 
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const label = name === "submissionsCount" ? "Entregas" : "Participaciones"
                return [value, label]
              }}
              labelFormatter={(label) => `${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="submissionsCount" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              name="submissionsCount"
            />
            <Line 
              type="monotone" 
              dataKey="participationCount" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              name="participationCount"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Entregas</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Participación</span>
          </div>
        </div>
      </div>
    </div>
  )
}
