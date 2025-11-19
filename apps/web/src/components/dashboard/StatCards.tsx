import React from 'react';
import { TrendingUp, Users, Award, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { motion } from 'motion/react';

export default function StatCards() {
    const stats = [
        {
            title: 'Proyectos Activos',
            value: '12',
            change: '+2 este mes',
            icon: TrendingUp,
            color: 'text-primary',
            bgColor: 'bg-primary/20'
        },
        {
            title: 'Clientes Totales',
            value: '48',
            change: '+8 este mes',
            icon: Users,
            color: 'text-success',
            bgColor: 'bg-success/20'
        },
        {
            title: 'Calificación',
            value: '4.9',
            change: '⭐⭐⭐⭐⭐',
            icon: Award,
            color: 'text-warning',
            bgColor: 'bg-warning/20'
        },
        {
            title: 'Ingresos',
            value: '$12,450',
            change: '+15% este mes',
            icon: DollarSign,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/20'
        }
    ];

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="glass border-white/10 hover:glass-medium transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
