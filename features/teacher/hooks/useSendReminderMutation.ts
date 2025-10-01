import { useMutation } from '@tanstack/react-query';

type Student = { email?: string; name: string };

interface SendReminderParams {
  taskId: string;
  taskTitle: string;
  courseName: string;
  dueDate: string | undefined;
  students: Student[];
}

interface SendReminderResponse {
  success: boolean;
  message: string;
  sentTo: number;
  failed: number;
  skipped: number;
  errors?: string[];
}

const sendReminder = async ({
  taskId,
  taskTitle,
  courseName,
  dueDate,
  students,
}: SendReminderParams): Promise<SendReminderResponse> => {
  const response = await fetch('/api/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, taskTitle, courseName, dueDate, students }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

export const useSendReminderMutation = () => {
  return useMutation({
    mutationFn: async (params: SendReminderParams) => {
      const result = await sendReminder(params);
      let logMessage = `✅ ${result.message}`;
      if (result.skipped && result.skipped > 0)
        logMessage += ` (${result.skipped} estudiantes sin email)`;
      if (result.failed && result.failed > 0)
        logMessage += `\n⚠️ ${result.failed} correos fallaron`;
      console.log('message :>> ', logMessage);
      return result;
    },
    onSuccess: data => {
      return data;
    },
  });
};
