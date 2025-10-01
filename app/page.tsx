import { ArrowRight, BookOpen, LogIn, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Hero Section */}
      <section className='container mx-auto px-6 py-22 text-center'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
            Potencia tu{' '}
            <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Google Classroom
            </span>
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            La herramienta complementaria que resuelve los desafíos de
            seguimiento, comunicación y métricas que Google Classroom no puede
            cubrir por sí solo.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/login'
              className='btn-primary inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all'
            >
              <BookOpen className='w-5 h-5 mr-2' />
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className='container mx-auto px-6 py-22'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            ¿Cómo funciona Conecta Clases?
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            En solo 3 pasos simples, transforma tu experiencia con Google
            Classroom
          </p>
        </div>

        <div className='max-w-5xl mx-auto'>
          <div className='grid md:grid-cols-3 gap-8'>
            {/* Step 1 */}
            <div className='relative'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                  <LogIn className='w-10 h-10 text-white' />
                </div>
                <div className='absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                  1
                </div>
                <h3 className='text-xl font-semibold mb-4 text-gray-900'>
                  Inicia Sesión con Google
                </h3>
                <p className='text-gray-600 mb-6'>
                  Usa tu cuenta de Google existente. La misma que ya usas en
                  Google Classroom. Sin crear nuevas cuentas ni recordar
                  contraseñas.
                </p>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <p className='text-sm text-blue-800 font-medium'>
                    🔐 OAuth 2.0 • ⚡ Acceso instantáneo
                  </p>
                </div>
              </div>
              {/* Arrow for desktop */}
              <div className='hidden md:block absolute top-10 -right-4 text-blue-300'>
                <ArrowRight className='w-8 h-8' />
              </div>
            </div>

            {/* Step 2 */}
            <div className='relative'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                  <Zap className='w-10 h-10 text-white' />
                </div>
                <div className='absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                  2
                </div>
                <h3 className='text-xl font-semibold mb-4 text-gray-900'>
                  Sincronización Automática
                </h3>
                <p className='text-gray-600 mb-6'>
                  Conecta Clases se sincroniza automáticamente con tus cursos,
                  estudiantes, tareas y anuncios de Google Classroom. Todo en
                  tiempo real.
                </p>
                <div className='bg-purple-50 p-4 rounded-lg'>
                  <p className='text-sm text-purple-800 font-medium'>
                    🔄 API Directa • 📚 Todos tus cursos
                  </p>
                </div>
              </div>
              {/* Arrow for desktop */}
              <div className='hidden md:block absolute top-10 -right-4 text-purple-300'>
                <ArrowRight className='w-8 h-8' />
              </div>
            </div>

            {/* Step 3 */}
            <div className='relative'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                  <TrendingUp className='w-10 h-10 text-white' />
                </div>
                <div className='absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                  3
                </div>
                <h3 className='text-xl font-semibold mb-4 text-gray-900'>
                  Visualiza y Gestiona
                </h3>
                <p className='text-gray-600 mb-6'>
                  Accede a dashboards intuitivos con progreso de estudiantes,
                  métricas de participación y notificaciones centralizadas. Todo
                  lo que Google Classroom no te muestra.
                </p>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <p className='text-sm text-green-800 font-medium'>
                    📊 Dashboards • 🎯 Métricas claras
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className='text-center mt-12'>
            <p className='text-lg text-gray-600 mb-6'>
              ¿Listo para potenciar tu Google Classroom?
            </p>
            <Link
              href='/login'
              className='btn-primary inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all'
            >
              <BookOpen className='w-5 h-5 mr-2' />
              Comenzar Ahora - Es Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='container mx-auto px-6'>
          <div className='text-center'>
            <div className='navbar-brand text-white mb-4'>Conecta Clases</div>
            <p className='text-gray-400 mb-6'>
              Formando jóvenes en oficios digitales para mejorar su
              empleabilidad
            </p>
            <div className='flex justify-center space-x-6'>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors'
              >
                Política de Privacidad
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors'
              >
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
