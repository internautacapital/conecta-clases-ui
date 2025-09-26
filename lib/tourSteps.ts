import { DriveStep } from "driver.js"

/**
 * Pasos del tour para diferentes páginas de la aplicación
 */

export const dashboardTourSteps: DriveStep[] = [
  {
    element: '[data-tour="navbar"]',
    popover: {
      title: "¡Bienvenido a Conecta Clases! 🎉",
      description: "Esta es la barra de navegación principal. Desde aquí puedes acceder a todas las funciones de la plataforma.",
      side: "bottom",
      align: "start"
    }
  },
  {
    element: '[data-tour="dashboard-link"]',
    popover: {
      title: "Dashboard Principal",
      description: "El dashboard es tu centro de control. Aquí encontrarás un resumen de todos tus cursos y actividades.",
      side: "bottom",
      align: "center"
    }
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: "Notificaciones 🔔",
      description: "Aquí verás las notificaciones y anuncios de tus cursos de Google Classroom en tiempo real.",
      side: "bottom",
      align: "center"
    }
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: "Menú de Usuario 👤",
      description: "Accede a tu perfil, configuraciones y cierra sesión desde aquí.",
      side: "bottom",
      align: "end"
    }
  }
]

export const metricsTourSteps: DriveStep[] = [
  {
    element: '[data-tour="course-selector"]',
    popover: {
      title: "Selector de Cursos 📚",
      description: "Cambia entre diferentes cursos para ver métricas específicas de cada uno. Los datos se actualizan automáticamente.",
      side: "left",
      align: "center"
    }
  },
  {
    element: '[data-tour="metrics-charts"]',
    popover: {
      title: "Gráficos de Métricas 📊",
      description: "Visualiza el progreso semanal de tus estudiantes, incluyendo asistencia y entregas de tareas.",
      side: "top",
      align: "center"
    }
  },
  {
    element: '[data-tour="metrics-summary"]',
    popover: {
      title: "Resumen de Métricas 📈",
      description: "Aquí puedes ver un resumen rápido con los números más importantes de tu curso.",
      side: "top",
      align: "center"
    }
  }
]

export const progressTourSteps: DriveStep[] = [
  {
    element: '[data-tour="course-selector"]',
    popover: {
      title: "Selector de Cursos 📚",
      description: "Selecciona el curso del cual quieres ver el progreso detallado de los estudiantes.",
      side: "left",
      align: "center"
    }
  },
  {
    element: '[data-tour="progress-table"]',
    popover: {
      title: "Tabla de Progreso 📋",
      description: "Aquí puedes ver el progreso detallado de cada estudiante, incluyendo tareas completadas y calificaciones.",
      side: "top",
      align: "center"
    }
  }
]

export const firstTimeTourSteps: DriveStep[] = [
  {
    element: '[data-tour="navbar"]',
    popover: {
      title: "¡Bienvenido a Conecta Clases! 🎉",
      description: "Te damos la bienvenida a tu nueva plataforma educativa. Te mostraremos las funciones principales.",
      side: "bottom",
      align: "start"
    }
  },
  {
    element: '[data-tour="dashboard-link"]',
    popover: {
      title: "Dashboard - Tu Centro de Control 🏠",
      description: "Desde el dashboard puedes ver un resumen de todos tus cursos y acceder rápidamente a las diferentes secciones.",
      side: "bottom",
      align: "center"
    }
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: "Notificaciones en Tiempo Real 🔔",
      description: "Mantente al día con todos los anuncios y actividades de Google Classroom. Las notificaciones se actualizan automáticamente.",
      side: "bottom",
      align: "center"
    }
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: "Tu Perfil y Configuración ⚙️",
      description: "Desde aquí puedes ver tu información de perfil y cerrar sesión cuando termines.",
      side: "bottom",
      align: "end"
    }
  },
  {
    popover: {
      title: "¡Listo para Comenzar! 🚀",
      description: "Ya conoces lo básico. Explora las secciones de Métricas y Progreso para ver datos detallados de tus cursos. ¡Puedes volver a ver este tour desde el botón de ayuda!",
      side: "top",
      align: "center"
    }
  }
]
