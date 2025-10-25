import { IsString, IsUrl, IsOptional, IsEnum } from 'class-validator';
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
  priority?: Priority = Priority.MEDIUM;
}