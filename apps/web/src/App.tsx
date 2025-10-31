import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Lazy-loaded Pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const NewProjectPage = lazy(() => import("./pages/NewProjectPage"));
const NewOpportunityPage = lazy(() => import("./pages/NewOpportunityPage"));
const MyAnnouncementsPage = lazy(() => import("./pages/MyAnnouncementsPage"));
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const Error404Page = lazy(() => import("./pages/Error404Page"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const HelpArticleDetailPage = lazy(() => import("./pages/HelpArticleDetailPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
// DISABLED: ReviewsPage causing React error #306 - replaced with new Feedback system
// const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const VerificationPage = lazy(() => import("./pages/VerificationPage"));
const VerificationAdminPage = lazy(() => import("./pages/admin/VerificationAdminPage"));
const PaymentTestPage = lazy(() => import("./pages/PaymentTestPage"));
const SubscriptionSuccess = lazy(() => import("./pages/subscription/SubscriptionSuccess"));
const SubscriptionFailure = lazy(() => import("./pages/subscription/SubscriptionFailure"));
const SubscriptionPending = lazy(() => import("./pages/subscription/SubscriptionPending"));

// Context
import { SecureAuthProvider, useSecureAuth } from "./context/SecureAuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// Error Boundaries
import ErrorBoundary from "./components/ErrorBoundary";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import AsyncErrorBoundary from "./components/AsyncErrorBoundary";

// Accessibility
import { useFocusManagement } from "./hooks/useFocusManagement";
import "./utils/colorContrastAudit"; // Auto-runs audit in development

// Toast notifications
import { Toaster } from "./components/ui/sonner";

// Loading component for initial app load
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative">
          <motion.img
            src="/logo.png"
            alt="Fixia"
            className="h-16 w-16 object-contain drop-shadow-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur opacity-30 animate-pulse-slow"></div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-foreground">Fixia</div>
          <div className="text-sm text-muted-foreground">Conecta. Confía. Resuelve.</div>
        </div>
      </motion.div>
    </div>
  );
}

// Lightweight loading component for lazy-loaded pages
function PageLoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center space-y-3"
      >
        <div className="relative">
          <motion.img
            src="/logo.png"
            alt="Fixia"
            className="h-12 w-12 object-contain drop-shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </motion.div>
    </div>
  );
}

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSecureAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSecureAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Component to handle focus management inside Router context
function FocusManager() {
  useFocusManagement();
  return null;
}

