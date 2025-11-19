import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Proyectos')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo clientes pueden crear proyectos' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(user.sub, createProjectDto);
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Listar proyectos propios del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos propios' })
  async getMyProjects(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.sub);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar proyectos',
    description: 'Clientes ven sus propios proyectos. Profesionales ven proyectos abiertos disponibles.'
  })
  @ApiResponse({ status: 200, description: 'Lista de proyectos' })
  findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un proyecto específico' })
  @ApiParam({ name: 'id', description: 'ID del proyecto', type: 'string' })
  @ApiResponse({ status: 200, description: 'Detalles del proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para ver este proyecto' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un proyecto propio' })
  @ApiParam({ name: 'id', description: 'ID del proyecto', type: 'string' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo puedes actualizar tus propios proyectos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.update(id, user.sub, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un proyecto propio' })
  @ApiParam({ name: 'id', description: 'ID del proyecto', type: 'string' })
  @ApiResponse({ status: 200, description: 'Proyecto eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo puedes eliminar tus propios proyectos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.projectsService.remove(id, user.sub);
  }
}