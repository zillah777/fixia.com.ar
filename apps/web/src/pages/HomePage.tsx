import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
    ArrowRight, Star, Shield, Clock, Users, CheckCircle,
    Search, Zap, Award, TrendingUp, Globe, Smartphone,
    Palette, Code, PenTool, Camera, Briefcase, HeadphonesIcon,
    Play, ChevronRight, MessageSquare, Heart, Bell, MapPin,
    Crown, Phone, Mail, Gift, CreditCard
} from "lucide-react";
import { OpportunitiesTicker } from "../components/OpportunitiesTicker";
import { FeaturedServicesSection } from "../components/FeaturedServicesSection";
import { TopProfessionalCard } from "../components/TopProfessionalCard";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { professionalsService, userService } from "../lib/services";
import { Skeleton } from "../components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

// Removed hardcoded categories - now fetched from API

function Navigation() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full glass border-b border-white/10"
        >
            <div className="container mx-auto flex h-20 items-center justify-between px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-3">
                    <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
                        </div>
                        <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-xl font-semibold tracking-tight">Fixia</span>
                        <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden lg:flex items-center space-x-8">
                    <Link to="/services" className="text-foreground hover:text-primary transition-colors font-medium">
                        Explorar Servicios
                    </Link>
                    <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                        Planes
                    </Link>
                    <Link to="/how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
                        Cómo Funciona
                    </Link>
                    <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
                        Sobre Nosotros
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    <Link to="/login">
                        <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
                            Iniciar Sesión
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                            <Gift className="h-4 w-4 mr-2" />
                            Únete Gratis
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}

