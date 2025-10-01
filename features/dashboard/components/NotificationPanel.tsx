'use client';

import { useClientOnly } from '@/hooks/useClientOnly';
import {
  useNotifications,
  type NotificationItem,
} from '@/features/notifications/hooks/useNotifications';

export function NotificationPanel() {
  const isClient = useClientOnly();
  const { items: notifications, isLoading, error } = useNotifications();

  const getNotificationIcon = () => {
    return '📢'; // All notifications from API are announcements
  };

  const isRecent = (creationTime: string | null) => {
    if (!creationTime || !isClient) return false;

    const created = new Date(creationTime);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    return diffHours <= 24; // Consider recent if less than 24 hours old
  };

  const getPriorityColor = (notification: NotificationItem) => {
    // Determine priority based on recency and content
    if (isRecent(notification.creationTime)) {
      return 'border-l-red-500 bg-red-50'; // Recent = high priority
    }
    return 'border-l-blue-500 bg-blue-50'; // Older = normal priority
  };

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp || !isClient) return 'Hace un momento';

    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} d`;
  };

  const getNotificationTitle = (notification: NotificationItem) => {
    return `${notification.courseName} - Nuevo anuncio`;
  };

  const getNotificationPreview = (text: string) => {
    // Clean HTML and limit text length
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    return cleanText.length > 100
      ? cleanText.substring(0, 100) + '...'
      : cleanText;
  };

  const recentNotifications = notifications.filter(n =>
    isRecent(n.creationTime)
  );

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Notificaciones Importantes
          </h2>
          <div className='bg-gray-200 animate-pulse h-6 w-16 rounded-full'></div>
        </div>
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='border-l-4 border-l-gray-200 bg-gray-50 p-4 rounded-r-lg animate-pulse'
            >
              <div className='h-4 bg-gray-200 rounded mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-3/4'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Notificaciones Importantes
          </h2>
          <span className='bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
            Error
          </span>
        </div>
        <div className='text-center py-8'>
          <div className='text-4xl mb-2'>⚠️</div>
          <p className='text-gray-500'>
            No se pudieron cargar las notificaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-gray-900'>
          Notificaciones Importantes
        </h2>
        <span className='bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
          {recentNotifications.length} recientes
        </span>
      </div>

      <div className='space-y-3'>
        {notifications.length === 0 ? (
          <div className='text-center py-8'>
            <div className='text-4xl mb-2'>✅</div>
            <p className='text-gray-500'>
              ¡Todo al día! No hay notificaciones nuevas.
            </p>
          </div>
        ) : (
          notifications.slice(0, 5).map(notification => (
            <div
              key={notification.id}
              className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(notification)}`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3 flex-1'>
                  <span className='text-xl'>{getNotificationIcon()}</span>
                  <div className='flex-1'>
                    <h3 className='font-medium text-gray-900 text-sm'>
                      {getNotificationTitle(notification)}
                    </h3>
                    <p className='text-gray-700 text-sm mt-1'>
                      {getNotificationPreview(notification.text)}
                    </p>
                    <div className='flex items-center justify-between mt-2'>
                      <span className='text-xs text-gray-500'>
                        {formatTimeAgo(notification.creationTime)}
                      </span>
                      {notification.alternateLink && (
                        <a
                          href={notification.alternateLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors'
                        >
                          Ver anuncio
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 5 && (
        <div className='mt-4 text-center'>
          <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
            Ver todas las notificaciones ({notifications.length - 5} más)
          </button>
        </div>
      )}

      {notifications.length > 0 && (
        <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
          <div className='flex items-center gap-2'>
            <span className='text-blue-600'>💡</span>
            <p className='text-blue-800 text-sm'>
              <strong>Tip:</strong> Revisa regularmente los anuncios de tus
              profesores para no perderte información importante.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
