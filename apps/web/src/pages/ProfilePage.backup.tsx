import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Calendar, Settings, Shield,
  Edit3, Save, X, Plus, Heart, Heart, Briefcase, Eye, Heart,
  MessageSquare, DollarSign, TrendingUp, Clock, CheckCircle,
  Upload, FileText, Globe, Linkedin, Twitter, Instagram, Github,
  Bell, Lock, CreditCard, LogOut, Trash2, ExternalLink,
  BarChart3, Users, Target, Zap, AlertTriangle, Camera
} from "lucide-react";
import { FixiaNavigation } from "../components/FixiaNavigation";
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
import { useSecureAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";

// Componentes seguros importados
import { SecureInput, SecureTextarea } from "../components/SecureInput";
import { SecureAvatarUpload } from "../components/SecureAvatarUpload";

// Mock data for portfolio items
const portfolioItems = [
  {
    id: 1,
    title: "E-commerce ModaStyle",
    description: "Tienda online completa con más de 1000 productos y sistema de pagos integrado",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    category: "Desarrollo Web",
    date: "Nov 2024",
    client: "ModaStyle Boutique",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    url: "https://modastyle.com",
    featured: true
  },
  {
    id: 2,
    title: "App Móvil FitTracker",
    description: "Aplicación de seguimiento fitness con integración de wearables",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    category: "Desarrollo Móvil",
    date: "Oct 2024",
    client: "HealthTech Solutions",
    technologies: ["Flutter", "Firebase", "HealthKit"],
    featured: false
  },
  {
    id: 3,
    title: "Identidad Visual TechStart",
    description: "Branding completo para startup tecnológica incluyendo logo y guía de marca",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    category: "Diseño Gráfico",
    date: "Sep 2024",
    client: "TechStart Inc.",
    technologies: ["Illustrator", "Photoshop", "Figma"],
    featured: true
  }
];

// Mock data for reviews
const userReviews = [
  {
    id: 1,
    serviceTitle: "Desarrollo E-commerce Completo",
    client: {
      name: "Carlos Mendoza",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    rating: 5,
    comment: "Excelente trabajo. Ana entregó exactamente lo que necesitábamos y más. La comunicación fue perfecta.",
    date: "Hace 2 semanas",
    response: "¡Gracias Carlos! Fue un placer trabajar contigo. Espero que el e-commerce siga creciendo."
  },
  {
    id: 2,
    serviceTitle: "App Móvil iOS/Android",
    client: {
      name: "María García",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    },
    rating: 5,
    comment: "Ana desarrolló nuestra app móvil y los resultados han sido increíbles. Muy profesional.",
    date: "Hace 1 mes"
  }
];

function ProfileHeader({ user, isEditing, setIsEditing }: any) {
  const [profileData, setProfileData] = useState({
    name: user.name || 'Usuario',
    bio: user.professionalProfile?.description || '',
    location: user.location || '',
    website: user.professionalProfile?.portfolio || '',
    phone: user.phone || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateProfile } = useSecureAuth();

  // Validación de campos
  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!profileData.name || profileData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar biografía
    if (profileData.bio && profileData.bio.length > 500) {
      newErrors.bio = 'La biografía no puede exceder 500 caracteres';
    }

    // Validar website
    if (profileData.website) {
      try {
        new URL(profileData.website);
      } catch {
        newErrors.website = 'La URL del sitio web no es válida';
      }
    }

    // Validar teléfono (formato básico)
    if (profileData.phone && profileData.phone.length > 0) {
      const phoneRegex = /^[+]?[\d\s\-()]{10}$/;
      if (!phoneRegex.test(profileData.phone)) {
        newErrors.phone = 'Formato de teléfono no válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      toast.error('Errores en el formulario', {
        description: "Por favor, corrije los errores marcados antes de guardar"
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: profileData.name,
        location: profileData.location,
        phone: profileData.phone,
        // Si es profesional, actualizar bio en el perfil profesional
        ...(user.userType === 'professional' && {
          professionalProfile: {
            ...user.professionalProfile,
            description: profileData.bio,
            portfolio: profileData.website
          }
        })
      });
      
      toast.success("Perfil actualizado", {
        description: "Tus cambios se guardaron correctamente"
      });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    try {
      await updateProfile({ avatar: newAvatarUrl });
      toast.success('📸 Foto actualizada', {
        description: "Tu nueva foto de perfil se guardó correctamente"
      });
    } catch (error: any) {
      toast.error('Error al actualizar foto', {
        description: "No se pudo guardar tu nueva foto de perfil. Intenta nuevamente"
      });
    }
  };

  return (
    <Card className="glass border-white/10">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <SecureAvatarUpload 
              currentAvatar={user.avatar}
              onAvatarUpdate={handleAvatarUpdate}
            />
            
            {user.verified && (
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
                    <SecureInput
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="text-2xl font-bold glass border-white/20"
                      sanitizationType="plainText"
                      maxLength={50}
                      customValidation={(value) => ({
                        isValid: value.length >= 2,
                        message: 'El nombre debe tener al menos 2 caracteres'
                      })}
                    />
                    {errors.name && (
                      <div className="text-destructive text-sm">{errors.name}</div>
                    )}
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold">{profileData.name}</h1>
                )}
                
                <div className="flex items-center space-x-3 mt-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {user.userType === 'professional' ? (user.professionalProfile?.verified ? 'Profesional Verificado' : 'Profesional') : user.planType === 'premium' ? 'Cliente Premium' : 'Cliente'}
                  </Badge>
                  {user.userType === 'professional' && user.professionalProfile && (
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-warning fill-current" />
                      <span className="font-medium">{user.professionalProfile.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({user.professionalProfile.totalReviews} reseñas)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="liquid-gradient">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
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
                <div className="space-y-2">
                  <SecureTextarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="glass border-white/20"
                    rows={3}
                    sanitizationType="basicHTML"
                    maxLength={500}
                    customValidation={(value) => ({
                      isValid: value.length <= 500,
                      message: 'La biografía no puede exceder 500 caracteres'
                    })}
                    placeholder="Describe tu experiencia, especialidades y lo que te diferencia..."
                  />
                  {errors.bio && (
                    <div className="text-destructive text-sm">{errors.bio}</div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {profileData.bio || 'No hay descripción disponible. Haz clic en "Editar Perfil" para agregar información sobre ti.'}
                </p>
              )}
            </div>
            
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                {isEditing ? (
                  <SecureInput
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-40 h-6 text-sm glass border-white/20"
                    sanitizationType="plainText"
                    maxLength={100}
                    showSecurityStatus={false}
                    placeholder="Ciudad, País"
                  />
                ) : (
                  <span>{profileData.location || 'Ubicación no especificada'}</span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde {new Date(user.createdAt || Date.now()).getFullYear()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                {isEditing ? (
                  <div>
                    <SecureInput
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      className="w-40 h-6 text-sm glass border-white/20"
                      sanitizationType="url"
                      showSecurityStatus={false}
                      customValidation={(value) => {
                        if (!value) return { isValid: true };
                        try {
                          new URL(value);
                          return { isValid: true };
                        } catch {
                          return { isValid: false, message: 'URL no válida' };
                        }
                      }}
                      placeholder="https://..."
                    />
                    {errors.website && (
                      <div className="text-destructive text-xs mt-1">{errors.website}</div>
                    )}
                  </div>
                ) : profileData.website ? (
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {profileData.website}
                  </a>
                ) : (
                  <span>Sin sitio web</span>
                )}
              </div>
            </div>
            
            {/* Stats for professionals */}
            {user.userType === 'professional' && user.professionalProfile && (
              <div className="flex space-x-8 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.professionalProfile.totalServices || 0}</div>
                  <div className="text-sm text-muted-foreground">Servicios</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{user.professionalProfile.completedServices || 0}</div>
                  <div className="text-sm text-muted-foreground">Completados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{user.professionalProfile.averageRating?.toFixed(1) || '0.0'}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.professionalProfile.totalReviews || 0}</div>
                  <div className="text-sm text-muted-foreground">Reseñas</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfessionalPortfolio() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portafolio</CardTitle>
            <CardDescription>Mis trabajos más destacados</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="liquid-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Proyecto</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo proyecto a tu portafolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título del Proyecto</Label>
                    <SecureInput 
                      className="glass border-white/20" 
                      placeholder="Ej: App Móvil Innovadora"
                      sanitizationType="plainText"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select>
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Desarrollo Web</SelectItem>
                        <SelectItem value="mobile">Desarrollo Móvil</SelectItem>
                        <SelectItem value="design">Diseño Gráfico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <SecureTextarea 
                    className="glass border-white/20" 
                    rows={3}
                    sanitizationType="basicHTML"
                    maxLength={500}
                    placeholder="Describe el proyecto, tecnologías utilizadas, desafíos superados..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL del Proyecto (opcional)</Label>
                  <SecureInput 
                    className="glass border-white/20" 
                    placeholder="https://..."
                    sanitizationType="url"
                    customValidation={(value) => {
                      if (!value) return { isValid: true };
                      try {
                        new URL(value);
                        return { isValid: true };
                      } catch {
                        return { isValid: false, message: 'URL no válida' };
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" className="glass border-white/20">Cancelar</Button>
                  <Button className="liquid-gradient">Guardar Proyecto</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {["Todos", "Desarrollo Web", "Desarrollo Móvil", "Diseño Gráfico"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "liquid-gradient hover:opacity-90" 
                : "glass border-white/20 hover:glass-medium"
              }
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.featured && (
                    <Badge className="absolute top-3 left-3 bg-warning/20 text-warning border-warning/30">
                      <Heart className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button size="sm" className="liquid-gradient">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {item.url && (
                        <Button size="sm" variant="outline" className="glass border-white/20">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="glass border-white/20 text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  
                  <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="glass border-white/20 text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-sm text-muted-foreground">Cliente: {item.client}</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Heart className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsSection() {
  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-warning" />
          <span>Reseñas y Valoraciones</span>
        </CardTitle>
        <CardDescription>Lo que dicen mis clientes</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating Overview */}
        <div className="flex items-center space-x-8 p-4 glass-medium rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold">4.9</div>
            <div className="flex items-center justify-center mt-1">
              {[1,2,3,4,5].map((star) => (
                <Heart key={star} className="h-4 w-4 text-warning fill-current" />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">187 reseñas</div>
          </div>
          
          <div className="flex-1 space-y-2">
            {[5,4,3,2,1].map((stars) => (
              <div key={stars} className="flex items-center space-x-3">
                <span className="text-sm w-8">{stars}★</span>
                <Progress value={stars === 5 ? 85 : stars === 4 ? 15 : 0} className="flex-1" />
                <span className="text-sm text-muted-foreground w-8">
                  {stars === 5 ? '85%' : stars === 4 ? '15%' : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Reviews List */}
        <div className="space-y-4">
          {userReviews.map((review) => (
            <div key={review.id} className="glass-medium rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={review.client.avatar} />
                  <AvatarFallback>{review.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{review.client.name}</div>
                      <div className="text-sm text-muted-foreground">{review.serviceTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map((star) => (
                          <Heart 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= review.rating 
                                ? 'text-warning fill-current' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{review.date}</div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                  
                  {review.response && (
                    <div className="bg-primary/10 border-l-4 border-primary pl-4 py-2 mt-3">
                      <div className="font-medium text-sm text-primary mb-1">Tu respuesta:</div>
                      <p className="text-sm">{review.response}</p>
                    </div>
                  )}
                  
                  {!review.response && (
                    <Button size="sm" variant="outline" className="glass border-white/20">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsSection() {
  const { user } = useSecureAuth();
  if (!user) return null;
  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración de Cuenta</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <SecureInput 
                defaultValue={user?.email || ""}
                className="glass border-white/20"
                sanitizationType="email"
                // Email validation removed from real-time input to allow typing
                // Email format validation should be done on form submit, not during typing
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <SecureInput 
                defaultValue={user?.phone || ""}
                className="glass border-white/20"
                sanitizationType="phone"
                customValidation={(value) => {
                  if (!value) return { isValid: true };
                  const phoneRegex = /^[+]?[\d\s\-()]{10}$/;
                  return {
                    isValid: phoneRegex.test(value),
                    message: 'Formato de teléfono inválido'
                  };
                }}
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Zona Horaria</Label>
            <Select defaultValue="mexico">
              <SelectTrigger className="glass border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mexico">Ciudad de México (GMT-6)</SelectItem>
                <SelectItem value="madrid">Madrid (GMT+1)</SelectItem>
                <SelectItem value="buenos-aires">Buenos Aires (GMT-3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Redes Sociales</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Linkedin className="h-5 w-5 text-blue-500" />
                <SecureInput 
                  placeholder="LinkedIn URL" 
                  className="glass border-white/20"
                  sanitizationType="url"
                  customValidation={(value) => {
                    if (!value) return { isValid: true };
                    return {
                      isValid: value.includes('linkedin.com'),
                      message: 'Debe ser una URL de LinkedIn válida'
                    };
                  }}
                />
              </div>
              <div className="flex items-center space-x-3">
                <Twitter className="h-5 w-5 text-blue-400" />
                <SecureInput 
                  placeholder="Twitter URL" 
                  className="glass border-white/20"
                  sanitizationType="url"
                  customValidation={(value) => {
                    if (!value) return { isValid: true };
                    return {
                      isValid: value.includes('twitter.com') || value.includes('x.com'),
                      message: 'Debe ser una URL de Twitter/X válida'
                    };
                  }}
                />
              </div>
              <div className="flex items-center space-x-3">
                <Github className="h-5 w-5" />
                <SecureInput 
                  placeholder="GitHub URL" 
                  className="glass border-white/20"
                  sanitizationType="url"
                  customValidation={(value) => {
                    if (!value) return { isValid: true };
                    return {
                      isValid: value.includes('github.com'),
                      message: 'Debe ser una URL de GitHub válida'
                    };
                  }}
                />
              </div>
              <div className="flex items-center space-x-3">
                <Instagram className="h-5 w-5 text-pink-500" />
                <SecureInput 
                  placeholder="Instagram URL" 
                  className="glass border-white/20"
                  sanitizationType="url"
                  customValidation={(value) => {
                    if (!value) return { isValid: true };
                    return {
                      isValid: value.includes('instagram.com'),
                      message: 'Debe ser una URL de Instagram válida'
                    };
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Preferencias de Notificación</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Nuevos mensajes</div>
              <div className="text-sm text-muted-foreground">Recibir notificaciones de nuevos mensajes</div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Nuevos pedidos</div>
              <div className="text-sm text-muted-foreground">Notificaciones de nuevos pedidos de servicio</div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Actualizaciones de proyectos</div>
              <div className="text-sm text-muted-foreground">Updates sobre el progreso de proyectos</div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Newsletter semanal</div>
              <div className="text-sm text-muted-foreground">Recibir tips y novedades semanales</div>
            </div>
            <Switch />
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
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
            <Lock className="h-4 w-4 mr-2" />
            Cambiar Contraseña
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Autenticación de dos factores</div>
              <div className="text-sm text-muted-foreground">Añade una capa extra de seguridad</div>
            </div>
            <Switch />
          </div>
          
          <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
            <FileText className="h-4 w-4 mr-2" />
            Descargar Datos Personales
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Zona Peligrosa</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full border-destructive/20 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Cuenta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useSecureAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <FixiaNavigation />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileHeader user={user} isEditing={isEditing} setIsEditing={setIsEditing} />
          </motion.div>

          {/* Profile Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Tabs defaultValue={user.userType === 'professional' ? 'portfolio' : 'activity'} className="w-full">
              <TabsList className="glass w-full md:w-auto">
                {user.userType === 'professional' ? (
                  <>
                    <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
                    <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="activity">Actividad</TabsTrigger>
                    <TabsTrigger value="favorites">Favoritos</TabsTrigger>
                    <TabsTrigger value="orders">Mis Pedidos</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Professional Tabs */}
              {user.userType === 'professional' && (
                <>
                  <TabsContent value="portfolio" className="mt-6">
                    <ProfessionalPortfolio />
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-6">
                    <ReviewsSection />
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-6">
                    <Card className="glass border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Analytics y Estadísticas</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                          <div className="glass-medium rounded-lg p-4 text-center">
                            <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                            <div className="text-2xl font-bold">$12,450</div>
                            <div className="text-sm text-muted-foreground">Ingresos este mes</div>
                          </div>
                          <div className="glass-medium rounded-lg p-4 text-center">
                            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">23</div>
                            <div className="text-sm text-muted-foreground">Clientes activos</div>
                          </div>
                          <div className="glass-medium rounded-lg p-4 text-center">
                            <Target className="h-8 w-8 text-warning mx-auto mb-2" />
                            <div className="text-2xl font-bold">89%</div>
                            <div className="text-sm text-muted-foreground">Tasa de conversión</div>
                          </div>
                          <div className="glass-medium rounded-lg p-4 text-center">
                            <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">45min</div>
                            <div className="text-sm text-muted-foreground">Tiempo promedio respuesta</div>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-center">
                          Analytics detallado próximamente...
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}

              {/* Client Tabs */}
              {user.userType === 'client' && (
                <>
                  <TabsContent value="activity" className="mt-6">
                    <Card className="glass border-white/10">
                      <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
                            <Clock className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Sin actividad reciente</h3>
                          <p className="text-muted-foreground mb-4">
                            Tu actividad aparecerá aquí cuando comiences a interactuar con la plataforma.
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
                  
                  <TabsContent value="favorites" className="mt-6">
                    <Card className="glass border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Heart className="h-5 w-5" />
                          <span>Servicios Favoritos</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center py-8">
                          Aún no tienes servicios guardados como favoritos.
                          <br />
                          <Link to="/services" className="text-primary hover:underline">
                            Explorar servicios
                          </Link>
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="orders" className="mt-6">
                    <Card className="glass border-white/10">
                      <CardHeader>
                        <CardTitle>Historial de Pedidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
                            <Briefcase className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Sin pedidos realizados</h3>
                          <p className="text-muted-foreground mb-4">
                            Cuando hagas pedidos de servicios, aparecerán aquí con su estado y detalles.
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
                </>
              )}

              {/* Settings Tab (for both) */}
              <TabsContent value="settings" className="mt-6">
                <SettingsSection />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}