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
          // Base toast - Premium glass morphism
          toast: `
            group toast
            bg-gradient-to-br from-[rgba(15,15,20,0.98)] via-[rgba(20,20,25,0.98)] to-[rgba(15,15,20,0.98)]
            backdrop-blur-[80px] backdrop-saturate-[180%]
            border-2 border-white/30
            shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.2)_inset,0_0_40px_rgba(102,126,234,0.2)]
            rounded-2xl
          `,

          // Title - Bold and prominent
          title: `
            text-base sm:text-lg
            font-extrabold
            text-white
            drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]
            leading-tight
          `,

          // Description - Clear and readable
          description: `
            text-sm sm:text-base
            text-white/90
            mt-1.5 sm:mt-2
            font-medium
            drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]
            leading-relaxed
          `,

          // Error variant - Red accent with strong visibility
          error: `
            bg-gradient-to-br from-[rgba(239,68,68,0.25)] via-[rgba(20,20,25,0.98)] to-[rgba(15,15,20,0.98)]
            border-2 border-red-500/50
            shadow-[0_25px_60px_rgba(239,68,68,0.4),0_0_40px_rgba(239,68,68,0.25)_inset]
          `,

          // Success variant - Green accent with strong visibility
          success: `
            bg-gradient-to-br from-[rgba(34,197,94,0.25)] via-[rgba(20,20,25,0.98)] to-[rgba(15,15,20,0.98)]
            border-2 border-green-500/50
            shadow-[0_25px_60px_rgba(34,197,94,0.4),0_0_40px_rgba(34,197,94,0.25)_inset]
          `,

          // Warning variant - Yellow/Orange accent
          warning: `
            bg-gradient-to-br from-[rgba(251,146,60,0.25)] via-[rgba(20,20,25,0.98)] to-[rgba(15,15,20,0.98)]
            border-2 border-orange-500/50
            shadow-[0_25px_60px_rgba(251,146,60,0.4),0_0_40px_rgba(251,146,60,0.25)_inset]
          `,

          // Info variant - Blue accent
          info: `
            bg-gradient-to-br from-[rgba(59,130,246,0.25)] via-[rgba(20,20,25,0.98)] to-[rgba(15,15,20,0.98)]
            border-2 border-blue-500/50
            shadow-[0_25px_60px_rgba(59,130,246,0.4),0_0_40px_rgba(59,130,246,0.25)_inset]
          `,

          // Action button - Premium glass style
          actionButton: `
            bg-white/30
            text-white
            hover:bg-white/40
            border-2 border-white/50
            font-bold
            shadow-lg
            backdrop-blur-sm
            transition-all duration-200
            rounded-lg
            px-4 py-2
          `,

          // Cancel button - Subtle glass style
          cancelButton: `
            bg-white/15
            text-white
            hover:bg-white/25
            border-2 border-white/30
            font-semibold
            backdrop-blur-sm
            transition-all duration-200
            rounded-lg
            px-4 py-2
          `,

          // Close button - Visible and accessible
          closeButton: `
            bg-white/20
            hover:bg-white/35
            border-2 border-white/40
            text-white
            font-bold
            backdrop-blur-sm
            transition-all duration-200
            rounded-lg
            w-8 h-8
            flex items-center justify-center
          `,
        },
        style: {
          // Mobile-first responsive padding
          padding: window.innerWidth < 640 ? '16px 20px' : '20px 24px',
          minHeight: window.innerWidth < 640 ? '70px' : '85px',
          maxWidth: window.innerWidth < 640 ? '340px' : '420px',
          // Typography
          fontSize: window.innerWidth < 640 ? '14px' : '16px',
          fontWeight: '600',
          color: '#ffffff',
          // Glass effect base (overridden by classNames for variants)
          background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.98) 0%, rgba(20, 20, 25, 0.98) 50%, rgba(15, 15, 20, 0.98) 100%)',
          backdropFilter: 'blur(80px) saturate(180%)',
          WebkitBackdropFilter: 'blur(80px) saturate(180%)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 0 40px rgba(102, 126, 234, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
        },
      }}
      // Responsive position - top-center on mobile, top-right on desktop
      position={window.innerWidth < 640 ? "top-center" : "top-right"}
      expand={true}
      richColors={false}
      closeButton={true}
      // Mobile-optimized offset and gap
      offset={window.innerWidth < 640 ? 16 : 24}
      gap={window.innerWidth < 640 ? 12 : 16}
      duration={6000}
      {...props}
    />
  );
};

export { Toaster };
