"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '16px 20px',
          minHeight: '60px',
          maxWidth: '420px',
        },
        classNames: {
          error: '!border-red-200 !bg-red-50 !text-red-900 dark:!bg-red-950/50 dark:!text-red-100 dark:!border-red-800/40 !shadow-red-100/50 dark:!shadow-red-900/20',
          success: '!bg-primary/10 !text-primary !border-primary/20 dark:!bg-primary/5 dark:!border-primary/30 !shadow-primary/10',
          warning: '!border-amber-200 !bg-amber-50 !text-amber-900 dark:!bg-amber-950/50 dark:!text-amber-100 dark:!border-amber-800/40 !shadow-amber-100/50',
          info: '!border-blue-200 !bg-blue-50 !text-blue-900 dark:!bg-blue-950/50 dark:!text-blue-100 dark:!border-blue-800/40 !shadow-blue-100/50',
          description: '!text-muted-foreground !font-normal !text-sm !mt-1 !leading-relaxed',
          title: '!font-semibold !text-base !leading-tight',
          closeButton: '!bg-background !text-muted-foreground hover:!text-foreground !border !border-border !right-3 !top-3 !w-6 !h-6 !rounded-md !p-0 !flex !items-center !justify-center hover:!scale-105 !transition-all !duration-200',
          toast: 'glass !backdrop-blur-sm',
        },
      }}
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      offset={24}
      gap={12}
      duration={6000}
      {...props}
    />
  );
};

export { Toaster };
