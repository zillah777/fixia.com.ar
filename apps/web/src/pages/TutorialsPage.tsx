import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Play, Clock, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function TutorialsPage() {
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
                            <span className="text-xs text-muted-foreground -mt-1">Video Tutoriales</span>
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
                    className="text-center"
                >
                    {/* Coming Soon Card */}
                    <Card className="glass border-white/10 overflow-hidden">
                        <CardContent className="p-12 lg:p-16">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="relative inline-block mb-8">
                                    <div className="h-24 w-24 rounded-full liquid-gradient flex items-center justify-center mx-auto">
                                        <Play className="h-12 w-12 text-white" />
                                    </div>
                                    <div className="absolute -inset-2 liquid-gradient rounded-full blur opacity-30 animate-pulse"></div>
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                                        Tutoriales en Video
                                    </span>
                                </h1>

                                <div className="flex items-center justify-center space-x-2 mb-6">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    <h2 className="text-2xl font-semibold text-primary">
                                        Próximamente
                                    </h2>
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>

                                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                                    Estamos preparando una biblioteca completa de video tutoriales para ayudarte a dominar Fixia.
                                    Aprenderás paso a paso cómo sacar el máximo provecho de la plataforma.
                                </p>

                                {/* Features Preview */}
                                <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
                                    <div className="glass rounded-lg p-6 border border-white/10">
                                        <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                                        <h3 className="font-semibold mb-2">Videos Cortos</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Tutoriales de 2-5 minutos, directos al punto
                                        </p>
                                    </div>
                                    <div className="glass rounded-lg p-6 border border-white/10">
                                        <Play className="h-8 w-8 text-primary mx-auto mb-3" />
                                        <h3 className="font-semibold mb-2">Paso a Paso</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Guías visuales fáciles de seguir
                                        </p>
                                    </div>
                                    <div className="glass rounded-lg p-6 border border-white/10">
                                        <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                                        <h3 className="font-semibold mb-2">Tips Avanzados</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Trucos para usuarios profesionales
                                        </p>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button variant="outline" className="glass border-white/20" asChild>
                                        <Link to="/help">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Volver al Centro de Ayuda
                                        </Link>
                                    </Button>
                                    <Button className="liquid-gradient" asChild>
                                        <Link to="/contact">
                                            Notificarme cuando estén listos
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        </CardContent>
                    </Card>

                    {/* Alternative Resources */}
                    <div className="mt-8">
                        <p className="text-muted-foreground mb-4">
                            Mientras tanto, puedes explorar:
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button variant="outline" className="glass border-white/20" asChild>
                                <Link to="/help">
                                    Artículos de Ayuda
                                </Link>
                            </Button>
                            <Button variant="outline" className="glass border-white/20" asChild>
                                <Link to="/how-it-works">
                                    Cómo Funciona
                                </Link>
                            </Button>
                            <Button variant="outline" className="glass border-white/20" asChild>
                                <Link to="/contact">
                                    Contactar Soporte
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
