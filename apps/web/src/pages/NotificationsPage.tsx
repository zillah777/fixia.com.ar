import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Bell, BellOff, Check, MoreHorizontal, Trash2, 
  MessageSquare, Star, Crown, AlertCircle, CheckCircle, 
  Clock, User, Briefcase, Heart, Calendar, Settings
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { useAuth } from "../context/AuthContext";

interface Notification {
  id: string;
  type: 'message' | 'review' | 'system' | 'project' | 'payment' | 'professional';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
  metadata?: {
    professionalName?: string;
    serviceName?: string;
    rating?: number;
    amount?: number;
  };
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "Nuevo mensaje de Carlos Rodríguez",
    description: "¡Hola! Vi tu proyecto de desarrollo web y me interesa mucho participar...",
    time: "hace 5 minutos",
    read: false,
    actionUrl: "/messages/1",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    metadata: {
      professionalName: "Carlos Rodríguez"
    }
  },
  {
    id: "2",
    type: "review",
    title: "Nueva reseña recibida",
    description: "Ana Martínez dejó una reseña de 5 estrellas en tu servicio de diseño gráfico",
    time: "hace 2 horas",
    read: false,
    actionUrl: "/reviews/2",
    metadata: {
      professionalName: "Ana Martínez",
      serviceName: "Identidad Visual Premium",
      rating: 5
    }
  },
  {
    id: "3",
    type: "project",
    title: "Nuevo proyecto disponible",
    description: "Se publicó un proyecto que coincide con tus habilidades: 'Desarrollo de e-commerce'",
    time: "hace 4 horas",
    read: true,
    actionUrl: "/opportunities/3"
  },
  {
    id: "4",
    type: "system",
    title: "Perfil verificado exitosamente",
    description: "¡Felicitaciones! Tu perfil profesional ha sido verificado. Ahora tienes acceso a más beneficios.",
    time: "hace 1 día",
    read: true,
    actionUrl: "/profile"
  },
  {
    id: "5",
    type: "payment",
    title: "Pago procesado",
    description: "Tu suscripción mensual de $4,500 ARS ha sido procesada exitosamente",
    time: "hace 2 días",
    read: true,
    actionUrl: "/settings/billing",
    metadata: {
      amount: 4500
    }
  },
  {
    id: "6",
    type: "professional",
    title: "Nuevo seguidor en tu perfil",
    description: "Miguel Torres ahora sigue tu perfil profesional",
    time: "hace 3 días",
    read: true,
    actionUrl: "/profile/miguel-torres",
    metadata: {
      professionalName: "Miguel Torres"
    }
  }
];

