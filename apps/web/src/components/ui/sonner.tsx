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
          toast: 'group toast group-[.toaster]:glass group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl',
          title: 'group-[.toast]:text-base group-[.toast]:font-semibold',
          description: 'group-[.toast]:text-sm group-[.toast]:text-muted-foreground group-[.toast]:mt-1',
          error: 'group-[.toast]:border-red-500/50 group-[.toast]:bg-red-500/10 group-[.toast]:backdrop-blur-xl',
          success: 'group-[.toast]:border-green-500/50 group-[.toast]:bg-green-500/10 group-[.toast]:backdrop-blur-xl',
          warning: 'group-[.toast]:border-yellow-500/50 group-[.toast]:bg-yellow-500/10 group-[.toast]:backdrop-blur-xl',
          info: 'group-[.toast]:border-blue-500/50 group-[.toast]:bg-blue-500/10 group-[.toast]:backdrop-blur-xl',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80',
          closeButton: 'group-[.toast]:bg-white/10 group-[.toast]:hover:bg-white/20 group-[.toast]:border-white/10',
        },
        style: {
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '20px 24px',
          minHeight: '76px',
          maxWidth: '420px',
          backdropFilter: 'blur(16px) saturate(180%)',
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
