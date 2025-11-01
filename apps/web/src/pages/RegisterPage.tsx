import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, AlertCircle, Crown, UserPlus, FileText, CreditCard, X, Hash, Plus } from "lucide-react";
import { PasswordToggleButton } from "../components/inputs/PasswordToggleButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { SecureInput } from "../components/SecureInput";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { PasswordStrength } from "../components/ui/password-strength";
import { useSecureAuth } from "../context/SecureAuthContext";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { toast } from "sonner";
import { usePasswordValidation, validatePassword } from "../utils/passwordValidation";
import { validateEmailFormat, FormSanitizers } from "../utils/sanitization";

interface FormData {
  // Common fields
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  location: string;
  birthdate: string;
  
  // Professional fields
  serviceCategories: string[];
  description: string;
  experience: string;
  pricing: string;
  availability: string;
  portfolio: string;
  certifications: string;
  
  // Agreements
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  location: '',
  birthdate: '',
  serviceCategories: [],
  description: '',
  experience: '',
  pricing: '',
  availability: '',
  portfolio: '',
  certifications: '',
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false
};

const popularCategories = [
  "Peluquería", "Manicura", "Pedicura", "Desarrollo Web", "Diseño Gráfico", 
  "Reparaciones", "Plomería", "Electricidad", "Limpieza", "Jardinería",
  "Marketing Digital", "Fotografía", "Contaduría", "Asesoría Legal",
  "Clases Particulares", "Traducción", "Catering", "Decoración",
  "Masajes", "Entrenamiento Personal", "Veterinaria", "Cerrajería",
  "Carpintería", "Pintura", "Mudanzas", "Delivery", "Cuidado de Niños",
  "Cuidado de Adultos Mayores", "Psicología", "Nutrición"
];


function ClientRegistrationForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  // Enhanced password validation with security standards
  const passwordValidation = usePasswordValidation(formData.password);

  // Real-time password match validation
  useEffect(() => {
    if (formData.confirmPassword.length > 0) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const locations = [
    "Rawson", "Puerto Madryn", "Comodoro Rivadavia", "Trelew", 
    "Esquel", "Gaiman", "Puerto Deseado", "Caleta Olivia",
    "Río Gallegos", "El Calafate", "Ushuaia", "Otra ubicación"
  ];

  return (
    <Card className="glass border-white/10 max-w-2xl mx-auto mobile-card">
      <CardHeader className="text-center space-y-2 sm:space-y-3">
        <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
          <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
          <CardTitle className="mobile-text-2xl text-foreground">Registro como Cliente</CardTitle>
        </div>
        <CardDescription className="mobile-text-base">
          Acceso gratuito para buscar y contactar profesionales verificados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Pérez"
                maxLength={100}
                autoComplete="name"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck="false"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@email.com"
                maxLength={200}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  aria-describedby={formData.password.length > 0 ? "password-feedback" : undefined}
                  required
                />
                <PasswordToggleButton
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  aria-describedby={formData.confirmPassword ? "confirm-password-feedback" : undefined}
                  required
                />
                <PasswordToggleButton
                  showPassword={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  ariaLabel={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                />
              </div>
            </div>
          </div>

          {/* Password strength indicator */}
          <PasswordStrength password={formData.password} />

          {/* Password validation feedback */}
          {(formData.password.length > 0 || (formData.confirmPassword && !passwordsMatch)) && (
            <div className="space-y-4">

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {/* Password errors */}
                  {passwordValidation.errors.length > 0 && (
                    <div id="password-feedback" className="text-sm space-y-2">
                      <p className="text-destructive font-medium">Errores:</p>
                      {passwordValidation.errors.map((error, index) => (
                        <div key={index} className="flex items-center space-x-2 text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Password warnings */}
                  {passwordValidation.warnings.length > 0 && (
                    <div className="text-sm space-y-2">
                      <p className="text-warning font-medium">Recomendaciones:</p>
                      {passwordValidation.warnings.map((warning, index) => (
                        <div key={index} className="flex items-center space-x-2 text-warning">
                          <AlertCircle className="h-3 w-3" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2" id="confirm-password-feedback">
                  {/* Password match validation */}
                  {formData.confirmPassword && !passwordsMatch && (
                    <div className="flex items-center space-x-2 text-destructive text-sm">
                      <AlertCircle className="h-3 w-3" />
                      <span>Las contraseñas no coinciden</span>
                    </div>
                  )}
                  {formData.confirmPassword && passwordsMatch && formData.password && (
                    <div className="flex items-center space-x-2 text-success text-sm">
                      <CheckCircle className="h-3 w-3" />
                      <span>Las contraseñas coinciden</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 280 1234567"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">Fecha de Nacimiento *</Label>
            <Input
              id="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              max={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-muted-foreground">
              Debes ser mayor de 18 años para registrarte
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeTerms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreeTerms: checked as boolean })
                }
                required
              />
              <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                Acepto los{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>{" "}
                de Fixia
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreePrivacy"
                checked={formData.agreePrivacy}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreePrivacy: checked as boolean })
                }
                required
              />
              <Label htmlFor="agreePrivacy" className="text-sm leading-relaxed">
                Acepto la{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>{" "}
                y el tratamiento de mis datos personales
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeMarketing"
                checked={formData.agreeMarketing}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreeMarketing: checked as boolean })
                }
              />
              <Label htmlFor="agreeMarketing" className="text-sm leading-relaxed">
                Deseo recibir ofertas especiales y noticias de Fixia (opcional)
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando tu cuenta...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Cuenta Gratuita
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TagsInput({
  categories,
  onCategoriesChange,
  suggestions = []
}: {
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
  suggestions?: string[];
}) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !categories.includes(suggestion)
  );

  const parseInput = (input: string): string[] => {
    // Handle both hashtags (#) and comma-separated values
    const hashtagPattern = /#[\w\sÀ-ÿ]+/g;
    const hashtags = input.match(hashtagPattern) || [];
    
    // Remove hashtags from input and split by comma
    const withoutHashtags = input.replace(hashtagPattern, '').trim();
    const commaSeparated = withoutHashtags
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Clean hashtags (remove # and trim)
    const cleanHashtags = hashtags.map(tag => tag.replace('#', '').trim());
    
    return [...cleanHashtags, ...commaSeparated].filter(item => item.length > 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCategoriesFromInput();
    } else if (e.key === 'Backspace' && inputValue === '' && categories.length > 0) {
      // Remove last category if input is empty
      const newCategories = [...categories];
      newCategories.pop();
      onCategoriesChange(newCategories);
    }
  };

  const addCategoriesFromInput = () => {
    if (!inputValue.trim()) return;
    
    const newCategories = parseInput(inputValue);
    const validCategories = newCategories.filter(
      cat => cat.length >= 2 && cat.length <= 30 && !categories.includes(cat)
    );
    
    if (validCategories.length > 0) {
      onCategoriesChange([...categories, ...validCategories]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const addSuggestion = (suggestion: string) => {
    if (!categories.includes(suggestion)) {
      onCategoriesChange([...categories, suggestion]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    onCategoriesChange(categories.filter(cat => cat !== categoryToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            placeholder="Escribe categorías separadas por comas o usa #hashtags"
            className="pl-10"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={addCategoriesFromInput}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 glass border border-white/20 rounded-lg max-h-48 overflow-y-auto z-10">
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2">Sugerencias populares:</div>
              {filteredSuggestions.slice(0, 8).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSuggestion(suggestion)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-white/10 rounded transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Display current categories as badges */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="glass border-primary/30 text-primary bg-primary/10 pr-1"
            >
              {category}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-white/20"
                onClick={() => removeCategory(category)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="text-xs text-muted-foreground space-y-2">
        <p>💡 Ejemplos: "Peluquería, Manicura" o "#Desarrollo #Web #WordPress"</p>
        <p>📝 Máximo 10 categorías, entre 2-30 caracteres cada una</p>
      </div>

      {/* Validation feedback */}
      {categories.length > 10 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Has excedido el límite de 10 categorías. Elimina algunas para continuar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function ProfessionalRegistrationForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  // Enhanced password validation with security standards
  const passwordValidation = usePasswordValidation(formData.password);

  // Real-time password match validation
  useEffect(() => {
    if (formData.confirmPassword.length > 0) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const locations = [
    "Rawson", "Puerto Madryn", "Comodoro Rivadavia", "Trelew", 
    "Esquel", "Gaiman", "Puerto Deseado", "Caleta Olivia",
    "Río Gallegos", "El Calafate", "Ushuaia", "Otra ubicación"
  ];

  const handleCategoriesChange = (categories: string[]) => {
    setFormData({ ...formData, serviceCategories: categories });
  };

  return (
    <Card className="glass border-white/10 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Crown className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl text-foreground">Registro Profesional</CardTitle>
        </div>
        <CardDescription>
          Suscripción mensual $4500 ARS • Sin comisiones por servicios
        </CardDescription>
        <Badge className="bg-warning/20 text-warning border-warning/30 mx-auto">
          🎉 Primeros 200 profesionales: 2 meses gratis
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Juan Pérez"
                  autoComplete="name"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck="false"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    aria-describedby={formData.password.length > 0 ? "pro-password-feedback" : undefined}
                    required
                  />
                  <PasswordToggleButton
                    showPassword={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    aria-describedby={formData.confirmPassword ? "pro-confirm-password-feedback" : undefined}
                    required
                  />
                  <PasswordToggleButton
                    showPassword={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    ariaLabel={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                  />
                </div>
              </div>
            </div>

            {/* Password strength indicator */}
            <PasswordStrength password={formData.password} />

            {/* Enhanced Password validation feedback */}
            {(formData.password.length > 0 || (formData.confirmPassword && !passwordsMatch)) && (
              <div className="space-y-4">

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {/* Password errors */}
                    {passwordValidation.errors.length > 0 && (
                      <div id="pro-password-feedback" className="text-sm space-y-2">
                        <p className="text-destructive font-medium">Errores:</p>
                        {passwordValidation.errors.map((error, index) => (
                          <div key={index} className="flex items-center space-x-2 text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Password warnings */}
                    {passwordValidation.warnings.length > 0 && (
                      <div className="text-sm space-y-2">
                        <p className="text-warning font-medium">Recomendaciones:</p>
                        {passwordValidation.warnings.map((warning, index) => (
                          <div key={index} className="flex items-center space-x-2 text-warning">
                            <AlertCircle className="h-3 w-3" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div id="pro-confirm-password-feedback" className="space-y-2">
                    {/* Password match validation */}
                    {formData.confirmPassword && !passwordsMatch && (
                      <div className="flex items-center space-x-2 text-destructive text-sm">
                        <AlertCircle className="h-3 w-3" />
                        <span>Las contraseñas no coinciden</span>
                      </div>
                    )}
                    {formData.confirmPassword && passwordsMatch && formData.password && (
                      <div className="flex items-center space-x-2 text-success text-sm">
                        <CheckCircle className="h-3 w-3" />
                        <span>Las contraseñas coinciden</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (WhatsApp) *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 280 1234567"
                  maxLength={20}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Fecha de Nacimiento *</Label>
              <Input
                id="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                max={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                required
              />
              <p className="text-xs text-muted-foreground">
                Debes ser mayor de 18 años para registrarte como profesional
              </p>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">Información del Negocio</h3>
            <div className="space-y-2">
              <Label htmlFor="serviceCategories">Categorías de Servicios *</Label>
              <TagsInput
                categories={formData.serviceCategories}
                onCategoriesChange={handleCategoriesChange}
                suggestions={popularCategories}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción de Servicios *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe tus servicios, especialidades y qué te diferencia de la competencia..."
                rows={4}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Años de Experiencia *</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menos-1">Menos de 1 año</SelectItem>
                    <SelectItem value="1-3">1-3 años</SelectItem>
                    <SelectItem value="3-5">3-5 años</SelectItem>
                    <SelectItem value="5-10">5-10 años</SelectItem>
                    <SelectItem value="mas-10">Más de 10 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing">Rango de Precios *</Label>
                <Select
                  value={formData.pricing}
                  onValueChange={(value) => setFormData({ ...formData, pricing: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico ($1.000 - $5.000)</SelectItem>
                    <SelectItem value="intermedio">Intermedio ($5.000 - $15.000)</SelectItem>
                    <SelectItem value="premium">Premium ($15.000 - $50.000)</SelectItem>
                    <SelectItem value="enterprise">Enterprise ($50.000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidad *</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData({ ...formData, availability: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="¿Cuándo puedes trabajar?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiempo-completo">Tiempo completo (Lun-Vie 8-18h)</SelectItem>
                  <SelectItem value="medio-tiempo">Medio tiempo (20h/semana)</SelectItem>
                  <SelectItem value="fines-semana">Solo fines de semana</SelectItem>
                  <SelectItem value="flexible">Horario flexible</SelectItem>
                  <SelectItem value="24-7">Disponible 24/7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio/Trabajos Anteriores</Label>
              <Input
                id="portfolio"
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                placeholder="https://mi-portfolio.com o enlace a trabajos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certificaciones o Títulos</Label>
              <Input
                id="certifications"
                type="text"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="Ej: Técnico en Sistemas, Certificado Google Ads, etc."
              />
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Términos y Condiciones</h3>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeTerms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreeTerms: checked as boolean })
                }
                required
              />
              <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                Acepto los{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>{" "}
                de Fixia, incluyendo la suscripción mensual de $4500 ARS
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreePrivacy"
                checked={formData.agreePrivacy}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreePrivacy: checked as boolean })
                }
                required
              />
              <Label htmlFor="agreePrivacy" className="text-sm leading-relaxed">
                Acepto la{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>{" "}
                y el tratamiento de mis datos profesionales
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeMarketing"
                checked={formData.agreeMarketing}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreeMarketing: checked as boolean })
                }
              />
              <Label htmlFor="agreeMarketing" className="text-sm leading-relaxed">
                Deseo recibir oportunidades de trabajo y noticias de Fixia (opcional)
              </Label>
            </div>

            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Promoción de Lanzamiento:</strong> Los primeros 200 profesionales obtienen 
                2 meses completamente gratis. Después se aplicará la tarifa mensual de $4500 ARS.
              </AlertDescription>
            </Alert>
          </div>

          <Button
            type="submit"
            className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg disabled:opacity-70"
            disabled={isSubmitting || formData.serviceCategories.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando tu perfil profesional...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Crear Perfil Profesional
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useSecureAuth();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(
    searchParams.get('type') === 'professional' ? 'professional' : 'client'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!validateEmailFormat(formData.email)) {
      toast.error("📧 Email inválido", {
        description: "Por favor ingresa una dirección de email válida"
      });
      return;
    }
    
    // Enhanced password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error("🔒 Contraseña no válida", {
        description: passwordValidation.errors[0]
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('🔐 Las contraseñas no coinciden', {
        description: "Asegúrate de que ambas contraseñas sean idénticas"
      });
      return;
    }

    // Validate birthdate
    if (!formData.birthdate) {
      toast.error('📅 Fecha de nacimiento requerida', {
        description: "Por favor selecciona tu fecha de nacimiento"
      });
      return;
    }

    // Validate age (must be 18 or older)
    const birthDate = new Date(formData.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      toast.error('🔞 Edad mínima requerida', {
        description: "Debes ser mayor de 18 años para registrarte en Fixia"
      });
      return;
    }

    if (currentTab === 'professional' && formData.serviceCategories.length === 0) {
      toast.error('🛠️ Categorías requeridas', {
        description: "Los profesionales deben seleccionar al menos una categoría de servicio"
      });
      return;
    }

    if (currentTab === 'professional' && formData.serviceCategories.length > 10) {
      toast.error('Demasiadas categorías', {
        description: "Máximo 10 categorías de servicio permitidas"
      });
      return;
    }

    // Check required agreements
    if (!formData.agreeTerms || !formData.agreePrivacy) {
      toast.error('📋 Términos requeridos', {
        description: "Debes aceptar los términos y condiciones y la política de privacidad"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize form data before submission
      const sanitizedData = FormSanitizers.REGISTRATION(formData);

      const result = await register({
        email: sanitizedData.email,
        password: sanitizedData.password,
        fullName: sanitizedData.fullName,
        phone: sanitizedData.phone,
        location: sanitizedData.location,
        birthdate: sanitizedData.birthdate,
        userType: currentTab as 'client' | 'professional',
        serviceCategories: sanitizedData.serviceCategories,
        description: sanitizedData.description,
        experience: sanitizedData.experience,
        pricing: sanitizedData.pricing,
        availability: sanitizedData.availability,
        portfolio: sanitizedData.portfolio,
        certifications: sanitizedData.certifications
      });

      // Handle different registration outcomes
      if (result?.requiresVerification) {
        // New flow: Email verification required
        toast.success(
          "¡Cuenta creada exitosamente! 🎉",
          {
            description: result.message || `Revisa tu bandeja de entrada en ${formData.email} para verificar tu cuenta.`,
            duration: 8000}
        );

        // Redirect to email verification page
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        // Legacy flow: User was logged in automatically (shouldn't happen with new flow)
        toast.success(
          "¡Bienvenido a Fixia! 🎉",
          {
            description: "Tu cuenta ha sido creada exitosamente.",
            duration: 6000}
        );
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Extract error details from API response
      const errorMessage = error.response?.data?.message || error.message || '';
      const statusCode = error.response?.status;

      // Handle specific error cases with user-friendly messages
      if (statusCode === 409 || errorMessage?.toLowerCase().includes('already exists') || errorMessage?.toLowerCase().includes('ya existe') || errorMessage?.toLowerCase().includes('duplicate')) {
        toast.error(
          '📧 Este email ya está registrado',
          {
            description: '¿Ya tienes cuenta? Intenta iniciar sesión o usar otro email.',
            action: {
              label: 'Iniciar Sesión',
              onClick: () => navigate('/login')
            },
            duration: 6000}
        );
      } else if (statusCode === 400 && (errorMessage?.toLowerCase().includes('email') || errorMessage?.toLowerCase().includes('invalid'))) {
        toast.error(
          '✉️ Email inválido',
          {
            description: 'La dirección de email no es válida. Por favor verifica que esté correcta.',
            duration: 5000}
        );
      } else if (statusCode === 400 && errorMessage?.toLowerCase().includes('password')) {
        toast.error(
          '🔒 Contraseña inválida',
          {
            description: 'La contraseña debe tener al menos 6 caracteres.',
            duration: 5000}
        );
      } else if (statusCode === 429) {
        toast.error(
          '⏰ Demasiados intentos',
          {
            description: 'Has intentado registrarte muchas veces. Espera unos minutos e intenta de nuevo.',
            duration: 8000}
        );
      } else if (statusCode >= 500) {
        toast.error(
          '🔧 Error del servidor',
          {
            description: 'Hay un problema temporal con nuestros servidores. Intenta de nuevo en unos minutos.',
            duration: 6000}
        );
      } else {
        // Generic error fallback
        toast.error(
          'Error al crear la cuenta',
          {
            description: errorMessage || 'Por favor, verifica los datos ingresados e intenta de nuevo.',
            duration: 5000}
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      
      <div className="mobile-container mobile-section">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="mobile-text-3xl font-bold mb-3 sm:mb-4 text-foreground">Únete a Fixia</h1>
            <p className="mobile-text-lg text-muted-foreground max-w-2xl mx-auto">
              Elige tu tipo de cuenta y comienza a conectar con la mejor red 
              de profesionales de Chubut
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Tabs 
              value={currentTab} 
              onValueChange={setCurrentTab}
              className="max-w-6xl mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2 glass border-white/10 p-1 max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8">
                <TabsTrigger value="client" className="mobile-text-base ">
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Cliente</span>
                  <span className="sm:hidden">Cliente</span>
                </TabsTrigger>
                <TabsTrigger value="professional" className="mobile-text-base ">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Profesional</span>
                  <span className="sm:hidden">Pro</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client">
                <ClientRegistrationForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="professional">
                <ProfessionalRegistrationForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}