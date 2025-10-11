import React, { useState, useEffect, memo } from 'react';
import { Shield, CheckCircle, Clock, XCircle, AlertCircle, Plus, FileText, Heart, Building } from 'lucide-react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useSecureAuth } from '../context/SecureAuthContext';
import { 
  verificationService, 
  VerificationRequest, 
  VerificationStatus as VerificationStatusType,
  VerificationType,
  VerificationStatus as VerificationStatusEnum
} from '../lib/services/verification.service';
import { VerificationRequestForm } from '../components/verification/VerificationRequestForm';
import { InstantVerificationCard } from '../components/verification/InstantVerificationCard';
import { VerificationRequestCard } from '../components/verification/VerificationRequestCard';

export const VerificationPage = memo(() => {
  const { user } = useSecureAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusType | null>(null);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedVerificationType, setSelectedVerificationType] = useState<VerificationType | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadVerificationData();
    }
  }, [user?.id]);

  const loadVerificationData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [status, requests] = await Promise.all([
        verificationService.getMyVerificationStatus(),
        verificationService.getMyVerificationRequests()
      ]);

      setVerificationStatus(status);
      setVerificationRequests(requests);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowRequestForm(false);
    setSelectedVerificationType(null);
    loadVerificationData();
  };

  const getVerificationIcon = (type: VerificationType, isVerified: boolean) => {
    const iconClass = `h-5 w-5 ${isVerified ? 'text-green-600' : 'text-gray-400'}`;
    
    switch (type) {
      case VerificationType.IDENTITY:
        return <Shield className={iconClass} />;
      case VerificationType.SKILLS:
        return <Heart className={iconClass} />;
      case VerificationType.BUSINESS:
        return <Building className={iconClass} />;
      case VerificationType.BACKGROUND_CHECK:
        return <CheckCircle className={iconClass} />;
      case VerificationType.PHONE:
        return <FileText className={iconClass} />;
      case VerificationType.EMAIL:
        return <FileText className={iconClass} />;
      case VerificationType.ADDRESS:
        return <FileText className={iconClass} />;
      default:
        return <Shield className={iconClass} />;
    }
  };

  const getVerificationProgress = () => {
    if (!verificationStatus) return 0;
    
    const totalVerifications = 7;
    const completedVerifications = [
      verificationStatus.verifiedIdentity,
      verificationStatus.verifiedSkills,
      verificationStatus.verifiedBusiness,
      verificationStatus.backgroundChecked,
      verificationStatus.verifiedPhone,
      verificationStatus.verifiedEmail,
      verificationStatus.verifiedAddress
    ].filter(Boolean).length;

    return (completedVerifications / totalVerifications) * 100;
  };

  const getVerificationLevel = () => {
    const progress = getVerificationProgress();
    if (progress >= 80) return { level: 'Elite', color: 'text-purple-600' };
    if (progress >= 60) return { level: 'Avanzado', color: 'text-blue-600' };
    if (progress >= 40) return { level: 'Intermedio', color: 'text-green-600' };
    if (progress >= 20) return { level: 'Básico', color: 'text-yellow-600' };
    return { level: 'Principiante', color: 'text-gray-600' };
  };

  if (!user || user.userType !== 'professional') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              La verificación profesional solo está disponible para usuarios profesionales.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
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

  const verificationsData = [
    {
      type: VerificationType.IDENTITY,
      title: 'Identidad',
      description: 'Confirma tu identidad con documento oficial',
      isVerified: verificationStatus?.verifiedIdentity || false,
      isRequired: true,
      instant: false
    },
    {
      type: VerificationType.PHONE,
      title: 'Teléfono',
      description: 'Verifica tu número de teléfono',
      isVerified: verificationStatus?.verifiedPhone || false,
      isRequired: true,
      instant: true
    },
    {
      type: VerificationType.EMAIL,
      title: 'Email',
      description: 'Confirma tu dirección de correo',
      isVerified: verificationStatus?.verifiedEmail || false,
      isRequired: true,
      instant: true
    },
    {
      type: VerificationType.SKILLS,
      title: 'Habilidades',
      description: 'Certifica tus competencias técnicas',
      isVerified: verificationStatus?.verifiedSkills || false,
      isRequired: false,
      instant: false
    },
    {
      type: VerificationType.ADDRESS,
      title: 'Dirección',
      description: 'Confirma tu dirección física',
      isVerified: verificationStatus?.verifiedAddress || false,
      isRequired: false,
      instant: false
    },
    {
      type: VerificationType.BUSINESS,
      title: 'Negocio',
      description: 'Valida tu actividad comercial',
      isVerified: verificationStatus?.verifiedBusiness || false,
      isRequired: false,
      instant: false
    },
    {
      type: VerificationType.BACKGROUND_CHECK,
      title: 'Antecedentes',
      description: 'Demuestra tu historial limpio',
      isVerified: verificationStatus?.backgroundChecked || false,
      isRequired: false,
      instant: false
    }
  ];

  const pendingRequests = verificationRequests.filter(
    req => req.status === VerificationStatusEnum.PENDING
  );

  const verificationLevel = getVerificationLevel();

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
            <h1 className="text-3xl font-bold text-foreground">Verificación Profesional</h1>
            <p className="text-muted-foreground">
              Aumenta tu credibilidad y accede a mejores oportunidades
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${verificationLevel.color}`}>
              {verificationLevel.level}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(getVerificationProgress())}% completado
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Progreso de Verificación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso General</span>
                <span className="font-medium">{Math.round(getVerificationProgress())}%</span>
              </div>
              <Progress value={getVerificationProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {verificationStatus?.overallVerificationScore || 0}
                </div>
                <div className="text-xs text-muted-foreground">Puntuación Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {verificationRequests.filter(r => r.status === VerificationStatusEnum.APPROVED).length}
                </div>
                <div className="text-xs text-muted-foreground">Verificaciones Aprobadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingRequests.length}
                </div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {verificationsData.filter(v => v.isVerified).length}/{verificationsData.length}
                </div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="instant">Verificación Instantánea</TabsTrigger>
            <TabsTrigger value="requests">Mis Solicitudes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verificationsData.map((verification) => (
                <Card key={verification.type} className="glass border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getVerificationIcon(verification.type, verification.isVerified)}
                        <div>
                          <h3 className="font-medium text-foreground">
                            {verification.title}
                            {verification.isRequired && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {verification.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant={verification.isVerified ? 'default' : 'outline'}
                          className={verification.isVerified ? 'bg-green-100 text-green-800' : ''}
                        >
                          {verification.isVerified ? 'Verificado' : 'Pendiente'}
                        </Badge>
                        
                        {!verification.isVerified && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedVerificationType(verification.type);
                              setShowRequestForm(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Verificar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-muted-foreground">
                      Tiempo estimado: {verificationService.getEstimatedProcessingTime(verification.type)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="instant" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InstantVerificationCard
                type={VerificationType.PHONE}
                title="Verificación de Teléfono"
                description="Confirma tu número de teléfono en segundos"
                isVerified={verificationStatus?.verifiedPhone || false}
                onSuccess={handleVerificationSuccess}
              />
              <InstantVerificationCard
                type={VerificationType.EMAIL}
                title="Verificación de Email"
                description="Confirma tu dirección de correo electrónico"
                isVerified={verificationStatus?.verifiedEmail || false}
                onSuccess={handleVerificationSuccess}
              />
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {verificationRequests.length === 0 ? (
              <Card className="glass border-white/20">
                <CardContent className="p-8 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
                  <p className="text-muted-foreground mb-4">
                    Aún no has enviado ninguna solicitud de verificación.
                  </p>
                  <Button onClick={() => setShowRequestForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Solicitud
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {verificationRequests.map((request) => (
                  <VerificationRequestCard
                    key={request.id}
                    request={request}
                    onUpdate={loadVerificationData}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Verification Request Form Modal */}
      {showRequestForm && (
        <VerificationRequestForm
          verificationType={selectedVerificationType}
          onClose={() => {
            setShowRequestForm(false);
            setSelectedVerificationType(null);
          }}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
});

VerificationPage.displayName = 'VerificationPage';