import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Star, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function RecentActivity() {
    const activities = [
        {
            id: '1',
            title: 'Nueva propuesta recibida',
            description: 'Tech Solutions envió una propuesta para "App Móvil"',
            time: 'Hace 2 horas',
            icon: MessageSquare,
            color: 'bg-primary/20 text-primary',
            status: 'new'
        },
        {
            id: '2',
            title: 'Proyecto completado',
            description: 'Diseño UI/UX para Fashion Store finalizado',
            time: 'Hace 5 horas',
            icon: CheckCircle,
            color: 'bg-success/20 text-success'
        },
        {
            id: '3',
            title: 'Nueva reseña',
            description: 'StartUp Inc te dio 5 estrellas',
            time: 'Hace 1 día',
            icon: Star,
            color: 'bg-warning/20 text-warning'
        },
        {
            id: '4',
            title: 'Pago recibido',
            description: '$3,200 de Fashion Store',
            time: 'Hace 2 días',
            icon: DollarSign,
            color: 'bg-emerald-500/20 text-emerald-500'
        }
    ];

    return (
        <Card className="glass border-white/10">
            <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="flex items-start space-x-4 p-3 glass-medium rounded-lg hover:glass-strong transition-all cursor-pointer">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">{activity.title}</h4>
                                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                                </div>
                                {activity.status === 'new' && (
                                    <Badge className="bg-success/20 text-success border-success/30">Nuevo</Badge>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
                <Button variant="outline" className="w-full glass border-white/20 hover:glass-medium">
                    Ver Todo el Historial
                </Button>
            </CardContent>
        </Card>
    );
}
