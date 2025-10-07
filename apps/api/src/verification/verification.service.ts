import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { VerificationRequest, VerificationType, VerificationStatus, Prisma } from '@prisma/client';
import { CreateVerificationRequestDto, UpdateVerificationRequestDto, ReviewVerificationDto } from './dto/verification.dto';
import { TrustService } from '../trust/trust.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private prisma: PrismaService,
    private trustService: TrustService,
    private notificationsService: NotificationsService
  ) {}

  async createVerificationRequest(
    userId: string, 
    createVerificationDto: CreateVerificationRequestDto
  ): Promise<VerificationRequest> {
    this.logger.log(`Creating verification request for user ${userId}, type: ${createVerificationDto.verificationType}`);

    // Check if user already has a pending or approved request for this verification type
    const existingRequest = await this.prisma.verificationRequest.findFirst({
      where: {
        user_id: userId,
        verification_type: createVerificationDto.verificationType,
        status: {
          in: [VerificationStatus.pending, VerificationStatus.approved]
        }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === VerificationStatus.approved) {
        throw new BadRequestException('This verification type is already approved');
      }
      if (existingRequest.status === VerificationStatus.pending) {
        throw new BadRequestException('You already have a pending request for this verification type');
      }
    }

    // Validate verification type specific requirements
    await this.validateVerificationRequirements(userId, createVerificationDto.verificationType);

    const verificationRequest = await this.prisma.verificationRequest.create({
      data: {
        user_id: userId,
        verification_type: createVerificationDto.verificationType,
        documents: createVerificationDto.documents || [],
        additional_info: createVerificationDto.additionalInfo || {},
        notes: createVerificationDto.notes,
        status: VerificationStatus.pending
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            user_type: true
          }
        }
      }
    });

    this.logger.log(`Verification request created: ${verificationRequest.id}`);
    return verificationRequest;
  }

  async getMyVerificationRequests(userId: string): Promise<VerificationRequest[]> {
    return this.prisma.verificationRequest.findMany({
      where: { user_id: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getVerificationRequestById(id: string): Promise<VerificationRequest> {
    const verificationRequest = await this.prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            user_type: true,
            professional_profile: {
              select: {
                bio: true,
                specialties: true,
                years_experience: true
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!verificationRequest) {
      throw new NotFoundException('Verification request not found');
    }

    return verificationRequest;
  }

  async updateVerificationRequest(
    id: string, 
    userId: string, 
    updateVerificationDto: UpdateVerificationRequestDto
  ): Promise<VerificationRequest> {
    const verificationRequest = await this.getVerificationRequestById(id);

    if (verificationRequest.user_id !== userId) {
      throw new ForbiddenException('You can only update your own verification requests');
    }

    if (verificationRequest.status !== VerificationStatus.pending) {
      throw new BadRequestException('You can only update pending verification requests');
    }

    return this.prisma.verificationRequest.update({
      where: { id },
      data: {
        documents: updateVerificationDto.documents,
        additional_info: updateVerificationDto.additionalInfo,
        notes: updateVerificationDto.notes,
        updated_at: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async cancelVerificationRequest(id: string, userId: string): Promise<void> {
    const verificationRequest = await this.getVerificationRequestById(id);

    if (verificationRequest.user_id !== userId) {
      throw new ForbiddenException('You can only cancel your own verification requests');
    }

    if (verificationRequest.status !== VerificationStatus.pending) {
      throw new BadRequestException('You can only cancel pending verification requests');
    }

    await this.prisma.verificationRequest.update({
      where: { id },
      data: {
        status: VerificationStatus.cancelled,
        updated_at: new Date()
      }
    });

    this.logger.log(`Verification request cancelled: ${id}`);
  }

  // Admin methods for reviewing verification requests
  async getPendingVerificationRequests(
    page = 1, 
    limit = 20,
    verificationType?: VerificationType
  ): Promise<{
    requests: VerificationRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const where: Prisma.VerificationRequestWhereInput = {
      status: VerificationStatus.pending,
      ...(verificationType && { verification_type: verificationType })
    };

    const [requests, total] = await Promise.all([
      this.prisma.verificationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              user_type: true,
              professional_profile: {
                select: {
                  bio: true,
                  specialties: true,
                  years_experience: true,
                  level: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'asc' }, // Oldest first for review queue
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.verificationRequest.count({ where })
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async reviewVerificationRequest(
    id: string, 
    reviewerId: string, 
    reviewDto: ReviewVerificationDto
  ): Promise<VerificationRequest> {
    const verificationRequest = await this.getVerificationRequestById(id);

    if (verificationRequest.status !== VerificationStatus.pending) {
      throw new BadRequestException('This verification request has already been reviewed');
    }

    const updatedRequest = await this.prisma.verificationRequest.update({
      where: { id },
      data: {
        status: reviewDto.status,
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
        rejection_reason: reviewDto.rejectionReason,
        notes: reviewDto.notes,
        updated_at: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // If approved, trigger trust score update and send notification
    if (reviewDto.status === VerificationStatus.approved) {
      await this.trustService.triggerTrustScoreUpdate(
        verificationRequest.user_id,
        'verification_approved'
      );
      
      // Send approval notification
      await this.notificationsService.createVerificationNotification(
        verificationRequest.user_id,
        'approved',
        verificationRequest.verification_type
      );
      
      this.logger.log(`Verification approved for user ${verificationRequest.user_id}, type: ${verificationRequest.verification_type}`);
    } else if (reviewDto.status === VerificationStatus.rejected) {
      // Send rejection notification
      await this.notificationsService.createVerificationNotification(
        verificationRequest.user_id,
        'rejected',
        verificationRequest.verification_type
      );
      
      this.logger.log(`Verification rejected for user ${verificationRequest.user_id}, type: ${verificationRequest.verification_type}, reason: ${reviewDto.rejectionReason}`);
    }

    return updatedRequest;
  }

  async getVerificationStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    byType: Record<VerificationType, {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>;
  }> {
    const [totalRequests, pendingRequests, approvedRequests, rejectedRequests] = await Promise.all([
      this.prisma.verificationRequest.count(),
      this.prisma.verificationRequest.count({ where: { status: VerificationStatus.pending } }),
      this.prisma.verificationRequest.count({ where: { status: VerificationStatus.approved } }),
      this.prisma.verificationRequest.count({ where: { status: VerificationStatus.rejected } })
    ]);

    // Get stats by verification type
    const verificationTypes = Object.values(VerificationType);
    const byType: Record<VerificationType, any> = {} as any;

    for (const type of verificationTypes) {
      const [total, pending, approved, rejected] = await Promise.all([
        this.prisma.verificationRequest.count({ where: { verification_type: type } }),
        this.prisma.verificationRequest.count({ 
          where: { verification_type: type, status: VerificationStatus.pending } 
        }),
        this.prisma.verificationRequest.count({ 
          where: { verification_type: type, status: VerificationStatus.approved } 
        }),
        this.prisma.verificationRequest.count({ 
          where: { verification_type: type, status: VerificationStatus.rejected } 
        })
      ]);

      byType[type] = { total, pending, approved, rejected };
    }

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      byType
    };
  }

  async getUserVerificationStatus(userId: string): Promise<{
    verifiedIdentity: boolean;
    verifiedSkills: boolean;
    verifiedBusiness: boolean;
    backgroundChecked: boolean;
    verifiedPhone: boolean;
    verifiedEmail: boolean;
    verifiedAddress: boolean;
    verificationRequests: VerificationRequest[];
    overallVerificationScore: number;
  }> {
    const verificationRequests = await this.prisma.verificationRequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    const approvedVerifications = verificationRequests.filter(
      req => req.status === VerificationStatus.approved
    );

    const verificationStatus = {
      verifiedIdentity: approvedVerifications.some(v => v.verification_type === VerificationType.identity),
      verifiedSkills: approvedVerifications.some(v => v.verification_type === VerificationType.skills),
      verifiedBusiness: approvedVerifications.some(v => v.verification_type === VerificationType.business),
      backgroundChecked: approvedVerifications.some(v => v.verification_type === VerificationType.background_check),
      verifiedPhone: approvedVerifications.some(v => v.verification_type === VerificationType.phone),
      verifiedEmail: approvedVerifications.some(v => v.verification_type === VerificationType.email),
      verifiedAddress: approvedVerifications.some(v => v.verification_type === VerificationType.address),
      verificationRequests,
      overallVerificationScore: this.calculateVerificationScore(approvedVerifications)
    };

    return verificationStatus;
  }

  private async validateVerificationRequirements(
    userId: string, 
    verificationType: VerificationType
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional_profile: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only professionals can request most verification types
    if (user.user_type !== 'professional' && 
        ['skills', 'business', 'background_check'].includes(verificationType)) {
      throw new BadRequestException('Only professionals can request this verification type');
    }

    // Additional validation based on verification type
    switch (verificationType) {
      case 'skills':
        if (!user.professional_profile?.specialties?.length) {
          throw new BadRequestException('You must have specialties listed to request skills verification');
        }
        break;
      
      case 'business':
        if (!user.professional_profile?.years_experience || user.professional_profile.years_experience < 1) {
          throw new BadRequestException('You must have at least 1 year of experience to request business verification');
        }
        break;
      
      case 'identity':
        if (!user.name || !user.email) {
          throw new BadRequestException('You must have a complete profile to request identity verification');
        }
        break;
    }
  }

  private calculateVerificationScore(approvedVerifications: VerificationRequest[]): number {
    const weights = {
      'identity': 25,
      'skills': 20,
      'business': 20,
      'background_check': 25,
      'phone': 5,
      'email': 3,
      'address': 2
    };

    let totalScore = 0;
    approvedVerifications.forEach(verification => {
      totalScore += weights[verification.verification_type] || 0;
    });

    return Math.min(totalScore, 100);
  }

  async getVerificationGuide(verificationType: VerificationType): Promise<{
    title: string;
    description: string;
    requirements: string[];
    documents: string[];
    processingTime: string;
    tips: string[];
  }> {
    const guides = {
      'identity': {
        title: 'Verificación de Identidad',
        description: 'Confirma tu identidad con un documento oficial para aumentar la confianza de los clientes.',
        requirements: [
          'Documento de identidad válido (DNI, Pasaporte, o Licencia de Conducir)',
          'Foto clara donde se vea tu rostro',
          'Documento debe estar vigente y legible'
        ],
        documents: [
          'Foto frontal del documento de identidad',
          'Foto posterior del documento (si aplica)',
          'Selfie sosteniendo el documento'
        ],
        processingTime: '1-3 días hábiles',
        tips: [
          'Asegúrate de que las fotos sean claras y bien iluminadas',
          'Todos los datos del documento deben ser legibles',
          'El nombre debe coincidir exactamente con tu perfil'
        ]
      },
      'skills': {
        title: 'Verificación de Habilidades',
        description: 'Demuestra tu experiencia y competencias técnicas en tu área de especialización.',
        requirements: [
          'Certificaciones profesionales o académicas',
          'Portfolio de trabajos realizados',
          'Referencias de clientes anteriores'
        ],
        documents: [
          'Certificados o diplomas relevantes',
          'Portfolio de proyectos (fotos, documentos)',
          'Cartas de recomendación o testimonios'
        ],
        processingTime: '3-7 días hábiles',
        tips: [
          'Incluye solo certificaciones relevantes a tus servicios',
          'Proporciona ejemplos específicos de tu trabajo',
          'Las referencias deben ser verificables'
        ]
      },
      'business': {
        title: 'Verificación de Negocio',
        description: 'Valida tu negocio o actividad comercial para generar mayor confianza empresarial.',
        requirements: [
          'Registro comercial o licencia de negocio',
          'Comprobante de domicilio comercial',
          'Al menos 1 año de experiencia documentada'
        ],
        documents: [
          'Registro mercantil o licencia comercial',
          'Comprobante de domicilio del negocio',
          'Facturas o contratos de servicios anteriores'
        ],
        processingTime: '5-10 días hábiles',
        tips: [
          'Los documentos deben estar a tu nombre o el de tu empresa',
          'Incluye evidencia de actividad comercial reciente',
          'Asegúrate de que la dirección comercial sea válida'
        ]
      },
      'background_check': {
        title: 'Verificación de Antecedentes',
        description: 'Demuestra tu historial limpio para trabajos que requieren mayor seguridad y confianza.',
        requirements: [
          'Certificado de antecedentes penales',
          'Certificado de buena conducta',
          'Referencias laborales recientes'
        ],
        documents: [
          'Certificado de antecedentes penales (máximo 3 meses)',
          'Certificado de buena conducta',
          'Referencias laborales con contactos verificables'
        ],
        processingTime: '7-14 días hábiles',
        tips: [
          'Los certificados deben ser recientes y oficiales',
          'Proporciona contactos de referencia actualizados',
          'Este proceso puede requerir verificación adicional'
        ]
      },
      'phone': {
        title: 'Verificación de Teléfono',
        description: 'Confirma tu número de teléfono para facilitar la comunicación directa con clientes.',
        requirements: [
          'Número de teléfono activo',
          'Acceso a SMS o llamadas'
        ],
        documents: [],
        processingTime: 'Inmediato',
        tips: [
          'Asegúrate de que el número esté activo',
          'Verifica que puedas recibir SMS',
          'Mantén el teléfono cerca durante la verificación'
        ]
      },
      'email': {
        title: 'Verificación de Email',
        description: 'Confirma tu dirección de email para comunicaciones seguras.',
        requirements: [
          'Dirección de email activa',
          'Acceso a la bandeja de entrada'
        ],
        documents: [],
        processingTime: 'Inmediato',
        tips: [
          'Revisa tu bandeja de entrada y spam',
          'Haz clic en el enlace de verificación',
          'El email debe ser el mismo que usas para iniciar sesión'
        ]
      },
      'address': {
        title: 'Verificación de Dirección',
        description: 'Confirma tu dirección física para servicios que requieren ubicación verificada.',
        requirements: [
          'Comprobante de domicilio reciente',
          'Dirección coincidente con perfil'
        ],
        documents: [
          'Factura de servicios (luz, agua, gas)',
          'Estado de cuenta bancario',
          'Contrato de alquiler o escritura'
        ],
        processingTime: '2-5 días hábiles',
        tips: [
          'El documento debe ser de los últimos 3 meses',
          'La dirección debe coincidir con tu perfil',
          'Asegúrate de que el documento sea legible'
        ]
      }
    };

    return guides[verificationType];
  }
}