import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User, Lock, Bell, CreditCard, Shield,
  Check, X, AlertCircle, Crown,
  Mail, Save, Trash2, LogOut,
  Settings, Zap, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PasswordToggleButton } from "../components/inputs/PasswordToggleButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { useSecureAuth } from "../context/SecureAuthContext";
import { subscriptionService } from "../lib/services/subscription.service";
import { extractErrorMessage } from "../utils/errorHandler";

function ProfileTab() {
  const { user, updateProfile } = useSecureAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    description: user?.professionalProfile?.description || ''
  });

  const locations = [
    "Rawson", "Puerto Madryn", "Comodoro Rivadavia", "Trelew", 
    "Esquel", "Gaiman", "Puerto Deseado", "Caleta Olivia",
    "Río Gallegos", "El Calafate", "Ushuaia", "Otra ubicación"
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      description: user?.professionalProfile?.description || ''
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <User className="h-5 w-5 flex-shrink-0" />
              <span>Información Personal</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Gestiona tu información de perfil
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="glass border-white/20 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="liquid-gradient w-full sm:w-auto text-xs sm:text-sm"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Guardar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="glass border-white/20 w-full sm:w-auto text-xs sm:text-sm"
              >
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-medium">Nombre Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!isEditing}
                className="glass border-white/20"
                autoComplete="name"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck="false"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="glass border-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-medium">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="glass border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="font-medium">Ubicación</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                disabled={!isEditing}
              >
                <SelectTrigger className="glass border-white/20">
                  <SelectValue placeholder="Selecciona tu ubicación" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
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
            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">Descripción Profesional</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 glass border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder="Describe tu experiencia profesional y servicios que ofreces..."
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Estado de Verificación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {user?.isVerified ? (
              <>
                <div className="h-12 w-12 bg-success/20 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-success">Perfil Verificado</h3>
                  <p className="text-sm text-muted-foreground">Tu perfil ha sido verificado exitosamente</p>
                </div>
                <Badge className="ml-auto bg-success/20 text-success">
                  Verificado
                </Badge>
              </>
            ) : (
              <>
                <div className="h-12 w-12 bg-warning/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-warning">Verificación Pendiente</h3>
                  <p className="text-sm text-muted-foreground">Completa tu verificación para obtener más beneficios</p>
                </div>
                <Link to="/verification">
                  <Button size="sm" className="ml-auto liquid-gradient">
                    Verificar Ahora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SecurityTab() {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { changePassword, deleteAccount } = useSecureAuth();

  const handleChangePassword = async () => {
    if (!formData.currentPassword.trim()) {
      toast.error('Por favor ingresa tu contraseña actual');
      return;
    }

    if (!formData.newPassword.trim()) {
      toast.error('Por favor ingresa una nueva contraseña');
      return;
    }

    if (!formData.confirmPassword.trim()) {
      toast.error('Por favor confirma tu nueva contraseña');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsChanging(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword, formData.confirmPassword);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Contraseña actualizada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña');
      console.error('Error changing password:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Por favor ingresa tu contraseña para confirmar');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteDialog(false);
      setDeletePassword('');

      // Redirect to home after successful deletion
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la cuenta');
      console.error('Error deleting account:', error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Cambiar Contraseña</span>
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="font-medium">Contraseña Actual</Label>
            <div className="relative flex items-center">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="glass border-white/20 pr-12"
              />
              <PasswordToggleButton
                showPassword={showCurrentPassword}
                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                ariaLabel={showCurrentPassword ? "Ocultar contraseña actual" : "Mostrar contraseña actual"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="font-medium">Nueva Contraseña</Label>
            <div className="relative flex items-center">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="glass border-white/20 pr-12"
              />
              <PasswordToggleButton
                showPassword={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                ariaLabel={showNewPassword ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-medium">Confirmar Nueva Contraseña</Label>
            <div className="relative flex items-center">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="glass border-white/20 pr-12"
              />
              <PasswordToggleButton
                showPassword={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                ariaLabel={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
              />
            </div>
          </div>
          
          <Button
            onClick={handleChangePassword}
            disabled={isChanging || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            className="liquid-gradient w-full sm:w-auto text-sm sm:text-base"
            size="lg"
          >
            {isChanging ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Dangerous Zone - Account Deletion */}
      <Card className="glass border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Zona Peligrosa</span>
          </CardTitle>
          <CardDescription>
            Acciones que no se pueden deshacer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Eliminar Cuenta</h4>
            <p className="text-sm text-muted-foreground">
              Eliminar tu cuenta de forma permanente. Esta acción no se puede deshacer.
              Se eliminarán todos tus datos, proyectos, mensajes e historial.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Cuenta Permanentemente
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900/95 border-destructive/40 max-w-[95%] sm:max-w-md shadow-2xl backdrop-blur-xl">
          <DialogHeader className="border-b border-destructive/20 pb-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 rounded-lg bg-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-destructive text-lg">Confirmar Eliminación de Cuenta</DialogTitle>
            </div>
            <DialogDescription className="text-slate-300 ml-10 mt-2">
              Esta acción es permanente e irreversible. Se eliminarán todos tus datos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <Alert className="border-destructive/30 bg-gradient-to-r from-destructive/20 to-destructive/10 rounded-xl">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive/90 ml-2 font-medium">
                ⚠️ Escribe tu contraseña para confirmar que deseas eliminar tu cuenta de forma permanente.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="deletePassword" className="font-semibold text-white">Contraseña de Confirmación</Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={isDeletingAccount}
                className="glass border-white/20 focus:border-destructive/50"
              />
              <p className="text-xs text-white/60">Tu contraseña será verificada de forma segura.</p>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-white/10 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword('');
              }}
              disabled={isDeletingAccount}
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword.trim()}
              className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-lg"
            >
              {isDeletingAccount ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Permanentemente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function NotificationsTab() {
  const { user, updateProfile } = useSecureAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isPushSaving, setIsPushSaving] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const pushDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize from user context
  const [emailNotifications, setEmailNotifications] = useState({
    orders: user?.notifications_orders !== false,
    newsletter: user?.notifications_newsletter === true
  });

  // Initialize push notifications from localStorage
  const [pushNotifications, setPushNotifications] = useState(() => {
    const stored = localStorage.getItem('pushNotifications');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          newOpportunities: true,
          reminders: false
        };
      }
    }
    return {
      newOpportunities: true,
      reminders: false
    };
  });

  // Debounced save function for email notifications
  const saveEmailNotifications = useCallback(
    async (data: typeof emailNotifications) => {
      setIsSaving(true);
      try {
        await updateProfile({
          notifications_orders: data.orders,
          notifications_newsletter: data.newsletter
        });
        toast.success('Preferencias de notificaciones guardadas');
      } catch (error) {
        console.error('Error saving notifications:', error);
        toast.error('Error al guardar las preferencias');
      } finally {
        setIsSaving(false);
      }
    },
    [updateProfile]
  );

  // Handle email notification changes with debounce
  const handleEmailNotificationChange = useCallback(
    (field: keyof typeof emailNotifications, checked: boolean) => {
      const newNotifications = { ...emailNotifications, [field]: checked };
      setEmailNotifications(newNotifications);

      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer for debounced save (500ms)
      debounceTimer.current = setTimeout(() => {
        saveEmailNotifications(newNotifications);
      }, 500);
    },
    [emailNotifications, saveEmailNotifications]
  );

  // Save push notifications to localStorage
  const savePushNotifications = useCallback(
    async (data: typeof pushNotifications) => {
      setIsPushSaving(true);
      try {
        localStorage.setItem('pushNotifications', JSON.stringify(data));
        toast.success('Preferencias de notificaciones push guardadas');
      } catch (error) {
        console.error('Error saving push notifications:', error);
        toast.error('Error al guardar las preferencias');
      } finally {
        setIsPushSaving(false);
      }
    },
    []
  );

  // Handle push notification changes with debounce
  const handlePushNotificationChange = useCallback(
    (field: keyof typeof pushNotifications, checked: boolean) => {
      const newNotifications = { ...pushNotifications, [field]: checked };
      setPushNotifications(newNotifications);

      // Clear existing timer
      if (pushDebounceTimer.current) {
        clearTimeout(pushDebounceTimer.current);
      }

      // Set new timer for debounced save (500ms)
      pushDebounceTimer.current = setTimeout(() => {
        savePushNotifications(newNotifications);
      }, 500);
    },
    [pushNotifications, savePushNotifications]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (pushDebounceTimer.current) {
        clearTimeout(pushDebounceTimer.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Mail className="h-5 w-5 flex-shrink-0" />
            <span>Notificaciones por Email</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Recibe actualizaciones importantes en tu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Nuevas oportunidades</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                Cuando hay trabajos que coinciden con tu perfil
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSaving && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
              <Switch
                checked={emailNotifications.orders}
                onCheckedChange={(checked) =>
                  handleEmailNotificationChange('orders', checked)
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Noticias y ofertas</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                Promociones, noticias y tips de Fixia
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSaving && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
              <Switch
                checked={emailNotifications.newsletter}
                onCheckedChange={(checked) =>
                  handleEmailNotificationChange('newsletter', checked)
                }
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Bell className="h-5 w-5 flex-shrink-0" />
            <span>Notificaciones Push</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Recibe notificaciones instantáneas en tu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Nuevas oportunidades</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                Notificación inmediata de trabajos relevantes
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isPushSaving && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
              <Switch
                checked={pushNotifications.newOpportunities}
                onCheckedChange={(checked) =>
                  handlePushNotificationChange('newOpportunities', checked)
                }
                disabled={isPushSaving}
              />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Recordatorios</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                Recordatorios de trabajos pendientes y citas
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isPushSaving && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
              <Switch
                checked={pushNotifications.reminders}
                onCheckedChange={(checked) =>
                  handlePushNotificationChange('reminders', checked)
                }
                disabled={isPushSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubscriptionTab() {
  const navigate = useNavigate();
  const { user, upgradeToPremium } = useSecureAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const isProfessional = user?.userType === 'professional';

  const handleUpgradeClick = async () => {
    setIsProcessing(true);
    try {
      // Call the context method which handles MercadoPago integration
      await upgradeToPremium();
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      // Error toast is already shown by the context method
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewBilling = () => {
    // TODO: Implement billing portal integration (Stripe/MercadoPago)
    toast.info('Redirigiendo a panel de facturación...');
    // window.location.href = '/billing'; // Uncomment when billing portal is ready
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await subscriptionService.cancelSubscription();
      toast.success('Suscripción cancelada correctamente');
      setShowCancelDialog(false);
      // Refresh the page to update subscription status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Error al cancelar la suscripción');
      console.error('Error cancelling subscription:', error);
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Plan Actual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProfessional ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl">Plan Profesional</h3>
                  <p className="text-muted-foreground">Acceso completo a todas las funcionalidades</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-primary/20 text-primary">Activo</Badge>
                    <Badge variant="secondary">$4,500 ARS/mes</Badge>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="space-y-3">
                <h4 className="font-medium">Beneficios incluidos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">Perfil verificado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">Sin comisiones por servicios</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">Estadísticas avanzadas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">Soporte prioritario</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  className="glass border-white/20 text-sm sm:text-base"
                  onClick={handleViewBilling}
                >
                  Ver Facturación
                </Button>
                <Button
                  variant="outline"
                  className="glass border-white/20 text-destructive text-sm sm:text-base"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCancelling}
                >
                  Cancelar Suscripción
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Free Plan Header */}
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl p-6 border border-primary/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-20 w-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-bold text-2xl bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-1">
                        Plan Gratuito
                      </h3>
                      <p className="text-white/80 font-medium mb-3">
                        Perfecto para encontrar servicios profesionales
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/40 text-primary border border-primary/30">Activo</Badge>
                        <span className="text-xl font-bold text-primary">Gratis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features as Client */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white/90 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Que puedes hacer como Cliente
                </h4>
                <div className="grid grid-cols-1 gap-2 ml-1">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-sm text-white/80">Buscar y contratar profesionales</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-sm text-white/80">Crear anuncios de trabajo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-sm text-white/80">Comunicación con profesionales</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-sm text-white/80">Ver reseñas y calificaciones</span>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-br from-primary/30 via-primary/15 to-primary/10 border-2 border-primary/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-2">¿Eres un Profesional?</h4>
                    <p className="text-sm text-white/80 mb-4">
                      Actualiza tu cuenta a <span className="font-semibold text-primary">Plan Profesional</span> y comienza a ofrecer tus servicios <span className="font-semibold">SIN COMISIONES</span>.
                    </p>
                    <ul className="space-y-2 text-xs text-white/70">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        <span>Perfil verificado con badge profesional</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        <span>Cero comisiones por cada servicio vendido</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        <span>Estadísticas y análisis avanzados</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  onClick={handleUpgradeClick}
                  disabled={isProcessing}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <Crown className="h-5 w-5 mr-2" />
                      Upgradea a Plan Profesional - $4,500 ARS/mes
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-white/50 text-center italic">
                Serás redirigido a MercadoPago para completar el pago de forma segura
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-slate-900/95 border-warning/40 max-w-[95%] sm:max-w-md shadow-2xl backdrop-blur-xl">
          <DialogHeader className="border-b border-warning/20 pb-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <DialogTitle className="text-warning text-lg">Cancelar Suscripción Premium</DialogTitle>
            </div>
            <DialogDescription className="text-slate-300 ml-10 mt-2">
              ¿Estás seguro de que deseas cancelar tu suscripción profesional?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <Alert className="border-warning/30 bg-gradient-to-r from-warning/20 to-warning/10 rounded-xl">
              <AlertCircle className="h-5 w-5 text-warning" />
              <AlertDescription className="text-warning/90 ml-2 font-medium">
                ⚠️ Al cancelar, perderás acceso a funciones premium después del período actual.
              </AlertDescription>
            </Alert>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-white">Perderás acceso a:</p>
              <ul className="space-y-1 text-sm text-white/70 ml-2">
                <li>✕ Servicios y anuncios ilimitados</li>
                <li>✕ Badge "Premium" destacado en tu perfil</li>
                <li>✕ Prioridad en búsquedas y visibilidad</li>
                <li>✕ Estadísticas y análisis avanzados</li>
                <li>✕ Soporte y atención prioritaria</li>
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
              <p className="text-xs text-primary/90">
                💡 <strong>Tip:</strong> Puedes reactivar tu suscripción en cualquier momento desde tu panel de control.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-white/10 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            >
              Mantener Premium
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-lg"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Cancelando...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Sí, Cancelar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user } = useSecureAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <div className="container mx-auto px-6 py-20">
          <Card className="glass border-white/10 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Inicia Sesión</h2>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para acceder a la configuración
              </p>
              <Link to="/login">
                <Button className="liquid-gradient">Iniciar Sesión</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <FixiaNavigation />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">Configuración</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Gestiona tu cuenta y preferencias
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass border-white/10 mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full h-auto p-2 sm:p-3 text-foreground">
              <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-foreground data-[state=active]:text-foreground data-[state=inactive]:text-foreground/70 hover:text-foreground transition-colors rounded-md">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-center leading-tight">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-foreground data-[state=active]:text-foreground data-[state=inactive]:text-foreground/70 hover:text-foreground transition-colors rounded-md">
                <Lock className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-center leading-tight">Seguridad</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-foreground data-[state=active]:text-foreground data-[state=inactive]:text-foreground/70 hover:text-foreground transition-colors rounded-md">
                <Bell className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-center leading-tight">Notif.</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-foreground data-[state=active]:text-foreground data-[state=inactive]:text-foreground/70 hover:text-foreground transition-colors rounded-md">
                <CreditCard className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-center leading-tight">Su Plan</span>
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}