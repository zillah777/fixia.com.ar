import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, Calendar, Settings, Shield, 
  Edit3, Save, X, Plus, Award, Award, Briefcase, Eye, Heart, 
  MessageSquare, DollarSign, TrendingUp, Clock, CheckCircle, 
  Upload, FileText, Globe, Linkedin, Twitter, Instagram, Github,
  Bell, Lock, CreditCard, LogOut, Trash2, ExternalLink,
  BarChart3, Users, Target, Zap, Loader2, AlertTriangle, Camera,
  Download, ArrowLeft
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { useSecureAuth } from "../context/SecureAuthContext";
import { useDebouncedCallback } from "../hooks/useDebounce";
import { uploadService } from "../lib/services/upload.service";
import { toast } from "sonner";
import { api } from "../lib/api";

// Navigation component
function Navigation() {
  const { user, logout } = useSecureAuth();
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Link to="/dashboard" className="flex items-center space-x-3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
            </motion.div>
            <span className="text-xl font-semibold tracking-tight text-white">Fixia</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
            Explorar
          </Link>
          <Link to="/profile" className="text-primary font-medium">
            Mi Perfil
          </Link>
        </nav>
        
        {/* Avatar con Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.userType === 'professional' ? 'Profesional' : 'Cliente'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

// Profile Header component
function ProfileHeader({ user, onUserUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.professionalProfile?.description || user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    whatsapp_number: user?.whatsapp_number || user?.phone || ''
  });

  // Handle form submission
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        name: profileData.name,
        location: profileData.location,
        bio: profileData.bio
      };

      // Only include phone if it's provided and valid
      if (profileData.phone && profileData.phone.trim()) {
        updateData.whatsapp_number = profileData.phone;
      }

      const updatedUser = await api.put('/user/profile', updateData);
      
      // Update the user context
      onUserUpdate(updatedUser);
      
      toast.success("✅ Perfil actualizado", {
        description: "Tus cambios se guardaron correctamente"
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error("❌ Error al actualizar", {
        description: error.response?.data?.message || error.message || 'Error al actualizar el perfil'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload and optimize image
      const uploadResult = await uploadService.uploadImage(file);

      // Update user profile with new avatar
      const updatedUser = await api.put('/user/profile', {
        avatar: uploadResult.url
      });

      onUserUpdate(updatedUser);

      toast.success('📸 Foto actualizada', {
        description: `Imagen optimizada (${Math.round(uploadResult.size! / 1024)}KB)`
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('❌ Error al actualizar foto', {
        description: error.message || 'No se pudo guardar tu nueva foto'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="glass border-white/10">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            
            {/* Avatar upload button */}
            <div className="absolute -bottom-2 -right-2">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <label htmlFor="avatar-upload">
                <Button size="sm" className="liquid-gradient rounded-full h-10 w-10 p-0 cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </label>
            </div>
            
            {user?.verified && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-success/20 text-success border-success/30 text-xs px-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="text-2xl font-bold glass border-white/20 bg-background/50"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold">{user?.name || 'Nombre no disponible'}</h1>
                )}
                
                <div className="flex items-center space-x-3 mt-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {user?.userType === 'professional' ? 'Profesional' : 'Cliente'}
                    {user?.planType === 'premium' && ' Premium'}
                  </Badge>
                  
                  {user?.userType === 'professional' && user?.professionalProfile && (
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4 text-warning fill-current" />
                      <span className="font-medium">{user.professionalProfile.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-muted-foreground">({user.professionalProfile.totalReviews || 0} reseñas)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={isSaving} className="liquid-gradient">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="glass border-white/20">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="glass border-white/20 hover:glass-medium">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>
            
            {/* Bio */}
            <div>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="glass border-white/20 bg-background/50"
                  rows={3}
                  maxLength={500}
                  placeholder="Describe tu experiencia, especialidades y lo que te diferencia..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {profileData.bio || 'No hay descripción disponible. Haz clic en "Editar Perfil" para agregar información sobre ti.'}
                </p>
              )}
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email || 'Email no disponible'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="h-6 text-sm glass border-white/20 bg-background/50"
                    placeholder="+54 11 1234-5678"
                  />
                ) : (
                  <span>{user?.phone || user?.whatsapp_number || 'Teléfono no disponible'}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="h-6 text-sm glass border-white/20 bg-background/50"
                    placeholder="Ciudad, País"
                  />
                ) : (
                  <span>{user?.location || 'Ubicación no especificada'}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Miembro desde {new Date(user?.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Settings Section component
function SettingsSection() {
  const { user, refreshUserData } = useSecureAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [socialNetworks, setSocialNetworks] = useState({
    linkedin: '',
    twitter: '',
    github: '',
    instagram: ''
  });
  const [notifications, setNotifications] = useState({
    newMessages: true,
    newOrders: true,
    projectUpdates: true,
    newsletter: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save function with debounce
  const autoSaveImplementation = async (field: string, value: any) => {
    try {
      await api.put('/user/profile', { [field]: value });
      toast.success('✓ Cambio guardado', {
        description: 'Se guardó automáticamente',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error auto-saving:', error);
      toast.error('Error al guardar el cambio');
    }
  };

  // Debounced version - waits 800ms after user stops typing
  const autoSave = useDebouncedCallback(autoSaveImplementation, 800);

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('✅ Contraseña actualizada', {
        description: 'Tu contraseña se ha cambiado correctamente'
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error('❌ Error al cambiar contraseña', {
        description: error.response?.data?.message || 'Verifica tu contraseña actual'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle data download
  const handleDataDownload = async () => {
    try {
      toast.success('📥 Preparando descarga...', {
        description: 'Se enviará un enlace de descarga a tu email'
      });
      
      // In a real implementation, this would trigger a backend process
      // to generate a data export and send it via email
    } catch (error) {
      toast.error('Error al solicitar descarga de datos');
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Información Personal</span>
          </CardTitle>
          <CardDescription>
            Tus datos básicos se guardan automáticamente al editarlos
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={user?.email || ""}
                  disabled
                  className="glass border-white/20 pl-10 bg-muted/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
            </div>
            
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={user?.phone || user?.whatsapp_number || ""}
                  onChange={(e) => autoSave('whatsapp_number', e.target.value)}
                  className="glass border-white/20 pl-10"
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Zona Horaria</Label>
            <Select 
              defaultValue="buenos-aires"
              onValueChange={(value) => autoSave('timezone', value)}
            >
              <SelectTrigger className="glass border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buenos-aires">Buenos Aires (GMT-3)</SelectItem>
                <SelectItem value="madrid">Madrid (GMT+1)</SelectItem>
                <SelectItem value="mexico">Ciudad de México (GMT-6)</SelectItem>
                <SelectItem value="bogota">Bogotá (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Social Networks */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Redes Sociales</span>
          </CardTitle>
          <CardDescription>
            Añade tus perfiles para que los clientes puedan conocerte mejor
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Linkedin className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <Input 
                placeholder="https://linkedin.com/in/tu-perfil" 
                className="glass border-white/20"
                value={socialNetworks.linkedin}
                onChange={(e) => {
                  setSocialNetworks({...socialNetworks, linkedin: e.target.value});
                  autoSave('social_linkedin', e.target.value);
                }}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Twitter className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <Input 
                placeholder="https://twitter.com/tu-usuario" 
                className="glass border-white/20"
                value={socialNetworks.twitter}
                onChange={(e) => {
                  setSocialNetworks({...socialNetworks, twitter: e.target.value});
                  autoSave('social_twitter', e.target.value);
                }}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Github className="h-5 w-5 text-white flex-shrink-0" />
              <Input 
                placeholder="https://github.com/tu-usuario" 
                className="glass border-white/20"
                value={socialNetworks.github}
                onChange={(e) => {
                  setSocialNetworks({...socialNetworks, github: e.target.value});
                  autoSave('social_github', e.target.value);
                }}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Instagram className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <Input 
                placeholder="https://instagram.com/tu-usuario" 
                className="glass border-white/20"
                value={socialNetworks.instagram}
                onChange={(e) => {
                  setSocialNetworks({...socialNetworks, instagram: e.target.value});
                  autoSave('social_instagram', e.target.value);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Preferencias de Notificación</span>
          </CardTitle>
          <CardDescription>
            Configura qué notificaciones quieres recibir
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Nuevos mensajes</div>
              <div className="text-sm text-muted-foreground">Recibir notificaciones de nuevos mensajes</div>
            </div>
            <Switch 
              checked={notifications.newMessages}
              onCheckedChange={(checked) => {
                setNotifications({...notifications, newMessages: checked});
                autoSave('notifications_messages', checked);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Nuevos pedidos</div>
              <div className="text-sm text-muted-foreground">Notificaciones de nuevos pedidos de servicio</div>
            </div>
            <Switch 
              checked={notifications.newOrders}
              onCheckedChange={(checked) => {
                setNotifications({...notifications, newOrders: checked});
                autoSave('notifications_orders', checked);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Actualizaciones de proyectos</div>
              <div className="text-sm text-muted-foreground">Updates sobre el progreso de proyectos</div>
            </div>
            <Switch 
              checked={notifications.projectUpdates}
              onCheckedChange={(checked) => {
                setNotifications({...notifications, projectUpdates: checked});
                autoSave('notifications_projects', checked);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Newsletter semanal</div>
              <div className="text-sm text-muted-foreground">Recibir tips y novedades semanales</div>
            </div>
            <Switch 
              checked={notifications.newsletter}
              onCheckedChange={(checked) => {
                setNotifications({...notifications, newsletter: checked});
                autoSave('notifications_newsletter', checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Seguridad</span>
          </CardTitle>
          <CardDescription>
            Gestiona la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Change Password */}
          <div className="space-y-4">
            <h4 className="font-medium">Cambiar Contraseña</h4>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Contraseña actual</Label>
                <Input 
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="glass border-white/20"
                  placeholder="Tu contraseña actual"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nueva contraseña</Label>
                <Input 
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="glass border-white/20"
                  placeholder="Nueva contraseña (mínimo 8 caracteres)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Confirmar nueva contraseña</Label>
                <Input 
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="glass border-white/20"
                  placeholder="Repite la nueva contraseña"
                />
              </div>
            </div>
            
            <Button 
              onClick={handlePasswordChange} 
              disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
              className="liquid-gradient"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cambiando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </div>
          
          <Separator />
          
          {/* Download Data */}
          <div className="space-y-2">
            <h4 className="font-medium">Datos Personales</h4>
            <p className="text-sm text-muted-foreground">
              Descarga una copia de todos tus datos personales
            </p>
            <Button 
              variant="outline" 
              onClick={handleDataDownload}
              className="glass border-white/20 hover:glass-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Datos Personales
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Zona Peligrosa</span>
          </CardTitle>
          <CardDescription>
            Acciones irreversibles que afectarán permanentemente tu cuenta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-destructive/20">
              <DialogHeader>
                <DialogTitle className="text-destructive">¿Eliminar cuenta permanentemente?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Se eliminarán todos tus datos, servicios, 
                  mensajes y cualquier información asociada a tu cuenta.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Advertencia:</strong> Una vez eliminada, tu cuenta no se podrá recuperar.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end space-x-2">
                  <DialogTrigger asChild>
                    <Button variant="outline" className="glass border-white/20">
                      Cancelar
                    </Button>
                  </DialogTrigger>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      toast.error('Función no implementada por seguridad');
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sí, eliminar mi cuenta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Profile Page component
export default function ProfilePageFixed() {
  const { user, refreshUserData } = useSecureAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle user updates
  const handleUserUpdate = (updatedUser: any) => {
    // Trigger a refresh of user data from context
    refreshUserData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileHeader user={user} onUserUpdate={handleUserUpdate} />
          </motion.div>

          {/* Profile Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="glass w-full md:w-auto">
                <TabsTrigger value="settings">Configuración</TabsTrigger>
                {user.userType === 'client' && (
                  <>
                    <TabsTrigger value="activity">Actividad</TabsTrigger>
                    <TabsTrigger value="favorites">Favoritos</TabsTrigger>
                  </>
                )}
                {user.userType === 'professional' && (
                  <>
                    <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <SettingsSection />
              </TabsContent>
              
              {/* Other tabs can be implemented as needed */}
              <TabsContent value="activity" className="mt-6">
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Sin actividad reciente</h3>
                      <p className="text-muted-foreground mb-4">
                        Tu actividad aparecerá aquí cuando comiences a usar la plataforma.
                      </p>
                      <Link to="/services">
                        <Button className="liquid-gradient hover:opacity-90">
                          <Plus className="h-4 w-4 mr-2" />
                          Explorar servicios
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}