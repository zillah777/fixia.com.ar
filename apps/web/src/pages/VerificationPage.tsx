import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
    VerificationType,
    VerificationRequest,
    verificationService
} from '../lib/services/verification.service';
import { VerificationRequestCard } from '../components/verification/VerificationRequestCard';
import { InstantVerificationCard } from '../components/verification/InstantVerificationCard';
import { VerificationRequestForm } from '../components/verification/VerificationRequestForm';
import { Shield, CheckCircle, Clock, FileText } from 'lucide-react';

export function VerificationPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<VerificationType | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await verificationService.getMyVerifications();
            setRequests(data);
        } catch (error) {
            console.error('Error loading verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (requestId: string) => {
        try {
            await verificationService.cancelVerificationRequest(requestId);
            await loadRequests();
        } catch (error) {
            console.error('Error canceling request:', error);
        }
    };

    const verificationTypes = [
        {
            type: VerificationType.IDENTITY,
            title: 'Identidad',
            description: 'Verifica tu identidad con DNI o pasaporte',
            icon: Shield,
            instant: false
        },
        {
            type: VerificationType.PHONE,
            title: 'Teléfono',
            description: 'Verificación instantánea por SMS',
            icon: CheckCircle,
            instant: true
        },
        {
            type: VerificationType.EMAIL,
            title: 'Email',
            description: 'Verificación instantánea por correo',
            icon: CheckCircle,
            instant: true
        },
        {
            type: VerificationType.SKILLS,
            title: 'Habilidades',
            description: 'Certifica tus habilidades profesionales',
            icon: FileText,
            instant: false
        },
        {
            type: VerificationType.BUSINESS,
            title: 'Negocio',
            description: 'Verifica tu negocio o empresa',
            icon: Clock,
            instant: false
        }
    ];

    const renderVerificationForm = () => {
        if (!selectedType) return null;

        // Type guard: check if it's an instant verification type
        if (selectedType === VerificationType.PHONE || selectedType === VerificationType.EMAIL) {
            return (
                <InstantVerificationCard
                    type={selectedType}
                    onClose={() => setSelectedType(null)}
                    onSuccess={() => {
                        setSelectedType(null);
                        loadRequests();
                    }}
                />
            );
        }

        // Otherwise it's a document-based verification
        return (
            <VerificationRequestForm
                type={selectedType}
                onClose={() => setSelectedType(null)}
                onSuccess={() => {
                    setSelectedType(null);
                    loadRequests();
                }}
            />
        );
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Verificaciones</h1>
                    <p className="text-muted-foreground">
                        Verifica tu identidad y habilidades para aumentar tu confiabilidad
                    </p>
                </div>
            </div>

            <Tabs defaultValue="available" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Disponibles</TabsTrigger>
                    <TabsTrigger value="my-requests">Mis Solicitudes</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {verificationTypes.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Card
                                    key={item.type}
                                    className="cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => setSelectedType(item.type)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <Icon className="h-8 w-8 text-primary" />
                                            {item.instant && (
                                                <Badge variant="secondary">Instantáneo</Badge>
                                            )}
                                        </div>
                                        <CardTitle>{item.title}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full">
                                            Iniciar Verificación
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {selectedType && (
                        <div className="mt-6">
                            {renderVerificationForm()}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="my-requests" className="space-y-4">
                    {loading ? (
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-center text-muted-foreground">Cargando...</p>
                            </CardContent>
                        </Card>
                    ) : requests.length === 0 ? (
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-center text-muted-foreground">
                                    No tienes solicitudes de verificación
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        requests.map((request) => (
                            <VerificationRequestCard
                                key={request.id}
                                request={request}
                                onCancel={handleCancel}
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default VerificationPage;