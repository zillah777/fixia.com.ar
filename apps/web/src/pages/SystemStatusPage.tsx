import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Server, Database, Zap, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface ServiceStatus {
    name: string;
    status: "operational" | "degraded" | "outage";
    description: string;
    icon: React.ComponentType<any>;
    uptime: string;
}

const services: ServiceStatus[] = [
    {
        name: "Plataforma Web",
        status: "operational",
        description: "Sitio web y aplicación funcionando correctamente",
        icon: Globe,
        uptime: "99.9%"
    },
    {
        name: "API Backend",
        status: "operational",
        description: "Servicios de backend y autenticación",
        icon: Server,
        uptime: "99.8%"
    },
    {
        name: "Base de Datos",
        status: "operational",
        description: "PostgreSQL y almacenamiento de datos",
        icon: Database,
        uptime: "100%"
    },
    {
        name: "Servicios de Email",
        status: "operational",
        description: "Envío de notificaciones y verificaciones",
        icon: Zap,
        uptime: "99.7%"
    }
];

const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
        case "operational":
            return "text-success";
        case "degraded":
            return "text-warning";
        case "outage":
            return "text-destructive";
    }
};

const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
        case "operational":
            return "bg-success/20 text-success border-success/30";
        case "degraded":
            return "bg-warning/20 text-warning border-warning/30";
        case "outage":
            return "bg-destructive/20 text-destructive border-destructive/30";
    }
};

const getStatusText = (status: ServiceStatus["status"]) => {
    switch (status) {
        case "operational":
            return "Operacional";
        case "degraded":
            return "Degradado";
        case "outage":
            return "Fuera de servicio";
    }
};

export default function SystemStatusPage() {
    const allOperational = services.every(s => s.status === "operational");

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 w-full glass border-b border-white/10"
            >
                <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold">Fixia</span>
                            <span className="text-xs text-muted-foreground -mt-1">Estado del Sistema</span>
                        </div>
                    </Link>

                    <Link to="/help">
                        <Button variant="ghost" className="hover:glass-medium">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Centro de Ayuda
                        </Button>
                    </Link>
                </div>
            </motion.header>

            {/* Content */}
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            {allOperational ? (
                                <CheckCircle className="h-16 w-16 text-success" />
                            ) : (
                                <AlertCircle className="h-16 w-16 text-warning" />
                            )}
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                            {allOperational ? "Todos los sistemas operacionales" : "Algunos sistemas con problemas"}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Última actualización: {new Date().toLocaleString("es-AR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </p>
                    </div>

                    {/* Services Status */}
                    <div className="space-y-4 mb-12">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <motion.div
                                    key={service.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Card className="glass border-white/10 hover:glass-medium transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${service.status === "operational" ? "bg-success/20" :
                                                            service.status === "degraded" ? "bg-warning/20" : "bg-destructive/20"
                                                        }`}>
                                                        <Icon className={`h-6 w-6 ${getStatusColor(service.status)}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{service.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{service.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={getStatusBadge(service.status)}>
                                                        {getStatusText(service.status)}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Uptime: {service.uptime}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Recent Incidents */}
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                Incidentes Recientes
                            </CardTitle>
                            <CardDescription>
                                Historial de los últimos 30 días
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No se han reportado incidentes en los últimos 30 días
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscribe to Updates */}
                    <div className="mt-8">
                        <Card className="glass border-primary/30 bg-primary/5">
                            <CardContent className="p-6 text-center">
                                <h3 className="text-xl font-semibold mb-2">¿Quieres recibir notificaciones?</h3>
                                <p className="text-muted-foreground mb-4">
                                    Suscríbete para recibir actualizaciones sobre el estado del sistema
                                </p>
                                <Button className="liquid-gradient" asChild>
                                    <Link to="/contact">
                                        Suscribirse a Actualizaciones
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
