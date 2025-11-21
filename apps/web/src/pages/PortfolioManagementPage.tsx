import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Edit3, Trash2, Award, Eye, Heart, ExternalLink,
    ArrowLeft, Upload, X, Save, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Switch } from "../components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { portfolioService, PortfolioItem, CreatePortfolioItemDto } from "../lib/services/portfolio.service";
import { useSecureAuth as useAuth } from "../context/SecureAuthContext";
import { toast } from "sonner";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

function Navigation() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full glass border-b border-white/10"
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <Link to="/dashboard" className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
                    </div>
                    <span className="font-semibold">Fixia</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                        Mi Perfil
                    </Link>
                    <Link to="/portfolio/manage" className="text-primary font-medium">
                        Portfolio
                    </Link>
                </nav>

                <Link to="/dashboard">
                    <Button variant="ghost" className="text-muted-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </Link>
            </div>
        </motion.header>
    );
}

interface AddEditPortfolioModalProps {
    item?: PortfolioItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

function AddEditPortfolioModal({ item, open, onOpenChange, onSuccess }: AddEditPortfolioModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<CreatePortfolioItemDto>({
        title: item?.title || '',
        description: item?.description || '',
        image_url: item?.image_url || '',
        project_url: item?.project_url || '',
        category: item?.category || '',
        tags: item?.tags || [],
        featured: item?.featured || false,
    });
    const [tagInput, setTagInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(item?.image_url || '');

    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: CreatePortfolioItemDto) => portfolioService.createPortfolioItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
            toast.success('Portfolio item creado exitosamente');
            onSuccess();
            onOpenChange(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear portfolio item');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreatePortfolioItemDto) => portfolioService.updatePortfolioItem(item!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
            toast.success('Portfolio item actualizado exitosamente');
            onSuccess();
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar portfolio item');
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten imágenes');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'portfolio');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Error al subir imagen');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, image_url: data.secure_url }));
            setImagePreview(data.secure_url);
            toast.success('Imagen subida exitosamente');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tag) || [],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('El título es requerido');
            return;
        }

        if (!formData.image_url) {
            toast.error('La imagen es requerida');
            return;
        }

        if (item) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image_url: '',
            project_url: '',
            category: '',
            tags: [],
            featured: false,
        });
        setImagePreview('');
        setTagInput('');
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{item ? 'Editar' : 'Agregar'} Proyecto al Portfolio</DialogTitle>
                    <DialogDescription>
                        {item ? 'Actualiza' : 'Agrega'} un proyecto a tu portfolio profesional
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Imagen del Proyecto *</Label>
                        {imagePreview ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, image_url: '' }));
                                        setImagePreview('');
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer glass hover:glass-medium transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-8 h-8 mb-4 text-primary animate-spin" />
                                            <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground">
                                                <span className="font-semibold">Haz clic para subir</span> o arrastra una imagen
                                            </p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Proyecto *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="glass border-white/20"
                            placeholder="Ej: E-commerce ModaStyle"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="glass border-white/20"
                            rows={3}
                            placeholder="Describe el proyecto..."
                        />
                    </div>

                    {/* Category and Project URL */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="glass border-white/20"
                                placeholder="Ej: Desarrollo Web"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project_url">URL del Proyecto</Label>
                            <Input
                                id="project_url"
                                type="url"
                                value={formData.project_url}
                                onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
                                className="glass border-white/20"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tecnologías / Tags</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                className="glass border-white/20"
                                placeholder="Ej: React, Node.js"
                            />
                            <Button type="button" onClick={handleAddTag} variant="outline" className="glass border-white/20">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {formData.tags && formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="glass border-white/20">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-2 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Featured */}
                    <div className="flex items-center justify-between p-4 glass-medium rounded-lg">
                        <div>
                            <Label htmlFor="featured" className="font-medium">Proyecto Destacado</Label>
                            <p className="text-sm text-muted-foreground">Mostrar este proyecto como destacado</p>
                        </div>
                        <Switch
                            id="featured"
                            checked={formData.featured}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="glass border-white/20"
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="liquid-gradient" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {item ? 'Actualizar' : 'Guardar'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface PortfolioItemCardProps {
    item: PortfolioItem;
    onEdit: (item: PortfolioItem) => void;
    onDelete: (item: PortfolioItem) => void;
}

function PortfolioItemCard({ item, onEdit, onDelete }: PortfolioItemCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group">
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.featured && (
                        <Badge className="absolute top-3 left-3 bg-warning/20 text-warning border-warning/30">
                            <Award className="h-3 w-3 mr-1" />
                            Destacado
                        </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex space-x-2">
                            <Button size="sm" onClick={() => onEdit(item)} className="liquid-gradient">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Editar
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(item)}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="p-4 space-y-3">
                    {item.category && (
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="glass border-white/20 text-xs">
                                {item.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    )}

                    <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                    {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="glass border-white/20 text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {item.tags.length > 3 && (
                                <Badge variant="outline" className="glass border-white/20 text-xs">
                                    +{item.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {item.likes_count || 0}
                            </span>
                            <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {item.views_count || 0}
                            </span>
                        </div>
                        {item.project_url && (
                            <a
                                href={item.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Ver proyecto
                            </a>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function PortfolioManagementPage() {
    const { user } = useAuth();
    const [addEditModalOpen, setAddEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);

    const queryClient = useQueryClient();

    // Fetch portfolio items
    const { data: portfolioItems, isLoading } = useQuery({
        queryKey: ['portfolio', user?.id],
        queryFn: () => portfolioService.getUserPortfolio(user!.id),
        enabled: !!user?.id,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => portfolioService.deletePortfolioItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
            toast.success('Portfolio item eliminado exitosamente');
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar portfolio item');
        },
    });

    const handleAddNew = () => {
        setSelectedItem(null);
        setAddEditModalOpen(true);
    };

    const handleEdit = (item: PortfolioItem) => {
        setSelectedItem(item);
        setAddEditModalOpen(true);
    };

    const handleDelete = (item: PortfolioItem) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="container mx-auto px-6 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-3xl">Gestión de Portfolio</CardTitle>
                                        <CardDescription className="mt-2">
                                            Administra tus proyectos y trabajos destacados
                                        </CardDescription>
                                    </div>
                                    <Button onClick={handleAddNew} className="liquid-gradient">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Proyecto
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    {/* Portfolio Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Card className="glass border-white/10">
                            <CardContent className="p-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : !portfolioItems || portfolioItems.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                            <Award className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">No tienes proyectos aún</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Comienza a construir tu portfolio agregando tus primeros proyectos
                                        </p>
                                        <Button onClick={handleAddNew} className="liquid-gradient">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Primer Proyecto
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {portfolioItems.map((item) => (
                                            <PortfolioItemCard
                                                key={item.id}
                                                item={item}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>

            {/* Add/Edit Modal */}
            <AddEditPortfolioModal
                item={selectedItem}
                open={addEditModalOpen}
                onOpenChange={setAddEditModalOpen}
                onSuccess={() => setSelectedItem(null)}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="glass border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El proyecto "{itemToDelete?.title}" será eliminado permanentemente de tu portfolio.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="glass border-white/20">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Eliminar'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
