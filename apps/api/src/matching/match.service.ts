import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a match when a proposal is accepted
   */
  async createMatch(
    proposalId: string,
    clientId: string,
    professionalId: string,
    projectId: string,
    jobId?: string,
  ) {
    try {
      return await this.prisma.match.create({
        data: {
          proposal_id: proposalId,
          client_id: clientId,
          professional_id: professionalId,
          project_id: projectId,
          job_id: jobId,
          status: 'active',
        },
        include: {
          proposal: true,
          client: {
            select: {
              id: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to create match: ${error.message}`);
    }
  }

  /**
   * Get all matches for a user
   */
  async getUserMatches(userId: string, role?: 'client' | 'professional') {
    const where: Prisma.MatchWhereInput = {
      OR: [
        { client_id: userId },
        { professional_id: userId },
      ],
    };

    if (role === 'client') {
      where.client_id = userId;
    } else if (role === 'professional') {
      where.professional_id = userId;
    }

    return await this.prisma.match.findMany({
      where,
      include: {
        proposal: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
            professional_profile: {
              select: {
                rating: true,
                review_count: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get a specific match by ID
   */
  async getMatch(matchId: string, userId?: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        proposal: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
            email: true,
            location: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
            email: true,
            location: true,
            professional_profile: {
              select: {
                rating: true,
                review_count: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    // Validate user is participant
    if (userId && match.client_id !== userId && match.professional_id !== userId) {
      throw new ForbiddenException('You are not a participant in this match');
    }

    return match;
  }

  /**
   * Update match status
   */
  async updateMatchStatus(
    matchId: string,
    userId: string,
    status: 'active' | 'completed' | 'disputed' | 'cancelled',
  ) {
    const match = await this.getMatch(matchId, userId);

    // Validate state transition
    this.validateStatusTransition(match.status, status);

    return await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status,
        updated_at: new Date(),
      },
      include: {
        proposal: true,
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Mark service as completed by one party
   */
  async requestCompletion(matchId: string, userId: string, comment?: string) {
    const match = await this.getMatch(matchId, userId);

    const job = await this.prisma.job.findFirst({
      where: { project_id: match.project_id },
    });

    if (!job) {
      throw new NotFoundException('Associated job not found');
    }

    if (job.completion_requested_by === userId) {
      throw new BadRequestException('You have already requested completion');
    }

    return await this.prisma.job.update({
      where: { id: job.id },
      data: {
        completion_requested_by: userId,
        completion_requested_at: new Date(),
      },
    });
  }

  /**
   * Confirm completion by opposite party
   */
  async confirmCompletion(matchId: string, userId: string) {
    const match = await this.getMatch(matchId, userId);

    const job = await this.prisma.job.findFirst({
      where: { project_id: match.project_id },
    });

    if (!job) {
      throw new NotFoundException('Associated job not found');
    }

    if (!job.completion_requested_by) {
      throw new BadRequestException('Completion has not been requested yet');
    }

    if (job.completion_requested_by === userId) {
      throw new BadRequestException('You cannot confirm your own completion request');
    }

    await this.prisma.job.update({
      where: { id: job.id },
      data: {
        completion_confirmed_by: userId,
        completion_confirmed_at: new Date(),
        status: 'completed',
      },
    });

    return await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'completed',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get completion status
   */
  async getCompletionStatus(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    const job = await this.prisma.job.findFirst({
      where: { project_id: match.project_id },
    });

    return {
      matchId,
      matchStatus: match.status,
      jobId: job?.id,
      completionRequestedBy: job?.completion_requested_by,
      completionRequestedAt: job?.completion_requested_at,
      completionConfirmedBy: job?.completion_confirmed_by,
      completionConfirmedAt: job?.completion_confirmed_at,
      isCompleted: job?.completion_confirmed_at != null,
      canLeaveReview: job?.completion_confirmed_at != null,
    };
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ) {
    const validTransitions: Record<string, string[]> = {
      active: ['completed', 'disputed', 'cancelled', 'unsuccessful'],
      completed: ['disputed'],
      disputed: [],
      cancelled: [],
      unsuccessful: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
