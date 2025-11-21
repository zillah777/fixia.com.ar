/**
 * Simulated Professional Data for Chubut, Argentina
 * This data represents top-rated professionals in each category
 * All data is pre-sanitized and validated for security
 */

import { SimulatedProfessional, CategoryProfessionals } from '@/types/professional';

// Chubut locations
const CHUBUT_LOCATIONS = [
    'Rawson, Chubut',
    'Trelew, Chubut',
    'Puerto Madryn, Chubut',
    'Comodoro Rivadavia, Chubut',
    'Esquel, Chubut',
    'Gaiman, Chubut',
    'Dolavon, Chubut',
    'Puerto Pirámides, Chubut'
];

// Avatar placeholder service (CSP-compliant)
const getAvatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

/**
 * Simulated professionals data organized by category
 * Each category has 3-4 top-rated professionals
 */
export const SIMULATED_PROFESSIONALS: CategoryProfessionals[] = [
    {
        category: 'Desarrollo Web',
        professionals: [
            {
                id: 'dev-001',
                name: 'Martín Rodríguez',
                avatar: getAvatar('martin-rodriguez'),
                location: CHUBUT_LOCATIONS[2], // Puerto Madryn
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 47,
                    level: 'Experto',
                    years_experience: 8,
                    completed_jobs: 52,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-dev-001',
                    title: 'Desarrollo de Sitios Web Profesionales',
                    description: 'Sitios web modernos y responsivos con React, Next.js y TypeScript. Optimizados para SEO y rendimiento.',
                    price_min: 150000,
                    price_max: 500000,
                    currency: 'ARS',
                    delivery_time_days: 14,
                    category: 'Desarrollo Web'
                },
                specialties: ['React', 'Next.js', 'TypeScript', 'Node.js'],
                bio: 'Desarrollador Full Stack especializado en aplicaciones web modernas. 8 años de experiencia creando soluciones digitales para empresas de Chubut.'
            },
            {
                id: 'dev-002',
                name: 'Carolina Fernández',
                avatar: getAvatar('carolina-fernandez'),
                location: CHUBUT_LOCATIONS[1], // Trelew
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 35,
                    level: 'Experto',
                    years_experience: 6,
                    completed_jobs: 41,
                    response_time_hours: 3
                },
                service: {
                    id: 'svc-dev-002',
                    title: 'E-commerce y Tiendas Online',
                    description: 'Desarrollo de tiendas online completas con carrito de compras, pasarela de pagos y panel de administración.',
                    price_min: 200000,
                    price_max: 600000,
                    currency: 'ARS',
                    delivery_time_days: 21,
                    category: 'Desarrollo Web'
                },
                specialties: ['E-commerce', 'WordPress', 'WooCommerce', 'Shopify'],
                bio: 'Especialista en comercio electrónico. He ayudado a más de 30 negocios de Chubut a vender online.'
            },
            {
                id: 'dev-003',
                name: 'Lucas Gómez',
                avatar: getAvatar('lucas-gomez'),
                location: CHUBUT_LOCATIONS[3], // Comodoro Rivadavia
                verified: true,
                professional_profile: {
                    rating: 4.7,
                    review_count: 28,
                    level: 'Intermedio',
                    years_experience: 4,
                    completed_jobs: 33,
                    response_time_hours: 4
                },
                service: {
                    id: 'svc-dev-003',
                    title: 'Landing Pages de Alta Conversión',
                    description: 'Páginas de aterrizaje optimizadas para convertir visitantes en clientes. Diseño moderno y carga rápida.',
                    price_min: 80000,
                    price_max: 200000,
                    currency: 'ARS',
                    delivery_time_days: 7,
                    category: 'Desarrollo Web'
                },
                specialties: ['Landing Pages', 'SEO', 'Google Ads', 'Analytics'],
                bio: 'Creador de landing pages que convierten. Especializado en optimización de conversión y marketing digital.'
            }
        ]
    },
    {
        category: 'Diseño Gráfico',
        professionals: [
            {
                id: 'design-001',
                name: 'Sofía Álvarez',
                avatar: getAvatar('sofia-alvarez'),
                location: CHUBUT_LOCATIONS[0], // Rawson
                verified: true,
                professional_profile: {
                    rating: 5.0,
                    review_count: 62,
                    level: 'Elite',
                    years_experience: 10,
                    completed_jobs: 78,
                    response_time_hours: 1
                },
                service: {
                    id: 'svc-design-001',
                    title: 'Diseño de Identidad de Marca Completa',
                    description: 'Creación de identidad visual profesional: logo, paleta de colores, tipografías, manual de marca y aplicaciones.',
                    price_min: 120000,
                    price_max: 350000,
                    currency: 'ARS',
                    delivery_time_days: 10,
                    category: 'Diseño Gráfico'
                },
                specialties: ['Branding', 'Identidad Visual', 'Ilustración', 'Adobe Creative Suite'],
                bio: 'Diseñadora gráfica con 10 años de experiencia. He trabajado con más de 60 marcas de Chubut creando identidades memorables.'
            },
            {
                id: 'design-002',
                name: 'Diego Morales',
                avatar: getAvatar('diego-morales'),
                location: CHUBUT_LOCATIONS[2], // Puerto Madryn
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 45,
                    level: 'Experto',
                    years_experience: 7,
                    completed_jobs: 53,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-design-002',
                    title: 'Diseño de Redes Sociales y Marketing',
                    description: 'Piezas gráficas para Instagram, Facebook, LinkedIn. Posts, stories, banners y contenido visual atractivo.',
                    price_min: 50000,
                    price_max: 150000,
                    currency: 'ARS',
                    delivery_time_days: 5,
                    category: 'Diseño Gráfico'
                },
                specialties: ['Social Media', 'Marketing Digital', 'Canva', 'Photoshop'],
                bio: 'Especialista en contenido visual para redes sociales. Ayudo a marcas a destacar en el mundo digital.'
            },
            {
                id: 'design-003',
                name: 'Valentina Castro',
                avatar: getAvatar('valentina-castro'),
                location: CHUBUT_LOCATIONS[4], // Esquel
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 38,
                    level: 'Experto',
                    years_experience: 6,
                    completed_jobs: 44,
                    response_time_hours: 3
                },
                service: {
                    id: 'svc-design-003',
                    title: 'Diseño Editorial y Publicaciones',
                    description: 'Diseño de revistas, catálogos, folletos, menús y material impreso de alta calidad.',
                    price_min: 70000,
                    price_max: 250000,
                    currency: 'ARS',
                    delivery_time_days: 8,
                    category: 'Diseño Gráfico'
                },
                specialties: ['Diseño Editorial', 'InDesign', 'Maquetación', 'Impresión'],
                bio: 'Diseñadora editorial con pasión por el detalle. Transformo ideas en publicaciones profesionales.'
            }
        ]
    },
    {
        category: 'Reparaciones',
        professionals: [
            {
                id: 'repair-001',
                name: 'Roberto Sánchez',
                avatar: getAvatar('roberto-sanchez'),
                location: CHUBUT_LOCATIONS[1], // Trelew
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 89,
                    level: 'Elite',
                    years_experience: 15,
                    completed_jobs: 124,
                    response_time_hours: 1
                },
                service: {
                    id: 'svc-repair-001',
                    title: 'Reparación de Electrodomésticos',
                    description: 'Reparación de heladeras, lavarropas, cocinas, microondas y todo tipo de electrodomésticos. Servicio a domicilio.',
                    price_min: 8000,
                    price_max: 50000,
                    currency: 'ARS',
                    delivery_time_days: 1,
                    category: 'Reparaciones'
                },
                specialties: ['Electrodomésticos', 'Refrigeración', 'Electricidad', 'Diagnóstico'],
                bio: 'Técnico en electrodomésticos con 15 años de experiencia. Servicio rápido y garantizado en toda la zona.'
            },
            {
                id: 'repair-002',
                name: 'Javier Pereyra',
                avatar: getAvatar('javier-pereyra'),
                location: CHUBUT_LOCATIONS[3], // Comodoro Rivadavia
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 72,
                    level: 'Experto',
                    years_experience: 12,
                    completed_jobs: 95,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-repair-002',
                    title: 'Plomería y Gasista Matriculado',
                    description: 'Instalación y reparación de cañerías, grifería, calefones, termotanques. Gasista matriculado.',
                    price_min: 10000,
                    price_max: 80000,
                    currency: 'ARS',
                    delivery_time_days: 1,
                    category: 'Reparaciones'
                },
                specialties: ['Plomería', 'Gas', 'Calefacción', 'Instalaciones'],
                bio: 'Plomero y gasista matriculado. Soluciones rápidas y seguras para tu hogar o negocio.'
            },
            {
                id: 'repair-003',
                name: 'Marcelo Díaz',
                avatar: getAvatar('marcelo-diaz'),
                location: CHUBUT_LOCATIONS[2], // Puerto Madryn
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 65,
                    level: 'Experto',
                    years_experience: 10,
                    completed_jobs: 81,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-repair-003',
                    title: 'Electricista Matriculado',
                    description: 'Instalaciones eléctricas, tableros, iluminación, reparaciones. Certificado de instalación eléctrica.',
                    price_min: 12000,
                    price_max: 100000,
                    currency: 'ARS',
                    delivery_time_days: 2,
                    category: 'Reparaciones'
                },
                specialties: ['Electricidad', 'Tableros', 'Iluminación', 'Certificaciones'],
                bio: 'Electricista matriculado con 10 años de experiencia. Trabajos seguros y certificados.'
            }
        ]
    },
    {
        category: 'Marketing Digital',
        professionals: [
            {
                id: 'marketing-001',
                name: 'Florencia Ruiz',
                avatar: getAvatar('florencia-ruiz'),
                location: CHUBUT_LOCATIONS[2], // Puerto Madryn
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 41,
                    level: 'Experto',
                    years_experience: 7,
                    completed_jobs: 48,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-marketing-001',
                    title: 'Gestión de Redes Sociales Profesional',
                    description: 'Administración completa de redes sociales: contenido, diseño, programación, interacción y reportes mensuales.',
                    price_min: 80000,
                    price_max: 200000,
                    currency: 'ARS',
                    delivery_time_days: 30,
                    category: 'Marketing Digital'
                },
                specialties: ['Social Media', 'Community Management', 'Estrategia Digital', 'Meta Ads'],
                bio: 'Community Manager certificada. Ayudo a negocios a crecer en redes sociales con estrategias efectivas.'
            },
            {
                id: 'marketing-002',
                name: 'Sebastián Torres',
                avatar: getAvatar('sebastian-torres'),
                location: CHUBUT_LOCATIONS[3], // Comodoro Rivadavia
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 33,
                    level: 'Experto',
                    years_experience: 6,
                    completed_jobs: 39,
                    response_time_hours: 3
                },
                service: {
                    id: 'svc-marketing-002',
                    title: 'Campañas de Google Ads y SEO',
                    description: 'Creación y optimización de campañas en Google Ads. Posicionamiento SEO para aparecer en primeros resultados.',
                    price_min: 100000,
                    price_max: 300000,
                    currency: 'ARS',
                    delivery_time_days: 15,
                    category: 'Marketing Digital'
                },
                specialties: ['Google Ads', 'SEO', 'SEM', 'Analytics'],
                bio: 'Especialista en marketing de búsqueda. Certificado por Google en Ads y Analytics.'
            }
        ]
    },
    {
        category: 'Consultoría',
        professionals: [
            {
                id: 'consulting-001',
                name: 'Patricia Méndez',
                avatar: getAvatar('patricia-mendez'),
                location: CHUBUT_LOCATIONS[0], // Rawson
                verified: true,
                professional_profile: {
                    rating: 5.0,
                    review_count: 38,
                    level: 'Elite',
                    years_experience: 12,
                    completed_jobs: 45,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-consulting-001',
                    title: 'Consultoría Contable y Tributaria',
                    description: 'Asesoramiento contable, liquidación de impuestos, monotributo, autónomos. Contador público matriculado.',
                    price_min: 50000,
                    price_max: 200000,
                    currency: 'ARS',
                    delivery_time_days: 7,
                    category: 'Consultoría'
                },
                specialties: ['Contabilidad', 'Impuestos', 'Monotributo', 'AFIP'],
                bio: 'Contadora pública con 12 años de experiencia. Simplifico tus obligaciones fiscales y contables.'
            },
            {
                id: 'consulting-002',
                name: 'Gustavo Herrera',
                avatar: getAvatar('gustavo-herrera'),
                location: CHUBUT_LOCATIONS[1], // Trelew
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 29,
                    level: 'Experto',
                    years_experience: 9,
                    completed_jobs: 34,
                    response_time_hours: 3
                },
                service: {
                    id: 'svc-consulting-002',
                    title: 'Asesoría Legal para Empresas',
                    description: 'Asesoramiento legal comercial, contratos, constitución de sociedades, trámites legales.',
                    price_min: 80000,
                    price_max: 300000,
                    currency: 'ARS',
                    delivery_time_days: 10,
                    category: 'Consultoría'
                },
                specialties: ['Derecho Comercial', 'Contratos', 'Sociedades', 'Asesoría Legal'],
                bio: 'Abogado especializado en derecho comercial. Protejo los intereses de tu negocio.'
            }
        ]
    },
    {
        category: 'Limpieza',
        professionals: [
            {
                id: 'cleaning-001',
                name: 'María González',
                avatar: getAvatar('maria-gonzalez'),
                location: CHUBUT_LOCATIONS[2], // Puerto Madryn
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 94,
                    level: 'Elite',
                    years_experience: 8,
                    completed_jobs: 156,
                    response_time_hours: 1
                },
                service: {
                    id: 'svc-cleaning-001',
                    title: 'Limpieza Profunda de Hogares',
                    description: 'Servicio de limpieza profunda para hogares. Incluye cocina, baños, pisos, ventanas y desinfección.',
                    price_min: 15000,
                    price_max: 40000,
                    currency: 'ARS',
                    delivery_time_days: 1,
                    category: 'Limpieza'
                },
                specialties: ['Limpieza Profunda', 'Desinfección', 'Organización', 'Mudanzas'],
                bio: 'Servicio de limpieza profesional con personal capacitado. Tu hogar impecable garantizado.'
            },
            {
                id: 'cleaning-002',
                name: 'Laura Benítez',
                avatar: getAvatar('laura-benitez'),
                location: CHUBUT_LOCATIONS[1], // Trelew
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 76,
                    level: 'Experto',
                    years_experience: 6,
                    completed_jobs: 112,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-cleaning-002',
                    title: 'Limpieza de Oficinas y Comercios',
                    description: 'Limpieza profesional para oficinas, locales comerciales y espacios corporativos. Servicio diario o semanal.',
                    price_min: 25000,
                    price_max: 80000,
                    currency: 'ARS',
                    delivery_time_days: 1,
                    category: 'Limpieza'
                },
                specialties: ['Limpieza Comercial', 'Oficinas', 'Mantenimiento', 'Desinfección'],
                bio: 'Especialistas en limpieza comercial. Mantenemos tu espacio de trabajo impecable.'
            }
        ]
    },
    {
        category: 'Jardinería',
        professionals: [
            {
                id: 'garden-001',
                name: 'Carlos Vega',
                avatar: getAvatar('carlos-vega'),
                location: CHUBUT_LOCATIONS[0], // Rawson
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 52,
                    level: 'Experto',
                    years_experience: 11,
                    completed_jobs: 68,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-garden-001',
                    title: 'Mantenimiento de Jardines y Parques',
                    description: 'Corte de césped, poda de árboles y arbustos, diseño de jardines, riego automático.',
                    price_min: 12000,
                    price_max: 50000,
                    currency: 'ARS',
                    delivery_time_days: 2,
                    category: 'Jardinería'
                },
                specialties: ['Jardinería', 'Poda', 'Diseño de Jardines', 'Riego'],
                bio: 'Jardinero profesional con 11 años de experiencia. Transformo espacios verdes en lugares hermosos.'
            },
            {
                id: 'garden-002',
                name: 'Adriana Silva',
                avatar: getAvatar('adriana-silva'),
                location: CHUBUT_LOCATIONS[4], // Esquel
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 41,
                    level: 'Experto',
                    years_experience: 8,
                    completed_jobs: 54,
                    response_time_hours: 3
                },
                service: {
                    id: 'svc-garden-002',
                    title: 'Paisajismo y Diseño de Espacios Verdes',
                    description: 'Diseño y creación de jardines personalizados. Selección de plantas, distribución y decoración.',
                    price_min: 30000,
                    price_max: 150000,
                    currency: 'ARS',
                    delivery_time_days: 7,
                    category: 'Jardinería'
                },
                specialties: ['Paisajismo', 'Diseño', 'Plantas Nativas', 'Decoración'],
                bio: 'Paisajista especializada en jardines sustentables con plantas nativas de la Patagonia.'
            }
        ]
    },
    {
        category: 'Educación',
        professionals: [
            {
                id: 'education-001',
                name: 'Profesora Ana Martínez',
                avatar: getAvatar('ana-martinez'),
                location: CHUBUT_LOCATIONS[1], // Trelew
                verified: true,
                professional_profile: {
                    rating: 5.0,
                    review_count: 67,
                    level: 'Elite',
                    years_experience: 14,
                    completed_jobs: 89,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-education-001',
                    title: 'Clases Particulares de Matemática',
                    description: 'Clases de matemática para primaria, secundaria y preparación para exámenes. Presencial y online.',
                    price_min: 5000,
                    price_max: 15000,
                    currency: 'ARS',
                    delivery_time_days: 1,
                    category: 'Educación'
                },
                specialties: ['Matemática', 'Álgebra', 'Geometría', 'Preparación Exámenes'],
                bio: 'Profesora de matemática con 14 años de experiencia. Ayudo a estudiantes a superar sus dificultades.'
            },
            {
                id: 'education-002',
                name: 'Profesor Miguel Ramos',
                avatar: getAvatar('miguel-ramos'),
                location: CHUBUT_LOCATIONS[2], // Puerto Madryn
                verified: true,
                professional_profile: {
                    rating: 4.9,
                    review_count: 54,
                    level: 'Experto',
                    years_experience: 10,
                    completed_jobs: 71,
                    response_time_hours: 3
                },
                service: {
                    id: 'svc-education-002',
                    title: 'Clases de Inglés Todos los Niveles',
                    description: 'Clases de inglés personalizadas para todos los niveles. Preparación para exámenes internacionales.',
                    price_min: 6000,
                    price_max: 18000,
                    currency: 'ARS',
                    delivery_time_days: 1,
                    category: 'Educación'
                },
                specialties: ['Inglés', 'TOEFL', 'Cambridge', 'Conversación'],
                bio: 'Profesor de inglés certificado. Método dinámico y efectivo para aprender el idioma.'
            },
            {
                id: 'education-003',
                name: 'Profesora Lucía Campos',
                avatar: getAvatar('lucia-campos'),
                location: CHUBUT_LOCATIONS[3], // Comodoro Rivadavia
                verified: true,
                professional_profile: {
                    rating: 4.8,
                    review_count: 43,
                    level: 'Experto',
                    years_experience: 8,
                    completed_jobs: 58,
                    response_time_hours: 2
                },
                service: {
                    id: 'svc-education-003',
                    title: 'Apoyo Escolar Integral',
                    description: 'Apoyo escolar en todas las materias para nivel primario y secundario. Técnicas de estudio y organización.',
                    price_min: 4500,
                    price_max: 12000,
                    currency: 'ARS',
                    delivery_time_days: 1,
                    category: 'Educación'
                },
                specialties: ['Apoyo Escolar', 'Técnicas de Estudio', 'Organización', 'Motivación'],
                bio: 'Maestra con vocación. Ayudo a estudiantes a alcanzar su máximo potencial académico.'
            }
        ]
    }
];

/**
 * Get top professionals for a specific category
 * @param category - Category name
 * @returns Array of professionals for that category
 */
export const getProfessionalsByCategory = (category: string): SimulatedProfessional[] => {
    const categoryData = SIMULATED_PROFESSIONALS.find(c => c.category === category);
    return categoryData?.professionals || [];
};

/**
 * Get all categories with their professionals
 * @returns Array of all category-professional mappings
 */
export const getAllCategoryProfessionals = (): CategoryProfessionals[] => {
    return SIMULATED_PROFESSIONALS;
};

/**
 * Get a random selection of top professionals across all categories
 * @param limit - Maximum number of professionals to return
 * @returns Array of random top professionals
 */
export const getRandomTopProfessionals = (limit: number = 6): SimulatedProfessional[] => {
    const allProfessionals = SIMULATED_PROFESSIONALS.flatMap(c => c.professionals);
    const shuffled = [...allProfessionals].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
};
