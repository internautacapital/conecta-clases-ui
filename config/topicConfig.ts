/**
 * Configuración para clasificar tareas como obligatorias u opcionales
 * Soporta clasificación por nombre de topic Y por nombre de tarea
 */

export type TaskType = 'obligatory' | 'optional' | 'unknown';

export interface TaskClassificationConfig {
  // Nombres exactos de topics obligatorias
  obligatoryTopics: string[];
  // Nombres exactos de topics opcionales
  optionalTopics: string[];
  // Patrones para detectar topics obligatorias
  obligatoryTopicPatterns: string[];
  // Patrones para detectar topics opcionales
  optionalTopicPatterns: string[];
  // Nombres exactos de tareas obligatorias
  obligatoryTaskNames: string[];
  // Nombres exactos de tareas opcionales
  optionalTaskNames: string[];
  // Patrones para detectar tareas obligatorias por nombre
  obligatoryTaskPatterns: string[];
  // Patrones para detectar tareas opcionales por nombre
  optionalTaskPatterns: string[];
}

export const TASK_CLASSIFICATION_CONFIG: TaskClassificationConfig = {
  // ===== CONFIGURACIÓN POR TOPICS =====
  obligatoryTopics: [
    'Evaluaciones',
    'Proyectos Finales',
    'Exámenes',
    'Tareas Obligatorias',
    'Actividades Evaluativas',
    'Entregables Principales',
  ],

  optionalTopics: [
    'Actividades Extra',
    'Bonus',
    'Complementarias',
    'Opcionales',
    'Extra Credit',
    'Actividades Adicionales',
  ],

  obligatoryTopicPatterns: [
    'obligator',
    'evaluaci',
    'examen',
    'proyecto',
    'entregable',
    'parcial',
    'final',
    'required',
    'mandatory',
  ],

  optionalTopicPatterns: [
    'opcional',
    'extra',
    'bonus',
    'complement',
    'adicional',
    'optional',
    'voluntary',
  ],

  // ===== CONFIGURACIÓN POR NOMBRE DE TAREA =====
  obligatoryTaskNames: [
    'Examen Final',
    'Proyecto Integrador',
    'Evaluación Parcial',
    'Entrega Final',
    'Tarea Evaluativa',
    'Quiz Obligatorio',
  ],

  optionalTaskNames: [
    'Actividad Extra',
    'Bonus Points',
    'Tarea Opcional',
    'Ejercicio Complementario',
    'Actividad Adicional',
  ],

  obligatoryTaskPatterns: [
    'examen',
    'evaluaci',
    'parcial',
    'final',
    'proyecto',
    'entregable',
    'obligator',
    'quiz',
    'test',
    'assessment',
    'required',
    'mandatory',
  ],

  optionalTaskPatterns: [
    'opcional',
    'extra',
    'bonus',
    'complement',
    'adicional',
    'voluntary',
    'optional',
    'practice',
    'ejercicio',
  ],
};

/**
 * Clasifica una tarea como obligatoria u opcional basándose en:
 * 1. Nombre del topic (si está disponible)
 * 2. Nombre de la tarea
 * 3. Patrones de texto
 */
export function classifyTask(taskTitle: string, topicName?: string): TaskType {
  const config = TASK_CLASSIFICATION_CONFIG;

  // Normalizar textos para comparación
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normalizedTaskTitle = normalizeText(taskTitle);
  const normalizedTopicName = topicName ? normalizeText(topicName) : '';

  // ===== CLASIFICACIÓN POR TOPIC (Prioridad 1) =====
  if (topicName) {
    // Verificar nombres exactos de topics
    if (
      config.obligatoryTopics.some(
        topic => normalizeText(topic) === normalizedTopicName
      )
    ) {
      return 'obligatory';
    }
    if (
      config.optionalTopics.some(
        topic => normalizeText(topic) === normalizedTopicName
      )
    ) {
      return 'optional';
    }

    // Verificar patrones de topics
    if (
      config.obligatoryTopicPatterns.some(pattern =>
        normalizedTopicName.includes(pattern)
      )
    ) {
      return 'obligatory';
    }
    if (
      config.optionalTopicPatterns.some(pattern =>
        normalizedTopicName.includes(pattern)
      )
    ) {
      return 'optional';
    }
  }

  // ===== CLASIFICACIÓN POR NOMBRE DE TAREA (Prioridad 2) =====

  // Verificar nombres exactos de tareas
  if (
    config.obligatoryTaskNames.some(
      name => normalizeText(name) === normalizedTaskTitle
    )
  ) {
    return 'obligatory';
  }
  if (
    config.optionalTaskNames.some(
      name => normalizeText(name) === normalizedTaskTitle
    )
  ) {
    return 'optional';
  }

  // Verificar patrones en nombre de tarea
  if (
    config.obligatoryTaskPatterns.some(pattern =>
      normalizedTaskTitle.includes(pattern)
    )
  ) {
    return 'obligatory';
  }
  if (
    config.optionalTaskPatterns.some(pattern =>
      normalizedTaskTitle.includes(pattern)
    )
  ) {
    return 'optional';
  }

  // Si no se puede clasificar, retornar unknown
  return 'unknown';
}

/**
 * Clasifica solo por topic (función legacy para compatibilidad)
 */
export function classifyTopic(topicName: string): TaskType {
  return classifyTask('', topicName);
}

/**
 * Obtiene información detallada sobre la clasificación
 */
export function getTaskClassificationInfo(
  taskTitle: string,
  topicName?: string
) {
  const classification = classifyTask(taskTitle, topicName);

  return {
    type: classification,
    isObligatory: classification === 'obligatory',
    isOptional: classification === 'optional',
    isUnknown: classification === 'unknown',
    source: topicName ? 'topic' : 'task_name',
    badge: {
      obligatory: { emoji: '🔴', text: 'Obligatoria', color: 'red' },
      optional: { emoji: '⚪', text: 'Opcional', color: 'gray' },
      unknown: {
        emoji: '📂',
        text: topicName || 'Sin clasificar',
        color: 'indigo',
      },
    }[classification],
  };
}

/**
 * Función para agregar configuración personalizada
 */
export function addCustomClassification(
  obligatoryPatterns: string[] = [],
  optionalPatterns: string[] = []
) {
  TASK_CLASSIFICATION_CONFIG.obligatoryTaskPatterns.push(...obligatoryPatterns);
  TASK_CLASSIFICATION_CONFIG.optionalTaskPatterns.push(...optionalPatterns);
}
