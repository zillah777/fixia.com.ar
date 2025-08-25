import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Lock, Bell, CreditCard, Shield, 
  Eye, EyeOff, Check, X, AlertCircle, Crown, 
  Mail, Phone, MapPin, Save, Trash2, LogOut,
  Settings, Smartphone, Globe, Calendar
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";

function Navigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">F</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Configuración</span>
          </div>
        </Link>
        
        <Link to="/dashboard">
          <Button variant="ghost" className="hover:glass-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </motion.header>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    businessName: user?.businessName || '',
    description: user?.description || ''
  });

  const locations = [
    "Rawson", "Puerto Madryn", "Comodoro Rivadavia", "Trelew", 
    "Esquel", "Gaiman", "Puerto Deseado", "Caleta Olivia",
    "Río Gallegos", "El Calafate", "Ushuaia", "Otra ubicación"
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Información Personal</h3>
          <p className="text-muted-foreground">Administra tu información de perfil</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="glass border-white/20">
            <User className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" className="glass border-white/20">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="liquid-gradient">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Card className="glass border-white/10">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? "opacity-60" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar. Contacta soporte si necesitas modificarlo.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? "opacity-60" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                disabled={!isEditing}
              >
                <SelectTrigger className={!isEditing ? "opacity-60" : ""}>
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

          {user?.userType === 'professional' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Información Profesional</h4>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "opacity-60" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-3 py-2 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityTab() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handle2FAToggle = (enabled: boolean) => {
    // Implementar activación/desactivación de 2FA
    console.log('2FA:', enabled);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsChangingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Seguridad</h3>
        <p className="text-muted-foreground">Gestiona la seguridad de tu cuenta</p>
      </div>

      {/* Cambiar Contraseña */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña regularmente para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
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

          <Button 
            onClick={handlePasswordChange}
            disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
            className="liquid-gradient"
          >
            {isChangingPassword ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Actualizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Actualizar Contraseña
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Autenticación de Dos Factores */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Autenticación de Dos Factores
          </CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Activar 2FA</p>
              <p className="text-sm text-muted-foreground">
                Recibe códigos de verificación por SMS o app de autenticación
              </p>
            </div>
            <Switch onCheckedChange={handle2FAToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Sesiones Activas */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Sesiones Activas
          </CardTitle>
          <CardDescription>
            Gestiona dónde has iniciado sesión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium">Navegador Web - Chrome</p>
                <p className="text-sm text-muted-foreground">Buenos Aires, Argentina • Activa ahora</p>
              </div>
            </div>
            <Badge className="bg-success/20 text-success border-success/30">
              Actual
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 glass rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Móvil - Safari</p>
                <p className="text-sm text-muted-foreground">Hace 2 días • iPhone</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="glass border-red-500/30 text-red-400 hover:bg-red-500/10">
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const [emailNotifications, setEmailNotifications] = useState({
    newOpportunities: true,
    messages: true,
    marketing: false,
    security: true
  });

  const [pushNotifications, setPushNotifications] = useState({
    newOpportunities: true,
    messages: true,
    reminders: false
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Notificaciones</h3>
        <p className="text-muted-foreground">Controla cómo y cuándo recibir notificaciones</p>
      </div>

      {/* Email Notifications */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Notificaciones por Email
          </CardTitle>
          <CardDescription>
            Recibe actualizaciones importantes en tu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Nuevas oportunidades</p>
              <p className="text-sm text-muted-foreground">
                Cuando hay trabajos que coinciden con tu perfil
              </p>
            </div>
            <Switch 
              checked={emailNotifications.newOpportunities}
              onCheckedChange={(checked) => 
                setEmailNotifications({ ...emailNotifications, newOpportunities: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Mensajes y contactos</p>
              <p className="text-sm text-muted-foreground">
                Cuando alguien te contacta o te envía un mensaje
              </p>
            </div>
            <Switch 
              checked={emailNotifications.messages}
              onCheckedChange={(checked) => 
                setEmailNotifications({ ...emailNotifications, messages: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Noticias y ofertas</p>
              <p className="text-sm text-muted-foreground">
                Promociones, noticias y tips de Fixia
              </p>
            </div>
            <Switch 
              checked={emailNotifications.marketing}
              onCheckedChange={(checked) => 
                setEmailNotifications({ ...emailNotifications, marketing: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Alertas de seguridad</p>
              <p className="text-sm text-muted-foreground">
                Inicios de sesión y cambios importantes en tu cuenta
              </p>
            </div>
            <Switch 
              checked={emailNotifications.security}
              onCheckedChange={(checked) => 
                setEmailNotifications({ ...emailNotifications, security: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificaciones Push
          </CardTitle>
          <CardDescription>
            Recibe notificaciones instantáneas en tu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Nuevas oportunidades</p>
              <p className="text-sm text-muted-foreground">
                Notificación inmediata de trabajos relevantes
              </p>
            </div>
            <Switch 
              checked={pushNotifications.newOpportunities}
              onCheckedChange={(checked) => 
                setPushNotifications({ ...pushNotifications, newOpportunities: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Mensajes</p>
              <p className="text-sm text-muted-foreground">
                Cuando recibes un mensaje directo
              </p>
            </div>
            <Switch 
              checked={pushNotifications.messages}
              onCheckedChange={(checked) => 
                setPushNotifications({ ...pushNotifications, messages: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Recordatorios</p>
              <p className="text-sm text-muted-foreground">
                Recordatorios de trabajos pendientes y citas
              </p>
            </div>
            <Switch 
              checked={pushNotifications.reminders}
              onCheckedChange={(checked) => 
                setPushNotifications({ ...pushNotifications, reminders: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/pricing');
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción? Perderás acceso a las funciones profesionales.')) {
      return;
    }

    setIsCanceling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Simular cancelación
      alert('Suscripción cancelada. Seguirás teniendo acceso hasta el final del período actual.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  const isProfessional = user?.userType === 'professional';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Suscripción</h3>
        <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
      </div>

      {/* Current Plan */}
      <Card className={`glass border-white/10 ${isProfessional ? 'bg-primary/5 border-primary/30' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isProfessional ? (
                <Crown className="h-8 w-8 text-primary" />
              ) : (
                <User className="h-8 w-8 text-success" />
              )}
              <div>
                <CardTitle>
                  {isProfessional ? 'Plan Profesional' : 'Plan Gratuito'}
                </CardTitle>
                <CardDescription>
                  {isProfessional 
                    ? '$4500 ARS/mes • Sin comisiones por servicios'
                    : 'Acceso gratuito para buscar profesionales'
                  }
                </CardDescription>
              </div>
            </div>
            {isProfessional ? (
              <Badge className="bg-primary/20 text-primary border-primary/50">
                Activo
              </Badge>
            ) : (
              <Badge className="bg-success/20 text-success border-success/50">
                Gratuito
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProfessional ? (
            <>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 glass rounded-lg">
                  <p className="text-2xl font-bold text-success">∞</p>
                  <p className="text-sm text-muted-foreground">Contactos por mes</p>
                </div>
                <div className="p-4 glass rounded-lg">
                  <p className="text-2xl font-bold text-success">5</p>
                  <p className="text-sm text-muted-foreground">Alertas activas</p>
                </div>
                <div className="p-4 glass rounded-lg">
                  <p className="text-2xl font-bold text-success">0%</p>
                  <p className="text-sm text-muted-foreground">Comisiones</p>
                </div>
              </div>
              
              <Alert className="border-warning/50 bg-warning/10">
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  <strong>Próxima facturación:</strong> 15 de Febrero, 2024 - $4500 ARS
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  variant="outline"
                  className="glass border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {isCanceling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Suscripción
                    </>
                  )}
                </Button>
                <Button variant="outline" className="glass border-white/20">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ver Historial de Pagos
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 glass rounded-lg">
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-sm text-muted-foreground">Contactos por mes</p>
                </div>
                <div className="p-4 glass rounded-lg">
                  <p className="text-2xl font-bold text-primary">1</p>
                  <p className="text-sm text-muted-foreground">Alerta activa</p>
                </div>
                <div className="p-4 glass rounded-lg">
                  <p className="text-2xl font-bold text-muted-foreground">✗</p>
                  <p className="text-sm text-muted-foreground">Publicar servicios</p>
                </div>
              </div>

              <Alert className="border-primary/50 bg-primary/10">
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  <strong>¿Quieres ofrecer servicios?</strong> Actualiza a Plan Profesional y obtén acceso completo sin comisiones.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg w-full"
              >
                {isUpgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Actualizar a Profesional
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      {isProfessional && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Método de Pago
            </CardTitle>
            <CardDescription>
              Administra cómo pagas tu suscripción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Visa •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Vence 12/26</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="glass border-white/20">
                Cambiar
              </Button>
            </div>
            
            <Button variant="outline" className="glass border-white/20 w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Agregar Método de Pago
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccountTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    
    if (!confirmed) return;

    const doubleConfirm = prompt(
      'Escribe "ELIMINAR" para confirmar que quieres eliminar permanentemente tu cuenta:'
    );

    if (doubleConfirm !== 'ELIMINAR') {
      alert('Eliminación cancelada.');
      return;
    }

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Simular eliminación
      alert('Cuenta eliminada correctamente.');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Cuenta</h3>
        <p className="text-muted-foreground">Opciones de cuenta y sesión</p>
      </div>

      {/* Logout */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LogOut className="h-5 w-5 mr-2" />
            Cerrar Sesión
          </CardTitle>
          <CardDescription>
            Cierra sesión de forma segura en este dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" className="glass border-white/20">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="glass border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <Trash2 className="h-5 w-5 mr-2" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Elimina permanentemente tu cuenta y todos tus datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500/50 bg-red-500/10 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Advertencia:</strong> Esta acción no se puede deshacer. Se eliminarán permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Tu perfil y toda tu información personal</li>
                <li>Historial de servicios y contactos</li>
                <li>Reseñas y calificaciones</li>
                <li>Configuraciones y preferencias</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                Eliminando cuenta...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cuenta Permanentemente
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-8 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Configuración</h1>
              <p className="text-muted-foreground">
                Administra tu cuenta, preferencias y configuración de seguridad
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className="glass border-white/10 p-1 h-auto">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Seguridad</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notificaciones</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Suscripción</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Cuenta</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>

              <TabsContent value="security">
                <SecurityTab />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationsTab />
              </TabsContent>

              <TabsContent value="subscription">
                <SubscriptionTab />
              </TabsContent>

              <TabsContent value="account">
                <AccountTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}