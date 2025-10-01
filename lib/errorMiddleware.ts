import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware que intercepta respuestas de error 500 en endpoints API
 * y agrega headers para forzar logout en el cliente
 */
export function errorMiddleware(request: NextRequest) {
  // Solo aplicar a rutas de API
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Función helper para envolver respuestas de error con logout forzado
 */
export function createErrorResponse(
  error: Error | { message?: string } | string | unknown,
  status: number = 500,
  forceLogout: boolean = false
) {
  // Extract error message safely
  let errorMessage = 'Internal Server Error';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    errorMessage = error.message;
  }

  const response = NextResponse.json(
    {
      error: errorMessage,
      forceLogout,
      redirectTo: forceLogout ? '/' : undefined,
    },
    { status }
  );

  if (forceLogout) {
    // Agregar headers para invalidar la sesión
    response.headers.set('X-Force-Logout', 'true');
    response.headers.set('X-Redirect-To', '/');

    // Limpiar cookies de sesión
    response.headers.set(
      'Set-Cookie',
      'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=lax'
    );
  }

  return response;
}
