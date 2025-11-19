import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    VerificationRequest,
    VerificationStatus,
    verificationService
} from '../../lib/services/verification.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface VerificationRequestCardProps {
    request: VerificationRequest;
    onCancel?: (requestId: string) => void;
    onUpdate?: () => void | Promise<void>;
}

export function VerificationRequestCard({ request, onCancel }: VerificationRequestCardProps) {
    const statusColor = verificationService.getVerificationStatusColor(request.status);
    const statusLabel = verificationService.getVerificationStatusLabel(request.status);
    const typeLabel = verificationService.getVerificationTypeLabel(request.verificationType);

    const handleCancel = () => {
        if (onCancel && request.id) {
            onCancel(request.id);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{typeLabel}</CardTitle>
                    <Badge className={statusColor}>{statusLabel}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Solicitado {formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                            locale: es
                        })}
                    </p>

                    {request.notes && (
                        <p className="text-sm">{request.notes}</p>
                    )}

                    {request.status === VerificationStatus.REJECTED && request.rejectionReason && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                            <p className="text-sm font-medium text-destructive">Motivo de rechazo:</p>
                            <p className="text-sm text-destructive/80">{request.rejectionReason}</p>
                        </div>
                    )}

                    {request.status === VerificationStatus.PENDING && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="mt-2"
                        >
                            Cancelar solicitud
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default VerificationRequestCard;
