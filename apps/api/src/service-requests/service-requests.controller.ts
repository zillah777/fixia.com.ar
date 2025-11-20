import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { RespondServiceRequestDto } from './dto/respond-service-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Service Requests Controller
 * 
 * Handles HTTP endpoints for service request management.
 * Follows NestJS 2025 best practices with Swagger documentation.
 */
@ApiTags('Service Requests')
@Controller('service-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServiceRequestsController {
    constructor(private readonly serviceRequestsService: ServiceRequestsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a service request (client)' })
    @ApiResponse({ status: 201, description: 'Service request created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input or duplicate request' })
    @ApiResponse({ status: 404, description: 'Service not found' })
    create(@Body() createDto: CreateServiceRequestDto, @CurrentUser() user: any) {
        return this.serviceRequestsService.create(user.sub, createDto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my service requests (as client)' })
    @ApiResponse({ status: 200, description: 'List of service requests' })
    getMyRequests(@CurrentUser() user: any) {
        return this.serviceRequestsService.getMyRequests(user.sub);
    }

    @Get('incoming')
    @ApiOperation({ summary: 'Get incoming service requests (as professional)' })
    @ApiResponse({ status: 200, description: 'List of incoming requests' })
    getIncomingRequests(@CurrentUser() user: any) {
        return this.serviceRequestsService.getIncomingRequests(user.sub);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific service request' })
    @ApiParam({ name: 'id', description: 'Service request ID', type: 'string' })
    @ApiResponse({ status: 200, description: 'Service request details' })
    @ApiResponse({ status: 403, description: 'Not authorized to view this request' })
    @ApiResponse({ status: 404, description: 'Service request not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.serviceRequestsService.findOne(id, user.sub);
    }

    @Post(':id/accept')
    @ApiOperation({ summary: 'Accept a service request (professional)' })
    @ApiParam({ name: 'id', description: 'Service request ID', type: 'string' })
    @ApiResponse({ status: 200, description: 'Request accepted, match created' })
    @ApiResponse({ status: 400, description: 'Request already processed' })
    @ApiResponse({ status: 403, description: 'Not authorized to accept this request' })
    @ApiResponse({ status: 404, description: 'Service request not found' })
    accept(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() respondDto: RespondServiceRequestDto,
        @CurrentUser() user: any,
    ) {
        return this.serviceRequestsService.accept(id, user.sub, respondDto);
    }

    @Post(':id/reject')
    @ApiOperation({ summary: 'Reject a service request (professional)' })
    @ApiParam({ name: 'id', description: 'Service request ID', type: 'string' })
    @ApiResponse({ status: 200, description: 'Request rejected' })
    @ApiResponse({ status: 400, description: 'Request already processed' })
    @ApiResponse({ status: 403, description: 'Not authorized to reject this request' })
    @ApiResponse({ status: 404, description: 'Service request not found' })
    reject(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() respondDto: RespondServiceRequestDto,
        @CurrentUser() user: any,
    ) {
        return this.serviceRequestsService.reject(id, user.sub, respondDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel a service request (client)' })
    @ApiParam({ name: 'id', description: 'Service request ID', type: 'string' })
    @ApiResponse({ status: 200, description: 'Request cancelled' })
    @ApiResponse({ status: 400, description: 'Can only cancel pending requests' })
    @ApiResponse({ status: 403, description: 'Not authorized to cancel this request' })
    @ApiResponse({ status: 404, description: 'Service request not found' })
    cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.serviceRequestsService.cancel(id, user.sub);
    }
}
