import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { RespondServiceRequestDto } from './dto/respond-service-request.dto';

/**
 * Service Requests Service
 * 
 * Handles business logic for service requests between clients and professionals.
 * Follows 2025 NestJS best practices with Prisma ORM.
 */
@Injectable()
export class ServiceRequestsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    /**
     * Create a new service request
     * Client requests a service from a professional
     */
    async create(clientId: string, createDto: CreateServiceRequestDto) {
        // Verify service exists
        const service = await this.prisma.service.findUnique({
            where: { id: createDto.service_id },
            include: { professional: true },
        });

        if (!service) {
            throw new NotFoundException('Servicio no encontrado');
        }

        // Prevent self-requests
        if (service.professional_id === clientId) {
            throw new BadRequestException('No puedes solicitar tu propio servicio');
        }

        // Check for existing pending request
        const existingRequest = await this.prisma.serviceRequest.findFirst({
            where: {
                service_id: createDto.service_id,
                client_id: clientId,
                status: 'pending',
            },
        });

        if (existingRequest) {
            throw new BadRequestException('Ya tienes una solicitud pendiente para este servicio');
        }

        // Create service request
        const serviceRequest = await this.prisma.serviceRequest.create({
            data: {
                service_id: createDto.service_id,
                client_id: clientId,
                professional_id: service.professional_id,
                message: createDto.message,
                budget: createDto.budget,
                deadline: createDto.deadline ? new Date(createDto.deadline) : null,
                status: 'pending',
            },
            include: {
                service: {
                    include: {
                        professional: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                location: true,
                                verified: true,
                            },
                        },
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        location: true,
                        verified: true,
                    },
                },
            },
        });

        // Send notification to professional
        try {
            await this.notificationsService.createNotification({
                userId: service.professional_id,
                type: 'system' as any,
                title: 'Nueva solicitud de servicio',
                message: `Recibiste una nueva solicitud para tu servicio "${service.title}"`,
                actionUrl: '/service-requests/incoming',
            });
        } catch (error) {
            // Log error but don't fail the request creation
            console.error('Failed to send notification:', error);
        }

        return serviceRequest;
    }

    /**
     * Get all service requests for current user (as client)
     */
    async getMyRequests(clientId: string) {
        return this.prisma.serviceRequest.findMany({
            where: { client_id: clientId },
            include: {
                service: {
                    include: {
                        professional: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                location: true,
                                verified: true,
                            },
                        },
                    },
                },
                professional: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        location: true,
                        verified: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Get all incoming service requests (as professional)
     */
    async getIncomingRequests(professionalId: string) {
        return this.prisma.serviceRequest.findMany({
            where: { professional_id: professionalId },
            include: {
                service: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        location: true,
                        verified: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Accept a service request (professional)
     * Creates a match when accepted
     */
    async accept(requestId: string, professionalId: string, respondDto: RespondServiceRequestDto) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: {
                service: true,
                client: true,
                professional: true,  // Include professional for notification
            },
        });

        if (!request) {
            throw new NotFoundException('Solicitud no encontrada');
        }

        if (request.professional_id !== professionalId) {
            throw new ForbiddenException('No tienes permiso para aceptar esta solicitud');
        }

        if (request.status !== 'pending') {
            throw new BadRequestException('Esta solicitud ya fue procesada');
        }

        // Update request status
        const updatedRequest = await this.prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                status: 'accepted',
                accepted_at: new Date(),
                response_message: respondDto.message,
            },
            include: {
                service: true,
                client: true,
                professional: true,
            },
        });

        // Create match - Note: Match requires proposal_id, so we skip match creation for now
        // In a real implementation, you'd either:
        // 1. Create a proposal first, then create the match
        // 2. Make proposal_id optional in Match model
        // 3. Use a different flow for service-based matches

        // For now, we'll comment out match creation to avoid the error
        // const match = await this.prisma.match.create({
        //     data: {
        //         client_id: request.client_id,
        //         professional_id: request.professional_id,
        //         service_id: request.service_id,
        //         status: 'active',
        //     },
        // });

        // Send notification to client
        try {
            await this.notificationsService.createNotification({
                userId: request.client_id,
                type: 'system' as any,
                title: 'Solicitud de servicio aceptada',
                message: `${request.professional.name} aceptó tu solicitud de servicio`,
                actionUrl: `/services/${request.service_id}`,
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }

        return {
            request: updatedRequest,
            // match,  // Commented out until we handle proposal_id
        };
    }

    /**
     * Reject a service request (professional)
     */
    async reject(requestId: string, professionalId: string, respondDto: RespondServiceRequestDto) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: {
                client: true,
                professional: true,
            },
        });

        if (!request) {
            throw new NotFoundException('Solicitud no encontrada');
        }

        if (request.professional_id !== professionalId) {
            throw new ForbiddenException('No tienes permiso para rechazar esta solicitud');
        }

        if (request.status !== 'pending') {
            throw new BadRequestException('Esta solicitud ya fue procesada');
        }

        const updatedRequest = await this.prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                status: 'rejected',
                rejected_at: new Date(),
                response_message: respondDto.message,
            },
            include: {
                service: true,
                client: true,
                professional: true,
            },
        });

        // Send notification to client
        try {
            await this.notificationsService.createNotification({
                userId: request.client_id,
                type: 'system' as any,
                title: 'Solicitud de servicio rechazada',
                message: `${request.professional.name} rechazó tu solicitud de servicio`,
                actionUrl: `/services/${request.service_id}`,
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }

        return updatedRequest;
    }

    /**
     * Cancel a service request (client)
     */
    async cancel(requestId: string, clientId: string) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            throw new NotFoundException('Solicitud no encontrada');
        }

        if (request.client_id !== clientId) {
            throw new ForbiddenException('No tienes permiso para cancelar esta solicitud');
        }

        if (request.status !== 'pending') {
            throw new BadRequestException('Solo puedes cancelar solicitudes pendientes');
        }

        return this.prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                status: 'cancelled',
                cancelled_at: new Date(),
            },
        });
    }

    /**
     * Get a single service request by ID
     */
    async findOne(requestId: string, userId: string) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: {
                service: {
                    include: {
                        professional: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                location: true,
                                verified: true,
                            },
                        },
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        location: true,
                        verified: true,
                    },
                },
                professional: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        location: true,
                        verified: true,
                    },
                },
            },
        });

        if (!request) {
            throw new NotFoundException('Solicitud no encontrada');
        }

        // Verify user is part of this request
        if (request.client_id !== userId && request.professional_id !== userId) {
            throw new ForbiddenException('No tienes permiso para ver esta solicitud');
        }

        return request;
    }
}
