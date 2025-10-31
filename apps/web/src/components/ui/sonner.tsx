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
          toast: 'group toast group-[.toaster]:bg-[rgba(10,10,11,0.85)] group-[.toaster]:backdrop-blur-[40px] group-[.toaster]:border group-[.toaster]:border-white/15 group-[.toaster]:shadow-2xl',
          title: 'group-[.toast]:text-base group-[.toast]:font-bold group-[.toast]:text-white',
          description: 'group-[.toast]:text-sm group-[.toast]:text-white/90 group-[.toast]:mt-1.5 group-[.toast]:font-medium',
          error: 'group-[.toast]:bg-[rgba(10,10,11,0.85)] group-[.toast]:backdrop-blur-[40px] group-[.toast]:border-white/15',
          success: 'group-[.toast]:bg-[rgba(10,10,11,0.85)] group-[.toast]:backdrop-blur-[40px] group-[.toast]:border-white/15',
          warning: 'group-[.toast]:bg-[rgba(10,10,11,0.85)] group-[.toast]:backdrop-blur-[40px] group-[.toast]:border-white/15',
          info: 'group-[.toast]:bg-[rgba(10,10,11,0.85)] group-[.toast]:backdrop-blur-[40px] group-[.toast]:border-white/15',
          actionButton: 'group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:hover:bg-white/30 group-[.toast]:border group-[.toast]:border-white/30 group-[.toast]:font-semibold',
          cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:hover:bg-white/20 group-[.toast]:border group-[.toast]:border-white/20',
          closeButton: 'group-[.toast]:bg-white/10 group-[.toast]:hover:bg-white/20 group-[.toast]:border-white/30 group-[.toast]:text-white',
        },
        style: {
          fontSize: '15px',
          fontWeight: '600',
          color: '#ffffff',
          background: 'rgba(10, 10, 11, 0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '20px 24px',
          minHeight: '80px',
          maxWidth: '420px',
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
