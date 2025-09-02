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
          background: 'white',
          color: '#1a1a1a',
          border: '2px solid',
          fontSize: '15px',
          fontWeight: '600',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          padding: '16px 20px',
          minHeight: '72px',
        },
        classNames: {
          error: '!border-red-500 !bg-red-50 !text-red-900 dark:!bg-red-900 dark:!text-red-50 shadow-lg shadow-red-500/20',
          success: '!border-green-500 !bg-green-50 !text-green-900 dark:!bg-green-900 dark:!text-green-50 shadow-lg shadow-green-500/20',
          warning: '!border-yellow-500 !bg-yellow-50 !text-yellow-900 dark:!bg-yellow-900 dark:!text-yellow-50 shadow-lg shadow-yellow-500/20',
          info: '!border-blue-500 !bg-blue-50 !text-blue-900 dark:!bg-blue-900 dark:!text-blue-50 shadow-lg shadow-blue-500/20',
          description: '!text-gray-700 dark:!text-gray-300 !font-medium !text-sm !mt-2',
          title: '!font-bold !text-base',
          closeButton: '!bg-white !text-gray-500 hover:!bg-gray-100 !border !border-gray-200 !right-4 !top-4 !w-8 !h-8 !rounded-lg hover:!scale-110 transition-transform',
        },
      }}
      position="top-center"
      expand={true}
      richColors={true}
      closeButton={true}
      offset={20}
      duration={8000}
      {...props}
    />
  );
};

export { Toaster };
