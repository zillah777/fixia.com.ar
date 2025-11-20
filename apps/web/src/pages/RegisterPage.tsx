import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Crown, UserPlus, FileText, CreditCard, X, Hash, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useSecureAuth as useAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";

interface FormData {
  // Common fields
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  location: string;
  dni: string;
  birthdate: string;
  gender: string; // NEW: Gender field

  // Professional fields
  businessName: string;
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
  dni: '',
  birthdate: '',
  gender: '', // NEW: Gender field
  businessName: '',
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

function Navigation() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
            </div>
            <div className="absolute -inset-1 liquid-gradient rounded-lg blur opacity-30"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
          </div>
        </Link>

        <Link to="/">
          <Button variant="ghost" className="hover:glass-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </motion.header>
  );
}

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

  const locations = [
    "Rawson", "Puerto Madryn", "Comodoro Rivadavia", "Trelew",
    "Esquel", "Gaiman", "Puerto Deseado", "Caleta Olivia",
    "Río Gallegos", "El Calafate", "Ushuaia", "Otra ubicación"
  ];

  return (
    <Card className="glass border-white/10 max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <UserPlus className="h-8 w-8 text-success" />
          <CardTitle className="text-2xl">Registro como Cliente</CardTitle>
        </div>
        <CardDescription>
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
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
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
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 280 1234567"
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                type="text"
                value={formData.dni}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 8) {
                    setFormData({ ...formData, dni: value });
                  }
                }}
                placeholder="12345678"
                required
                maxLength={8}
                pattern="\d{7,8}"
                title="El DNI debe tener 7 u 8 dígitos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">Fecha de Nacimiento *</Label>
              <Input
                id="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                title="Debes ser mayor de 18 años"
              />
            </div>
          </div>

          {/* Gender Field */}
          <div className="space-y-2">
            <Label htmlFor="gender">Género *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Selecciona tu género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="prefiero_no_decirlo">Prefiero no decirlo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Terms and Privacy */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeTerms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFormData({ ...formData, agreeTerms: checked === true })
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
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFormData({ ...formData, agreePrivacy: checked === true })
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
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFormData({ ...formData, agreeMarketing: checked === true })
                }
              />
              <Label htmlFor="agreeMarketing" className="text-sm leading-relaxed">
                Deseo recibir ofertas especiales y noticias de Fixia (opcional)
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
            disabled={isSubmitting || !formData.agreeTerms || !formData.agreePrivacy}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Cuenta Gratuita
              </>
            )}
          </Button>

          {(!formData.agreeTerms || !formData.agreePrivacy) && (
            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card >
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
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
      <div className="text-xs text-muted-foreground space-y-1">
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
          <CardTitle className="text-2xl">Registro Profesional</CardTitle>
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
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
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
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (WhatsApp) *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 280 1234567"
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

            {/* DNI, Birthdate, and Gender */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prof-dni">DNI *</Label>
                <Input
                  id="prof-dni"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                      setFormData({ ...formData, dni: value });
                    }
                  }}
                  placeholder="12345678"
                  required
                  maxLength={8}
                  pattern="\d{7,8}"
                  title="El DNI debe tener 7 u 8 dígitos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prof-birthdate">Fecha de Nacimiento *</Label>
                <Input
                  id="prof-birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  title="Debes ser mayor de 18 años"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prof-gender">Género *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger id="prof-gender">
                  <SelectValue placeholder="Selecciona tu género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="prefiero_no_decirlo">Prefiero no decirlo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">Información del Negocio</h3>
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del Negocio/Empresa</Label>
              <Input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Mi Empresa de Servicios SRL"
              />
            </div>

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
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFormData({ ...formData, agreeTerms: checked === true })
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
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFormData({ ...formData, agreePrivacy: checked === true })
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
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFormData({ ...formData, agreeMarketing: checked === true })
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
            className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
            disabled={isSubmitting || formData.serviceCategories.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando perfil profesional...
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
  const { register } = useAuth();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(
    searchParams.get('type') === 'professional' ? 'professional' : 'client'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (currentTab === 'professional' && formData.serviceCategories.length === 0) {
      toast.error('Debes seleccionar al menos una categoría de servicio');
      return;
    }

    if (currentTab === 'professional' && formData.serviceCategories.length === 0) {
      toast.error('Debes seleccionar al menos una categoría de servicio para registrarte como profesional.');
      return;
    }

    if (currentTab === 'professional' && formData.serviceCategories.length > 10) {
      toast.error('No puedes tener más de 10 categorías de servicio');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        userType: currentTab as 'client' | 'professional',
        businessName: formData.businessName,
        serviceCategories: formData.serviceCategories,
        description: formData.description,
        experience: formData.experience,
        pricing: formData.pricing,
        availability: formData.availability,
        portfolio: formData.portfolio,
        certifications: formData.certifications
      });

      if (result.success) {
        // The context now handles the success toast.
        // Redirect to login page to verify email.
        navigate('/login?status=registered');
      }
    } catch (error) {
      console.error('Error en registro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="py-12 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Únete a Fixia</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
              <TabsList className="grid w-full grid-cols-2 glass border-white/10 p-1 max-w-md mx-auto mb-8">
                <TabsTrigger value="client" className="text-sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger value="professional" className="text-sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Profesional
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