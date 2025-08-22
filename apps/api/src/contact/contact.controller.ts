import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Contacto')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar mensaje de contacto' })
  @ApiResponse({ status: 200, description: 'Mensaje enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  submitContact(@Body() contactDto: ContactDto) {
    return this.contactService.submitContact(contactDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admins can see contact stats
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de mensajes de contacto (Admin)' })
  @ApiResponse({ status: 200, description: 'Estadísticas de contacto' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  getContactStats() {
    return this.contactService.getContactStats();
  }
}