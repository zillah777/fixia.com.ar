import { useState } from 'react';
import { motion } from 'motion/react';
import {
    Briefcase,
    MapPin,
    Clock,
    Users,
    ArrowRight,
    Filter,
    Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * B2B Project Opportunity Interface
 * Defines the structure for professional-to-professional collaboration projects
 */
interface B2BOpportunity {
    id: string;
    title: string;
    description: string;
    category: string;
    client: {
        name: string;
        avatar?: string;
        verified: boolean;
    };
    budget: {
        min?: number;
        max?: number;
        type: 'fixed' | 'hourly' | 'quote';
    };
    location: string;
    remote: boolean;
    deadline?: string;
    skills?: string[];
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    applicationsCount: number;
}

/**
 * B2B Project Card Component
 * 
 * Professional-grade card displaying collaboration opportunities.
 * Features Pro-to-Pro badge and comprehensive project details.
 * 
 * @param project - The B2B opportunity to display
 * @param onApply - Callback when user applies to the project
 */
interface B2BProjectCardProps {
    project: B2BOpportunity;
    onApply?: (projectId: string) => void;
}

function B2BProjectCard({ project, onApply }: B2BProjectCardProps) {
    const handleApply = () => {
        onApply?.(project.id);
    };

    const experienceLevelLabel = {
        expert: 'Experto',
        intermediate: 'Intermedio',
        entry: 'Principiante',
    }[project.experienceLevel];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="glass hover:glass-medium transition-all border-white/10 group">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        {/* Professional Avatar */}
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20 flex-shrink-0">
                            <AvatarImage src={project.client.avatar} alt={project.client.name} />
                            <AvatarFallback>{project.client.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        {/* Project Content */}
                        <div className="flex-1 min-w-0 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-semibold text-lg truncate">
                                            {project.title}
                                        </h3>
                                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 flex-shrink-0">
                                            <Users className="h-3 w-3 mr-1" />
                                            Pro-to-Pro
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-medium text-white">
                                            {project.client.name}
                                        </span>
                                        {project.client.verified && (
                                            <Badge className="bg-success/20 text-success border-success/30 text-xs">
                                                Verificado
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="text-right flex-shrink-0">
                                    <div className="text-xl font-bold text-primary">
                                        ${project.budget.min?.toLocaleString() || '0'} - $
                                        {project.budget.max?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {project.budget.type === 'hourly' ? 'Por hora' : 'Precio fijo'}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.description}
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span>{project.location}</span>
                                </div>

                                {project.deadline && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                        <span>
                                            Entrega: {new Date(project.deadline).toLocaleDateString('es-AR')}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                                    <span>{project.category}</span>
                                </div>

                                {project.remote && (
                                    <Badge variant="outline" className="text-xs">
                                        Remoto
                                    </Badge>
                                )}
                            </div>

                            {/* Skills */}
                            {project.skills && project.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {project.skills.slice(0, 4).map((skill: string) => (
                                        <Badge
                                            key={skill}
                                            variant="outline"
                                            className="text-xs bg-primary/5 border-primary/20"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                    {project.skills.length > 4 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{project.skills.length - 4} más
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{project.applicationsCount || 0} aplicaciones</span>
                                    <span>Nivel: {experienceLevelLabel}</span>
                                </div>

                                <Button
                                    onClick={handleApply}
                                    className="liquid-gradient hover:opacity-90"
                                    size="sm"
                                >
                                    Aplicar al Proyecto
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/**
 * B2B Projects Feed Page
 * 
 * Professional collaboration discovery feed.
 * Allows professionals to find and apply to projects from other professionals.
 * 
 * Features:
 * - Search and filter capabilities
 * - Real-time project updates
 * - Pro-to-Pro badge distinction
 * - Responsive design
 */
export function B2BProjectsFeed() {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data - replace with actual API call using React Query
    const projects: B2BOpportunity[] = [];
    const isLoading = false;

    return (
        <div className="min-h-screen bg-background">
            {/* Sticky Header */}
            <div className="border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Proyectos B2B</h1>
                            <p className="text-muted-foreground">
                                Colabora con otros profesionales en proyectos especializados
                            </p>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            <Users className="h-4 w-4 mr-2" />
                            Profesional a Profesional
                        </Badge>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                placeholder="Buscar proyectos..."
                                className="glass border-white/20 pl-10"
                            />
                        </div>
                        <Button variant="outline" className="glass border-white/20">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : projects.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <B2BProjectCard
                                key={project.id}
                                project={project}
                                onApply={(id) => console.log('Apply to project:', id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Loading Skeleton Component
 */
function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="glass border-white/10 animate-pulse">
                    <CardContent className="p-6">
                        <div className="h-32 bg-muted/20 rounded" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * Empty State Component
 */
function EmptyState() {
    return (
        <Card className="glass border-white/10 text-center">
            <CardContent className="p-12">
                <div className="max-w-md mx-auto">
                    <div className="h-16 w-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                        No hay proyectos B2B disponibles
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Los proyectos de colaboración profesional aparecerán aquí.
                        Vuelve pronto para ver nuevas oportunidades.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default B2BProjectsFeed;
