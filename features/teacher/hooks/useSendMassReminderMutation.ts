import { useMutation } from '@tanstack/react-query';

type Student = { email?: string; name: string };

interface Task {
  taskId: string;
  taskTitle: string;
  courseName: string;
  dueDate?: string;
  students: Student[];
}

interface SendMassReminderParams {
  tasks: Task[];
}

interface SendMassReminderResponse {
  success: boolean;
  message: string;
  sentTo: number;
  failed: number;
  skipped: number;
  totalTasks: number;
  errors?: string[];
}

const sendMassReminder = async ({
  tasks,
}: SendMassReminderParams): Promise<SendMassReminderResponse> => {
  const response = await fetch('/api/send-mass-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
};

export const useSendMassReminderMutation = () => {
  return useMutation({
    mutationFn: async (params: SendMassReminderParams) => {
      const result = await sendMassReminder(params);

      let logMessage = `✅ ${result.message}`;
      logMessage += `\n📧 Enviados: ${result.sentTo} estudiantes`;
      logMessage += `\n📋 Tareas procesadas: ${result.totalTasks}`;

      if (result.skipped > 0) {
        logMessage += `\n⏭️ Omitidos: ${result.skipped} (sin email o duplicados)`;
      }

      if (result.failed > 0) {
        logMessage += `\n⚠️ Fallidos: ${result.failed} correos`;
        if (result.errors && result.errors.length > 0) {
          logMessage += `\nErrores:\n${result.errors.join('\n')}`;
        }
      }

      console.log('Mass reminder result:', logMessage);
      return result;
    },
    onSuccess: data => {
      return data;
    },
  });
};
