import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
    VerificationRequest,
    VerificationStats,
    VerificationStatus,
    verificationService
} from '../../lib/services/verification.service';

export function VerificationAdminPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [stats, setStats] = useState<VerificationStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [requestsData, statsData] = await Promise.all([
                verificationService.getPendingVerificationRequests(),
                verificationService.getVerificationStats()
            ]);
            setRequests(requestsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading verification data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (requestId: string, approved: boolean, reason?: string) => {
        try {
            await verificationService.reviewVerificationRequest(requestId, approved, reason);
            await loadData();
        } catch (error) {
            console.error('Error reviewing request:', error);
        }
    };

    if (loading) {
        return <div className="p-8">Cargando...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Administración de Verificaciones</h1>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Pendientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Aprobadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-success">{stats.approved}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Rechazadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Solicitudes Pendientes</h2>

                {requests.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-center text-muted-foreground">
                                No hay solicitudes pendientes
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    requests.map((request) => (
                        <Card key={request.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {verificationService.getVerificationTypeLabel(request.verificationType)}
                                    </CardTitle>
                                    <Badge className={verificationService.getVerificationStatusColor(request.status)}>
                                        {verificationService.getVerificationStatusLabel(request.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {request.user && (
                                        <div>
                                            <p className="text-sm font-medium">Usuario:</p>
                                            <p className="text-sm text-muted-foreground">
                                                {request.user.name} ({request.user.email})
                                            </p>
                                        </div>
                                    )}

                                    {request.notes && (
                                        <div>
                                            <p className="text-sm font-medium">Notas:</p>
                                            <p className="text-sm text-muted-foreground">{request.notes}</p>
                                        </div>
                                    )}

                                    {request.documents && request.documents.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium">Documentos:</p>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                {request.documents.map((doc, index) => (
                                                    <li key={index}>{doc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleReview(request.id, true)}
                                        >
                                            Aprobar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReview(request.id, false, 'Documentación insuficiente')}
                                        >
                                            Rechazar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

export default VerificationAdminPage;
