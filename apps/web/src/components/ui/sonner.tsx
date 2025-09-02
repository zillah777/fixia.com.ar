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
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#0f172a',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: '16px',
          padding: '16px 20px',
          minHeight: '64px',
          maxWidth: '400px',
        },
        classNames: {
          error: '!border-red-200 !bg-gradient-to-br !from-red-50/90 !to-red-100/90 !text-red-800 dark:!from-red-950/90 dark:!to-red-900/90 dark:!text-red-200 dark:!border-red-800/30',
          success: '!border-green-200 !bg-gradient-to-br !from-green-50/90 !to-emerald-100/90 !text-green-800 dark:!from-green-950/90 dark:!to-green-900/90 dark:!text-green-200 dark:!border-green-800/30',
          warning: '!border-amber-200 !bg-gradient-to-br !from-amber-50/90 !to-orange-100/90 !text-amber-800 dark:!from-amber-950/90 dark:!to-amber-900/90 dark:!text-amber-200 dark:!border-amber-800/30',
          info: '!border-blue-200 !bg-gradient-to-br !from-blue-50/90 !to-sky-100/90 !text-blue-800 dark:!from-blue-950/90 dark:!to-blue-900/90 dark:!text-blue-200 dark:!border-blue-800/30',
          description: '!text-slate-600 dark:!text-slate-300 !font-normal !text-sm !mt-1 !leading-relaxed',
          title: '!font-semibold !text-base !leading-tight',
          closeButton: '!bg-white/80 !text-slate-400 hover:!bg-white hover:!text-slate-600 !border-0 !right-3 !top-3 !w-6 !h-6 !rounded-full !p-0 !flex !items-center !justify-center hover:!scale-105 !transition-all !duration-200 !shadow-sm',
          toast: '!backdrop-blur-md !border-white/20 dark:!border-slate-800/20',
        },
      }}
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      offset={24}
      gap={12}
      duration={7000}
      {...props}
    />
  );
};

export { Toaster };
