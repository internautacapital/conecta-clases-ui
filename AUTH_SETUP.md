# Configuración de Autenticación con Google

Este proyecto implementa autenticación con Google usando NextAuth.js. Los usuarios se autentican con su email de Google (el mismo que usan en Classroom) y se les asigna un rol (alumno, profesor, coordinador).

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install next-auth @auth/google-provider
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` basado en `env.example`:

```bash
cp env.example .env.local
```

Completa las variables de entorno:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-secreta-aqui
GOOGLE_CLIENT_ID=tu-google-client-id-aqui
GOOGLE_CLIENT_SECRET=tu-google-client-secret-aqui
```

### 3. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Ve a "Credentials" y crea un "OAuth 2.0 Client ID"
5. Configura las URLs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
6. Copia el Client ID y Client Secret a tu archivo `.env.local`

Además, habilita la API de Google Classroom para tu proyecto en Google Cloud Console (APIs & Services > Library > Classroom API > Enable).

### 4. Generar NEXTAUTH_SECRET

Puedes generar una clave secreta usando:

```bash
openssl rand -base64 32
```

O usando Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Estructura de Archivos Creados

```
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Página de login con Google
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts       # API route de NextAuth
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard protegido
│   └── layout.tsx                # Layout actualizado con SessionProvider
├── components/
│   └── providers.tsx             # SessionProvider wrapper
├── lib/
│   └── auth.ts                   # Configuración de NextAuth
├── types/
│   └── next-auth.d.ts           # Tipos extendidos para NextAuth
├── middleware.ts                 # Middleware para proteger rutas
└── env.example                   # Ejemplo de variables de entorno
```

## Funcionalidades Implementadas

### ✅ Autenticación con Google
- Los usuarios se autentican usando su cuenta de Google
- Compatible con cuentas de Google Classroom

### ✅ Gestión de Roles
- **Alumno**: Rol por defecto
- **Profesor**: Para emails que contengan "profesor" o "teacher"
- **Coordinador**: Para emails que contengan "coordinador" o "admin"

### ✅ Protección de Rutas
- Las rutas `/dashboard/*` están protegidas
- Los usuarios no autenticados son redirigidos a `/login`

### ✅ Sesión Persistente
- La sesión incluye email y rol del usuario
- Los datos se mantienen entre recargas de página

## Uso

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 2. Probar la autenticación

1. Ve a `http://localhost:3000/login`
2. Haz clic en "Continuar con Google"
3. Autoriza la aplicación
4. Serás redirigido al dashboard

### 3. Acceder al dashboard

- URL: `http://localhost:3000/dashboard`
- Solo accesible para usuarios autenticados
- Muestra información de la sesión y rol del usuario

## Personalización de Roles

Para personalizar la lógica de asignación de roles, edita la función `determineUserRole` en `lib/auth.ts`:

```typescript
function determineUserRole(email: string): 'alumno' | 'profesor' | 'coordinador' {
  // Implementa tu lógica personalizada aquí
  // Puedes consultar una base de datos, usar patrones de email, etc.
  
  if (email.includes('profesor') || email.includes('teacher')) {
    return 'profesor'
  }
  if (email.includes('coordinador') || email.includes('admin')) {
    return 'coordinador'
  }
  
  return 'alumno' // Rol por defecto
}
```

## Integración con Google Classroom

Se añadió un cliente de Google Classroom con OAuth 2.0 en `lib/google.ts` y un endpoint en `app/api/classroom/route.ts`.

### Instalar dependencia

```bash
npm install googleapis
```

### Scopes requeridos
Los scopes necesarios ya están configurados en `lib/auth.ts`:

- `https://www.googleapis.com/auth/classroom.courses.readonly`
- `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
- `https://www.googleapis.com/auth/classroom.student-submissions.me.readonly`

### Variables de entorno usadas
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`

### Endpoints disponibles
- `GET /api/classroom`: retorna los cursos del usuario autenticado (requiere sesión iniciada y permisos aceptados en el consentimiento de Google).

Ejemplo (una vez autenticado en el navegador):

```bash
curl -X GET http://localhost:3000/api/classroom
```

## Próximos Pasos

1. **Base de Datos**: Conectar a una base de datos para gestionar usuarios y roles
2. **Roles Dinámicos**: Implementar un sistema de gestión de roles más flexible
3. **Permisos**: Crear un sistema de permisos basado en roles
4. **UI Mejorada**: Mejorar la interfaz de usuario del login y dashboard

## Troubleshooting

### Error: "Cannot find module 'next-auth'"
Asegúrate de instalar las dependencias:
```bash
npm install next-auth @auth/google-provider
```

### Error: "Invalid client_id"
Verifica que el `GOOGLE_CLIENT_ID` en `.env.local` sea correcto y que las URLs autorizadas estén configuradas correctamente en Google Cloud Console.

### Error: "NEXTAUTH_SECRET missing"
Asegúrate de tener `NEXTAUTH_SECRET` configurado en tu archivo `.env.local`.
