import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  username?: string;  // Сделал опциональным

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  password: string;
}