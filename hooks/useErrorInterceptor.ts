'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook que intercepta respuestas de fetch y detecta errores que requieren logout
 */
export function useErrorInterceptor() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Guardar fetch original
    const originalFetch = window.fetch;

    // Interceptor de fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);

        // Solo interceptar llamadas a nuestras APIs
        const url = typeof input === 'string' ? input : input.toString();
        const isApiCall = url.includes('/api/');

        if (isApiCall && !response.ok) {
          // Verificar headers de logout forzado
          const forceLogout = response.headers.get('X-Force-Logout');
          const redirectTo = response.headers.get('X-Redirect-To');

          if (forceLogout === 'true') {
            console.log('Error 500 detected - forcing logout');

            // Hacer logout y redirigir
            await signOut({
              callbackUrl: redirectTo || '/',
              redirect: true,
            });

            return response;
          }

          // También verificar en el body de la respuesta
          try {
            const clonedResponse = response.clone();
            const errorData = await clonedResponse.json();

            if (errorData.forceLogout === true) {
              console.log('Error 500 in response body - forcing logout');

              await signOut({
                callbackUrl: errorData.redirectTo || '/',
                redirect: true,
              });
            }
          } catch (e) {
            console.error('Error parsing response body:', e);
          }
        }

        return response;
      } catch (error) {
        console.error('Fetch interceptor error:', error);
        throw error;
      }
    };

    // Cleanup function
    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);
}
