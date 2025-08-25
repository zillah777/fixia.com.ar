// Application Constants
export const APP_CONFIG = {
  name: 'Fixia',
  tagline: 'Conecta. Confía. Resuelve.',
  description: 'El marketplace #1 de microservicios profesionales de la Provincia del Chubut',
  version: '1.0.0',
  url: 'https://fixia.com.ar',
  supportEmail: 'soporte@fixia.com.ar',
  supportPhone: '+54 280 4567890',
  supportHours: 'Lun-Vie 9-18hs'
} as const;

// Pricing Constants
export const PRICING = {
  professional: {
    monthly: 4500,
    currency: 'ARS',
    trialMonths: 2,
    maxTrialUsers: 200
  },
  free: {
    maxContacts: 3,
    maxAlerts: 1
  }
} as const;

// Location Constants - Chubut Province
export const LOCATIONS = [
  'Rawson',
  'Puerto Madryn', 
  'Comodoro Rivadavia',
  'Trelew',
  'Esquel',
  'Gaiman',
  'Puerto Deseado',
  'Caleta Olivia',
  'Río Gallegos',
  'El Calafate',
  'Ushuaia',
  'Otra ubicación'
] as const;

// Service Categories
export const CATEGORIES = [
  {
    name: 'Desarrollo Web',
    slug: 'desarrollo-web',
    icon: 'Globe',
    description: 'Sitios web, e-commerce y aplicaciones web',
    subcategories: ['WordPress', 'E-commerce', 'React/Vue', 'Backend', 'APIs'],
    popular: true
  },
  {
    name: 'Diseño Gráfico',
    slug: 'diseno-grafico', 
    icon: 'Palette',
    description: 'Logos, branding e identidad visual',
    subcategories: ['Logo', 'Branding', 'Ilustración', 'Print', 'UI/UX'],
    popular: true
  },
  {
    name: 'Reparaciones',
    slug: 'reparaciones',
    icon: 'Wrench',
    description: 'Reparación de electrodomésticos y equipos',
    subcategories: ['Electrodomésticos', 'Electrónicos', 'Computadoras', 'Móviles', 'Audio/Video'],
    popular: true
  },
  {
    name: 'Marketing Digital',
    slug: 'marketing-digital',
    icon: 'TrendingUp',
    description: 'SEO, redes sociales y publicidad online',
    subcategories: ['SEO', 'Redes Sociales', 'Google Ads', 'Email Marketing', 'Analytics'],
    popular: false
  },
  {
    name: 'Consultoría',
    slug: 'consultoria',
    icon: 'Briefcase',
    description: 'Asesoramiento profesional y empresarial',
    subcategories: ['Negocios', 'Legal', 'Contable', 'RRHH', 'Financiera'],
    popular: false
  },
  {
    name: 'Limpieza',
    slug: 'limpieza',
    icon: 'Sparkles',
    description: 'Servicios de limpieza doméstica y comercial',
    subcategories: ['Doméstica', 'Oficinas', 'Post-obra', 'Alfombras', 'Vidrios'],
    popular: true
  },
  {
    name: 'Jardinería',
    slug: 'jardineria',
    icon: 'Flower',
    description: 'Mantenimiento y diseño de jardines',
    subcategories: ['Mantenimiento', 'Diseño', 'Poda', 'Riego', 'Paisajismo'],
    popular: false
  },
  {
    name: 'Educación',
    slug: 'educacion',
    icon: 'BookOpen',
    description: 'Clases particulares y capacitación',
    subcategories: ['Matemáticas', 'Idiomas', 'Música', 'Programación', 'Apoyo Escolar'],
    popular: false
  },
  {
    name: 'Construcción',
    slug: 'construccion',
    icon: 'Hammer',
    description: 'Obras, reformas y construcción',
    subcategories: ['Albañilería', 'Pintura', 'Plomería', 'Electricidad', 'Reformas'],
    popular: true
  },
  {
    name: 'Transporte',
    slug: 'transporte',
    icon: 'Truck',
    description: 'Mudanzas y servicios de transporte',
    subcategories: ['Mudanzas', 'Delivery', 'Logística', 'Fletes', 'Traslados'],
    popular: false
  }
] as const;

