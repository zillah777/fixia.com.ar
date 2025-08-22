# Modelo de Datos - Fixia

**Marketplace de microservicios profesionales de Chubut**  
**Fecha**: 21 agosto 2025

## 🎯 Resumen Ejecutivo

Modelo de datos normalizado para marketplace que conecta clientes con profesionales verificados de Chubut, sin comisiones y con contacto directo por WhatsApp.

## 📊 Entidades Principales

### 1. Users (Usuarios)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    user_type ENUM('client', 'professional') NOT NULL,
    location VARCHAR(255), -- Ubicación específica en Chubut
    verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_verified ON users(verified);
```

### 2. Professional_Profiles (Perfiles Profesionales)
```sql
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialties TEXT[], -- Array de especialidades
    years_experience INTEGER,
    level ENUM('Nuevo', 'Profesional Verificado', 'Top Rated Plus', 'Técnico Certificado') DEFAULT 'Nuevo',
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0.0,
    availability_status ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    response_time_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_prof_user_id ON professional_profiles(user_id);
CREATE INDEX idx_prof_rating ON professional_profiles(rating DESC);
CREATE INDEX idx_prof_level ON professional_profiles(level);
```

### 3. Categories (Categorías)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- Lucide icon name
    popular BOOLEAN DEFAULT false,
    service_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Datos iniciales identificados del código
INSERT INTO categories (name, slug, icon, popular, service_count) VALUES
('Desarrollo Web', 'desarrollo-web', 'Globe', true, 120),
('Diseño Gráfico', 'diseno-grafico', 'Palette', true, 95),
('Reparaciones', 'reparaciones', 'Briefcase', true, 180),
('Marketing Digital', 'marketing-digital', 'TrendingUp', false, 75),
('Consultoría', 'consultoria', 'HeadphonesIcon', false, 65),
('Limpieza', 'limpieza', 'Users', true, 210),
('Jardinería', 'jardineria', 'Camera', false, 85),
('Educación', 'educacion', 'PenTool', false, 45);
```

### 4. Services (Servicios)
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    main_image VARCHAR(500),
    gallery TEXT[], -- Array de URLs de imágenes
    tags TEXT[],
    delivery_time_days INTEGER,
    revisions_included INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_services_professional ON services(professional_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_price ON services(price);
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_services_featured ON services(featured);
```

### 5. Projects (Proyectos de Clientes)
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    deadline DATE,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    location VARCHAR(255),
    skills_required TEXT[],
    proposals_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_budget ON projects(budget_min, budget_max);
```

### 6. Proposals (Propuestas de Profesionales)
```sql
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    quoted_price DECIMAL(12,2) NOT NULL,
    delivery_time_days INTEGER NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, professional_id)
);
```

### 7. Reviews (Reseñas)
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_professional ON reviews(professional_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
```

### 8. Conversations (Conversaciones)
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
    whatsapp_chat_url VARCHAR(500), -- Link directo a WhatsApp
    status ENUM('active', 'archived') DEFAULT 'active',
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Notifications (Notificaciones)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type ENUM('new_project', 'proposal_received', 'review_received', 'message', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. User_Sessions (Sesiones JWT)
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔗 Relaciones Principales

### Diagrama ER Conceptual
```
Users (1:1) Professional_Profiles
Users (1:N) Services  
Users (1:N) Projects
Users (1:N) Reviews (como reviewer)
Users (1:N) Reviews (como professional)
Categories (1:N) Services
Categories (1:N) Projects  
Projects (1:N) Proposals
Services (1:N) Reviews
Projects (1:1) Conversations
```

### Claves Foráneas y Constraints
```sql
-- Constraint para professional_profiles
ALTER TABLE professional_profiles 
ADD CONSTRAINT check_user_is_professional 
CHECK ((SELECT user_type FROM users WHERE id = user_id) = 'professional');

-- Constraint para projects  
ALTER TABLE projects
ADD CONSTRAINT check_user_is_client
CHECK ((SELECT user_type FROM users WHERE id = client_id) = 'client');

-- Constraint para proposals
ALTER TABLE proposals
ADD CONSTRAINT check_proposal_professional
CHECK ((SELECT user_type FROM users WHERE id = professional_id) = 'professional');
```

## 📈 Optimizaciones y Performance

### Índices Compuestos
```sql
-- Para búsquedas de servicios por ubicación y categoría
CREATE INDEX idx_services_location_category ON services(category_id) 
INCLUDE (price, professional_id) WHERE active = true;

-- Para dashboard de profesionales
CREATE INDEX idx_professional_dashboard ON services(professional_id, created_at DESC) 
WHERE active = true;

-- Para matching de proyectos
CREATE INDEX idx_project_matching ON projects(category_id, status, budget_min, budget_max) 
WHERE status = 'open';
```

### Triggers para Mantenimiento
```sql
-- Actualizar rating promedio automáticamente
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE professional_profiles 
    SET rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE professional_id = NEW.professional_id
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE professional_id = NEW.professional_id
    )
    WHERE user_id = NEW.professional_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_professional_rating();
```

## 🛡️ Seguridad y Validaciones

### Políticas RLS (Row Level Security)
```sql
-- Usuarios solo pueden ver sus propios datos sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_own_data ON users
FOR ALL USING (auth.uid() = id);

-- Profesionales solo pueden editar sus servicios
CREATE POLICY services_professional_edit ON services  
FOR UPDATE USING (professional_id = auth.uid());
```

### Encriptación de Datos Sensibles
```sql
-- WhatsApp numbers encriptados
ALTER TABLE users ADD COLUMN whatsapp_encrypted BYTEA;
ALTER TABLE professional_profiles ADD COLUMN phone_encrypted BYTEA;
```

## 📊 Analytics y Métricas

### Tablas de Analytics
```sql
CREATE TABLE service_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id),
    viewer_id UUID REFERENCES users(id), -- Nullable para anónimos  
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Migraciones y Seeds

### Datos de Prueba (Seeds)
```sql
-- Profesionales destacados del código
INSERT INTO users (email, name, user_type, location, verified) VALUES
('carlos@example.com', 'Carlos Rodríguez', 'professional', 'Rawson, Chubut', true),
('ana@example.com', 'Ana Martínez', 'professional', 'Puerto Madryn, Chubut', true),
('miguel@example.com', 'Miguel Santos', 'professional', 'Comodoro Rivadavia, Chubut', true);

-- Servicios destacados del código  
INSERT INTO services (title, description, price, category_id, professional_id) VALUES
('Desarrollo Web Completo', 'Sitios web profesionales y e-commerce con tecnologías modernas', 25000, category_web_id, carlos_id),
('Identidad Visual Premium', 'Logo, branding completo y diseño gráfico para tu empresa', 15000, category_design_id, ana_id),
('Reparación de Electrodomésticos', 'Servicio técnico especializado con garantía incluida', 3500, category_repair_id, miguel_id);
```

## 🔄 Backup y Disaster Recovery

### Estrategia de Backup
- **Backup completo**: Diario a las 02:00 AM ART
- **Backup incremental**: Cada 6 horas  
- **Retención**: 30 días para backups diarios, 1 año para backups semanales
- **Replicación**: Read replica en diferente región para disaster recovery

### Scripts de Mantenimiento
```sql
-- Limpieza de sesiones expiradas
DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '7 days';

-- Actualización de contadores de categorías
UPDATE categories SET service_count = (
    SELECT COUNT(*) FROM services 
    WHERE category_id = categories.id AND active = true
);
```

---
**Modelo optimizado para**: PostgreSQL 15+, compatible con Railway  
**Última actualización**: 21 agosto 2025