function NotificationIcon({ type }: { type: string }) {
  const iconMap = {
    message: MessageSquare,
    review: Star,
    system: CheckCircle,
    project: Briefcase,
    payment: Crown,
    professional: User
  };

  const colorMap = {
    message: "text-blue-500 bg-blue-500/20",
    review: "text-yellow-500 bg-yellow-500/20", 
    system: "text-green-500 bg-green-500/20",
    project: "text-purple-500 bg-purple-500/20",
    payment: "text-primary bg-primary/20",
    professional: "text-orange-500 bg-orange-500/20"
  };

  const Icon = iconMap[type as keyof typeof iconMap] || Bell;
  const colorClass = colorMap[type as keyof typeof colorMap] || "text-gray-500 bg-gray-500/20";

  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`glass border-white/10 transition-all duration-300 cursor-pointer group ${
        !notification.read ? 'border-primary/30 bg-primary/5' : 'hover:bg-white/5'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Avatar or Icon */}
            <div className="flex-shrink-0">
              {notification.avatar ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback>
                    {notification.metadata?.professionalName?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <NotificationIcon type={notification.type} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-semibold text-sm group-hover:text-primary transition-colors ${
                  !notification.read ? 'text-foreground' : 'text-foreground/80'
                }`}>
                  {notification.title}
                </h3>
                
                <div className="flex items-center space-x-2 ml-2">
                  {!notification.read && (
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border-white/20">
                      <DropdownMenuItem>
                        <Check className="h-4 w-4 mr-2" />
                        Marcar como leída
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {notification.description}
              </p>

              {/* Metadata */}
              {notification.metadata && (
                <div className="flex items-center space-x-2 mb-3">
                  {notification.metadata.rating && (
                    <div className="flex items-center space-x-1">
                      {[...Array(notification.metadata.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  )}
                  {notification.metadata.amount && (
                    <Badge variant="secondary" className="text-xs">
                      ${notification.metadata.amount.toLocaleString()} ARS
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{notification.time}</span>
                </div>
                
                {notification.actionUrl && (
                  <Link to={notification.actionUrl}>
                    <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-primary">
                      Ver detalles
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    messages: true,
    reviews: true,
    projects: true,
    payments: true,
    marketing: false,
    browser: true,
    email: true,
    sms: false
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Tipos de Notificaciones</span>
          </CardTitle>
          <CardDescription>
            Elige qué notificaciones quieres recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mensajes</h4>
              <p className="text-sm text-muted-foreground">Notificaciones de nuevos mensajes</p>
            </div>
            <Switch 
              checked={settings.messages} 
              onCheckedChange={(checked) => handleSettingChange('messages', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Reseñas</h4>
              <p className="text-sm text-muted-foreground">Notificaciones de nuevas reseñas</p>
            </div>
            <Switch 
              checked={settings.reviews} 
              onCheckedChange={(checked) => handleSettingChange('reviews', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Proyectos</h4>
              <p className="text-sm text-muted-foreground">Nuevas oportunidades de trabajo</p>
            </div>
            <Switch 
              checked={settings.projects} 
              onCheckedChange={(checked) => handleSettingChange('projects', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Pagos</h4>
              <p className="text-sm text-muted-foreground">Confirmaciones de pagos y facturación</p>
            </div>
            <Switch 
              checked={settings.payments} 
              onCheckedChange={(checked) => handleSettingChange('payments', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Marketing</h4>
              <p className="text-sm text-muted-foreground">Ofertas especiales y noticias de Fixia</p>
            </div>
            <Switch 
              checked={settings.marketing} 
              onCheckedChange={(checked) => handleSettingChange('marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Métodos de Entrega</CardTitle>
          <CardDescription>
            Cómo quieres recibir las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Navegador</h4>
              <p className="text-sm text-muted-foreground">Notificaciones push del navegador</p>
            </div>
            <Switch 
              checked={settings.browser} 
              onCheckedChange={(checked) => handleSettingChange('browser', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email</h4>
              <p className="text-sm text-muted-foreground">Notificaciones por correo electrónico</p>
            </div>
            <Switch 
              checked={settings.email} 
              onCheckedChange={(checked) => handleSettingChange('email', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SMS</h4>
              <p className="text-sm text-muted-foreground">Mensajes de texto (solo urgentes)</p>
            </div>
            <Switch 
              checked={settings.sms} 
              onCheckedChange={(checked) => handleSettingChange('sms', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = activeTab === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <FixiaNavigation />
        <div className="container mx-auto px-6 py-20">
          <Card className="glass border-white/10 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Inicia Sesión</h2>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para ver tus notificaciones
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">Notificaciones</h1>
            <p className="text-xl text-muted-foreground">
              Mantente al día con las últimas actualizaciones
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {unreadCount} sin leer
              </Badge>
            )}
            <Button variant="outline" size="sm" className="glass border-white/20">
              <Check className="h-4 w-4 mr-1" />
              Marcar todas como leídas
            </Button>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass border-white/10 mb-8">
              <TabsTrigger value="all">
                Todas ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Sin leer ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="settings">
                Configuración
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
              
              {filteredNotifications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <Bell className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4 text-foreground">No hay notificaciones</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Cuando tengas nuevas notificaciones, aparecerán aquí
                  </p>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
              
              {filteredNotifications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4 text-foreground">¡Todo al día!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Has leído todas tus notificaciones
                  </p>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}