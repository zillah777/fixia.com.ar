import React, { useState, useEffect, memo } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter, 
  FileText, 
  Eye, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useSecureAuth } from '../../context/SecureAuthContext';
import { 
  verificationService, 
  VerificationRequest, 
  VerificationType,
  VerificationStatus,
  VerificationStats
} from '../../lib/services/verification.service';

export const VerificationAdminPage = memo(() => {
  const { user } = useSecureAuth();
  const [pendingRequests, setPendingRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<VerificationType | 'all'>('all');
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    request: VerificationRequest | null;
    action: 'approve' | 'reject' | null;
  }>({
    open: false,
    request: null,
    action: null
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadData();
  }, [filter, pagination.page]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [requestsData, statsData] = await Promise.all([
        verificationService.getPendingVerificationRequests(
          pagination.page,
          pagination.limit,
          filter === 'all' ? undefined : filter as VerificationType
        ),
        verificationService.getVerificationStats()
      ]);

      setPendingRequests(requestsData.requests);
      setPagination(requestsData.pagination);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!reviewDialog.request) return;

    try {
      await verificationService.reviewVerificationRequest(
        reviewDialog.request.id,
        action === 'approve' ? 'approved' : 'rejected',
        action === 'reject' ? rejectionReason : undefined,
        reviewNotes || undefined
      );

      // Remove from pending list
      setPendingRequests(prev => 
        prev.filter(req => req.id !== reviewDialog.request?.id)
      );

      // Close dialog and reset
      setReviewDialog({ open: false, request: null, action: null });
      setReviewNotes('');
      setRejectionReason('');
      
      // Reload stats
      const updatedStats = await verificationService.getVerificationStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Error reviewing verification request:', error);
    }
  };

  const openReviewDialog = (request: VerificationRequest, action: 'approve' | 'reject') => {
    setReviewDialog({ open: true, request, action });
    setReviewNotes('');
    setRejectionReason('');
  };

  const closeReviewDialog = () => {
    setReviewDialog({ open: false, request: null, action: null });
    setReviewNotes('');
    setRejectionReason('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // TODO: Add proper admin role check
  if (!user || user.userType !== 'professional') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta página solo está disponible para administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border-white/20">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-6 bg-white/10 rounded animate-pulse" />
              <div className="h-20 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded animate-pulse w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Panel de Verificación
            </h1>
            <p className="text-muted-foreground">
              Gestiona y revisa las solicitudes de verificación de profesionales
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
              <SelectTrigger className="w-48 glass border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las verificaciones</SelectItem>
                <SelectItem value={VerificationType.IDENTITY}>Identidad</SelectItem>
                <SelectItem value={VerificationType.SKILLS}>Habilidades</SelectItem>
                <SelectItem value={VerificationType.BUSINESS}>Negocio</SelectItem>
                <SelectItem value={VerificationType.BACKGROUND_CHECK}>Antecedentes</SelectItem>
                <SelectItem value={VerificationType.ADDRESS}>Dirección</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="glass border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Solicitudes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalRequests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.pendingRequests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aprobadas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.approvedRequests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-destructive/20 rounded-lg">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rechazadas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.rejectedRequests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pending Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <span>Solicitudes Pendientes ({pendingRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
                <h3 className="text-lg font-semibold mb-2">
                  ¡Todo al día!
                </h3>
                <p className="text-muted-foreground">
                  No hay solicitudes de verificación pendientes de revisión.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">
                              {verificationService.getVerificationTypeLabel(request.verificationType)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(request.createdAt)}
                            </span>
                          </div>
                          
                          <div>
                            <p className="font-medium text-foreground">
                              {request.user?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.user?.email}
                            </p>
                          </div>

                          {request.notes && (
                            <p className="text-sm text-muted-foreground bg-white/5 p-2 rounded">
                              {request.notes}
                            </p>
                          )}
                          
                          {request.documents && request.documents.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>{request.documents.length} documento(s)</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(request, 'reject')}
                            className="text-destructive border-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openReviewDialog(request, 'approve')}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={closeReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approve' ? 'Aprobar' : 'Rechazar'} Verificación
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.action === 'approve' 
                ? 'Esta acción aprobará la solicitud de verificación y actualizará el trust score del usuario.'
                : 'Esta acción rechazará la solicitud. Por favor proporciona un motivo.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {reviewDialog.action === 'reject' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Motivo del rechazo *
                </label>
                <Textarea
                  placeholder="Explica por qué se rechaza esta verificación..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Notas adicionales (opcional)
              </label>
              <Textarea
                placeholder="Notas internas o comentarios adicionales..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleReview(reviewDialog.action!)}
              disabled={reviewDialog.action === 'reject' && !rejectionReason.trim()}
              className={
                reviewDialog.action === 'approve'
                  ? 'bg-success hover:bg-success/90'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {reviewDialog.action === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Detail Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                Detalle de Verificación - {verificationService.getVerificationTypeLabel(selectedRequest.verificationType)}
              </DialogTitle>
              <DialogDescription>
                Solicitud ID: {selectedRequest.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usuario</label>
                  <p className="text-foreground">{selectedRequest.user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{selectedRequest.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Enviado</label>
                  <p className="text-foreground">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="text-foreground">
                    {verificationService.getVerificationTypeLabel(selectedRequest.verificationType)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notas del usuario</label>
                  <p className="text-foreground bg-white/5 p-3 rounded mt-1">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {selectedRequest.additionalInfo && Object.keys(selectedRequest.additionalInfo).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Información adicional</label>
                  <pre className="text-sm text-foreground bg-white/5 p-3 rounded mt-1 whitespace-pre-wrap">
                    {JSON.stringify(selectedRequest.additionalInfo, null, 2)}
                  </pre>
                </div>
              )}

              {/* Documents */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Documentos ({selectedRequest.documents.length})
                  </label>
                  <div className="space-y-2 mt-1">
                    {selectedRequest.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-white/5 p-2 rounded"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {doc.split('/').pop() || `Documento ${index + 1}`}
                        </span>
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="space-x-2">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cerrar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  openReviewDialog(selectedRequest, 'reject');
                }}
                className="text-destructive border-destructive hover:bg-destructive/5"
              >
                Rechazar
              </Button>
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  openReviewDialog(selectedRequest, 'approve');
                }}
                className="bg-success hover:bg-success/90"
              >
                Aprobar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
});

VerificationAdminPage.displayName = 'VerificationAdminPage';