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
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          fontSize: '14px',
          fontWeight: '500',
        },
        classNames: {
          error: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
          success: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
          warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
          info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
        },
      }}
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      {...props}
    />
  );
};

export { Toaster };
