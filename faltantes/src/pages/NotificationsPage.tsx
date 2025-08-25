import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Bell, Check, X, Trash2, Settings, 
  MessageSquare, Crown, Star, AlertCircle, Clock,
  Users, Briefcase, Heart, TrendingUp, Filter,
  CheckCircle, MoreHorizontal, Mail, Phone
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface Notification {
  id: string;
  type: 'message' | 'opportunity' | 'review' | 'system' | 'payment' | 'verification';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  priority: 'low' | 'medium' | 'high';
}

const notificationsData: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "Nuevo mensaje de María González",
    message: "Te ha enviado una consulta sobre tu servicio de diseño web. Responde pronto para no perder la oportunidad.",
    timestamp: "Hace 5 minutos",
    read: false,
    actionUrl: "/dashboard/messages/1",
    user: {
      name: "María González",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face"
    },
    priority: "high"
  },
  {
    id: "2",
    type: "opportunity",
    title: "Nueva oportunidad: Desarrollo de App Móvil",
    message: "Un cliente busca desarrollador React Native en Puerto Madryn. El proyecto coincide con tu perfil.",
    timestamp: "Hace 1 hora",
    read: false,
    actionUrl: "/opportunities/2",
    priority: "high"
  },
  {
    id: "3",
    type: "review",
    title: "Nueva reseña de 5 estrellas",
    message: "Carlos Rodríguez ha dejado una excelente reseña por tu trabajo de reparación eléctrica.",
    timestamp: "Hace 2 horas",
    read: true,
    actionUrl: "/profile/reviews",
    user: {
      name: "Carlos Rodríguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
    },
    priority: "medium"
  },
  {
    id: "4",
    type: "payment",
    title: "Pago procesado correctamente",
    message: "Tu suscripción mensual de $4500 ARS ha sido procesada. Próximo pago: 15 de Febrero.",
    timestamp: "Hace 1 día",
    read: true,
    actionUrl: "/settings?tab=subscription",
    priority: "low"
  },
  {
    id: "5",
    type: "verification",
    title: "Verificación completada",
    message: "¡Felicitaciones! Tu perfil ha sido verificado exitosamente. Ya tienes tu insignia verificada.",
    timestamp: "Hace 2 días",
    read: true,
    actionUrl: "/profile",
    priority: "high"
  },
  {
    id: "6",
    type: "system",
    title: "Actualización de términos y condiciones",
    message: "Hemos actualizado nuestros términos de servicio. Revisa los cambios en tu próximo inicio de sesión.",
    timestamp: "Hace 3 días",
    read: false,
    actionUrl: "/terms",
    priority: "medium"
  },
  {
    id: "7",
    type: "message",
    title: "Recordatorio: Responder a Ana Martínez",
    message: "Tienes un mensaje pendiente de respuesta desde hace 24 horas. Los clientes valoran la rapidez.",
    timestamp: "Hace 1 día",
    read: false,
    actionUrl: "/dashboard/messages/3",
    user: {
      name: "Ana Martínez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face"
    },
    priority: "medium"
  },
  {
    id: "8",
    type: "opportunity",
    title: "Alerta: Servicio de Plomería",
    message: "Nueva solicitud de servicio de plomería urgente en Rawson. Cliente dispuesto a pagar precio premium.",
    timestamp: "Hace 6 horas",
    read: true,
    actionUrl: "/opportunities/8",
    priority: "high"
  }
];

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
            <span className="text-xs text-muted-foreground -mt-1">Notificaciones</span>
          </div>
        </Link>
        
        <div className="flex items-center space-x-3">
          <Link to="/settings?tab=notifications">
            <Button variant="ghost" size="icon" className="hover:glass-medium">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" className="hover:glass-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function NotificationItem({ notification, onMarkRead, onDelete }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return MessageSquare;
      case 'opportunity':
        return Briefcase;
      case 'review':
        return Star;
      case 'payment':
        return Crown;
      case 'verification':
        return CheckCircle;
      case 'system':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'message':
        return 'text-blue-400';
      case 'opportunity':
        return 'text-success';
      case 'review':
        return 'text-warning';
      case 'payment':
        return 'text-primary';
      case 'verification':
        return 'text-green-400';
      case 'system':
        return 'text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/5';
      case 'medium':
        return 'border-warning/30 bg-warning/5';
      case 'low':
        return 'border-white/10';
      default:
        return 'border-white/10';
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className={`glass transition-all duration-300 cursor-pointer ${
        notification.read ? 'opacity-75' : getPriorityColor()
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Avatar or Icon */}
            <div className="flex-shrink-0">
              {notification.user ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.user.avatar} />
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${getIconColor()}`} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    )}
                    {notification.priority === 'high' && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{notification.timestamp}</span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:glass-medium">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-white/20">
                    {!notification.read && (
                      <DropdownMenuItem onClick={() => onMarkRead(notification.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Marcar como leída
                      </DropdownMenuItem>
                    )}
                    {notification.read && (
                      <DropdownMenuItem onClick={() => onMarkRead(notification.id)}>
                        <Bell className="h-4 w-4 mr-2" />
                        Marcar como no leída
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDelete(notification.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {notification.actionUrl && (
            <div className="mt-3 pl-14">
              <Button 
                size="sm" 
                variant="outline" 
                className="glass border-white/20 text-xs"
              >
                {notification.type === 'message' ? 'Responder' :
                 notification.type === 'opportunity' ? 'Ver Oportunidad' :
                 notification.type === 'review' ? 'Ver Reseña' :
                 notification.type === 'payment' ? 'Ver Detalles' :
                 'Ver Más'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NotificationsHeader({ 
  unreadCount, 
  onMarkAllRead, 
  onDeleteAll 
}: {
  unreadCount: number;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
        <p className="text-muted-foreground">
          {unreadCount > 0 
            ? `Tienes ${unreadCount} ${unreadCount === 1 ? 'notificación nueva' : 'notificaciones nuevas'}`
            : 'Todas las notificaciones están al día'
          }
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          onClick={onMarkAllRead} 
          variant="outline" 
          size="sm"
          className="glass border-white/20"
          disabled={unreadCount === 0}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Marcar todas como leídas
        </Button>
        <Button 
          onClick={onDeleteAll} 
          variant="outline" 
          size="sm"
          className="glass border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpiar todas
        </Button>
        <Link to="/settings?tab=notifications">
          <Button variant="outline" size="sm" className="glass border-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </Link>
      </div>
    </div>
  );
}

function QuickStats({ notifications }: { notifications: Notification[] }) {
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    messages: notifications.filter(n => n.type === 'message').length,
    opportunities: notifications.filter(n => n.type === 'opportunity').length,
    highPriority: notifications.filter(n => n.priority === 'high').length
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <Card className="glass border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </CardContent>
      </Card>
      <Card className="glass border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-warning">{stats.unread}</div>
          <div className="text-sm text-muted-foreground">Sin leer</div>
        </CardContent>
      </Card>
      <Card className="glass border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.messages}</div>
          <div className="text-sm text-muted-foreground">Mensajes</div>
        </CardContent>
      </Card>
      <Card className="glass border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.opportunities}</div>
          <div className="text-sm text-muted-foreground">Oportunidades</div>
        </CardContent>
      </Card>
      <Card className="glass border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.highPriority}</div>
          <div className="text-sm text-muted-foreground">Urgentes</div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="glass border-white/10 text-center py-16">
      <CardContent>
        <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No hay notificaciones</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Cuando tengas nuevos mensajes, oportunidades o actualizaciones importantes, 
          aparecerán aquí.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link to="/dashboard">
            <Button variant="outline" className="glass border-white/20">
              Ir al Dashboard
            </Button>
          </Link>
          <Link to="/settings?tab=notifications">
            <Button className="liquid-gradient">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Notificaciones
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [selectedTab, setSelectedTab] = useState("all");

  const handleMarkRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: !notification.read }
        : notification
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const handleDeleteAll = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      setNotifications([]);
    }
  };

  const filterNotifications = () => {
    switch (selectedTab) {
      case "unread":
        return notifications.filter(n => !n.read);
      case "messages":
        return notifications.filter(n => n.type === 'message');
      case "opportunities":
        return notifications.filter(n => n.type === 'opportunity');
      case "system":
        return notifications.filter(n => ['system', 'payment', 'verification'].includes(n.type));
      default:
        return notifications;
    }
  };

  const filteredNotifications = filterNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <NotificationsHeader 
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onDeleteAll={handleDeleteAll}
            />

            <QuickStats notifications={notifications} />

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="glass border-white/10 p-1 w-full">
                <TabsTrigger value="all" className="flex-1">
                  Todas
                  <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 text-xs">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">
                  Sin leer
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-warning/20 text-warning border-warning/30 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Mensajes
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="flex-1">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Oportunidades
                </TabsTrigger>
                <TabsTrigger value="system" className="flex-1">
                  <Settings className="h-4 w-4 mr-1" />
                  Sistema
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab}>
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}