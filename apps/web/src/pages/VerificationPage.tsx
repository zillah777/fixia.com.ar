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
  VerificationStatus as VerificationStatusInterface,
  VerificationType,
  VerificationStatus as VerificationStatusEnum
} from '../lib/services/verification.service';

// Type guard to differentiate between interface and enum
type VerificationStatusData = {
  verifiedIdentity: boolean;
  verifiedSkills: boolean;
  verifiedBusiness: boolean;
  backgroundChecked: boolean;
  verifiedPhone: boolean;
  verifiedEmail: boolean;
  verifiedAddress: boolean;
  verificationRequests: VerificationRequest[];
  overallVerificationScore: number;
};
import { VerificationRequestForm } from '../components/verification/VerificationRequestForm';
import { InstantVerificationCard } from '../components/verification/InstantVerificationCard';
import { VerificationRequestCard } from '../components/verification/VerificationRequestCard';

export const VerificationPage = memo(() => {
  const { user } = useSecureAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusData | null>(null);
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

      setVerificationStatus(status as unknown as VerificationStatusData);
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
    const iconClass = `h-5 w-5 ${isVerified ? 'text-success' : 'text-muted-foreground'}`;
    
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

    // Clients have 1 verification (identity only), professionals have 7
    const totalVerifications = isClient ? 1 : 7;

    const completedVerifications = isClient
      ? [verificationStatus.verifiedIdentity].filter(Boolean).length
      : [
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

    // Clients have simple verification status
    if (isClient) {
      return progress === 100
        ? { level: 'Verificado', color: 'text-success' }
        : { level: 'Sin Verificar', color: 'text-muted-foreground' };
    }

    // Professionals have tiered levels
    if (progress >= 80) return { level: 'Elite', color: 'text-primary' };
    if (progress >= 60) return { level: 'Avanzado', color: 'text-secondary' };
    if (progress >= 40) return { level: 'Intermedio', color: 'text-success' };
    if (progress >= 20) return { level: 'Básico', color: 'text-warning' };
    return { level: 'Principiante', color: 'text-muted-foreground' };
  };

  // Remove the restriction - allow both professionals and clients
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Debes iniciar sesión para acceder a la verificación.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClient = user.userType === 'client';

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

  // Client verification options - only identity verification (DNI)
  const clientVerificationsData = [
    {
      type: VerificationType.IDENTITY,
      title: 'Verificación de Identidad',
      description: 'Sube las dos caras de tu DNI para verificar tu identidad. Esto ayuda a proteger nuestra comunidad contra fraude y garantiza que todos los usuarios sean quiénes dicen ser.',
      isVerified: verificationStatus?.verifiedIdentity || false,
      isRequired: true,
      instant: false
    }
  ];

  // Professional verification options - full verifications
  const professionalVerificationsData = [
    {
      type: VerificationType.IDENTITY,
      title: 'Identidad',
      description: 'Verifica tu identidad con un documento oficial (DNI, Pasaporte, Licencia). Esto es fundamental para establecer confianza con los clientes y cumplir con regulaciones.',
      isVerified: verificationStatus?.verifiedIdentity || false,
      isRequired: true,
      instant: false
    },
    {
      type: VerificationType.PHONE,
      title: 'Teléfono',
      description: 'Confirma tu número de teléfono mediante un código de verificación. Esto te permite recibir notificaciones importantes y permite a los clientes comunicarse contigo.',
      isVerified: verificationStatus?.verifiedPhone || false,
      isRequired: true,
      instant: true
    },
    {
      type: VerificationType.EMAIL,
      title: 'Email',
      description: 'Confirma tu dirección de correo electrónico. Garantiza que puedas recibir mensajes de clientes y notificaciones de la plataforma.',
      isVerified: verificationStatus?.verifiedEmail || false,
      isRequired: true,
      instant: true
    },
    {
      type: VerificationType.SKILLS,
      title: 'Habilidades',
      description: 'Demuestra tus competencias técnicas con certificaciones relevantes. Esto aumenta tu credibilidad y te hace más visible para clientes que buscan especialistas.',
      isVerified: verificationStatus?.verifiedSkills || false,
      isRequired: false,
      instant: false
    },
    {
      type: VerificationType.ADDRESS,
      title: 'Dirección',
      description: 'Confirma tu dirección física actual. Esto es importante para servicios locales y ayuda a los clientes a saber dónde estás basado.',
      isVerified: verificationStatus?.verifiedAddress || false,
      isRequired: false,
      instant: false
    },
    {
      type: VerificationType.BUSINESS,
      title: 'Negocio',
      description: 'Valida tu actividad comercial si tienes un negocio registrado. Esto demuestra que operas de manera formal y profesional.',
      isVerified: verificationStatus?.verifiedBusiness || false,
      isRequired: false,
      instant: false
    },
    {
      type: VerificationType.BACKGROUND_CHECK,
      title: 'Antecedentes',
      description: 'Demuestra tu historial limpio mediante verificación de antecedentes. Esto es especialmente importante para servicios que requieren confianza alta (niñera, cuidador, acceso a hogares).',
      isVerified: verificationStatus?.backgroundChecked || false,
      isRequired: false,
      instant: false
    }
  ];

  const verificationsData = isClient ? clientVerificationsData : professionalVerificationsData;

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
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isClient ? 'Verificación de Cuenta' : 'Verificación Profesional'}
            </h1>
            <p className="text-muted-foreground">
              {isClient
                ? 'Verifica tu cuenta para mayor seguridad y confianza en la plataforma'
                : 'Aumenta tu credibilidad y accede a mejores oportunidades'
              }
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

        {/* Verification Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`glass border-white/20 overflow-hidden ${
            isClient
              ? 'bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20'
              : 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isClient ? 'bg-success/20' : 'bg-primary/20'
                }`}>
                  <Shield className={`h-6 w-6 ${isClient ? 'text-success' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-2">¿Por qué es importante estar Verificado?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {isClient
                      ? 'Ser "Verificado" en Fixia confirma tu identidad y te convierte en un usuario de confianza. Esto protege tanto a los profesionales como a otros usuarios, creando un ambiente seguro para todas las transacciones y evitando fraudes.'
                      : 'Ser "Verificado" en Fixia valida tu identidad y credenciales profesionales. Los clientes tienen mayor confianza en profesionales verificados, lo que resulta en más oportunidades y mejor visibilidad en búsquedas.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {isClient ? (
                      <>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-success font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Confianza garantizada con profesionales</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-success font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Acceso a todas las características</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-success font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Protección contra fraude</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-success font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Badge de verificación visible</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Aparece con distintivo en tu perfil</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Mayor visibilidad en búsquedas</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Más oportunidades de clientes</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary font-bold text-xs">✓</span>
                          </div>
                          <span className="text-foreground">Mejor posición en rankings</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                <div className="text-2xl font-bold text-success">
                  {verificationStatus?.overallVerificationScore || 0}
                </div>
                <div className="text-xs text-muted-foreground">Puntuación Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {verificationRequests.filter(r => r.status === VerificationStatusEnum.APPROVED).length}
                </div>
                <div className="text-xs text-muted-foreground">Verificaciones Aprobadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {pendingRequests.length}
                </div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
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
          <TabsList className={`grid w-full ${isClient ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            {!isClient && <TabsTrigger value="instant">Verificación Instantánea</TabsTrigger>}
            <TabsTrigger value="requests">Mis Solicitudes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isClient && getVerificationProgress() === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-success/20 via-success/10 to-transparent border border-success/30 rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-success/20 rounded-lg flex-shrink-0">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">Comenzar tu Verificación</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete tu verificación de identidad en pocos pasos. Esto ayuda a mantener segura nuestra comunidad y te da acceso a todas las características de Fixia.
                    </p>
                    <Button
                      className="bg-success hover:bg-success/90"
                      onClick={() => {
                        setSelectedVerificationType(VerificationType.IDENTITY);
                        setShowRequestForm(true);
                      }}
                    >
                      Comenzar Verificación
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className={`grid gap-6 ${isClient ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {verificationsData.map((verification, index) => (
                <motion.div
                  key={verification.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`glass border-white/20 h-full transition-all hover:border-white/40 ${
                    verification.isVerified
                      ? 'bg-success/5 border-success/30'
                      : 'hover:shadow-lg'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            verification.isVerified ? 'bg-success/20' : 'bg-white/10'
                          }`}>
                            {getVerificationIcon(verification.type, verification.isVerified)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">
                              {verification.title}
                              {verification.isRequired && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </h3>
                          </div>
                        </div>

                        <Badge
                          variant={verification.isVerified ? 'default' : 'outline'}
                          className={verification.isVerified
                            ? 'bg-success/20 text-success border-success/30'
                            : 'bg-warning/20 text-warning border-warning/30'
                          }
                        >
                          {verification.isVerified ? '✓ Verificado' : 'Pendiente'}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {verification.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>⏱ {verificationService.getEstimatedProcessingTime(verification.type)}</span>
                      </div>

                      {!verification.isVerified && (
                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => {
                            setSelectedVerificationType(verification.type);
                            setShowRequestForm(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {isClient ? 'Verificar Ahora' : 'Enviar Solicitud'}
                        </Button>
                      )}

                      {verification.isVerified && (
                        <div className="flex items-center justify-center text-success text-sm font-semibold">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completado
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {!isClient && (
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
          )}

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