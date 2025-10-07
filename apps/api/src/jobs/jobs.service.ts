import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateJobDto, UpdateJobStatusDto, CreateMilestoneDto, CreateContactInteractionDto } from './dto/create-job.dto';
import { Job, JobStatus, ProposalStatus, ProjectStatus, Prisma } from '@prisma/client';
import { TrustService } from '../trust/trust.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TrustService))
    private trustService: TrustService
  ) {}

  async createJob(createJobDto: CreateJobDto): Promise<Job> {
    // Verify the project and proposal exist and are valid
    const project = await this.prisma.project.findUnique({
      where: { id: createJobDto.projectId },
      include: { proposals: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const proposal = await this.prisma.proposal.findUnique({
      where: { id: createJobDto.proposalId }
    });

    if (!proposal || proposal.status !== ProposalStatus.accepted) {
      throw new BadRequestException('Proposal must be accepted to create a job');
    }

    // Check if job already exists for this project
    const existingJob = await this.prisma.job.findUnique({
      where: { project_id: createJobDto.projectId }
    });

    if (existingJob) {
      throw new BadRequestException('Job already exists for this project');
    }

    // Create the job
    const job = await this.prisma.job.create({
      data: {
        project_id: createJobDto.projectId,
        client_id: createJobDto.clientId,
        professional_id: createJobDto.professionalId,
        proposal_id: createJobDto.proposalId,
        title: createJobDto.title,
        description: createJobDto.description,
        agreed_price: createJobDto.agreedPrice,
        currency: createJobDto.currency || 'ARS',
        delivery_date: createJobDto.deliveryDate ? new Date(createJobDto.deliveryDate) : null,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        milestones: true,
        status_updates: {
          include: { updated_by: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    // Update project status to in_progress
    await this.prisma.project.update({
      where: { id: createJobDto.projectId },
      data: { status: ProjectStatus.in_progress }
    });

    // Create initial status update
    await this.createStatusUpdate(job.id, JobStatus.not_started, JobStatus.not_started, createJobDto.clientId, 'Job created');

    return job;
  }

  async updateJobStatus(jobId: string, userId: string, updateJobStatusDto: UpdateJobStatusDto): Promise<Job> {
    const job = await this.findJobById(jobId);
    
    // Verify user is authorized to update this job
    if (job.client_id !== userId && job.professional_id !== userId) {
      throw new ForbiddenException('You are not authorized to update this job');
    }

    const previousStatus = job.status;
    
    // Update job status
    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: updateJobStatusDto.status,
        progress_percentage: updateJobStatusDto.progressPercentage ?? job.progress_percentage,
        started_at: updateJobStatusDto.status === JobStatus.in_progress && !job.started_at ? new Date() : job.started_at,
        completed_at: updateJobStatusDto.status === JobStatus.completed && !job.completed_at ? new Date() : job.completed_at,
        cancelled_at: updateJobStatusDto.status === JobStatus.cancelled && !job.cancelled_at ? new Date() : job.cancelled_at,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        milestones: true,
        status_updates: {
          include: { updated_by: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    // Create status update record
    await this.createStatusUpdate(jobId, previousStatus, updateJobStatusDto.status, userId, updateJobStatusDto.message);

    // Update project status if needed
    if (updateJobStatusDto.status === JobStatus.completed) {
      await this.prisma.project.update({
        where: { id: job.project_id },
        data: { status: ProjectStatus.completed }
      });
      
      // Trigger trust score update for the professional when job is completed
      await this.trustService.triggerTrustScoreUpdate(
        job.professional_id, 
        'job_completed'
      );
    }

    return updatedJob;
  }

  async findJobById(jobId: string): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: { select: { id: true, name: true, email: true, whatsapp_number: true } },
        professional: { select: { id: true, name: true, email: true, whatsapp_number: true } },
        project: { select: { id: true, title: true, description: true } },
        proposal: { select: { id: true, quoted_price: true, delivery_time_days: true } },
        milestones: { orderBy: { created_at: 'asc' } },
        status_updates: {
          include: { updated_by: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' }
        },
        payments: { orderBy: { created_at: 'desc' } }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async findJobsByUser(userId: string, userType: 'client' | 'professional'): Promise<Job[]> {
    const whereClause = userType === 'client' 
      ? { client_id: userId }
      : { professional_id: userId };

    return this.prisma.job.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        milestones: { where: { completed: false } },
        status_updates: {
          take: 1,
          orderBy: { created_at: 'desc' },
          include: { updated_by: { select: { id: true, name: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async createMilestone(jobId: string, createMilestoneDto: CreateMilestoneDto) {
    const job = await this.findJobById(jobId);
    
    return this.prisma.jobMilestone.create({
      data: {
        job_id: jobId,
        title: createMilestoneDto.title,
        description: createMilestoneDto.description,
        amount: createMilestoneDto.amount,
        due_date: createMilestoneDto.dueDate ? new Date(createMilestoneDto.dueDate) : null,
      }
    });
  }

  async completeMilestone(milestoneId: string, userId: string) {
    const milestone = await this.prisma.jobMilestone.findUnique({
      where: { id: milestoneId },
      include: { job: true }
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    // Only professional can mark milestone as completed
    if (milestone.job.professional_id !== userId) {
      throw new ForbiddenException('Only the professional can complete milestones');
    }

    return this.prisma.jobMilestone.update({
      where: { id: milestoneId },
      data: {
        completed: true,
        completed_at: new Date()
      }
    });
  }

  async approveMilestone(milestoneId: string, userId: string) {
    const milestone = await this.prisma.jobMilestone.findUnique({
      where: { id: milestoneId },
      include: { job: true }
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    // Only client can approve milestone
    if (milestone.job.client_id !== userId) {
      throw new ForbiddenException('Only the client can approve milestones');
    }

    return this.prisma.jobMilestone.update({
      where: { id: milestoneId },
      data: {
        approved_by_client: true,
        approved_at: new Date()
      }
    });
  }

  async createContactInteraction(clientId: string, createContactInteractionDto: CreateContactInteractionDto) {
    return this.prisma.contactInteraction.create({
      data: {
        client_id: clientId,
        professional_id: createContactInteractionDto.professionalId,
        service_id: createContactInteractionDto.serviceId,
        project_id: createContactInteractionDto.projectId,
        contact_method: createContactInteractionDto.contactMethod,
        message: createContactInteractionDto.message,
        contact_data: createContactInteractionDto.contactData as Prisma.JsonObject,
      },
      include: {
        client: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, title: true } },
        project: { select: { id: true, title: true } }
      }
    });
  }

  async getContactInteractions(userId: string, userType: 'client' | 'professional') {
    const whereClause = userType === 'client' 
      ? { client_id: userId }
      : { professional_id: userId };

    return this.prisma.contactInteraction.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true, price: true } },
        project: { select: { id: true, title: true, budget_min: true, budget_max: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async markContactAsConverted(contactId: string, jobId: string, conversionValue?: number) {
    return this.prisma.contactInteraction.update({
      where: { id: contactId },
      data: {
        converted_to_job: true,
        job_id: jobId,
        conversion_value: conversionValue
      }
    });
  }

  private async createStatusUpdate(jobId: string, statusFrom: JobStatus, statusTo: JobStatus, userId: string, message?: string) {
    return this.prisma.jobStatusUpdate.create({
      data: {
        job_id: jobId,
        status_from: statusFrom,
        status_to: statusTo,
        message,
        updated_by_user_id: userId
      }
    });
  }

  // Analytics and reporting methods
  async getJobStats(userId: string, userType: 'client' | 'professional') {
    const whereClause = userType === 'client' 
      ? { client_id: userId }
      : { professional_id: userId };

    const stats = await this.prisma.job.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true }
    });

    const totalEarnings = userType === 'professional' 
      ? await this.prisma.job.aggregate({
          where: { 
            professional_id: userId,
            status: JobStatus.completed
          },
          _sum: { agreed_price: true }
        })
      : null;

    return {
      jobsByStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<JobStatus, number>),
      totalEarnings: totalEarnings?._sum.agreed_price || 0,
      totalJobs: stats.reduce((sum, stat) => sum + stat._count.status, 0)
    };
  }

  async getConversionAnalytics(userId: string, userType: 'professional') {
    if (userType !== 'professional') {
      throw new ForbiddenException('Only professionals can view conversion analytics');
    }

    const totalContacts = await this.prisma.contactInteraction.count({
      where: { professional_id: userId }
    });

    const convertedContacts = await this.prisma.contactInteraction.count({
      where: { 
        professional_id: userId,
        converted_to_job: true
      }
    });

    const conversionRate = totalContacts > 0 ? (convertedContacts / totalContacts) * 100 : 0;

    const contactsByMethod = await this.prisma.contactInteraction.groupBy({
      by: ['contact_method'],
      where: { professional_id: userId },
      _count: { contact_method: true }
    });

    return {
      totalContacts,
      convertedContacts,
      conversionRate: Math.round(conversionRate * 100) / 100,
      contactsByMethod: contactsByMethod.reduce((acc, contact) => {
        acc[contact.contact_method] = contact._count.contact_method;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}