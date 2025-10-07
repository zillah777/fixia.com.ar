import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobStatusDto, CreateMilestoneDto, CreateContactInteractionDto } from './dto/create-job.dto';

@ApiTags('Jobs & Transaction Tracking')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job from accepted proposal' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Job created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid job data or proposal not accepted' })
  async createJob(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobsService.createJob(createJobDto);
  }

  @Get('my-jobs')
  @ApiOperation({ summary: 'Get all jobs for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jobs retrieved successfully' })
  async getMyJobs(@Request() req) {
    const userType = req.user.user_type;
    return this.jobsService.findJobsByUser(req.user.sub, userType);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get job statistics for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getJobStats(@Request() req) {
    const userType = req.user.user_type;
    return this.jobsService.getJobStats(req.user.sub, userType);
  }

  @Get('conversion-analytics')
  @ApiOperation({ summary: 'Get conversion analytics (professionals only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only professionals can access this endpoint' })
  async getConversionAnalytics(@Request() req) {
    return this.jobsService.getConversionAnalytics(req.user.sub, req.user.user_type);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get job details by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job details retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  async getJobById(@Param('jobId') jobId: string) {
    return this.jobsService.findJobById(jobId);
  }

  @Put(':jobId/status')
  @ApiOperation({ summary: 'Update job status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job status updated successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to update this job' })
  async updateJobStatus(
    @Param('jobId') jobId: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
    @Request() req
  ) {
    return this.jobsService.updateJobStatus(jobId, req.user.sub, updateJobStatusDto);
  }

  @Post(':jobId/milestones')
  @ApiOperation({ summary: 'Create a new milestone for a job' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Milestone created successfully' })
  async createMilestone(
    @Param('jobId') jobId: string,
    @Body() createMilestoneDto: CreateMilestoneDto
  ) {
    return this.jobsService.createMilestone(jobId, createMilestoneDto);
  }

  @Put('milestones/:milestoneId/complete')
  @ApiOperation({ summary: 'Mark milestone as completed (professional only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Milestone marked as completed' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only professional can complete milestones' })
  async completeMilestone(@Param('milestoneId') milestoneId: string, @Request() req) {
    return this.jobsService.completeMilestone(milestoneId, req.user.sub);
  }

  @Put('milestones/:milestoneId/approve')
  @ApiOperation({ summary: 'Approve milestone (client only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Milestone approved successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only client can approve milestones' })
  async approveMilestone(@Param('milestoneId') milestoneId: string, @Request() req) {
    return this.jobsService.approveMilestone(milestoneId, req.user.sub);
  }

  @Post('contacts')
  @ApiOperation({ summary: 'Record a contact interaction' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Contact interaction recorded successfully' })
  async createContactInteraction(
    @Body() createContactInteractionDto: CreateContactInteractionDto,
    @Request() req
  ) {
    return this.jobsService.createContactInteraction(req.user.sub, createContactInteractionDto);
  }

  @Get('contacts/my-contacts')
  @ApiOperation({ summary: 'Get all contact interactions for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact interactions retrieved successfully' })
  async getMyContacts(@Request() req) {
    const userType = req.user.user_type;
    return this.jobsService.getContactInteractions(req.user.sub, userType);
  }

  @Put('contacts/:contactId/convert')
  @ApiOperation({ summary: 'Mark contact as converted to job' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact marked as converted' })
  async markContactAsConverted(
    @Param('contactId') contactId: string,
    @Body() body: { jobId: string; conversionValue?: number }
  ) {
    return this.jobsService.markContactAsConverted(contactId, body.jobId, body.conversionValue);
  }
}