// Professional Levels
export const PROFESSIONAL_LEVELS = [
  {
    id: 'newcomer',
    name: 'Nuevo',
    description: 'Profesional recién registrado',
    requirements: { reviews: 0, rating: 0, jobs: 0 },
    color: 'gray'
  },
  {
    id: 'verified',
    name: 'Verificado',
    description: 'Profesional con identidad verificada',
    requirements: { reviews: 0, rating: 0, jobs: 0 },
    color: 'blue'
  },
  {
    id: 'professional',
    name: 'Profesional',
    description: 'Profesional con experiencia comprobada',
    requirements: { reviews: 5, rating: 4.0, jobs: 3 },
    color: 'green'
  },
  {
    id: 'top_rated',
    name: 'Top Rated',
    description: 'Profesional destacado con excelentes reseñas',
    requirements: { reviews: 20, rating: 4.5, jobs: 15 },
    color: 'yellow'
  },
  {
    id: 'top_rated_plus',
    name: 'Top Rated Plus',
    description: 'El más alto nivel de reconocimiento',
    requirements: { reviews: 50, rating: 4.8, jobs: 40 },
    color: 'purple'
  }
] as const;

// Response Times
export const RESPONSE_TIMES = [
  'Menos de 1 hora',
  '1-3 horas', 
  '3-6 horas',
  '6-12 horas',
  '12-24 horas',
  'Más de 24 horas'
] as const;

// Availability Options
export const AVAILABILITY_OPTIONS = [
  {
    id: 'tiempo-completo',
    name: 'Tiempo completo',
    description: 'Lun-Vie 8-18hs'
  },
  {
    id: 'medio-tiempo', 
    name: 'Medio tiempo',
    description: '20h/semana'
  },
  {
    id: 'fines-semana',
    name: 'Solo fines de semana',
    description: 'Sáb-Dom disponible'
  },
  {
    id: 'flexible',
    name: 'Horario flexible',
    description: 'A convenir'
  },
  {
    id: '24-7',
    name: 'Disponible 24/7',
    description: 'Urgencias incluidas'
  }
] as const;

// Experience Levels
export const EXPERIENCE_LEVELS = [
  {
    id: 'menos-1',
    name: 'Menos de 1 año',
    value: 0.5
  },
  {
    id: '1-3',
    name: '1-3 años',
    value: 2
  },
  {
    id: '3-5',
    name: '3-5 años', 
    value: 4
  },
  {
    id: '5-10',
    name: '5-10 años',
    value: 7.5
  },
  {
    id: 'mas-10',
    name: 'Más de 10 años',
    value: 15
  }
] as const;

// Price Ranges
export const PRICE_RANGES = [
  {
    id: 'basico',
    name: 'Básico',
    min: 1000,
    max: 5000,
    description: 'Servicios simples y rápidos'
  },
  {
    id: 'intermedio',
    name: 'Intermedio', 
    min: 5000,
    max: 15000,
    description: 'Proyectos de mediana complejidad'
  },
  {
    id: 'premium',
    name: 'Premium',
    min: 15000,
    max: 50000,
    description: 'Servicios especializados'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    min: 50000,
    max: null,
    description: 'Proyectos grandes y complejos'
  }
] as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  message: {
    name: 'Mensaje',
    icon: 'MessageSquare',
    color: 'blue'
  },
  opportunity: {
    name: 'Oportunidad',
    icon: 'Briefcase', 
    color: 'green'
  },
  review: {
    name: 'Reseña',
    icon: 'Star',
    color: 'yellow'
  },
  system: {
    name: 'Sistema',
    icon: 'AlertCircle',
    color: 'orange'
  },
  payment: {
    name: 'Pago',
    icon: 'CreditCard',
    color: 'purple'
  },
  verification: {
    name: 'Verificación',
    icon: 'CheckCircle',
    color: 'green'
  }
} as const;

