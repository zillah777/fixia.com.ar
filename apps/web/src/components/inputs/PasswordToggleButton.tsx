import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';

interface PasswordToggleButtonProps {
  showPassword: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

/**
 * Reusable password visibility toggle button
 * Replaces duplicated toggle logic across LoginPage, RegisterPage, SettingsPage
 *
 * Usage:
 * const [showPassword, setShowPassword] = useState(false);
 * <PasswordToggleButton
 *   showPassword={showPassword}
 *   onToggle={() => setShowPassword(!showPassword)}
 * />
 */
export const PasswordToggleButton = React.memo<PasswordToggleButtonProps>(({
  showPassword,
  onToggle,
  ariaLabel
}) => {
  const defaultAriaLabel = showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-2 hover:bg-transparent"
      onClick={onToggle}
      aria-label={ariaLabel || defaultAriaLabel}
      tabIndex={0}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
});

PasswordToggleButton.displayName = 'PasswordToggleButton';
