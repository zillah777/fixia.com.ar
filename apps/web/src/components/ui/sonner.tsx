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
          // Base toast - Premium glass with EXCELLENT contrast
          toast: `
            group toast
            bg-gradient-to-br from-white/95 via-white/90 to-white/95
            dark:from-[rgba(30,30,35,0.95)] dark:via-[rgba(35,35,40,0.95)] dark:to-[rgba(30,30,35,0.95)]
            backdrop-blur-[40px] backdrop-saturate-[200%]
            border-2 border-black/10 dark:border-white/20
            shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)_inset]
            dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.15)_inset]
            rounded-xl sm:rounded-2xl
            p-4 sm:p-5
            min-h-[70px] sm:min-h-[80px]
            max-w-[340px] sm:max-w-[400px]
          `,

          // Title - High contrast and bold
          title: `
            text-sm sm:text-base md:text-lg
            font-extrabold
            text-gray-900 dark:text-white
            leading-tight
            mb-1
          `,

          // Description - Clear and readable
          description: `
            text-xs sm:text-sm
            text-gray-700 dark:text-gray-200
            font-medium
            leading-relaxed
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

          // Action button - Strong contrast
          actionButton: `
            bg-gray-900 dark:bg-white
            text-white dark:text-gray-900
            hover:bg-gray-800 dark:hover:bg-gray-100
            border-2 border-gray-900 dark:border-white
            font-bold
            shadow-lg
            transition-all duration-200
            rounded-lg
            px-4 py-2
            text-sm
          `,

          // Cancel button - Subtle but visible
          cancelButton: `
            bg-gray-100 dark:bg-gray-700
            text-gray-900 dark:text-white
            hover:bg-gray-200 dark:hover:bg-gray-600
            border-2 border-gray-300 dark:border-gray-600
            font-semibold
            transition-all duration-200
            rounded-lg
            px-4 py-2
            text-sm
          `,

          // Close button - Clear and accessible
          closeButton: `
            bg-gray-100 dark:bg-white/10
            hover:bg-gray-200 dark:hover:bg-white/20
            border-2 border-gray-200 dark:border-white/30
            text-gray-900 dark:text-white
            font-bold
            transition-all duration-200
            rounded-lg
            !w-7 !h-7 sm:!w-8 sm:!h-8
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