// Search Sort Options
export const SORT_OPTIONS = [
  {
    id: 'relevance',
    name: 'Relevancia',
    description: 'Más relevantes primero'
  },
  {
    id: 'rating',
    name: 'Mejor calificados',
    description: 'Mayor rating primero'
  },
  {
    id: 'reviews',
    name: 'Más reseñas',
    description: 'Más experiencia primero'
  },
  {
    id: 'price_asc',
    name: 'Precio: menor a mayor',
    description: 'Más económicos primero'
  },
  {
    id: 'price_desc',
    name: 'Precio: mayor a menor',
    description: 'Más costosos primero'
  },
  {
    id: 'distance',
    name: 'Distancia',
    description: 'Más cercanos primero'
  },
  {
    id: 'newest',
    name: 'Más recientes',
    description: 'Registrados recientemente'
  }
] as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
} as const;

// Validation Rules
export const VALIDATION = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Ingresa un email válido'
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'
  },
  phone: {
    pattern: /^(\+54|0)?[\s\-]?([0-9]{2,4})[\s\-]?([0-9]{6,8})$/,
    message: 'Ingresa un teléfono argentino válido'
  },
  text: {
    minLength: 2,
    maxLength: 255,
    message: 'El texto debe tener entre 2 y 255 caracteres'
  },
  description: {
    minLength: 10,
    maxLength: 2000,
    message: 'La descripción debe tener entre 10 y 2000 caracteres'
  }
} as const;

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password'
  },
  users: {
    profile: '/api/users/profile',
    update: '/api/users/update',
    avatar: '/api/users/avatar',
    delete: '/api/users/delete'
  },
  services: {
    list: '/api/services',
    create: '/api/services',
    detail: '/api/services/:id',
    update: '/api/services/:id',
    delete: '/api/services/:id',
    search: '/api/services/search'
  },
  notifications: {
    list: '/api/notifications',
    markRead: '/api/notifications/:id/read',
    markAllRead: '/api/notifications/mark-all-read',
    delete: '/api/notifications/:id'
  },
  reviews: {
    list: '/api/reviews',
    create: '/api/reviews',
    update: '/api/reviews/:id',
    delete: '/api/reviews/:id'
  }
} as const;

// Social Links
export const SOCIAL_LINKS = {
  whatsapp: `https://wa.me/5402804567890`,
  email: `mailto:${APP_CONFIG.supportEmail}`,
  instagram: 'https://instagram.com/fixia.ar',
  facebook: 'https://facebook.com/fixia.ar',
  linkedin: 'https://linkedin.com/company/fixia-ar'
} as const;

// Feature Flags
export const FEATURES = {
  enableChat: false, // Using WhatsApp instead
  enableVideoCall: false,
  enablePayments: false, // Direct payment, no platform fees
  enableSubscriptions: true,
  enableNotifications: true,
  enableFavorites: true,
  enableReviews: true,
  enableAnalytics: true,
  enableGeoLocation: false, // Privacy focused
  enableSocialLogin: false // Email only for security
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
  network: 'Error de conexión. Verifica tu internet.',
  unauthorized: 'No tienes permisos para realizar esta acción.',
  notFound: 'El recurso solicitado no existe.',
  validation: 'Por favor verifica los datos ingresados.',
  rateLimit: 'Has hecho muchas solicitudes. Intenta en unos minutos.',
  server: 'Error del servidor. Nuestro equipo ha sido notificado.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  saved: 'Cambios guardados correctamente.',
  created: 'Creado exitosamente.',
  updated: 'Actualizado correctamente.',
  deleted: 'Eliminado correctamente.',
  sent: 'Enviado correctamente.',
  login: 'Sesión iniciada exitosamente.',
  logout: 'Sesión cerrada correctamente.',
  register: 'Cuenta creada exitosamente.'
} as const;