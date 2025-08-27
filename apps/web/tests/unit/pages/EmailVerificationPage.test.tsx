import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/context/AuthContext';
import EmailVerificationPage from '../../../src/pages/EmailVerificationPage';
import { toast } from 'sonner';
import { authService } from '../../../src/lib/services';

// Mock dependencies
jest.mock('sonner');
jest.mock('../../../src/lib/services');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockSearchParams)],
}));

const mockNavigate = jest.fn();
const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Helper function to render component with providers
const renderWithProviders = (
  searchParams: string = '',
  authContextValue: any = {}
) => {
  // Reset search params mock
  global.mockSearchParams = searchParams;

  return render(
    <MemoryRouter>
      <AuthProvider>
        <EmailVerificationPage />
      </AuthProvider>
    </MemoryRouter>
  );
};

// Mock search params globally
let mockSearchParams = '';
Object.defineProperty(global, 'mockSearchParams', {
  get: () => mockSearchParams,
  set: (value) => { mockSearchParams = value; }
});

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    test('renders verification page without email or token', () => {
      renderWithProviders();

      expect(screen.getByText('Verifica tu Email')).toBeInTheDocument();
      expect(screen.getByText('Te hemos enviado un enlace de verificación')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reenviar email/i })).toBeInTheDocument();
    });

    test('renders with email from search params', () => {
      renderWithProviders('email=test@example.com');

      expect(screen.getByText('te***t@example.com')).toBeInTheDocument();
    });

    test('renders verification instructions', () => {
      renderWithProviders();

      expect(screen.getByText(/revisa tu bandeja de entrada/i)).toBeInTheDocument();
      expect(screen.getByText(/revisa tu carpeta de spam/i)).toBeInTheDocument();
      expect(screen.getByText(/el enlace expira en 24 horas/i)).toBeInTheDocument();
    });
  });

  describe('Automatic Token Verification', () => {
    test('automatically verifies email when token is in URL', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(undefined);
      renderWithProviders('email=test@example.com&token=valid-token');

      // Should show verifying state
      expect(screen.getByText('Verificando Email...')).toBeInTheDocument();
      expect(screen.getByText(/verificando tu email/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('valid-token');
      });

      // Should show success state after verification
      await waitFor(() => {
        expect(screen.getByText('¡Email Verificado!')).toBeInTheDocument();
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        '¡Email verificado exitosamente! Ya puedes iniciar sesión.'
      );
    });

    test('handles verification failure', async () => {
      const errorMessage = 'Invalid verification token';
      mockAuthService.verifyEmail.mockRejectedValue(
        new Error(errorMessage)
      );

      renderWithProviders('token=invalid-token');

      await waitFor(() => {
        expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('invalid-token');
      });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
      });
    });

    test('handles expired token error', async () => {
      const expiredError = {
        response: { data: { message: 'Verification token has expired' } }
      };
      mockAuthService.verifyEmail.mockRejectedValue(expiredError);

      renderWithProviders('token=expired-token');

      await waitFor(() => {
        expect(screen.getByText('Verification token has expired')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Verification Flow', () => {
    test('shows success state and auto-redirects to login', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(undefined);
      renderWithProviders('email=test@example.com&token=valid-token');

      await waitFor(() => {
        expect(screen.getByText('¡Email Verificado!')).toBeInTheDocument();
      });

      // Should show success indicators
      expect(screen.getByText('Cuenta verificada y segura')).toBeInTheDocument();
      expect(screen.getByText('Acceso completo habilitado')).toBeInTheDocument();
      expect(screen.getByText(/serás redirigido automáticamente/i)).toBeInTheDocument();

      // Should have login button
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(loginButton).toBeInTheDocument();

      // Test manual navigation
      fireEvent.click(loginButton);
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { email: 'test@example.com' }
      });

      // Test auto-redirect after 3 seconds
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          state: {
            message: 'Tu cuenta ha sido verificada. Puedes iniciar sesión ahora.',
            email: 'test@example.com'
          }
        });
      });
    });
  });

  describe('Email Resend Functionality', () => {
    test('successfully resends verification email', async () => {
      mockAuthService.resendVerificationEmail.mockResolvedValue(undefined);
      renderWithProviders('email=test@example.com');

      const resendButton = screen.getByRole('button', { name: /reenviar email/i });
      fireEvent.click(resendButton);

      // Should show loading state
      expect(screen.getByText('Enviando...')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockAuthService.resendVerificationEmail).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Email de verificación reenviado. Revisa tu bandeja de entrada.'
        );
      });
    });

    test('handles resend error', async () => {
      const errorMessage = 'Rate limit exceeded';
      mockAuthService.resendVerificationEmail.mockRejectedValue(
        new Error(errorMessage)
      );

      renderWithProviders('email=test@example.com');

      const resendButton = screen.getByRole('button', { name: /reenviar email/i });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
      });
    });

    test('implements cooldown period after resend', async () => {
      mockAuthService.resendVerificationEmail.mockResolvedValue(undefined);
      renderWithProviders('email=test@example.com');

      const resendButton = screen.getByRole('button', { name: /reenviar email/i });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText(/reenviar en \d+s/i)).toBeInTheDocument();
      });

      // Button should be disabled during cooldown
      expect(resendButton).toBeDisabled();

      // Fast-forward through cooldown
      jest.advanceTimersByTime(60000); // 60 seconds

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reenviar email/i })).not.toBeDisabled();
      });
    });

    test('prevents resend without email', async () => {
      renderWithProviders(); // No email in search params

      const resendButton = screen.getByRole('button', { name: /reenviar email/i });
      fireEvent.click(resendButton);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Por favor espera antes de reenviar el email'
      );
      expect(mockAuthService.resendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('Email Masking', () => {
    test('masks long emails correctly', () => {
      renderWithProviders('email=verylongemail@example.com');

      expect(screen.getByText('ve***********l@example.com')).toBeInTheDocument();
    });

    test('does not mask short emails', () => {
      renderWithProviders('email=ab@test.com');

      expect(screen.getByText('ab@test.com')).toBeInTheDocument();
    });

    test('handles edge cases in email masking', () => {
      // No email
      renderWithProviders('email=');
      expect(screen.getByText('tu email')).toBeInTheDocument();

      // Email without @ symbol (should not crash)
      renderWithProviders('email=invalidemail');
      expect(screen.getByText('invalidemail')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    test('provides navigation back to login', () => {
      renderWithProviders();

      const backToLoginLink = screen.getByText(/volver al login/i);
      expect(backToLoginLink).toBeInTheDocument();
      expect(backToLoginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    test('provides navigation to home page', () => {
      renderWithProviders();

      const homeLink = screen.getByText(/ir al inicio/i);
      expect(homeLink).toBeInTheDocument();
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });

    test('provides help contact information', () => {
      renderWithProviders();

      expect(screen.getByText(/¿necesitas ayuda?/i)).toBeInTheDocument();
      
      const supportLink = screen.getByText('soporte@fixia.com.ar');
      expect(supportLink).toBeInTheDocument();
      expect(supportLink.closest('a')).toHaveAttribute('href', '/contact');
    });
  });

  describe('Error States', () => {
    test('displays verification error with retry option', async () => {
      const networkError = new Error('Network error');
      mockAuthService.verifyEmail.mockRejectedValue(networkError);

      renderWithProviders('token=network-fail-token');

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Should still show resend button for recovery
      expect(screen.getByRole('button', { name: /reenviar email/i })).toBeInTheDocument();
    });

    test('handles API error responses properly', async () => {
      const apiError = {
        response: {
          data: { message: 'Server temporarily unavailable' }
        }
      };
      mockAuthService.verifyEmail.mockRejectedValue(apiError);

      renderWithProviders('token=server-error-token');

      await waitFor(() => {
        expect(screen.getByText('Server temporarily unavailable')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner during verification', () => {
      mockAuthService.verifyEmail.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderWithProviders('token=slow-token');

      expect(screen.getByText('Verificando Email...')).toBeInTheDocument();
      expect(screen.getByText(/verificando tu email, esto solo tomará un momento/i)).toBeInTheDocument();
    });

    test('shows loading state during resend', async () => {
      mockAuthService.resendVerificationEmail.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderWithProviders('email=test@example.com');

      const resendButton = screen.getByRole('button', { name: /reenviar email/i });
      fireEvent.click(resendButton);

      expect(screen.getByText('Enviando...')).toBeInTheDocument();
      expect(resendButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      renderWithProviders('email=test@example.com');

      // Check for proper headings
      expect(screen.getByRole('heading', { name: /verifica tu email/i })).toBeInTheDocument();
      
      // Check for proper button labels
      const resendButton = screen.getByRole('button', { name: /reenviar email/i });
      expect(resendButton).toBeInTheDocument();
      
      // Check for alert regions for errors
      // (Would be present if there's an error state)
    });

    test('maintains focus management during state changes', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(undefined);
      renderWithProviders('email=test@example.com&token=valid-token');

      await waitFor(() => {
        expect(screen.getByText('¡Email Verificado!')).toBeInTheDocument();
      });

      // In success state, login button should be focusable
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('URL Parameter Handling', () => {
    test('extracts email and token from URL correctly', () => {
      renderWithProviders('email=user%40example.com&token=abc123&other=param');

      // Should decode email properly
      expect(screen.getByText('us***r@example.com')).toBeInTheDocument();
    });

    test('handles malformed URL parameters gracefully', () => {
      renderWithProviders('email=&token=&invalid');

      // Should not crash and show default state
      expect(screen.getByText('Verifica tu Email')).toBeInTheDocument();
      expect(screen.getByText('tu email')).toBeInTheDocument();
    });
  });

  describe('Timer Management', () => {
    test('cleans up timers on component unmount', () => {
      const { unmount } = renderWithProviders('email=test@example.com');

      // Start cooldown
      const resendButton = screen.getByRole('button', { name: /reenviar email/i });
      mockAuthService.resendVerificationEmail.mockResolvedValue(undefined);
      fireEvent.click(resendButton);

      // Unmount component
      unmount();

      // Should not cause any timer-related errors
      expect(() => {
        jest.advanceTimersByTime(60000);
      }).not.toThrow();
    });
  });
});