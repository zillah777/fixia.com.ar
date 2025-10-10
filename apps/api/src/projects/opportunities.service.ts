import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

interface OpportunityMatch {
  id: string;
  project: any;
  client: {
    name: string;
    location: string;
  };
  matchScore: number;
}

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async getOpportunities(userId: string): Promise<OpportunityMatch[]> {
    // Verify user is professional
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        professional_profile: {
          select: {
            specialties: true,
          },
        },
      },
    });

    if (!user || user.user_type !== 'professional') {
      throw new ForbiddenException('Only professionals can view opportunities');
    }

    // Get open projects
    const projects = await this.prisma.project.findMany({
      where: {
        status: 'open',
        // Exclude projects where this professional already submitted a proposal
        NOT: {
          proposals: {
            some: {
              professional_id: userId,
            },
          },
        },
      },
      include: {
        client: {
          select: {
            name: true,
            location: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    // Calculate match scores for each project
    const opportunities: OpportunityMatch[] = projects.map(project => {
      const matchScore = this.calculateMatchScore(project, user);
      
      return {
        id: project.id,
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          budget_min: project.budget_min,
          budget_max: project.budget_max,
          deadline: project.deadline,
          location: project.location,
          skills_required: project.skills_required,
          category: project.category,
          proposals_count: project._count.proposals,
          created_at: project.created_at,
        },
        client: {
          name: project.client.name,
          location: project.client.location || 'No especificado',
        },
        matchScore,
      };
    });

    // Sort by match score (highest first)
    opportunities.sort((a, b) => b.matchScore - a.matchScore);

    return opportunities;
  }

  private calculateMatchScore(project: any, professional: any): number {
    let score = 50; // Base score

    // Location matching (20 points)
    if (project.location && professional.location) {
      if (project.location.toLowerCase().includes(professional.location.toLowerCase()) ||
          professional.location.toLowerCase().includes(project.location.toLowerCase())) {
        score += 20;
      } else if (project.location.toLowerCase().includes('chubut') && 
                 professional.location.toLowerCase().includes('chubut')) {
        score += 10; // Same province
      }
    }

    // Skills matching (30 points)
    if (project.skills_required && project.skills_required.length > 0) {
      const professionalSkills = professional.professional_profile?.specialties || [];
      const matchedSkills = project.skills_required.filter((skill: string) =>
        professionalSkills.some((profSkill: string) =>
          profSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(profSkill.toLowerCase())
        )
      );
      
      const skillMatchRatio = matchedSkills.length / project.skills_required.length;
      score += Math.round(skillMatchRatio * 30);
    }

    // Category matching (15 points)
    if (project.category && professional.professional_profile?.specialties) {
      const categoryMatches = professional.professional_profile.specialties.some((specialty: string) =>
        specialty.toLowerCase().includes(project.category.name.toLowerCase()) ||
        project.category.name.toLowerCase().includes(specialty.toLowerCase())
      );
      
      if (categoryMatches) {
        score += 15;
      }
    }

    // Budget considerations (10 points)
    if (project.budget_min && project.budget_max) {
      // Higher budget projects get slightly higher scores
      const avgBudget = (project.budget_min + project.budget_max) / 2;
      if (avgBudget >= 50000) score += 10;
      else if (avgBudget >= 20000) score += 5;
    }

    // Competition factor (-5 to -20 points based on proposal count)
    const proposalCount = project._count?.proposals || 0;
    if (proposalCount > 10) score -= 20;
    else if (proposalCount > 5) score -= 15;
    else if (proposalCount > 2) score -= 10;
    else if (proposalCount > 0) score -= 5;

    // Recency bonus (5 points for projects created in last 7 days)
    const createdAt = new Date(project.created_at);
    const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated <= 7) {
      score += 5;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  async getOpportunityStats(userId: string) {
    // Verify user is professional
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    if (!user || user.user_type !== 'professional') {
      throw new ForbiddenException('Only professionals can view opportunity stats');
    }

    const [totalOpportunities, myProposals, acceptedProposals] = await Promise.all([
      this.prisma.project.count({
        where: {
          status: 'open',
          NOT: {
            proposals: {
              some: {
                professional_id: userId,
              },
            },
          },
        },
      }),
      this.prisma.proposal.count({
        where: {
          professional_id: userId,
        },
      }),
      this.prisma.proposal.count({
        where: {
          professional_id: userId,
          status: 'accepted',
        },
      }),
    ]);

    return {
      total_available_opportunities: totalOpportunities,
      my_proposals: myProposals,
      accepted_proposals: acceptedProposals,
      success_rate: myProposals > 0 ? Math.round((acceptedProposals / myProposals) * 100) : 0,
    };
  }

  async applyToOpportunity(
    professionalId: string,
    opportunityId: string,
    applicationData: {
      message: string;
      proposedBudget: number;
      estimatedDuration: string;
      portfolio?: string[];
    },
  ) {
    // Verify user is professional
    const user = await this.prisma.user.findUnique({
      where: { id: professionalId },
      select: { user_type: true, name: true, email: true },
    });

    if (!user || user.user_type !== 'professional') {
      throw new ForbiddenException('Only professionals can apply to opportunities');
    }

    // Verify project exists and is open
    const project = await this.prisma.project.findUnique({
      where: { id: opportunityId },
      include: {
        client: {
          select: { name: true, email: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Opportunity not found');
    }

    if (project.status !== 'open') {
      throw new BadRequestException('This opportunity is no longer accepting proposals');
    }

    // Check if professional already applied
    const existingProposal = await this.prisma.proposal.findFirst({
      where: {
        project_id: opportunityId,
        professional_id: professionalId,
      },
    });

    if (existingProposal) {
      throw new BadRequestException('You have already applied to this opportunity');
    }

    // Create proposal
    const proposal = await this.prisma.proposal.create({
      data: {
        project_id: opportunityId,
        professional_id: professionalId,
        message: applicationData.message,
        quoted_price: applicationData.proposedBudget,
        delivery_time_days: this.parseDurationToDays(applicationData.estimatedDuration),
        status: 'pending',
      },
      include: {
        professional: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // TODO: Send notification to client
    // TODO: Send email to client

    return {
      success: true,
      proposal: {
        id: proposal.id,
        status: proposal.status,
        submitted_at: proposal.created_at,
      },
      message: 'Proposal submitted successfully',
    };
  }

  private parseDurationToDays(duration: string): number {
    const durationMap: { [key: string]: number } = {
      '1 semana': 7,
      '2 semanas': 14,
      '1 mes': 30,
      '2 meses': 60,
      '3+ meses': 90,
    };

    return durationMap[duration] || 30;
  }
}