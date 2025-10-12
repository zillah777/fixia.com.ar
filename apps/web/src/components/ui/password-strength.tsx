import * as React from "react";
import { cn } from "./utils";

export interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthLevel {
  label: string;
  color: string;
  bgColor: string;
  minScore: number;
}

const strengthLevels: StrengthLevel[] = [
  { label: "Muy débil", color: "text-red-500", bgColor: "bg-red-500", minScore: 0 },
  { label: "Débil", color: "text-orange-500", bgColor: "bg-orange-500", minScore: 1 },
  { label: "Aceptable", color: "text-yellow-500", bgColor: "bg-yellow-500", minScore: 2 },
  { label: "Fuerte", color: "text-green-500", bgColor: "bg-green-500", minScore: 3 },
  { label: "Muy fuerte", color: "text-emerald-500", bgColor: "bg-emerald-500", minScore: 4 },
];

function calculatePasswordStrength(password: string): number {
  let score = 0;

  if (!password) return 0;

  // Length score
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Mixed case
  if (/\d/.test(password)) score++; // Numbers
  if (/[^a-zA-Z0-9]/.test(password)) score++; // Special characters

  return Math.min(score, 4);
}

export const PasswordStrength = React.forwardRef<HTMLDivElement, PasswordStrengthProps>(
  ({ password, className, ...props }, ref) => {
    const score = calculatePasswordStrength(password);
    const strength = strengthLevels[score];

    if (!password) return null;

    return (
      <div
        ref={ref}
        className={cn("mt-2 space-y-2", className)}
        {...props}
      >
        {/* Strength bars */}
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                level <= score ? strength.bgColor : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Strength label */}
        <p className={cn("text-xs font-medium transition-colors", strength.color)}>
          {strength.label}
        </p>

        {/* Requirements checklist */}
        {password.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            <li className={cn("flex items-center gap-1", password.length >= 8 ? "text-success" : "")}>
              <span className={cn("h-1 w-1 rounded-full", password.length >= 8 ? "bg-success" : "bg-muted")} />
              Al menos 8 caracteres
            </li>
            <li className={cn("flex items-center gap-1", /[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-success" : "")}>
              <span className={cn("h-1 w-1 rounded-full", /[A-Z]/.test(password) && /[a-z]/.test(password) ? "bg-success" : "bg-muted")} />
              Mayúsculas y minúsculas
            </li>
            <li className={cn("flex items-center gap-1", /\d/.test(password) ? "text-success" : "")}>
              <span className={cn("h-1 w-1 rounded-full", /\d/.test(password) ? "bg-success" : "bg-muted")} />
              Al menos un número
            </li>
            <li className={cn("flex items-center gap-1", /[^a-zA-Z0-9]/.test(password) ? "text-success" : "")}>
              <span className={cn("h-1 w-1 rounded-full", /[^a-zA-Z0-9]/.test(password) ? "bg-success" : "bg-muted")} />
              Al menos un carácter especial
            </li>
          </ul>
        )}
      </div>
    );
  }
);

PasswordStrength.displayName = "PasswordStrength";
