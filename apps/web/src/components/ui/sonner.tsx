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
        unstyled: false,
        classNames: {
          toast: 'group toast group-[.toaster]:border-2 group-[.toaster]:shadow-2xl',
          title: 'group-[.toast]:text-base group-[.toast]:font-bold group-[.toast]:text-white',
          description: 'group-[.toast]:text-sm group-[.toast]:text-white/90 group-[.toast]:mt-1.5 group-[.toast]:font-medium',
          error: 'group-[.toast]:border-red-500 group-[.toast]:bg-gradient-to-br group-[.toast]:from-red-600 group-[.toast]:to-red-700 group-[.toast]:backdrop-blur-xl group-[.toast]:shadow-red-500/50',
          success: 'group-[.toast]:border-green-500 group-[.toast]:bg-gradient-to-br group-[.toast]:from-green-600 group-[.toast]:to-emerald-700 group-[.toast]:backdrop-blur-xl group-[.toast]:shadow-green-500/50',
          warning: 'group-[.toast]:border-amber-400 group-[.toast]:bg-gradient-to-br group-[.toast]:from-amber-500 group-[.toast]:to-orange-600 group-[.toast]:backdrop-blur-xl group-[.toast]:shadow-amber-500/50',
          info: 'group-[.toast]:border-blue-400 group-[.toast]:bg-gradient-to-br group-[.toast]:from-blue-600 group-[.toast]:to-blue-700 group-[.toast]:backdrop-blur-xl group-[.toast]:shadow-blue-500/50',
          actionButton: 'group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:hover:bg-white/30 group-[.toast]:border group-[.toast]:border-white/30 group-[.toast]:font-semibold',
          cancelButton: 'group-[.toast]:bg-black/20 group-[.toast]:text-white group-[.toast]:hover:bg-black/30 group-[.toast]:border group-[.toast]:border-white/20',
          closeButton: 'group-[.toast]:bg-white/10 group-[.toast]:hover:bg-white/20 group-[.toast]:border-white/30 group-[.toast]:text-white',
        },
        style: {
          fontSize: '15px',
          fontWeight: '600',
          color: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px 24px',
          minHeight: '80px',
          maxWidth: '420px',
          backdropFilter: 'blur(20px) saturate(180%)',
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
