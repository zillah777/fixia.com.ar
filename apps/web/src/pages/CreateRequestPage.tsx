import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    ArrowLeft, FileText, DollarSign, Calendar, Tag,
    AlertCircle, Save, Send, MapPin, Globe
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { projectsService, CreateProjectRequest } from "../lib/services/projects.service";

const categories = [
    { value: "web-development", label: "Desarrollo Web" },
    { value: "mobile-development", label: "Desarrollo Móvil" },
    { value: "graphic-design", label: "Diseño Gráfico" },
    { value: "digital-marketing", label: "Marketing Digital" },
    { value: "writing", label: "Redacción y Contenido" },
    { value: "video-animation", label: "Video y Animación" },
    { value: "consulting", label: "Consultoría" },
    { value: "cybersecurity", label: "Ciberseguridad" },
    { value: "other", label: "Otro" }
];

export default function CreateRequestPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateProjectRequest>>({
        title: "",
        description: "",
        category: "",
        budget: 0,
        budgetType: "fixed",
        location: "Remoto",
        remote: true,
        priority: "medium",
        skills: [],
        requirements: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category || !formData.budget) {
            toast.error("Por favor completa los campos obligatorios");
            return;
        }

        setLoading(true);
        try {
            // Ensure all required fields are present and typed correctly
            const requestData: CreateProjectRequest = {
                title: formData.title!,
                description: formData.description!,
                category: formData.category!,
                budget: Number(formData.budget),
                budgetType: formData.budgetType as 'fixed' | 'hourly' | 'negotiable' || 'fixed',
                location: formData.location || 'Remoto',
                remote: formData.remote || false,
                priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
                skills: formData.skills || [],
                requirements: formData.requirements || [],
                deadline: formData.deadline
            };

            await projectsService.createProject(requestData);
            toast.success("Solicitud publicada correctamente");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error creating request:", error);
            toast.error("Error al publicar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full glass border-b border-white/10 mb-8">
                <div className="container mx-auto flex h-16 items-center px-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mr-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-xl font-semibold">Publicar Nueva Solicitud</h1>
                </div>
            </header>

            <main className="container mx-auto px-6 max-w-3xl">
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    {/* Basic Info */}
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Detalles del Proyecto
                            </CardTitle>
                            <CardDescription>
                                Describe qué necesitas para recibir mejores propuestas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título del Proyecto *</Label>
                                <Input
                                    id="title"
                                    placeholder="Ej: Desarrollo de sitio web corporativo"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="glass border-white/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger className="glass border-white/20">
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción Detallada *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Explica los objetivos, alcance y requerimientos específicos..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[150px] glass border-white/20"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Budget & Timeline */}
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-success" />
                                Presupuesto y Tiempos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Presupuesto Estimado (USD) *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="budget"
                                            type="number"
                                            min="0"
                                            placeholder="0.00"
                                            value={formData.budget || ''}
                                            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                            className="pl-9 glass border-white/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Fecha Límite (Opcional)</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setFormData({ ...formData, deadline: new Date(e.target.value).toISOString() })}
                                            className="pl-9 glass border-white/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 glass-medium rounded-lg border border-white/10">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Trabajo Remoto</Label>
                                    <p className="text-sm text-muted-foreground">
                                        ¿Este proyecto puede realizarse 100% a distancia?
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.remote}
                                    onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="glass border-white/20"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="liquid-gradient min-w-[150px]"
                        >
                            {loading ? (
                                <span className="animate-pulse">Publicando...</span>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Publicar Solicitud
                                </>
                            )}
                        </Button>
                    </div>
                </motion.form>
            </main>
        </div>
    );
}
