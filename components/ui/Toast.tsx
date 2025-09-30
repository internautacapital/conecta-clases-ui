import * as React from "react";
import * as Toast from "@radix-ui/react-toast";

type EmailStats = {
  sent?: number;
  failed?: number;
  skipped?: number;
  totalTasks?: number;
};

type ToastProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  emailStats?: EmailStats;
  variant?: "success" | "warning" | "error";
};

export const ToastNotification: React.FC<ToastProps> = ({
  open,
  setOpen,
  title = "Correos enviados",
  description,
  emailStats,
  variant = "success",
}) => {
  const bgColor = 
    variant === "success" ? "bg-green-600" :
    variant === "warning" ? "bg-yellow-600" :
    variant === "error" ? "bg-red-600" :
    "bg-black";

  return (
    <>
      <Toast.Root
        className={`
                ${bgColor} text-white rounded-md 
                shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]
                p-[15px] 
                data-[state=open]:animate-slideIn
                data-[state=closed]:animate-hide
                data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
                data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200
                data-[swipe=end]:animate-swipeOut
            `}
        open={open}
        onOpenChange={setOpen}
        duration={5000}
      >
        <Toast.Title className="font-medium text-[15px] mb-[5px]">
          {title}
        </Toast.Title>
        {description && (
          <Toast.Description className="text-[13px] leading-[1.3] mb-2 opacity-90">
            {description}
          </Toast.Description>
        )}
        {emailStats && (
          <Toast.Description className="text-[12px] leading-[1.4] opacity-90">
            <div className="space-y-1">
              {emailStats.sent !== undefined && emailStats.sent > 0 && (
                <div>✅ Enviados: {emailStats.sent}</div>
              )}
              {emailStats.failed !== undefined && emailStats.failed > 0 && (
                <div>⚠️ Fallidos: {emailStats.failed}</div>
              )}
              {emailStats.skipped !== undefined && emailStats.skipped > 0 && (
                <div>⏭️ Omitidos: {emailStats.skipped}</div>
              )}
              {emailStats.totalTasks !== undefined && emailStats.totalTasks > 0 && (
                <div>📋 Tareas: {emailStats.totalTasks}</div>
              )}
            </div>
          </Toast.Description>
        )}
      </Toast.Root>
      <Toast.Viewport
        className="fixed bottom-0 right-0 
                flex flex-col 
                p-[25px] gap-[10px] 
                w-[390px] max-w-[100vw] 
                m-0 list-none 
                z-[2147483647] outline-none"
      />
    </>
  );
};
