import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Servicios')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('professional')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo servicio (solo profesionales)' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo profesionales pueden crear servicios' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createServiceDto: CreateServiceDto, @CurrentUser() user: any) {
    return this.servicesService.create(user.sub, createServiceDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar servicios con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista paginada de servicios' })
  findAll(@Query() filters: ServiceFiltersDto) {
    return this.servicesService.findAll(filters);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Obtener servicios destacados' })
  @ApiResponse({ status: 200, description: 'Lista de servicios destacados' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de servicios a retornar' })
  getFeaturedServices(@Query('limit') limit?: number) {
    return this.servicesService.getFeaturedServices(limit);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Obtener todas las categorías de servicios' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  getCategories() {
    return this.servicesService.getCategories();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener detalles de un servicio específico' })
  @ApiParam({ name: 'id', description: 'ID del servicio', type: 'string' })
  @ApiResponse({ status: 200, description: 'Detalles del servicio' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.servicesService.findOne(id, user?.sub);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un servicio propio' })
  @ApiParam({ name: 'id', description: 'ID del servicio', type: 'string' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo puedes actualizar tus propios servicios' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: any,
  ) {
    return this.servicesService.update(id, user.sub, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un servicio propio' })
  @ApiParam({ name: 'id', description: 'ID del servicio', type: 'string' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo puedes eliminar tus propios servicios' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.servicesService.remove(id, user.sub);
  }
}