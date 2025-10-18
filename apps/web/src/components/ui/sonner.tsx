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
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          fontSize: '15px',
          fontWeight: '600',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '20px 24px',
          minHeight: '72px',
          maxWidth: '450px',
        },
      }}
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      offset={24}
      gap={16}
      duration={15000} // 15 segundos - auto-cierre de notificaciones
      {...props}
    />
  );
};

export { Toaster };
