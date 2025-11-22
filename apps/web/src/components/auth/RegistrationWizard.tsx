import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { FormFieldError, FormFieldCharCount, FormFieldPasswordStrength } from '../ui/form-field-error';
import { cn } from '../ui/utils';

export interface RegistrationFormData {
  // Common fields
  userType: 'client' | 'professional' | '';
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  dni: string;

  // Professional fields
  businessName: string;
  serviceCategories: string[];
  description: string;
  experience: string;
  verification: string;

  // Agreements
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

interface RegistrationWizardProps {
  onSubmit: (formData: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const PROFESSIONAL_CATEGORIES = [
  'Peluquería', 'Manicura', 'Pedicura', 'Desarrollo Web', 'Diseño Gráfico',
  'Reparaciones', 'Plomería', 'Electricidad', 'Limpieza', 'Jardinería',
  'Marketing Digital', 'Fotografía', 'Contaduría', 'Asesoría Legal',
  'Clases Particulares', 'Traducción', 'Catering', 'Decoración',
  'Masajes', 'Entrenamiento Personal', 'Veterinaria', 'Cerrajería',
  'Carpintería', 'Pintura', 'Mudanzas', 'Delivery', 'Cuidado de Niños',
  'Cuidado de Adultos Mayores', 'Psicología', 'Nutrición'
];

const STEPS = ['Tipo de Cuenta', 'Información Personal', 'Detalles Profesionales', 'Términos y Condiciones'];

/**
 * RegistrationWizard - Multi-step registration form
 * Progressive disclosure improves UX and reduces cognitive load
 */
export function RegistrationWizard({
  onSubmit,
  isLoading = false,
  error: externalError,
}: RegistrationWizardProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong'>('weak');

  const [formData, setFormData] = useState<RegistrationFormData>({
    userType: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    dni: '',
    businessName: '',
    serviceCategories: [],
    description: '',
    experience: '',
    verification: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return 'El email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'Mínimo 8 caracteres';
    return null;
  };

  const calculatePasswordStrength = (password: string) => {
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'fair';
    else if (score <= 5) strength = 'good';
    else strength = 'strong';

    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));
    calculatePasswordStrength(value);

    // Clear error if user starts typing
    if (errors.password) {
      setErrors((prev) => {
        const { password, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.userType) {
        newErrors.userType = 'Selecciona un tipo de cuenta';
      }
    } else if (stepNum === 2) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'El nombre es requerido';
      }

      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;

      if (!formData.phone.trim()) {
        newErrors.phone = 'El teléfono es requerido';
      }

      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (stepNum === 3 && formData.userType === 'professional') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'El nombre del negocio es requerido';
      }

      if (formData.serviceCategories.length === 0) {
        newErrors.serviceCategories = 'Selecciona al menos una categoría';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
      } else if (formData.description.length < 20) {
        newErrors.description = 'Mínimo 20 caracteres';
      }
    } else if (stepNum === 4) {
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'Debes aceptar los términos de servicio';
      }
      if (!formData.agreePrivacy) {
        newErrors.agreePrivacy = 'Debes aceptar la política de privacidad';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      await onSubmit(formData);
    }
  };

  const totalSteps = formData.userType === 'professional' ? STEPS.length : 3;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {[...Array(totalSteps)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i + 1 <= step ? 'bg-primary' : 'bg-border'
                )}
                layoutId={`step-${i}`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Paso {step} de {totalSteps}
            </span>
            <span className="text-sm font-semibold text-primary">
              {STEPS[step - 1]}
            </span>
          </div>
        </div>

        {/* External Error Alert */}
        {externalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{externalError}</AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>¿Qué tipo de cuenta deseas?</CardTitle>
                    <CardDescription>
                      Puedes cambiar esto más tarde en tu perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Client Option */}
                    <motion.button
                      type="button"
                      onClick={() => handleChange('userType', 'client')}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
                        formData.userType === 'client'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-background/50'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold mb-1">Soy Cliente</div>
                      <div className="text-sm text-muted-foreground">
                        Busco profesionales para mis proyectos
                      </div>
                    </motion.button>

                    {/* Professional Option */}
                    <motion.button
                      type="button"
                      onClick={() => handleChange('userType', 'professional')}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
                        formData.userType === 'professional'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-background/50'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold mb-1">Soy Profesional</div>
                      <div className="text-sm text-muted-foreground">
                        Ofrezco mis servicios a clientes
                      </div>
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Esto nos ayuda a verificar tu cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input
                        id="fullName"
                        placeholder="Juan Pérez"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                      />
                      {errors.fullName && (
                        <FormFieldError error={errors.fullName} id="fullName" />
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <FormFieldError error={errors.email} id="email" />
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <FormFieldError error={errors.phone} id="phone" />
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handlePasswordChange}
                          aria-invalid={!!errors.password}
                          aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <FormFieldError error={errors.password} id="password" />
                      )}
                      {formData.password && !errors.password && (
                        <FormFieldPasswordStrength strength={passwordStrength} id="password" />
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          aria-invalid={!!errors.confirmPassword}
                          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <FormFieldError error={errors.confirmPassword} id="confirmPassword" />
                      )}
                      {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                        <FormFieldError success="Las contraseñas coinciden" id="confirmPassword" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && formData.userType === 'professional' && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Detalles Profesionales</CardTitle>
                    <CardDescription>
                      Cuéntanos más sobre tus servicios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Business Name */}
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Nombre del Negocio</Label>
                      <Input
                        id="businessName"
                        placeholder="Mi Negocio"
                        value={formData.businessName}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                        aria-invalid={!!errors.businessName}
                        aria-describedby={errors.businessName ? 'businessName-error' : undefined}
                      />
                      {errors.businessName && (
                        <FormFieldError error={errors.businessName} id="businessName" />
                      )}
                    </div>

