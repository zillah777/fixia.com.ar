import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('popular')
  async findPopular() {
    return this.categoriesService.findPopular();
  }

  // TEMPORARY: Endpoint to seed categories in production
  // TODO: Remove this after seeding production database
  @Post('seed')
  async seedCategories() {
    return this.categoriesService.seedCategories();
  }
}
