import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Bell, BellOff, Check, MoreHorizontal, Trash2, 
  MessageSquare, Heart, Crown, AlertCircle, CheckCircle, 
  Clock, User, Briefcase, Heart, Calendar, Settings,
  Search, Filter, CheckAll, Archive
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { useToast } from "../components/ui/use-toast";
import { FixiaNavigation } from "../components/FixiaNavigation";
import { useSecureAuth } from "../context/SecureAuthContext";

interface Notification {
  id: string;
  type: 'job_started' | 'job_milestone' | 'job_completed' | 'review_received' | 'proposal_received' | 'message' | 'payment_received' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  last7Days: number;
  last30Days: number;
}

const notificationTypeConfig = {
  job_started: { color: 'bg-secondary', icon: '🔨', label: 'Trabajo Iniciado' },
  job_milestone: { color: 'bg-success', icon: '✅', label: 'Hito Completado' },
  job_completed: { color: 'bg-primary', icon: '🎉', label: 'Trabajo Terminado' },
  review_received: { color: 'bg-warning', icon: '⭐', label: 'Reseña Recibida' },
  proposal_received: { color: 'bg-warning', icon: '📋', label: 'Propuesta Recibida' },
  message: { color: 'bg-primary', icon: '💬', label: 'Mensaje' },
  payment_received: { color: 'bg-success', icon: '💰', label: 'Pago Recibido' },
  system: { color: 'bg-muted-foreground', icon: '🔔', label: 'Sistema' }
};

function NotificationIcon({ type }: { type: string }) {
  const iconMap = {
    message: MessageSquare,
    review: Heart,
    system: CheckCircle,
    project: Briefcase,
    payment: Crown,
    professional: User
  };

  const colorMap = {
    message: "text-secondary bg-secondary/20",
    review: "text-warning bg-warning/20",
    system: "text-success bg-success/20",
    project: "text-primary bg-primary/20",
    payment: "text-primary bg-primary/20",
    professional: "text-warning bg-warning/20"
  };

  const Icon = iconMap[type as keyof typeof iconMap] || Bell;
  const colorClass = colorMap[type as keyof typeof colorMap] || "text-gray-500 bg-gray-500/20";

  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

function NotificationCard({ notification, onMarkRead, onDelete }: { 
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = notificationTypeConfig[notification.type];
  
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
            {/* Notification Icon */}
            <div className="flex-shrink-0">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${config.color}`}>
                {config.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0" onClick={() => {
              if (!notification.read) onMarkRead(notification.id);
              if (notification.action_url) window.location.href = notification.action_url;
            }}>
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
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border-white/20">
                      {!notification.read && (
                        <DropdownMenuItem onClick={() => onMarkRead(notification.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como leída
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(notification.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {notification.message}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(notification.created_at)}</span>
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                </div>
                
                {notification.action_url && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-primary">
                    Ver detalles
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Utility function moved outside component
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Hace un momento';
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)} día${Math.floor(diffInHours / 24) !== 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
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
  const { user } = useSecureAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [currentType, setCurrentType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'type'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy
      });

      if (currentFilter === 'unread') params.append('read', 'false');
      if (currentFilter === 'read') params.append('read', 'true');
      if (currentType !== 'all') params.append('type', currentType);

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        fetchStats();
        toast({
          title: "Todas las notificaciones marcadas como leídas",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        fetchStats();
        toast({
          title: "Notificación eliminada",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace un momento';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)} día${Math.floor(diffInHours / 24) !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (activeTab === 'unread' && notification.read) return false;
    
    return true;
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchStats();
    }
  }, [user, currentFilter, currentType, sortBy, currentPage, activeTab]);
  
  const unreadCount = stats?.unread || 0;

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
            
            <TabsContent value="all" className="space-y-6">
              {/* Search and Filters */}
              <Card className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Buscar notificaciones..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 glass border-white/20"
                        />
                      </div>
                    </div>
                    
                    <Select value={currentType} onValueChange={setCurrentType}>
                      <SelectTrigger className="w-48 glass border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {Object.entries(notificationTypeConfig).map(([type, config]) => (
                          <SelectItem key={type} value={type}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'type') => setSortBy(value)}>
                      <SelectTrigger className="w-40 glass border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="newest">Más recientes</SelectItem>
                        <SelectItem value="oldest">Más antiguos</SelectItem>
                        <SelectItem value="type">Por tipo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="glass border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <Bell className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Sin leer</p>
                          <p className="text-2xl font-bold text-secondary">{stats.unread}</p>
                        </div>
                        <div className="h-8 w-8 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Badge className="h-4 w-4 bg-secondary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Últimos 7 días</p>
                          <p className="text-2xl font-bold">{stats.last7Days}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Últimos 30 días</p>
                          <p className="text-2xl font-bold">{stats.last30Days}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notifications List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <Bell className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {searchQuery ? 'No se encontraron notificaciones' : 'No hay notificaciones'}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery 
                      ? 'No se encontraron notificaciones que coincidan con tu búsqueda.' 
                      : 'Cuando tengas nuevas notificaciones, aparecerán aquí'
                    }
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="glass border-white/20"
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={pageNum === currentPage ? "" : "glass border-white/20"}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="glass border-white/20"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="space-y-4">
              {filteredNotifications.filter(n => !n.read).map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
              
              {filteredNotifications.filter(n => !n.read).length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <CheckCircle className="h-24 w-24 text-success mx-auto mb-6" />
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