                    {/* Service Categories */}
                    <div className="space-y-2">
                      <Label>Categorías de Servicios</Label>
                      <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                        {PROFESSIONAL_CATEGORIES.map((category) => (
                          <label
                            key={category}
                            className="flex items-center gap-2 cursor-pointer hover:bg-background/50 p-2 rounded transition-colors"
                          >
                            <Checkbox
                              checked={formData.serviceCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleChange('serviceCategories', [
                                    ...formData.serviceCategories,
                                    category,
                                  ]);
                                } else {
                                  handleChange(
                                    'serviceCategories',
                                    formData.serviceCategories.filter((c) => c !== category)
                                  );
                                }
                              }}
                            />
                            <span className="text-sm">{category}</span>
                          </label>
                        ))}
                      </div>
                      {errors.serviceCategories && (
                        <FormFieldError error={errors.serviceCategories} />
                      )}
                      {formData.serviceCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.serviceCategories.map((cat) => (
                            <Badge key={cat} variant="secondary">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <textarea
                        id="description"
                        placeholder="Describe tus servicios y experiencia..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background/50 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 transition-all duration-150 resize-none"
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? 'description-error' : 'description-counter'}
                      />
                      {errors.description && (
                        <FormFieldError error={errors.description} id="description" />
                      )}
                      <FormFieldCharCount
                        current={formData.description.length}
                        max={500}
                        id="description"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && formData.userType === 'client' && (
              <motion.div
                key="step-3-client"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Términos y Condiciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) =>
                            handleChange('agreeTerms', checked)
                          }
                          className="mt-1"
                        />
                        <span className="text-sm">
                          Acepto los{' '}
                          <a href="#" className="text-primary hover:underline">
                            términos de servicio
                          </a>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.agreePrivacy}
                          onCheckedChange={(checked) =>
                            handleChange('agreePrivacy', checked)
                          }
                          className="mt-1"
                        />
                        <span className="text-sm">
                          Acepto la{' '}
                          <a href="#" className="text-primary hover:underline">
                            política de privacidad
                          </a>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.agreeMarketing}
                          onCheckedChange={(checked) =>
                            handleChange('agreeMarketing', checked)
                          }
                          className="mt-1"
                        />
                        <span className="text-sm">
                          Deseo recibir ofertas y noticias (opcional)
                        </span>
                      </label>
                    </div>

                    {errors.agreeTerms && (
                      <FormFieldError error={errors.agreeTerms} />
                    )}
                    {errors.agreePrivacy && (
                      <FormFieldError error={errors.agreePrivacy} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 4 && formData.userType === 'professional' && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Términos y Condiciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) =>
                            handleChange('agreeTerms', checked)
                          }
                          className="mt-1"
                        />
                        <span className="text-sm">
                          Acepto los{' '}
                          <a href="#" className="text-primary hover:underline">
                            términos de servicio
                          </a>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.agreePrivacy}
                          onCheckedChange={(checked) =>
                            handleChange('agreePrivacy', checked)
                          }
                          className="mt-1"
                        />
                        <span className="text-sm">
                          Acepto la{' '}
                          <a href="#" className="text-primary hover:underline">
                            política de privacidad
                          </a>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.agreeMarketing}
                          onCheckedChange={(checked) =>
                            handleChange('agreeMarketing', checked)
                          }
                          className="mt-1"
                        />
                        <span className="text-sm">
                          Deseo recibir ofertas y noticias (opcional)
                        </span>
                      </label>
                    </div>

                    {errors.agreeTerms && (
                      <FormFieldError error={errors.agreeTerms} />
                    )}
                    {errors.agreePrivacy && (
                      <FormFieldError error={errors.agreePrivacy} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              className="px-6"
            >
              ← Atrás
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="px-6"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
