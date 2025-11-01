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
        unstyled: true,
        classNames: {
          // Base toast - Compact and modern
          toast: `
            group toast
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700
            shadow-lg dark:shadow-2xl
            rounded-lg
            px-4 py-2.5
            min-h-auto
            max-w-sm sm:max-w-md
            flex items-center gap-3
            backdrop-blur-sm
          `,

          // Title - Compact text
          title: `
            text-sm font-semibold
            text-slate-900 dark:text-white
            leading-tight
            m-0
          `,

          // Description - Smaller and more subtle
          description: `
            text-xs
            text-slate-600 dark:text-slate-300
            font-normal
            leading-relaxed
            m-0
          `,

          // Error variant - Clean red
          error: `
            bg-red-600 dark:bg-red-600
            border-red-700 dark:border-red-700
            [&_div]:text-white
            [&_p]:text-white
            [&>button]:text-white dark:[&>button]:text-white
          `,

          // Success variant - Clean green
          success: `
            bg-green-50 dark:bg-green-950/40
            border-green-200 dark:border-green-800
            [&>button]:text-green-700 dark:[&>button]:text-green-300
          `,

          // Warning variant - Clean orange
          warning: `
            bg-amber-50 dark:bg-amber-950/40
            border-amber-200 dark:border-amber-800
            [&>button]:text-amber-700 dark:[&>button]:text-amber-300
          `,

          // Info variant - Clean blue
          info: `
            bg-blue-50 dark:bg-blue-950/40
            border-blue-200 dark:border-blue-800
            [&>button]:text-blue-700 dark:[&>button]:text-blue-300
          `,

          // Action button - Compact and modern
          actionButton: `
            bg-slate-900 dark:bg-white
            text-white dark:text-slate-900
            hover:bg-slate-800 dark:hover:bg-slate-100
            font-semibold
            transition-all duration-150
            rounded px-3 py-1.5
            text-xs
          `,

          // Cancel button - Subtle
          cancelButton: `
            bg-transparent
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800
            font-medium
            transition-all duration-150
            rounded px-3 py-1.5
            text-xs
          `,

          // Close button - Minimal icon-only
          closeButton: `
            bg-transparent dark:bg-transparent
            hover:bg-slate-200 dark:hover:bg-slate-700
            border-none
            text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
            font-normal
            transition-all duration-150
            rounded
            !w-5 !h-5
            flex items-center justify-center
            p-0
          `,
        },
      }}
      position="top-center"
      expand={false}
      richColors={true}
      closeButton={true}
      offset="16px"
      gap={10}
      duration={4000}
      {...props}
    />
  );
};

export { Toaster };
