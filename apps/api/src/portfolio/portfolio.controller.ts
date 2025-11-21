import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
    ParseBoolPipe,
    ParseIntPipe,
    Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) { }

    @Get('user/:userId')
    @Public()
    @ApiOperation({ summary: 'Get portfolio items for a user (public)' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiQuery({ name: 'featured', required: false, type: Boolean })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Portfolio items retrieved successfully' })
    findByUserId(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Query('featured') featured?: boolean,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.portfolioService.findByUserId(userId, featured, limit);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get a single portfolio item by ID (public)' })
    @ApiParam({ name: 'id', description: 'Portfolio item ID' })
    @ApiResponse({ status: 200, description: 'Portfolio item retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Portfolio item not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const item = await this.portfolioService.findOne(id);

        // Increment views count (fire and forget)
        this.portfolioService.incrementViews(id).catch(() => { });

        return item;
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new portfolio item (authenticated)' })
    @ApiResponse({ status: 201, description: 'Portfolio item created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    create(@Body() dto: CreatePortfolioItemDto, @CurrentUser() user: any) {
        return this.portfolioService.create(user.sub, dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a portfolio item (owner only)' })
    @ApiParam({ name: 'id', description: 'Portfolio item ID' })
    @ApiResponse({ status: 200, description: 'Portfolio item updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
    @ApiResponse({ status: 404, description: 'Portfolio item not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePortfolioItemDto,
        @CurrentUser() user: any,
    ) {
        return this.portfolioService.update(id, user.sub, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a portfolio item (owner only)' })
    @ApiParam({ name: 'id', description: 'Portfolio item ID' })
    @ApiResponse({ status: 200, description: 'Portfolio item deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
    @ApiResponse({ status: 404, description: 'Portfolio item not found' })
    delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
        return this.portfolioService.delete(id, user.sub);
    }

    @Patch('reorder')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder portfolio items (owner only)' })
    @ApiResponse({ status: 200, description: 'Portfolio items reordered successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
    reorder(
        @Body() body: { items: Array<{ id: string; display_order: number }> },
        @CurrentUser() user: any,
    ) {
        return this.portfolioService.reorder(user.sub, body.items);
    }
}
