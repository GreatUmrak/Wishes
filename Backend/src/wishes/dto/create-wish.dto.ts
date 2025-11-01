import { IsString, IsUrl, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateWishDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}