function HeroSection() {
    // Fetch real professional count
    const { data: professionalsCount, isLoading: loadingCount } = useQuery({
        queryKey: ['professionals-count'],
        queryFn: () => userService.getActiveProfessionalsCount(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const displayCount = professionalsCount?.count || 0;

    return (
        <section className="relative py-24 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <Badge className="mb-6 bg-success/20 text-success border-success/30 px-4 py-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            {loadingCount ? (
                                "Chubut, Argentina • Cargando..."
                            ) : (
                                `Chubut, Argentina • ${displayCount} profesionales activos`
                            )}
                        </Badge>

                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
                            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                                Conecta.
                            </span>{" "}
                            <span className="bg-gradient-to-r from-primary-solid to-purple-400 bg-clip-text text-transparent">
                                Confía.
                            </span>{" "}
                            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                                Resuelve.
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                            El primer marketplace de microservicios de la Provincia del Chubut.
                            Conecta con profesionales locales verificados o promociona tus servicios.
                        </p>

                        {/* Launch Promotion Alert */}
                        <Card className="glass border-warning/30 bg-warning/5 mb-8 max-w-2xl mx-auto">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <Gift className="h-5 w-5 text-warning" />
                                    <span className="font-semibold text-warning">¡Promoción de Lanzamiento!</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Primeros 200 usuarios obtienen 1 mes gratis de funcionalidades premium
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link to="/services">
                                <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-8 py-6 text-lg">
                                    <Search className="mr-2 h-5 w-5" />
                                    Buscar Profesionales
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/register?type=professional">
                                <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-8 py-6 text-lg">
                                    <Crown className="mr-2 h-5 w-5" />
                                    Ser Profesional
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground mb-6">
                            <div className="flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-success" />
                                Sin comisiones
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                                Profesionales verificados
                            </div>
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-success" />
                                Contacto directo WhatsApp
                            </div>
                        </div>

                        <Link to="/pricing">
                            <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Ver Planes y Precios
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function CategoriesSection() {
    // Fetch real category stats from API
    const { data: categories, isLoading: loadingCategories } = useQuery({
        queryKey: ['category-stats'],
        queryFn: () => professionalsService.getCategoryStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Set first category as selected when categories load
    if (categories && categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0].category);
    }

    // Fetch real professionals data from API
    const { data: categoryProfessionals, isLoading, isError, refetch } = useQuery({
        queryKey: ['professionals-by-category', selectedCategory],
        queryFn: () => professionalsService.getProfessionalsByCategory(selectedCategory!, 3),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        enabled: !!selectedCategory, // Only run query when category is selected
    });

    return (
        <section className="py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">Servicios Más Solicitados</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Descubre los profesionales más valorados en cada categoría de Chubut
                    </p>
                </motion.div>

                {/* Category Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {loadingCategories ? (
                        [1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="glass border-white/10 p-6">
                                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                                <Skeleton className="h-3 w-20 mx-auto" />
                            </Card>
                        ))
                    ) : categories && categories.length > 0 ? (
                        categories.map((category, index) => {
                            const isSelected = selectedCategory === category.category;
                            return (
                                <motion.div
                                    key={category.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.1 * index }}
                                    whileHover={{ y: -4 }}
                                >
                                    <button
                                        onClick={() => setSelectedCategory(category.category)}
                                        className="block w-full text-left"
                                    >
                                        <Card className={`glass hover:glass-medium transition-all duration-300 cursor-pointer group h-full relative ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-white/10'
                                            }`}>
                                            {category.popular && (
                                                <Badge className="absolute top-3 right-3 bg-primary/20 text-primary border-primary/30 text-xs">
                                                    Popular
                                                </Badge>
                                            )}
                                            <CardContent className="p-6 text-center">
                                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${isSelected ? 'bg-primary/20' : 'bg-primary/10 group-hover:bg-primary/20'
                                                    }`}>
                                                    <Briefcase className="h-8 w-8 text-primary" />
                                                </div>
                                                <h3 className="font-semibold mb-2">{category.category}</h3>
                                                <p className="text-sm text-muted-foreground">{category.count} servicios</p>
                                            </CardContent>
                                        </Card>
                                    </button>
                                </motion.div>
                            );
                        })
                    ) : (
                        <Card className="glass border-white/10 p-12 text-center col-span-full">
                            <p className="text-muted-foreground">
                                No hay categorías disponibles en este momento.
                            </p>
                        </Card>
                    )}
                </div>

                {/* Top Professionals Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">
                                Top de Profesionales mejor valorados por los usuarios
                            </h3>
                            <p className="text-muted-foreground">
                                {selectedCategory} - Los más confiables de Chubut
                            </p>
                        </div>
                        <Link to={`/services?category=${selectedCategory ? encodeURIComponent(selectedCategory) : ''}`}>
                            <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                                Ver Todos
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="glass border-white/10 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-20 w-full mb-4" />
                                    <Skeleton className="h-4 w-full" />
                                </Card>
                            ))}
                        </div>
                    ) : isError ? (
                        <Card className="glass border-white/10 p-12 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Error al cargar profesionales</h3>
                            <p className="text-muted-foreground mb-4">
                                No pudimos cargar los profesionales. Por favor, intenta nuevamente.
                            </p>
                            <Button onClick={() => refetch()} variant="outline" className="glass border-white/20">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reintentar
                            </Button>
                        </Card>
                    ) : categoryProfessionals && categoryProfessionals.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryProfessionals.map((professional, index) => (
                                <TopProfessionalCard
                                    key={professional.id}
                                    professional={professional}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="glass border-white/10 p-12 text-center">
                            <p className="text-muted-foreground">
                                No hay profesionales destacados en esta categoría aún.
                            </p>
                        </Card>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center"
                >
                    <Link to="/services">
                        <Button variant="outline" className="glass border-white/20 hover:glass-medium px-8">
                            Explorar Todas las Categorías
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            title: "Busca lo que necesitas",
            description: "Explora profesionales por categoría o crea una alerta para que te contacten",
            icon: Search
        },
        {
            number: "02",
            title: "Conecta de forma segura",
            description: "Revisa perfiles verificados con insignias de calidad y reputación comprobada",
            icon: Users
        },
        {
            number: "03",
            title: "Contacta por WhatsApp",
            description: "Acuerda directamente con el profesional sin intermediarios ni comisiones",
            icon: MessageSquare
        }
    ];

    return (
        <section id="como-funciona" className="py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">Cómo Funciona Fixia</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Un proceso simple, seguro y sin comisiones para conectar con los mejores
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                            >
                                <Card className="glass border-white/10 text-center h-full">
                                    <CardContent className="p-8">
                                        <div className="relative mb-6">
                                            <div className="h-20 w-20 liquid-gradient rounded-2xl flex items-center justify-center mx-auto">
                                                <Icon className="h-10 w-10 text-white" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 h-8 w-8 bg-background rounded-full border-2 border-primary/30 flex items-center justify-center">
                                                <span className="text-sm font-bold text-primary">{step.number}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <Link to="/how-it-works">
                        <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-8 mr-4">
                            Ver Proceso Completo
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8">
                            Comenzar Ahora Gratis
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <Card className="glass border-white/10 overflow-hidden">
                        <CardContent className="p-12 text-center">
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-4xl font-bold mb-6">
                                    ¿Listo para conectar con los mejores profesionales de Chubut?
                                </h2>
                                <p className="text-xl text-muted-foreground mb-8">
                                    Únete a la revolución del marketplace local. Sin comisiones,
                                    con profesionales verificados y contacto directo.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link to="/register">
                                        <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-8">
                                            <Users className="mr-2 h-5 w-5" />
                                            Buscar Profesionales
                                        </Button>
                                    </Link>
                                    <Link to="/register?type=professional">
                                        <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium px-8">
                                            <Crown className="mr-2 h-5 w-5" />
                                            Ser Profesional
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground">
                                    <span>✨ Sin comisiones</span>
                                    <span>🛡️ Profesionales verificados</span>
                                    <span>📱 Contacto directo WhatsApp</span>
                                    <span>🎯 Matchmaking inteligente</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="py-16 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-semibold">Fixia</span>
                                <span className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</span>
                            </div>
                        </Link>
                        <p className="text-muted-foreground">
                            El marketplace #1 de microservicios profesionales de la Provincia del Chubut.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <a
                                href="https://www.google.com/maps/place/Chubut,+Argentina"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                            >
                                Chubut, Argentina
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Plataforma</h4>
                        <div className="space-y-2">
                            <Link to="/services" className="block text-muted-foreground hover:text-primary transition-colors">
                                Buscar Profesionales
                            </Link>
                            <Link to="/pricing" className="block text-muted-foreground hover:text-primary transition-colors">
                                Planes y Precios
                            </Link>
                            <Link to="/register?type=professional" className="block text-muted-foreground hover:text-primary transition-colors">
                                Ser Profesional
                            </Link>
                            <Link to="/register" className="block text-muted-foreground hover:text-primary transition-colors">
                                Registrarse Gratis
                            </Link>
                            <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                                Sobre Nosotros
                            </Link>
                            <Link to="/how-it-works" className="block text-muted-foreground hover:text-primary transition-colors">
                                Cómo Funciona
                            </Link>
                        </div>
                    </div>

                    {/* Soporte */}
                    <div>
                        <h4 className="font-semibold mb-4">Soporte</h4>
                        <div className="space-y-2">
                            <Link to="/help" className="block text-muted-foreground hover:text-primary transition-colors">
                                Centro de Ayuda
                            </Link>
                            <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                                Contactar Soporte
                            </Link>
                            <a href="https://wa.me/5492804874166" className="block text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </a>
                            <a href="mailto:soporte@fixia.com.ar" className="block text-muted-foreground hover:text-primary transition-colors">
                                Email Soporte
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>soporte@fixia.com.ar</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>+54 280 4874166</span>
                            </div>
                            <p className="text-sm">Disponible Lun-Vie 9-18hs</p>
                            <Link to="/contact" className="text-primary hover:underline text-sm">
                                Página de Contacto →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="text-muted-foreground text-center md:text-left">
                        <p>&copy; 2025 Fixia. Todos los derechos reservados. Hecho en Chubut, Argentina 🇦🇷</p>
                        <p className="text-sm mt-1">MMATA</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                            Privacidad
                        </Link>
                        <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                            Términos
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <OpportunitiesTicker />
            <HeroSection />
            <CategoriesSection />
            <FeaturedServicesSection />
            <HowItWorksSection />
            <CTASection />
            <Footer />
        </div>
    );
}
