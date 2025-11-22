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
import {
    ResponsiveButton,
    ResponsiveCard,
    ResponsiveCardContent,
    ResponsiveCardHeader,
    ResponsiveCardTitle,
    ResponsiveGrid,
    ResponsiveGridItem,
} from "../components/design-system";

// Removed hardcoded categories - now fetched from API

function Navigation() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full glass border-b border-white/10"
        >
            <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-6">
                {/* Logo - Responsive sizing */}
                <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
                        </div>
                        <div className="absolute -inset-1 liquid-gradient rounded-lg sm:rounded-xl blur opacity-20 animate-pulse-slow"></div>
                    </motion.div>
                    <div className="flex flex-col flex-shrink-0">
                        <span className="text-base sm:text-xl font-semibold tracking-tight">Fixia</span>
                        <span className="text-xs text-muted-foreground -mt-0.5">Conecta. Confía. Resuelve.</span>
                    </div>
                </Link>

                {/* Navigation - Hidden on mobile, shown on lg+ */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link to="/services" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
                        Explorar Servicios
                    </Link>
                    <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors text-sm">
                        Planes
                    </Link>
                    <Link to="/how-it-works" className="text-foreground/80 hover:text-foreground transition-colors text-sm">
                        Cómo Funciona
                    </Link>
                    <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors text-sm">
                        Sobre Nosotros
                    </Link>
                </nav>

                {/* Actions - Responsive spacing and sizing */}
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <Link to="/login">
                        <Button variant="ghost" size="sm" className="hidden sm:inline-flex hover:glass-medium transition-all duration-300">
                            Iniciar Sesión
                        </Button>
                    </Link>
                    <Link to="/register">
                        <ResponsiveButton size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                            <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Únete Gratis</span>
                            <span className="sm:hidden">Únete</span>
                        </ResponsiveButton>
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
        <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="space-y-4 sm:space-y-6 lg:space-y-8"
                    >
                        {/* Badge - Responsive */}
                        <Badge className="mb-4 sm:mb-6 inline-flex bg-success/20 text-success border-success/30 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                            {loadingCount ? (
                                "Chubut, Argentina • Cargando..."
                            ) : (
                                `Chubut, Argentina • ${displayCount} profesionales activos`
                            )}
                        </Badge>

                        {/* Hero Title - Fluid typography scaling */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight">
                            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent block sm:inline">
                                Conecta.{" "}
                            </span>
                            <span className="bg-gradient-to-r from-primary-solid to-purple-400 bg-clip-text text-transparent block sm:inline">
                                Confía.{" "}
                            </span>
                            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent block sm:inline">
                                Resuelve.
                            </span>
                        </h1>

                        {/* Subtitle - Responsive text sizing */}
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
                            El primer marketplace de microservicios de la Provincia del Chubut.
                            Conecta con profesionales locales verificados o promociona tus servicios.
                        </p>

                        {/* Launch Promotion Alert - Responsive */}
                        <Card className="glass border-warning/30 bg-warning/5 mb-4 sm:mb-8 max-w-2xl mx-auto mx-2">
                            <CardContent className="p-3 sm:p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-0">
                                    <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-warning flex-shrink-0" />
                                    <span className="font-semibold text-warning text-sm sm:text-base">¡Promoción de Lanzamiento!</span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-1">
                                    Primeros 200 usuarios obtienen 1 mes gratis de funcionalidades premium
                                </p>
                            </CardContent>
                        </Card>

                        {/* CTA Buttons - Responsive stacking and sizing */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
                            <Link to="/services" className="flex-1 sm:flex-none">
                                <ResponsiveButton size="lg" className="w-full sm:w-auto liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    <span className="hidden sm:inline">Buscar Profesionales</span>
                                    <span className="sm:hidden">Buscar</span>
                                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                                </ResponsiveButton>
                            </Link>
                            <Link to="/register?type=professional" className="flex-1 sm:flex-none">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto glass border-white/20 hover:glass-medium">
                                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    <span className="hidden sm:inline">Ser Profesional</span>
                                    <span className="sm:hidden">Profesional</span>
                                </Button>
                            </Link>
                        </div>

                        {/* Features - Responsive grid */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground mb-6 px-2 flex-wrap">
                            <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                                <span>Sin comisiones</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                                <span>Verificados</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                                <span>WhatsApp directo</span>
                            </div>
                        </div>

                        {/* Pricing Link */}
                        <Link to="/pricing">
                            <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium">
                                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Ver Planes y Precios</span>
                                <span className="sm:hidden">Planes</span>
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
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
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8 sm:mb-12 lg:mb-16"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">Servicios Más Solicitados</h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                        Descubre los profesionales más valorados en cada categoría de Chubut
                    </p>
                </motion.div>

                {/* Category Grid - Responsive columns: 1 on mobile, 2 on tablet, 3 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 lg:mb-16">
                    {loadingCategories ? (
                        [1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="glass border-white/10 p-3 sm:p-4 lg:p-6">
                                <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mx-auto mb-3 sm:mb-4" />
                                <Skeleton className="h-3 w-20 sm:h-4 sm:w-24 mx-auto mb-2" />
                                <Skeleton className="h-2 w-16 sm:h-3 sm:w-20 mx-auto" />
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
                                                <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary/20 text-primary border-primary/30 text-xs px-2 py-1">
                                                    Popular
                                                </Badge>
                                            )}
                                            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                                                <div className={`h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 transition-colors ${isSelected ? 'bg-primary/20' : 'bg-primary/10 group-hover:bg-primary/20'
                                                    }`}>
                                                    <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                                                </div>
                                                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{category.category}</h3>
                                                <p className="text-xs sm:text-sm text-muted-foreground">{category.count} servicios</p>
                                            </CardContent>
                                        </Card>
                                    </button>
                                </motion.div>
                            );
                        })
                    ) : (
                        <Card className="glass border-white/10 p-6 sm:p-8 lg:p-12 text-center col-span-full">
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                                No hay categorías disponibles en este momento.
                            </p>
                        </Card>
                    )}
                </div>

                {/* Top Professionals Showcase - Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 sm:mb-12"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                        <div className="min-w-0">
                            <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 break-words">
                                Top de Profesionales mejor valorados
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {selectedCategory} - Los más confiables de Chubut
                            </p>
                        </div>
                        <Link to={`/services?category=${selectedCategory ? encodeURIComponent(selectedCategory) : ''}`} className="flex-shrink-0">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto glass border-white/20 hover:glass-medium">
                                Ver Todos
                                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="glass border-white/10 p-3 sm:p-4 lg:p-6">
                                    <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                                        <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex-shrink-0" />
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <Skeleton className="h-3 sm:h-4 w-3/4" />
                                            <Skeleton className="h-2 sm:h-3 w-1/2" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-16 sm:h-20 w-full mb-3 sm:mb-4" />
                                    <Skeleton className="h-3 sm:h-4 w-full" />
                                </Card>
                            ))}
                        </div>
                    ) : isError ? (
                        <Card className="glass border-white/10 p-6 sm:p-8 lg:p-12 text-center">
                            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg font-semibold mb-2">Error al cargar profesionales</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                No pudimos cargar los profesionales. Por favor, intenta nuevamente.
                            </p>
                            <Button onClick={() => refetch()} variant="outline" size="sm" className="glass border-white/20">
                                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Reintentar
                            </Button>
                        </Card>
                    ) : categoryProfessionals && categoryProfessionals.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                            {categoryProfessionals.map((professional, index) => (
                                <TopProfessionalCard
                                    key={professional.id}
                                    professional={professional}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="glass border-white/10 p-6 sm:p-8 lg:p-12 text-center">
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
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
                        <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium px-4 sm:px-8">
                            Explorar Todas las Categorías
                            <ChevronRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
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
        <section id="como-funciona" className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8 sm:mb-12 lg:mb-16"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">Cómo Funciona Fixia</h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                        Un proceso simple, seguro y sin comisiones para conectar con los mejores
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                                    <CardContent className="p-4 sm:p-6 lg:p-8">
                                        <div className="relative mb-4 sm:mb-6">
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 liquid-gradient rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto flex-shrink-0">
                                                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 bg-background rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs sm:text-sm font-bold text-primary">{step.number}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4">{step.title}</h3>
                                        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">{step.description}</p>
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
                    className="text-center mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center"
                >
                    <Link to="/how-it-works" className="flex-1 sm:flex-none w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto glass border-white/20 hover:glass-medium px-4 sm:px-8">
                            Ver Proceso Completo
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:h-5" />
                        </Button>
                    </Link>
                    <Link to="/register" className="flex-1 sm:flex-none w-full sm:w-auto">
                        <ResponsiveButton size="sm" className="w-full sm:w-auto liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-4 sm:px-8">
                            Comenzar Ahora Gratis
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:h-5" />
                        </ResponsiveButton>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <Card className="glass border-white/10 overflow-hidden">
                        <CardContent className="p-4 sm:p-8 lg:p-12 text-center">
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
                                    ¿Listo para conectar con los mejores profesionales de Chubut?
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-2">
                                    Únete a la revolución del marketplace local. Sin comisiones,
                                    con profesionales verificados y contacto directo.
                                </p>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                                    <Link to="/register" className="flex-1 sm:flex-none">
                                        <ResponsiveButton size="sm" className="w-full sm:w-auto liquid-gradient hover:opacity-90 transition-all duration-300 shadow-xl px-4 sm:px-8">
                                            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                            <span className="hidden sm:inline">Buscar Profesionales</span>
                                            <span className="sm:hidden">Buscar</span>
                                        </ResponsiveButton>
                                    </Link>
                                    <Link to="/register?type=professional" className="flex-1 sm:flex-none">
                                        <Button size="sm" variant="outline" className="w-full sm:w-auto glass border-white/20 hover:glass-medium px-4 sm:px-8">
                                            <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                            <span className="hidden sm:inline">Ser Profesional</span>
                                            <span className="sm:hidden">Profesional</span>
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 lg:gap-8 mt-4 sm:mt-8 text-xs sm:text-sm text-muted-foreground px-2">
                                    <span className="whitespace-nowrap">✨ Sin comisiones</span>
                                    <span className="whitespace-nowrap">🛡️ Verificados</span>
                                    <span className="whitespace-nowrap">📱 WhatsApp directo</span>
                                    <span className="whitespace-nowrap">🎯 Inteligente</span>
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
        <footer className="py-8 sm:py-12 lg:py-16 border-t border-white/10">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                {/* Main Footer Grid - Responsive: 2 cols on mobile, 4 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-3 sm:space-y-4 col-span-1 sm:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
                            </div>
                            <div className="flex flex-col flex-shrink-0">
                                <span className="text-base sm:text-lg lg:text-xl font-semibold">Fixia</span>
                                <span className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</span>
                            </div>
                        </Link>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            El marketplace #1 de microservicios profesionales de la Provincia del Chubut.
                        </p>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <a
                                href="https://www.google.com/maps/place/Chubut,+Argentina"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors truncate"
                            >
                                Chubut, Argentina
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Plataforma</h4>
                        <div className="space-y-2">
                            <Link to="/services" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Buscar Profesionales
                            </Link>
                            <Link to="/pricing" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Planes y Precios
                            </Link>
                            <Link to="/register?type=professional" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Ser Profesional
                            </Link>
                            <Link to="/register" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Registrarse Gratis
                            </Link>
                            <Link to="/about" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Sobre Nosotros
                            </Link>
                            <Link to="/how-it-works" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Cómo Funciona
                            </Link>
                        </div>
                    </div>

                    {/* Soporte */}
                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Soporte</h4>
                        <div className="space-y-2">
                            <Link to="/help" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Centro de Ayuda
                            </Link>
                            <Link to="/contact" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Contactar Soporte
                            </Link>
                            <a href="https://wa.me/5492804874166" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate" target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </a>
                            <a href="mailto:soporte@fixia.com.ar" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                Email Soporte
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contacto</h4>
                        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">soporte@fixia.com.ar</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">+54 280 4874166</span>
                            </div>
                            <p className="text-xs">Disponible Lun-Vie 9-18hs</p>
                            <Link to="/contact" className="text-primary hover:underline text-xs sm:text-sm block truncate">
                                Página de Contacto →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer - Responsive */}
                <div className="border-t border-white/10 mt-6 sm:mt-8 lg:mt-12 pt-6 sm:pt-8 flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-muted-foreground text-center sm:text-left text-xs sm:text-sm">
                        <p className="truncate">&copy; 2025 Fixia. Todos los derechos reservados.</p>
                        <p className="text-xs mt-1">Hecho en Chubut, Argentina 🇦🇷 • MMATA</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
                        <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm whitespace-nowrap">
                            Privacidad
                        </Link>
                        <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm whitespace-nowrap">
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
