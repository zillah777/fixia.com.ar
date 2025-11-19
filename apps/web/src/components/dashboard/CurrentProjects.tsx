import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, DollarSign, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

export default function CurrentProjects() {
    const projects = [
        {
            id: '1',
            title: 'Desarrollo de App Móvil',
            client: 'Tech Solutions SA',
            progress: 75,
            deadline: '15 días',
            budget: '$5,000',
            status: 'En Progreso'
        },
        {
            id: '2',
            title: 'Diseño UI/UX para E-commerce',
            client: 'Fashion Store',
            progress: 45,
            deadline: '22 días',
            budget: '$3,200',
            status: 'En Progreso'
        },
        {
            id: '3',
            title: 'Consultoría de Marketing Digital',
            client: 'StartUp Inc',
            progress: 90,
            deadline: '5 días',
            budget: '$2,800',
            status: 'Por Finalizar'
        }
    ];

    return (
        <Card className="glass border-white/10">
            <CardHeader>
                <CardTitle>Proyectos Actuales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <div className="p-4 glass-medium rounded-lg hover:glass-strong transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-1">{project.title}</h4>
                                    <div className="flex items-center text-sm text-muted-foreground space-x-3">
                                        <span className="flex items-center">
                                            <User className="h-3 w-3 mr-1" />
                                            {project.client}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {project.deadline}
                                        </span>
                                        <span className="flex items-center">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            {project.budget}
                                        </span>
                                    </div>
                                </div>
                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                    {project.status}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progreso</span>
                                    <span className="font-medium">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                            </div>
                        </div>
                    </motion.div>
                ))}
                <Link to="/projects">
                    <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
                        Ver Todos los Proyectos
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
