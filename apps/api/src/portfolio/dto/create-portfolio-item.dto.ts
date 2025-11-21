import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUrl, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioItemDto {
    @ApiProperty({ description: 'Title of the portfolio item', maxLength: 200 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiPropertyOptional({ description: 'Description of the portfolio item' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Image URL (Cloudinary)' })
    @IsString()
    @IsUrl()
    image_url: string;

    @ApiPropertyOptional({ description: 'Project URL' })
    @IsString()
    @IsUrl()
    @IsOptional()
    project_url?: string;

    @ApiPropertyOptional({ description: 'Category', maxLength: 100 })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;

    @ApiPropertyOptional({ description: 'Tags array' })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ description: 'Featured flag', default: false })
    @IsBoolean()
    @IsOptional()
    featured?: boolean;
}
