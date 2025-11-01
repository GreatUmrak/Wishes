import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);
    const username = dto.username || dto.email.split('@')[0];

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        username: username
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role
      }
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      console.log('❌ User not found:', dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.password, dto.password);
    if (!passwordValid) {
      console.log('❌ Invalid password for user:', dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('✅ Password valid for user:', user.email);

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role
      }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key'
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user) throw new UnauthorizedException();

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      console.log('❌ Refresh token error:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: number, email: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, role },
      {
        secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
        expiresIn: "15m",
      }
    );

    const refreshToken = this.jwt.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
        expiresIn: "7d",
      }
    );

    console.log('🔑 Generated tokens for user:', email);

    return { accessToken, refreshToken };
  }
}