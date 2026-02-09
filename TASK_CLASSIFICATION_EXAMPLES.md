# Ejemplos de Clasificación de Tareas

## 🎯 Sistema de Clasificación Implementado

El sistema ahora clasifica tareas como **obligatorias** u **opcionales** basándose en:

1. **Nombre del Topic** (si está disponible)
2. **Nombre de la Tarea** (nueva funcionalidad)
3. **Patrones de texto** automáticos

## 📝 Ejemplos de Clasificación por Nombre de Tarea

### ✅ **Tareas Obligatorias** (🔴)

**Por nombres exactos:**

- "Examen Final"
- "Proyecto Integrador"
- "Evaluación Parcial"
- "Entrega Final"
- "Quiz Obligatorio"

**Por patrones automáticos:**

- "Examen de Matemáticas" → `examen` → **Obligatoria**
- "Evaluación Unidad 3" → `evaluaci` → **Obligatoria**
- "Proyecto Final de Curso" → `proyecto` + `final` → **Obligatoria**
- "Quiz Parcial" → `parcial` → **Obligatoria**
- "Entregable Semana 5" → `entregable` → **Obligatoria**

### ⚪ **Tareas Opcionales** (⚪)

**Por nombres exactos:**

- "Actividad Extra"
- "Bonus Points"
- "Tarea Opcional"
- "Ejercicio Complementario"

**Por patrones automáticos:**

- "Actividad Opcional de Repaso" → `opcional` → **Opcional**
- "Ejercicio Extra Crédito" → `extra` → **Opcional**
- "Bonus: Investigación Adicional" → `bonus` → **Opcional**
- "Práctica Complementaria" → `complement` → **Opcional**

### 📂 **Tareas Sin Clasificar**

Si no coincide con ningún patrón:

- "Lectura Capítulo 5" → **Sin clasificar** (muestra topic si existe)
- "Investigación Libre" → **Sin clasificar**

## 🔧 Configuración Personalizable

### Agregar Patrones Personalizados

```typescript
// En config/topicConfig.ts
export const TASK_CLASSIFICATION_CONFIG = {
  // Agregar nombres exactos
  obligatoryTaskNames: ['Tu Tarea Específica', 'Evaluación Institucional'],

  // Agregar patrones automáticos
  obligatoryTaskPatterns: [
    'evaluacion',
    'examen',
    'entrega',
    // Tus patrones personalizados
  ],
};
```

### Función Programática

```typescript
import { addCustomClassification } from '@/config/topicConfig';

// Agregar patrones dinámicamente
addCustomClassification(
  ['mi_patron_obligatorio'], // Obligatorias
  ['mi_patron_opcional'] // Opcionales
);
```

## 📊 Impacto en Métricas

### **Solo Obligatorias Afectan:**

- ✅ **Progreso crítico** (% completado)
- ✅ **Alertas de riesgo** (< 70%)
- ✅ **Indicadores de rendimiento**
- ✅ **Promedios de calificación**

### **Opcionales NO Afectan:**

- ❌ **Progreso crítico**
- ❌ **Alertas de riesgo**
- ❌ **Indicadores críticos**
- ✅ **Se muestran como "adicionales"**

## 🎨 Visualización en UI

### **Badges de Clasificación:**

- 🔴 **Obligatoria** (rojo) - Crítica para evaluación
- ⚪ **Opcional** (gris) - Adicional, no crítica
- 📂 **Topic Name** (índigo) - Sin clasificar

### **Contadores en Dashboard:**

- "X obligatorias" (rojo)
- "X opcionales" (gris)
- "X pendientes", "X completadas" (general)

### **Filtros Disponibles:**

- 🔴 **Solo Obligatorias** (por defecto)
- ⚪ **Solo Opcionales**
- 📂 **Todas las Tareas**

## 🔍 Debug y Verificación

### **Consola del Navegador:**

```
=== CLASIFICACIÓN DE TAREAS ===
"Examen Final" (Topic: "Evaluaciones") -> obligatory
"Actividad Extra" (Topic: "Bonus") -> optional
"Lectura Capítulo 3" (Topic: "N/A") -> unknown
Total: 15 | Obligatorias: 8 | Opcionales: 3
```

### **Tooltips Informativos:**

- Hover sobre badges muestra: "Obligatoria - Clasificado por: nombre de tarea"
- Información de origen de la clasificación

## 🚀 Casos de Uso Reales

### **Semillero Digital:**

```typescript
obligatoryTaskPatterns: [
  'proyecto',
  'evaluacion',
  'entregable',
  'presentacion',
  'final',
];

optionalTaskPatterns: [
  'practica',
  'ejercicio',
  'opcional',
  'extra',
  'complemento',
];
```

### **Universidad:**

```typescript
obligatoryTaskNames: [
  'Examen Parcial',
  'Examen Final',
  'Proyecto de Grado',
  'Ensayo Académico',
];

optionalTaskNames: [
  'Participación en Foro',
  'Lectura Adicional',
  'Actividad Voluntaria',
];
```

### **Colegio:**

```typescript
obligatoryTaskPatterns: ['examen', 'prueba', 'trabajo', 'tarea', 'evaluacion'];

optionalTaskPatterns: ['extra', 'bonus', 'adicional', 'voluntario'];
```

---

**Resultado:** Los estudiantes ahora pueden **enfocar su tiempo** en lo que realmente importa para su evaluación, mientras que las actividades opcionales se muestran como oportunidades adicionales sin generar estrés por "incumplimiento".
