"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface Course {
  id?: string | null
  name?: string | null
  section?: string | null
  descriptionHeading?: string | null
}

interface CourseSelectorProps {
  courses: Course[]
  currentCourseId?: string
  basePath: string // e.g., "/dashboard/metrics" or "/dashboard/progress"
}

export function CourseSelector({ courses, currentCourseId, basePath }: CourseSelectorProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  
  const currentCourse = courses.find(c => c.id === currentCourseId)
  
  const handleCourseChange = (courseId: string | null | undefined) => {
    if (!courseId) return
    router.push(`${basePath}?courseId=${encodeURIComponent(courseId)}`)
    setIsOpen(false)
  }

  if (courses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay cursos disponibles
      </div>
    )
  }

  return (
    <div className="relative" data-tour="course-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors min-w-[200px] justify-between cursor-pointer"
      >
        <div className="text-left">
          <div className="font-medium text-sm truncate">
            {currentCourse?.name || "Seleccionar curso"}
          </div>
          {currentCourse?.section && (
            <div className="text-xs text-muted-foreground truncate">
              {currentCourse.section}
            </div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
            {courses.filter(course => course.id).map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseChange(course.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer ${
                  course.id === currentCourseId ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <div className="font-medium text-sm truncate">
                  {course.name || 'Sin nombre'}
                </div>
                {course.section && (
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {course.section}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
