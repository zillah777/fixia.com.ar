import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/context/AuthContext';
import RegisterPage from '../../../src/pages/RegisterPage';
import { toast } from 'sonner';
import { useAuth } from '../../../src/context/AuthContext';

// Mock dependencies
jest.mock('sonner');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockSearchParams)],
}));

const mockNavigate = jest.fn();
const mockRegister = jest.fn();
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock useAuth hook
jest.mock('../../../src/context/AuthContext', () => ({
  ...jest.requireActual('../../../src/context/AuthContext'),
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Helper function to render component with providers
const renderWithProviders = (searchParams: string = '') => {
  global.mockSearchParams = searchParams;

  // Setup auth context mock
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    register: mockRegister,
    login: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    requestContactProfessional: jest.fn(),
    respondToContactRequest: jest.fn(),
    updateAvailability: jest.fn(),
    upgradeToPremium: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    loading: false,
  });

  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterPage />
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

describe('RegisterPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = '';
  });

  describe('Initial Rendering', () => {
    test('renders registration page with client tab by default', () => {
      renderWithProviders();

      expect(screen.getByText('Únete a Fixia')).toBeInTheDocument();
      expect(screen.getByText('Elige tu tipo de cuenta')).toBeInTheDocument();
      
      // Should show client registration form by default
      expect(screen.getByText('Registro como Cliente')).toBeInTheDocument();
      expect(screen.getByText('Acceso gratuito para buscar y contactar profesionales verificados')).toBeInTheDocument();
    });

    test('renders professional tab when specified in URL params', () => {
      renderWithProviders('type=professional');

      expect(screen.getByText('Registro Profesional')).toBeInTheDocument();
      expect(screen.getByText('Suscripción mensual $4500 ARS • Sin comisiones por servicios')).toBeInTheDocument();
    });

    test('shows promotional badge for professionals', () => {
      renderWithProviders('type=professional');

      expect(screen.getByText('🎉 Primeros 200 profesionales: 2 meses gratis')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('switches between client and professional tabs', async () => {
      renderWithProviders();

      // Start with client tab
      expect(screen.getByText('Registro como Cliente')).toBeInTheDocument();

      // Click professional tab
      const professionalTab = screen.getByRole('tab', { name: /profesional/i });
      await user.click(professionalTab);

      expect(screen.getByText('Registro Profesional')).toBeInTheDocument();
      expect(screen.getByText('Información del Negocio')).toBeInTheDocument();

      // Click client tab
      const clientTab = screen.getByRole('tab', { name: /cliente/i });
      await user.click(clientTab);

      expect(screen.getByText('Registro como Cliente')).toBeInTheDocument();
    });
  });

  describe('Client Registration Form', () => {
    beforeEach(() => {
      renderWithProviders();
    });

    test('renders all required fields', () => {
      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña *')).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ubicación/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
    });

    test('renders agreement checkboxes', () => {
      expect(screen.getByLabelText(/acepto los términos y condiciones/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/acepto la política de privacidad/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/deseo recibir ofertas especiales/i)).toBeInTheDocument();
    });

    test('shows/hides password fields', async () => {
      const passwordField = screen.getByLabelText('Contraseña *') as HTMLInputElement;
      const toggleButton = screen.getAllByRole('button')[0]; // First password toggle

      expect(passwordField.type).toBe('password');

      await user.click(toggleButton);
      expect(passwordField.type).toBe('text');

      await user.click(toggleButton);
      expect(passwordField.type).toBe('password');
    });

    test('validates required fields', async () => {
      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      // Should show validation messages (browser native validation)
      expect(mockRegister).not.toHaveBeenCalled();
    });

    test('validates password confirmation', async () => {
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'different');
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      
      // Select location
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      // Set birthdate
      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1990-01-01');

      // Check required agreements
      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Las contraseñas no coinciden');
      });
    });

    test('validates minimum password length', async () => {
      await user.type(screen.getByLabelText('Contraseña *'), '123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), '123');
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1990-01-01');

      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('La contraseña debe tener al menos 8 caracteres');
      });
    });

    test('validates age requirement', async () => {
      const today = new Date();
      const recentDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      
      await user.type(screen.getByLabelText(/nombre completo/i), 'Young User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'young@example.com');
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, recentDate.toISOString().split('T')[0]);

      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Debes ser mayor de 18 años para registrarte');
      });
    });

    test('successful client registration', async () => {
      mockRegister.mockResolvedValue(undefined);

      // Fill form with valid data
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      await user.type(screen.getByLabelText(/teléfono/i), '+54 280 1234567');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1990-01-01');

      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
          phone: '+54 280 1234567',
          location: 'Rawson',
          birthdate: '1990-01-01',
          userType: 'client',
          serviceCategories: [],
          description: '',
          experience: '',
          pricing: '',
          availability: '',
          portfolio: '',
          certifications: ''
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/verify-email?email=test%40example.com');
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        '¡Bienvenido/a a Fixia, Test User! Te hemos enviado un email de verificación.',
        expect.objectContaining({
          description: 'Revisa tu bandeja de entrada en test@example.com',
        })
      );
    });
  });

  describe('Professional Registration Form', () => {
    beforeEach(() => {
      renderWithProviders('type=professional');
    });

    test('renders professional-specific fields', () => {
      expect(screen.getByText('Información Personal')).toBeInTheDocument();
      expect(screen.getByText('Información del Negocio')).toBeInTheDocument();
      expect(screen.getByLabelText(/categorías de servicios/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descripción de servicios/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/años de experiencia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rango de precios/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/disponibilidad/i)).toBeInTheDocument();
    });

    test('renders optional professional fields', () => {
      expect(screen.getByLabelText(/portfolio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/certificaciones/i)).toBeInTheDocument();
    });

    test('validates required professional fields', async () => {
      // Fill personal information
      await user.type(screen.getByLabelText(/nombre completo/i), 'Professional User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'pro@example.com');
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      await user.type(screen.getByLabelText(/teléfono \(whatsapp\)/i), '+54 280 1234567');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1985-01-01');

      // Check agreements
      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      // Try to submit without business information
      const submitButton = screen.getByRole('button', { name: /crear perfil profesional/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Debes seleccionar al menos una categoría de servicio'
        );
      });
    });

    test('service categories input functionality', async () => {
      const categoriesInput = screen.getByPlaceholderText(/escribe categorías separadas por comas/i);
      
      // Test typing and adding categories
      await user.type(categoriesInput, 'Desarrollo Web');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('Desarrollo Web')).toBeInTheDocument();

      // Test hashtag input
      await user.type(categoriesInput, '#Diseño #UI/UX');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('Diseño')).toBeInTheDocument();
      expect(screen.getByText('UI/UX')).toBeInTheDocument();
    });

    test('service categories suggestions', async () => {
      const categoriesInput = screen.getByPlaceholderText(/escribe categorías separadas por comas/i);
      
      await user.type(categoriesInput, 'Pelu');
      
      // Should show suggestions
      await waitFor(() => {
        expect(screen.getByText('Peluquería')).toBeInTheDocument();
      });
    });

    test('validates maximum categories limit', async () => {
      // Add more than 10 categories
      const categoriesInput = screen.getByPlaceholderText(/escribe categorías separadas por comas/i);
      
      for (let i = 1; i <= 12; i++) {
        await user.type(categoriesInput, `Categoria${i}`);
        await user.keyboard('{Enter}');
        await user.clear(categoriesInput);
      }

      await waitFor(() => {
        expect(screen.getByText(/has excedido el límite de 10 categorías/i)).toBeInTheDocument();
      });

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /crear perfil profesional/i });
      expect(submitButton).toBeDisabled();
    });

    test('successful professional registration', async () => {
      mockRegister.mockResolvedValue(undefined);

      // Fill personal information
      await user.type(screen.getByLabelText(/nombre completo/i), 'Professional User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'pro@example.com');
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      await user.type(screen.getByLabelText(/teléfono \(whatsapp\)/i), '+54 280 1234567');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1985-01-01');

      // Add service categories
      const categoriesInput = screen.getByPlaceholderText(/escribe categorías separadas por comas/i);
      await user.type(categoriesInput, 'Desarrollo Web');
      await user.keyboard('{Enter}');

      // Fill business information
      const descriptionTextarea = screen.getByLabelText(/descripción de servicios/i);
      await user.type(descriptionTextarea, 'Desarrollo de aplicaciones web modernas');

      const experienceSelect = screen.getByRole('combobox', { name: /selecciona tu experiencia/i });
      await user.click(experienceSelect);
      await user.click(screen.getByText('5-10 años'));

      const pricingSelect = screen.getByRole('combobox', { name: /selecciona tu rango/i });
      await user.click(pricingSelect);
      await user.click(screen.getByText('Premium ($15.000 - $50.000)'));

      const availabilitySelect = screen.getByRole('combobox', { name: /¿cuándo puedes trabajar?/i });
      await user.click(availabilitySelect);
      await user.click(screen.getByText('Tiempo completo (Lun-Vie 8-18h)'));

      // Check agreements
      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear perfil profesional/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            userType: 'professional',
            serviceCategories: ['Desarrollo Web'],
            description: 'Desarrollo de aplicaciones web modernas',
            experience: '5-10',
            pricing: 'premium',
            availability: 'tiempo-completo'
          })
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/verify-email?email=pro%40example.com');
    });
  });

  describe('Error Handling', () => {
    test('handles email already exists error', async () => {
      const emailExistsError = {
        response: { data: { message: 'Email already exists' } }
      };
      mockRegister.mockRejectedValue(emailExistsError);

      renderWithProviders();
      
      // Fill minimum required fields
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'existing@example.com');
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1990-01-01');

      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Esta dirección de email ya está registrada',
          expect.objectContaining({
            description: '¿Ya tienes cuenta? Intenta iniciar sesión o usar otro email.',
            action: expect.objectContaining({
              label: 'Iniciar Sesión'
            })
          })
        );
      });
    });

    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      mockRegister.mockRejectedValue(networkError);

      renderWithProviders();
      
      // Fill minimum required fields and submit
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1990-01-01');

      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Error al crear la cuenta',
          expect.objectContaining({
            description: 'Por favor, verifica los datos ingresados e intenta de nuevo.'
          })
        );
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state during registration', async () => {
      let resolveRegistration: () => void;
      mockRegister.mockImplementation(() => 
        new Promise(resolve => { resolveRegistration = resolve; })
      );

      renderWithProviders();
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
      await user.type(screen.getByLabelText('Contraseña *'), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const locationSelect = screen.getByRole('combobox');
      await user.click(locationSelect);
      await user.click(screen.getByText('Rawson'));

      const birthdateInput = screen.getByLabelText(/fecha de nacimiento/i);
      await user.type(birthdateInput, '1990-01-01');

      await user.click(screen.getByLabelText(/acepto los términos/i));
      await user.click(screen.getByLabelText(/acepto la política/i));

      const submitButton = screen.getByRole('button', { name: /crear cuenta gratuita/i });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Creando tu cuenta...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and ARIA attributes', () => {
      renderWithProviders();

      // Check required field indicators
      expect(screen.getByLabelText(/nombre completo \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico \*/i)).toBeInTheDocument();
      
      // Check form structure
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    test('keyboard navigation works properly', async () => {
      renderWithProviders();

      // Should be able to navigate tabs with keyboard
      const clientTab = screen.getByRole('tab', { name: /cliente/i });
      const professionalTab = screen.getByRole('tab', { name: /profesional/i });

      clientTab.focus();
      await user.keyboard('{ArrowRight}');
      expect(professionalTab).toHaveFocus();
    });
  });

  describe('Link Navigation', () => {
    test('provides navigation to login page', () => {
      renderWithProviders();

      const loginLink = screen.getByText(/inicia sesión aquí/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    test('includes links to terms and privacy policy', () => {
      renderWithProviders();

      const termsLink = screen.getByText(/términos y condiciones/i);
      expect(termsLink).toBeInTheDocument();
      expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');

      const privacyLink = screen.getByText(/política de privacidad/i);
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
    });
  });
});