function AppRoutes() {
  return (
    <Router>
      <FocusManager />
      <RouteErrorBoundary routeName="App Routes">
        <AnimatePresence mode="wait">
          <ErrorBoundary level="page" name="Page Container">
            <Suspense fallback={<PageLoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <RouteErrorBoundary routeName="Inicio">
                    <HomePage />
                  </RouteErrorBoundary>
                } />
                <Route path="/services" element={
                  <RouteErrorBoundary routeName="Servicios" fallbackRoute="/">
                    <ServicesPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/services/:id" element={
                  <RouteErrorBoundary routeName="Detalle de Servicio" fallbackRoute="/services">
                    <ServiceDetailPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/profile/:userId" element={
                  <RouteErrorBoundary routeName="Perfil Público" fallbackRoute="/">
                    <PublicProfilePage />
                  </RouteErrorBoundary>
                } />
                <Route path="/terms" element={
                  <RouteErrorBoundary routeName="Términos" fallbackRoute="/">
                    <TermsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/privacy" element={
                  <RouteErrorBoundary routeName="Privacidad" fallbackRoute="/">
                    <PrivacyPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/about" element={
                  <RouteErrorBoundary routeName="Acerca de" fallbackRoute="/">
                    <AboutPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/how-it-works" element={
                  <RouteErrorBoundary routeName="Cómo Funciona" fallbackRoute="/">
                    <HowItWorksPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/contact" element={
                  <RouteErrorBoundary routeName="Contacto" fallbackRoute="/">
                    <ContactPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/pricing" element={
                  <RouteErrorBoundary routeName="Precios" fallbackRoute="/">
                    <PricingPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/subscription/success" element={
                  <RouteErrorBoundary routeName="Suscripción Exitosa" fallbackRoute="/dashboard">
                    <SubscriptionSuccess />
                  </RouteErrorBoundary>
                } />
                <Route path="/subscription/failure" element={
                  <RouteErrorBoundary routeName="Pago Rechazado" fallbackRoute="/pricing">
                    <SubscriptionFailure />
                  </RouteErrorBoundary>
                } />
                <Route path="/subscription/pending" element={
                  <RouteErrorBoundary routeName="Pago Pendiente" fallbackRoute="/dashboard">
                    <SubscriptionPending />
                  </RouteErrorBoundary>
                } />
                <Route path="/help" element={
                  <RouteErrorBoundary routeName="Ayuda" fallbackRoute="/">
                    <HelpPage />
                  </RouteErrorBoundary>
                } />
                <Route path="/help/:articleId" element={
                  <RouteErrorBoundary routeName="Artículo de Ayuda" fallbackRoute="/help">
                    <HelpArticleDetailPage />
                  </RouteErrorBoundary>
                } />

                {/* Auth Routes */}
                <Route 
                  path="/login" 
                  element={
                    <RouteErrorBoundary routeName="Iniciar Sesión" fallbackRoute="/">
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <RouteErrorBoundary routeName="Registro" fallbackRoute="/">
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/forgot-password" 
                  element={
                    <RouteErrorBoundary routeName="Recuperar Contraseña" fallbackRoute="/login">
                      <PublicRoute>
                        <ForgotPasswordPage />
                      </PublicRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/verify-email/*" 
                  element={
                    <RouteErrorBoundary routeName="Verificación de Email" fallbackRoute="/">
                      <EmailVerificationPage />
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/verify-email" 
                  element={
                    <RouteErrorBoundary routeName="Verificación de Email" fallbackRoute="/">
                      <EmailVerificationPage />
                    </RouteErrorBoundary>
                  } 
                />
            
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <RouteErrorBoundary routeName="Dashboard" fallbackRoute="/">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <DashboardPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <RouteErrorBoundary routeName="Mi Perfil" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <ProfilePage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/new-project" 
                  element={
                    <RouteErrorBoundary routeName="Nuevo Proyecto" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <NewProjectPage />
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route
                  path="/new-opportunity"
                  element={
                    <RouteErrorBoundary routeName="Nuevo Anuncio" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <NewOpportunityPage />
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/my-announcements"
                  element={
                    <RouteErrorBoundary routeName="Mis Anuncios" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <MyAnnouncementsPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/opportunities"
                  element={
                    <RouteErrorBoundary routeName="Oportunidades" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <OpportunitiesPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  }
                />
                <Route 
                  path="/favorites" 
                  element={
                    <RouteErrorBoundary routeName="Favoritos" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <FavoritesPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <RouteErrorBoundary routeName="Notificaciones" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <RouteErrorBoundary routeName="Configuración" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <SettingsPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route
                  path="/jobs"
                  element={
                    <RouteErrorBoundary routeName="Mis Trabajos" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <JobsPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  }
                />
                {/* DISABLED: Reviews route - replaced with new Feedback system below
                <Route
                  path="/reviews"
                  element={
                    <RouteErrorBoundary routeName="Mis Reseñas" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <ReviewsPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  }
                />
                */}
                <Route
                  path="/feedback"
                  element={
                    <RouteErrorBoundary routeName="Mi Feedback" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <FeedbackPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  }
                />
                <Route 
                  path="/verification" 
                  element={
                    <RouteErrorBoundary routeName="Verificación" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <VerificationPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/payment-test" 
                  element={
                    <RouteErrorBoundary routeName="Payment Test" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <PaymentTestPage />
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/admin/verification" 
                  element={
                    <RouteErrorBoundary routeName="Admin Verificación" fallbackRoute="/dashboard">
                      <ProtectedRoute>
                        <AsyncErrorBoundary>
                          <VerificationAdminPage />
                        </AsyncErrorBoundary>
                      </ProtectedRoute>
                    </RouteErrorBoundary>
                  } 
                />
                
                {/* 404 Route */}
                <Route path="*" element={
                  <RouteErrorBoundary routeName="Página No Encontrada" fallbackRoute="/">
                    <Error404Page />
                  </RouteErrorBoundary>
                } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AnimatePresence>
      </RouteErrorBoundary>
    </Router>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary level="critical" name="App">
      <SecureAuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-background">
            <AppRoutes />
            
            {/* Background decorative elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-10 animate-float"></div>
              <div className="absolute top-3/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>
            
            {/* Toast notifications */}
            <Toaster />
          </div>
        </NotificationProvider>
      </SecureAuthProvider>
    </ErrorBoundary>
  );
}