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
          // Base toast - Compact and subtle
          toast: `
            group toast
            bg-gradient-to-br from-white/90 via-white/85 to-white/90
            dark:from-[rgba(30,30,35,0.92)] dark:via-[rgba(35,35,40,0.92)] dark:to-[rgba(30,30,35,0.92)]
            backdrop-blur-[30px] backdrop-saturate-[180%]
            border border-black/8 dark:border-white/15
            shadow-[0_8px_16px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.05)_inset]
            dark:shadow-[0_8px_16px_rgba(0,0,0,0.4),0_0_0_0.5px_rgba(255,255,255,0.1)_inset]
            rounded-lg
            px-3 py-2
            min-h-[44px]
            max-w-[320px] sm:max-w-[380px]
          `,

          // Title - Compact text
          title: `
            text-xs sm:text-sm
            font-bold
            text-gray-900 dark:text-white
            leading-snug
          `,

          // Description - Smaller and more subtle
          description: `
            text-[11px] sm:text-xs
            text-gray-700 dark:text-gray-300
            font-medium
            leading-snug
          `,

          // Error variant - Strong red with excellent visibility
          error: `
            bg-gradient-to-br from-red-50/95 via-red-100/90 to-red-50/95
            dark:from-[rgba(127,29,29,0.9)] dark:via-[rgba(153,27,27,0.9)] dark:to-[rgba(127,29,29,0.9)]
            border-2 border-red-500/40 dark:border-red-400/50
            shadow-[0_20px_50px_rgba(239,68,68,0.25),0_0_30px_rgba(239,68,68,0.15)_inset]
            dark:shadow-[0_20px_50px_rgba(239,68,68,0.4),0_0_30px_rgba(239,68,68,0.2)_inset]
          `,

          // Success variant - Strong green with excellent visibility
          success: `
            bg-gradient-to-br from-green-50/95 via-green-100/90 to-green-50/95
            dark:from-[rgba(20,83,45,0.9)] dark:via-[rgba(22,101,52,0.9)] dark:to-[rgba(20,83,45,0.9)]
            border-2 border-green-500/40 dark:border-green-400/50
            shadow-[0_20px_50px_rgba(34,197,94,0.25),0_0_30px_rgba(34,197,94,0.15)_inset]
            dark:shadow-[0_20px_50px_rgba(34,197,94,0.4),0_0_30px_rgba(34,197,94,0.2)_inset]
          `,

          // Warning variant - Strong orange/yellow with excellent visibility
          warning: `
            bg-gradient-to-br from-orange-50/95 via-orange-100/90 to-orange-50/95
            dark:from-[rgba(124,45,18,0.9)] dark:via-[rgba(154,52,18,0.9)] dark:to-[rgba(124,45,18,0.9)]
            border-2 border-orange-500/40 dark:border-orange-400/50
            shadow-[0_20px_50px_rgba(249,115,22,0.25),0_0_30px_rgba(249,115,22,0.15)_inset]
            dark:shadow-[0_20px_50px_rgba(249,115,22,0.4),0_0_30px_rgba(249,115,22,0.2)_inset]
          `,

          // Info variant - Strong blue with excellent visibility
          info: `
            bg-gradient-to-br from-blue-50/95 via-blue-100/90 to-blue-50/95
            dark:from-[rgba(30,58,138,0.9)] dark:via-[rgba(29,78,216,0.9)] dark:to-[rgba(30,58,138,0.9)]
            border-2 border-blue-500/40 dark:border-blue-400/50
            shadow-[0_20px_50px_rgba(59,130,246,0.25),0_0_30px_rgba(59,130,246,0.15)_inset]
            dark:shadow-[0_20px_50px_rgba(59,130,246,0.4),0_0_30px_rgba(59,130,246,0.2)_inset]
          `,

          // Action button - Compact
          actionButton: `
            bg-gray-900 dark:bg-white
            text-white dark:text-gray-900
            hover:bg-gray-800 dark:hover:bg-gray-100
            border border-gray-900 dark:border-white
            font-semibold
            shadow-md
            transition-all duration-150
            rounded-md
            px-2.5 py-1.5
            text-xs sm:text-xs
          `,

          // Cancel button - Subtle
          cancelButton: `
            bg-gray-100 dark:bg-gray-700
            text-gray-900 dark:text-white
            hover:bg-gray-200 dark:hover:bg-gray-600
            border border-gray-300 dark:border-gray-600
            font-medium
            transition-all duration-150
            rounded-md
            px-2.5 py-1.5
            text-xs sm:text-xs
          `,

          // Close button - Minimal
          closeButton: `
            bg-transparent dark:bg-transparent
            hover:bg-gray-200 dark:hover:bg-white/20
            border-none
            text-gray-900 dark:text-white
            font-bold
            transition-all duration-150
            rounded
            !w-5 !h-5 sm:!w-6 sm:!h-6
            flex items-center justify-center
          `,
        },
      }}
      position="top-center"
      expand={true}
      richColors={false}
      closeButton={true}
      offset="16px"
      gap={12}
      duration={5000}
      {...props}
    />
  );
};

export { Toaster };
