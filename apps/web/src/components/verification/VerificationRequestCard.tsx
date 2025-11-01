import React, { memo } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, FileText, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  verificationService, 
  VerificationRequest, 
  VerificationStatus 
} from '../../lib/services/verification.service';

interface VerificationRequestCardProps {
  request: VerificationRequest;
  onUpdate: () => void;
}

export const VerificationRequestCard = memo<VerificationRequestCardProps>(({
  request,
  onUpdate
}) => {
  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return <Clock className="h-4 w-4 text-warning" />;
      case VerificationStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-success" />;
      case VerificationStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-destructive" />;
      case VerificationStatus.EXPIRED:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      case VerificationStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleCancel = async () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta solicitud?')) {
      try {
        await verificationService.cancelVerificationRequest(request.id);
        onUpdate();
      } catch (error) {
        console.error('Error cancelling verification request:', error);
      }
    }
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

  return (
    <Card className="glass border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {verificationService.getVerificationTypeLabel(request.verificationType)}
              </h3>
              <p className="text-sm text-muted-foreground">
                ID: {request.id.slice(-8)}
              </p>
            </div>
          </div>
          
          <Badge className={verificationService.getVerificationStatusColor(request.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(request.status)}
              <span>{verificationService.getVerificationStatusLabel(request.status)}</span>
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Enviado:</span>
              <span className="text-foreground">{formatDate(request.createdAt)}</span>
            </div>
            
            {request.reviewedAt && (
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Revisado:</span>
                <span className="text-foreground">{formatDate(request.reviewedAt)}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {request.documents && request.documents.length > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Documentos:</span>
                <span className="text-foreground">{request.documents.length} archivo(s)</span>
              </div>
            )}
            
            <div className="text-sm">
              <span className="text-muted-foreground">Tiempo estimado:</span>
              <span className="text-foreground ml-2">
                {verificationService.getEstimatedProcessingTime(request.verificationType)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {request.notes && (
          <>
            <Separator className="bg-white/10" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Notas adicionales:</h4>
              <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
                {request.notes}
              </p>
            </div>
          </>
        )}

        {/* Additional Info */}
        {request.additionalInfo && Object.keys(request.additionalInfo).length > 0 && (
          <>
            <Separator className="bg-white/10" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Información adicional:</h4>
              <div className="bg-white/5 p-3 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(request.additionalInfo, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}

        {/* Rejection Reason */}
        {request.status === VerificationStatus.REJECTED && request.rejectionReason && (
          <>
            <Separator className="bg-white/10" />
            <div className="bg-destructive/5 border border-destructive/30 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-destructive mb-2">
                Motivo del rechazo:
              </h4>
              <p className="text-sm text-destructive">{request.rejectionReason}</p>
            </div>
          </>
        )}

        {/* Reviewer Notes */}
        {request.reviewer && request.status !== VerificationStatus.PENDING && (
          <>
            <Separator className="bg-white/10" />
            <div className="text-sm">
              <span className="text-muted-foreground">Revisado por:</span>
              <span className="text-foreground ml-2">{request.reviewer.name}</span>
              {request.reviewedAt && (
                <span className="text-muted-foreground ml-2">
                  el {formatDate(request.reviewedAt)}
                </span>
              )}
            </div>
          </>
        )}

        {/* Documents List */}
        {request.documents && request.documents.length > 0 && (
          <>
            <Separator className="bg-white/10" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Documentos adjuntos:
              </h4>
              <div className="space-y-2">
                {request.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm bg-white/5 p-2 rounded"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground truncate">
                      {doc.split('/').pop() || `Documento ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {request.status === VerificationStatus.PENDING && (
          <>
            <Separator className="bg-white/10" />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-destructive border-red-600 hover:bg-destructive/5"
              >
                Cancelar Solicitud
              </Button>
            </div>
          </>
        )}

        {/* Status-specific content */}
        {request.status === VerificationStatus.APPROVED && (
          <div className="bg-success/5 border border-success/30 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">
                ¡Verificación aprobada!
              </span>
            </div>
            <p className="text-sm text-success mt-1">
              Tu verificación ha sido aprobada exitosamente y ya está activa en tu perfil.
            </p>
          </div>
        )}

        {request.status === VerificationStatus.PENDING && (
          <div className="bg-warning/5 border border-warning/30 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium text-warning">
                En revisión
              </span>
            </div>
            <p className="text-sm text-warning mt-1">
              Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos cuando esté lista.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

VerificationRequestCard.displayName = 'VerificationRequestCard';