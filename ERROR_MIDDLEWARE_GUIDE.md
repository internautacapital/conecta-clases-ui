# 🚨 Middleware de Manejo de Errores con Logout Automático

## 📋 Resumen

Este sistema detecta automáticamente errores 500 en los endpoints API y hace logout del usuario, redirigiendo a la página principal.

## 🎯 Componentes Principales

### 1. **createErrorResponse** (Server-side)
- Función helper para crear respuestas de error con logout forzado
- Agrega headers especiales para indicar al cliente que debe hacer logout
- Limpia cookies de sesión automáticamente

### 2. **useErrorInterceptor** (Client-side)
- Hook que intercepta todas las llamadas fetch
- Detecta headers de logout forzado
- Ejecuta signOut automáticamente

### 3. **ErrorInterceptor Component**
- Componente que inicializa el interceptor
- Se incluye en el layout principal
- No renderiza contenido visible

## 🚀 Cómo Funciona

### En el Servidor (Endpoints API):
```typescript
import { createErrorResponse } from "@/lib/errorMiddleware"

export async function GET() {
  try {
    // Lógica del endpoint...
    const data = await someApiCall()
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("API Error:", error)
    // Si es error 500, forzar logout
    return createErrorResponse(error, 500, true)
  }
}
```

### En el Cliente (Automático):
```typescript
// El interceptor detecta automáticamente:
const response = await fetch('/api/notifications')

// Si response tiene X-Force-Logout: true
// → Ejecuta signOut({ callbackUrl: "/" })
// → Redirige a la página principal
```

## 🔧 Endpoints Actualizados

### ✅ `/api/notifications`
- Error 500 → Logout automático
- Redirige a "/"

### ✅ `/api/metrics`
- Error 500 → Logout automático  
- Redirige a "/"

### ✅ `/api/classroom`
- Error 500 → Logout automático
- Redirige a "/"

## 📡 Headers de Respuesta

Cuando ocurre un error 500, el servidor envía:

```http
HTTP/1.1 500 Internal Server Error
X-Force-Logout: true
X-Redirect-To: /
Set-Cookie: next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
Content-Type: application/json

{
  "error": "Internal Server Error",
  "forceLogout": true,
  "redirectTo": "/"
}
```

## 🔄 Flujo Completo

1. **Usuario hace petición** → `fetch('/api/notifications')`
2. **Endpoint falla** → Error 500 en el servidor
3. **createErrorResponse** → Agrega headers de logout forzado
4. **useErrorInterceptor** → Detecta headers en el cliente
5. **signOut automático** → Limpia sesión y redirige
6. **Usuario en "/"** → Página principal sin sesión

## 🛡️ Características de Seguridad

### ✅ Limpieza Completa de Sesión
- Cookies de NextAuth eliminadas
- Headers de logout explícitos
- Redirección forzada

### ✅ Interceptación Inteligente
- Solo intercepta llamadas a `/api/`
- No interfiere con otras peticiones
- Manejo de errores robusto

### ✅ Fallbacks Múltiples
- Detecta logout en headers HTTP
- También verifica en body de respuesta
- Continúa funcionando si falla el parsing

## 🧪 Testing

Para probar el sistema:

1. **Simular error 500** en cualquier endpoint
2. **Verificar logout** automático
3. **Confirmar redirección** a "/"

```typescript
// En cualquier endpoint, agregar:
throw new Error("Simulated 500 error")
```

## ⚙️ Configuración

### Cambiar URL de Redirección:
```typescript
// En lib/errorMiddleware.ts
return createErrorResponse(error, 500, true, "/custom-redirect")
```

### Personalizar Condiciones de Logout:
```typescript
// Solo forzar logout en ciertos errores
const shouldForceLogout = error.code === 'GOOGLE_AUTH_ERROR'
return createErrorResponse(error, 500, shouldForceLogout)
```

## 📝 Notas Importantes

- ✅ **Funciona automáticamente** - No requiere cambios en componentes existentes
- ✅ **Compatible con React Query** - Intercepta todas las llamadas fetch
- ✅ **No afecta SSR** - Solo funciona en el cliente
- ✅ **Limpieza completa** - Elimina toda la sesión del usuario
- ✅ **Logging detallado** - Registra todos los eventos de logout

## 🎯 Resultado

**Ahora cuando cualquier endpoint devuelva error 500:**
1. **Logout automático** del usuario
2. **Redirección a "/"** inmediata  
3. **Sesión completamente limpia**
4. **Sin intervención manual** requerida

El usuario será redirigido automáticamente a la página principal y tendrá que volver a iniciar sesión.
