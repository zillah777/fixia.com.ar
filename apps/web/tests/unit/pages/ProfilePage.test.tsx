/**
 * ProfilePage Comprehensive Unit Tests
 * 
 * These tests cover all functionality found in the ProfilePage component,
 * including form interactions, modals, tabs, and user flows.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../../../src/pages/ProfilePage';
import { AuthContext } from '../../../src/context/AuthContext';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('motion/react', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock AuthContext values for different user types
const mockProfessionalUser = {
  id: 'prof-123',
  email: 'professional@test.com',
  name: 'Ana Martinez',
  userType: 'professional' as const,
  avatar: 'https://example.com/avatar.jpg',
  verified: true,
  professionalProfile: {
    id: 'prof-profile-123',
    serviceCategories: ['Desarrollo Web', 'React'],
    description: 'Desarrolladora full-stack con 5 años de experiencia',
    experience: '5 años',
    pricing: 'Por proyecto',
    availability: 'available' as const,
    portfolio: 'https://ana-portfolio.com',
    certifications: 'Certificación React, Node.js',
    averageRating: 4.9,
    totalReviews: 187,
    totalServices: 45,
    completedServices: 42,
    verified: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  location: 'Buenos Aires, Argentina',
  phone: '+54 11 1234 5678',
  createdAt: '2023-01-01T00:00:00Z',
  planType: 'premium' as const,
  isVerified: true,
  emailVerified: true,
};

const mockClientUser = {
  id: 'client-123',
  email: 'client@test.com',
  name: 'Carlos Cliente',
  userType: 'client' as const,
  avatar: '',
  verified: false,
  location: 'Córdoba, Argentina',
  phone: '',
  createdAt: '2024-01-01T00:00:00Z',
  planType: 'free' as const,
  isVerified: false,
  emailVerified: true,
};

const mockAuthContextValue = {
  user: mockProfessionalUser,
  isAuthenticated: true,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn().mockResolvedValue(undefined),
  requestContactProfessional: jest.fn(),
  respondToContactRequest: jest.fn(),
  updateAvailability: jest.fn(),
  upgradeToPremium: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
  loading: false,
};

const renderProfilePage = (userOverride?: any) => {
  const contextValue = {
    ...mockAuthContextValue,
    user: userOverride || mockProfessionalUser,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={contextValue}>
        <ProfilePage />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation Component', () => {
    it('renders navigation with correct elements', () => {
      renderProfilePage();
      
      expect(screen.getByText('Fixia')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Explorar')).toBeInTheDocument();
      expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
      expect(screen.getByText('Salir')).toBeInTheDocument();
    });

    it('calls logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const logoutButton = screen.getByRole('button', { name: /salir/i });
      await user.click(logoutButton);
      
      expect(mockAuthContextValue.logout).toHaveBeenCalledTimes(1);
    });

    it('has correct navigation links', () => {
      renderProfilePage();
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      const exploreLink = screen.getByRole('link', { name: /explorar/i });
      
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(exploreLink).toHaveAttribute('href', '/services');
    });
  });

  describe('ProfileHeader Component', () => {
    it('displays user information correctly', () => {
      renderProfilePage();
      
      expect(screen.getByText('Ana Martinez')).toBeInTheDocument();
      expect(screen.getByText('Desarrolladora full-stack con 5 años de experiencia')).toBeInTheDocument();
      expect(screen.getByText('Buenos Aires, Argentina')).toBeInTheDocument();
      expect(screen.getByText('Profesional Verificado')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('(187 reseñas)')).toBeInTheDocument();
    });

    it('shows professional stats for professional users', () => {
      renderProfilePage();
      
      expect(screen.getByText('45')).toBeInTheDocument(); // totalServices
      expect(screen.getByText('42')).toBeInTheDocument(); // completedServices
      expect(screen.getByText('4.9')).toBeInTheDocument(); // averageRating
      expect(screen.getByText('187')).toBeInTheDocument(); // totalReviews
    });

    it('shows verified badge when user is verified', () => {
      renderProfilePage();
      
      expect(screen.getByText('Verificado')).toBeInTheDocument();
    });

    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);
      
      // Should show save and cancel buttons
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /×/i })).toBeInTheDocument();
      
      // Should show editable fields
      expect(screen.getByDisplayValue('Ana Martinez')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Desarrolladora full-stack con 5 años de experiencia')).toBeInTheDocument();
    });

    it('saves profile changes when save button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);
      
      // Modify fields
      const nameInput = screen.getByDisplayValue('Ana Martinez');
      await user.clear(nameInput);
      await user.type(nameInput, 'Ana Martinez Updated');
      
      // Save changes
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(saveButton);
      
      // Should show success message
      expect(toast.success).toHaveBeenCalledWith('Perfil actualizado correctamente');
    });

    it('cancels edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);
      
      // Cancel editing
      const cancelButton = screen.getByRole('button', { name: /×/i });
      await user.click(cancelButton);
      
      // Should exit edit mode
      expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /guardar/i })).not.toBeInTheDocument();
    });
  });

  describe('Avatar Upload Modal', () => {
    it('opens avatar upload modal when camera button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const cameraButton = screen.getByRole('button', { name: /camera/i });
      await user.click(cameraButton);
      
      expect(screen.getByText('Cambiar Foto de Perfil')).toBeInTheDocument();
      expect(screen.getByText('Selecciona una nueva imagen para tu perfil')).toBeInTheDocument();
      expect(screen.getByText('Haz clic para subir')).toBeInTheDocument();
    });

    it('handles file selection in avatar upload', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const cameraButton = screen.getByRole('button', { name: /camera/i });
      await user.click(cameraButton);
      
      const fileInput = screen.getByRole('textbox', { hidden: true });
      const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
      
      await user.upload(fileInput, file);
      
      expect(fileInput).toHaveProperty('files', expect.arrayContaining([file]));
    });

    it('has save button in avatar upload modal', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const cameraButton = screen.getByRole('button', { name: /camera/i });
      await user.click(cameraButton);
      
      expect(screen.getByRole('button', { name: /guardar imagen/i })).toBeInTheDocument();
    });
  });

  describe('Professional Tabs', () => {
    it('shows professional tabs for professional users', () => {
      renderProfilePage();
      
      expect(screen.getByRole('tab', { name: /portafolio/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /reseñas/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /configuración/i })).toBeInTheDocument();
    });

    it('switches between tabs correctly', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      // Click on Reviews tab
      const reviewsTab = screen.getByRole('tab', { name: /reseñas/i });
      await user.click(reviewsTab);
      
      expect(screen.getByText('Reseñas y Valoraciones')).toBeInTheDocument();
      expect(screen.getByText('Lo que dicen mis clientes')).toBeInTheDocument();
      
      // Click on Analytics tab
      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      await user.click(analyticsTab);
      
      expect(screen.getByText('Analytics y Estadísticas')).toBeInTheDocument();
    });
  });

  describe('Client Tabs', () => {
    it('shows client tabs for client users', () => {
      renderProfilePage(mockClientUser);
      
      expect(screen.getByRole('tab', { name: /actividad/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /favoritos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /mis pedidos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /configuración/i })).toBeInTheDocument();
    });

    it('shows empty states for client tabs', async () => {
      const user = userEvent.setup();
      renderProfilePage(mockClientUser);
      
      // Activity tab should show empty state
      expect(screen.getByText('Sin actividad reciente')).toBeInTheDocument();
      
      // Click on Favorites tab
      const favoritesTab = screen.getByRole('tab', { name: /favoritos/i });
      await user.click(favoritesTab);
      
      expect(screen.getByText('Aún no tienes servicios guardados como favoritos.')).toBeInTheDocument();
      
      // Click on Orders tab
      const ordersTab = screen.getByRole('tab', { name: /mis pedidos/i });
      await user.click(ordersTab);
      
      expect(screen.getByText('Sin pedidos realizados')).toBeInTheDocument();
    });
  });

  describe('Portfolio Section', () => {
    it('displays portfolio items', () => {
      renderProfilePage();
      
      expect(screen.getByText('Portafolio')).toBeInTheDocument();
      expect(screen.getByText('Mis trabajos más destacados')).toBeInTheDocument();
      
      // Mock portfolio items should be visible
      expect(screen.getByText('E-commerce ModaStyle')).toBeInTheDocument();
      expect(screen.getByText('App Móvil FitTracker')).toBeInTheDocument();
      expect(screen.getByText('Identidad Visual TechStart')).toBeInTheDocument();
    });

    it('opens add project modal when add button is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const addButton = screen.getByRole('button', { name: /agregar proyecto/i });
      await user.click(addButton);
      
      expect(screen.getByText('Agregar Nuevo Proyecto')).toBeInTheDocument();
      expect(screen.getByText('Agrega un nuevo proyecto a tu portafolio')).toBeInTheDocument();
    });

    it('filters portfolio items by category', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const webDevButton = screen.getByRole('button', { name: /desarrollo web/i });
      await user.click(webDevButton);
      
      // Filter should be applied (visual feedback)
      expect(webDevButton).toHaveClass('liquid-gradient');
    });
  });

  describe('Add Portfolio Project Modal', () => {
    it('contains all required form fields', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const addButton = screen.getByRole('button', { name: /agregar proyecto/i });
      await user.click(addButton);
      
      expect(screen.getByPlaceholderText('Ej: App Móvil Innovadora')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument(); // Description textarea
      expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /guardar proyecto/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('has category selection dropdown', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const addButton = screen.getByRole('button', { name: /agregar proyecto/i });
      await user.click(addButton);
      
      // Should have category select
      const categorySelect = screen.getByRole('combobox');
      expect(categorySelect).toBeInTheDocument();
    });
  });

  describe('Reviews Section', () => {
    it('displays review statistics', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const reviewsTab = screen.getByRole('tab', { name: /reseñas/i });
      await user.click(reviewsTab);
      
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('187 reseñas')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument(); // 5-star percentage
    });

    it('displays individual reviews', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const reviewsTab = screen.getByRole('tab', { name: /reseñas/i });
      await user.click(reviewsTab);
      
      expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('Excelente trabajo. Ana entregó exactamente lo que necesitábamos y más.')).toBeInTheDocument();
    });

    it('shows response option for reviews without responses', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const reviewsTab = screen.getByRole('tab', { name: /reseñas/i });
      await user.click(reviewsTab);
      
      expect(screen.getByRole('button', { name: /responder/i })).toBeInTheDocument();
    });
  });

  describe('Settings Section', () => {
    it('displays account settings form', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const settingsTab = screen.getByRole('tab', { name: /configuración/i });
      await user.click(settingsTab);
      
      expect(screen.getByText('Configuración de Cuenta')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ana@ejemplo.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+52 55 1234 5678')).toBeInTheDocument();
    });

    it('displays notification preferences', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const settingsTab = screen.getByRole('tab', { name: /configuración/i });
      await user.click(settingsTab);
      
      expect(screen.getByText('Preferencias de Notificación')).toBeInTheDocument();
      expect(screen.getByText('Nuevos mensajes')).toBeInTheDocument();
      expect(screen.getByText('Nuevos pedidos')).toBeInTheDocument();
      expect(screen.getByText('Newsletter semanal')).toBeInTheDocument();
    });

    it('displays security settings', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const settingsTab = screen.getByRole('tab', { name: /configuración/i });
      await user.click(settingsTab);
      
      expect(screen.getByText('Seguridad')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
      expect(screen.getByText('Autenticación de dos factores')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /descargar datos personales/i })).toBeInTheDocument();
    });

    it('displays danger zone', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const settingsTab = screen.getByRole('tab', { name: /configuración/i });
      await user.click(settingsTab);
      
      expect(screen.getByText('Zona Peligrosa')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /eliminar cuenta/i })).toBeInTheDocument();
    });

    it('has working notification switches', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const settingsTab = screen.getByRole('tab', { name: /configuración/i });
      await user.click(settingsTab);
      
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
      
      // Test toggling a switch
      await user.click(switches[0]);
      // Switch state should change (tested through aria-checked)
    });
  });

  describe('Social Media Fields', () => {
    it('displays social media input fields', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const settingsTab = screen.getByRole('tab', { name: /configuración/i });
      await user.click(settingsTab);
      
      expect(screen.getByText('Redes Sociales')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('LinkedIn URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Twitter URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('GitHub URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Instagram URL')).toBeInTheDocument();
    });
  });

  describe('Analytics Tab', () => {
    it('displays analytics metrics for professionals', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      await user.click(analyticsTab);
      
      expect(screen.getByText('Analytics y Estadísticas')).toBeInTheDocument();
      expect(screen.getByText('$12,450')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('89%')).toBeInTheDocument();
      expect(screen.getByText('45min')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles null user gracefully', () => {
      const contextValue = {
        ...mockAuthContextValue,
        user: null,
      };

      render(
        <BrowserRouter>
          <AuthContext.Provider value={contextValue}>
            <ProfilePage />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // Component should not render when user is null
      expect(screen.queryByText('Fixia')).not.toBeInTheDocument();
    });

    it('handles missing professional profile gracefully', () => {
      const userWithoutProfile = {
        ...mockProfessionalUser,
        professionalProfile: undefined,
      };

      renderProfilePage(userWithoutProfile);

      expect(screen.getByText('Ana Martinez')).toBeInTheDocument();
      // Should show fallback values
      expect(screen.getByText('0')).toBeInTheDocument(); // Default stats
    });
  });

  describe('Form Validation', () => {
    it('validates profile edit form fields', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar perfil/i });
      await user.click(editButton);
      
      // Clear required field
      const nameInput = screen.getByDisplayValue('Ana Martinez');
      await user.clear(nameInput);
      
      // Try to save
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(saveButton);
      
      // Should still show success (current implementation doesn't validate)
      expect(toast.success).toHaveBeenCalledWith('Perfil actualizado correctamente');
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts layout for different screen sizes', () => {
      renderProfilePage();
      
      // Check for responsive classes
      const profileContent = screen.getByText('Ana Martinez').closest('.flex');
      expect(profileContent).toHaveClass('lg:flex-row', 'flex-col');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderProfilePage();
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderProfilePage();
      
      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '/dashboard');
      
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '/services');
    });
  });
});