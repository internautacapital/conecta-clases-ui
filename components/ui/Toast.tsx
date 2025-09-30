import * as React from "react";
import * as Toast from "@radix-ui/react-toast";

type ToastProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  eventDate: Date;
  prettyDate: (date: Date) => string;
  onUndo?: () => void;
};

export const ToastNotification: React.FC<ToastProps> = ({
  open,
  setOpen,
  eventDate,
  prettyDate,
  onUndo,
}) => (
  <>
    <Toast.Root
      className={`
                bg-black text-white rounded-md 
                shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]
                p-[15px] grid 
                [grid-template-areas:'title_action''description_action'] 
                [grid-template-columns:auto_max-content] 
                gap-x-[15px] items-center
                data-[state=open]:animate-slideIn
                data-[state=closed]:animate-hide
                data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
                data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200
                data-[swipe=end]:animate-swipeOut
            `}
      open={open}
      onOpenChange={setOpen}
    >
      <Toast.Title className="text-slate-12 font-medium text-[15px] mb-[5px] [grid-area:title]">
        Scheduled: Catch up
      </Toast.Title>
      <Toast.Description
        asChild
        className="text-slate-11 text-[13px] leading-[1.3] m-0 [grid-area:description]"
      >
        <time dateTime={eventDate.toISOString()}>{prettyDate(eventDate)}</time>
      </Toast.Description>
      <Toast.Action
        asChild
        altText="Goto schedule to undo"
        className="[grid-area:action]"
      >
        <button
          className="inline-flex items-center justify-center rounded 
                        font-medium select-none text-[12px] px-[10px] h-[25px] leading-[25px] 
                        bg-green-2 text-green-11 shadow-[inset_0_0_0_1px_var(--green-7)]
                        hover:shadow-[inset_0_0_0_1px_var(--green-8)]
                        focus:shadow-[0_0_0_2px_var(--green-8)]"
          onClick={onUndo}
        >
          Undo
        </button>
      </Toast.Action>
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
