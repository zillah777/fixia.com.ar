import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User, Lock, Bell, CreditCard, Shield,
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
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
    <div className="space-y-6">
      <Card className="glass border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información Personal</span>
            </CardTitle>
            <CardDescription>
              Gestiona tu información de perfil
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="glass border-white/20"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="liquid-gradient"
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
                className="glass border-white/20"
              >
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
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
              <Label htmlFor="email">Correo Electrónico</Label>
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
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="glass border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
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
              <Label htmlFor="description">Descripción Profesional</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
                <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-500">Perfil Verificado</h3>
                  <p className="text-sm text-muted-foreground">Tu perfil ha sido verificado exitosamente</p>
                </div>
                <Badge className="ml-auto bg-green-500/20 text-green-500">
                  Verificado
                </Badge>
              </>
            ) : (
              <>
                <div className="h-12 w-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-500">Verificación Pendiente</h3>
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
    </div>
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
    <div className="space-y-6">
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
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="glass border-white/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="glass border-white/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="glass border-white/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleChangePassword}
            disabled={isChanging || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            className="liquid-gradient"
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
      
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Autenticación de Dos Factores</span>
          </CardTitle>
          <CardDescription>
            Agrega una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Autenticación SMS</h4>
              <p className="text-sm text-muted-foreground">Recibe códigos de verificación por SMS</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Dangerous Zone - Account Deletion */}
      <Card className="glass border-red-900/30 bg-red-950/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>Zona Peligrosa</span>
          </CardTitle>
          <CardDescription>
            Acciones que no se pueden deshacer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-red-500">Eliminar Cuenta</h4>
            <p className="text-sm text-muted-foreground">
              Eliminar tu cuenta de forma permanente. Esta acción no se puede deshacer.
              Se eliminarán todos tus datos, proyectos, mensajes e historial.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Cuenta Permanentemente
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>Confirmar Eliminación de Cuenta</span>
            </DialogTitle>
            <DialogDescription>
              Esta acción es permanente e irreversible. Se eliminarán todos tus datos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-red-500/50 bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                Escribe tu contraseña para confirmar que deseas eliminar tu cuenta.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="deletePassword">Contraseña</Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={isDeletingAccount}
                className="glass border-white/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword('');
              }}
              disabled={isDeletingAccount}
              className="glass border-white/20"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingAccount ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
    messages: user?.notifications_messages !== false,
    orders: user?.notifications_orders !== false,
    projects: user?.notifications_projects !== false,
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
          messages: true,
          reminders: false
        };
      }
    }
    return {
      newOpportunities: true,
      messages: true,
      reminders: false
    };
  });

  // Debounced save function for email notifications
  const saveEmailNotifications = useCallback(
    async (data: typeof emailNotifications) => {
      setIsSaving(true);
      try {
        await updateProfile({
          notifications_messages: data.messages,
          notifications_orders: data.orders,
          notifications_projects: data.projects,
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
    <div className="space-y-6">
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Notificaciones por Email</span>
          </CardTitle>
          <CardDescription>
            Recibe actualizaciones importantes en tu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">Nuevas oportunidades</p>
              <p className="text-sm text-muted-foreground">
                Cuando hay trabajos que coinciden con tu perfil
              </p>
            </div>
            <div className="flex items-center gap-2">
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

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">Mensajes y contactos</p>
              <p className="text-sm text-muted-foreground">
                Cuando alguien te contacta o te envía un mensaje
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
              <Switch
                checked={emailNotifications.messages}
                onCheckedChange={(checked) =>
                  handleEmailNotificationChange('messages', checked)
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">Noticias y ofertas</p>
              <p className="text-sm text-muted-foreground">
                Promociones, noticias y tips de Fixia
              </p>
            </div>
            <div className="flex items-center gap-2">
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

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">Alertas de seguridad</p>
              <p className="text-sm text-muted-foreground">
                Inicios de sesión y cambios importantes en tu cuenta
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
              <Switch
                checked={emailNotifications.projects}
                onCheckedChange={(checked) =>
                  handleEmailNotificationChange('projects', checked)
                }
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notificaciones Push</span>
          </CardTitle>
          <CardDescription>
            Recibe notificaciones instantáneas en tu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">Nuevas oportunidades</p>
              <p className="text-sm text-muted-foreground">
                Notificación inmediata de trabajos relevantes
              </p>
            </div>
            <div className="flex items-center gap-2">
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

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">Mensajes</p>
              <p className="text-sm text-muted-foreground">
                Cuando recibes un mensaje directo
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPushSaving && <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
              <Switch
                checked={pushNotifications.messages}
                onCheckedChange={(checked) =>
                  handlePushNotificationChange('messages', checked)
                }
                disabled={isPushSaving}
              />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">Recordatorios</p>
              <p className="text-sm text-muted-foreground">
                Recordatorios de trabajos pendientes y citas
              </p>
            </div>
            <div className="flex items-center gap-2">
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
    </div>
  );
}

function SubscriptionTab() {
  const navigate = useNavigate();
  const { user, upgradeToPremium } = useSecureAuth();
  const [isProcessing, setIsProcessing] = useState(false);
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

  return (
    <div className="space-y-6">
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
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Perfil verificado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Sin comisiones por servicios</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Estadísticas avanzadas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Soporte prioritario</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="glass border-white/20">
                  Ver Facturación
                </Button>
                <Button variant="outline" className="glass border-white/20 text-destructive">
                  Cancelar Suscripción
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-500/20 rounded-2xl flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl">Plan Gratuito</h3>
                  <p className="text-muted-foreground">Perfecto para encontrar servicios profesionales</p>
                  <Badge variant="secondary" className="mt-2">Gratis</Badge>
                </div>
              </div>
              
              <Alert className="glass border-white/20">
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  ¿Eres un profesional? Upgradea a nuestro plan profesional y comienza a ofrecer tus servicios sin comisiones.
                </AlertDescription>
              </Alert>
              
              <Button
                className="liquid-gradient w-full"
                onClick={handleUpgradeClick}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? 'Procesando...' : 'Actualizar a Profesional'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DangerZone() {
  const navigate = useNavigate();
  const { logout } = useSecureAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>Zona de Peligro</span>
          </CardTitle>
          <CardDescription>
            Acciones irreversibles que afectan tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg">
            <div>
              <h4 className="font-medium">Cerrar Sesión</h4>
              <p className="text-sm text-muted-foreground">Cerrar sesión en este dispositivo</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-red-500/50 text-red-500 hover:bg-red-500/10">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg">
            <div>
              <h4 className="font-medium text-red-500">Eliminar Cuenta</h4>
              <p className="text-sm text-muted-foreground">Eliminar permanentemente tu cuenta y todos los datos</p>
            </div>
            <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Cuenta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
    <div className="min-h-screen bg-background">
      <FixiaNavigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-foreground">Configuración</h1>
          <p className="text-xl text-muted-foreground">
            Gestiona tu cuenta y preferencias
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass border-white/10 mb-8 grid grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Seguridad
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <CreditCard className="h-4 w-4 mr-2" />
                Suscripción
              </TabsTrigger>
              <TabsTrigger value="danger">
                <AlertCircle className="h-4 w-4 mr-2" />
                Cuenta
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
            
            <TabsContent value="danger">
              <DangerZone />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}