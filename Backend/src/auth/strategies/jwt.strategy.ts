import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          // Пробуем получить из cookies
          if (req?.cookies?.accessToken) {
            console.log('✅ JWT found in cookies');
            return req.cookies.accessToken;
          }

          // Пробуем получить из headers
          if (req?.headers?.authorization) {
            console.log('✅ JWT found in headers');
            return req.headers.authorization.replace('Bearer ', '');
          }

          console.log('❌ No JWT found');
          return null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'access-secret-key'
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT Validation - payload received:', {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    });

    if (!payload || !payload.sub) {
      console.log('❌ Invalid payload');
      throw new UnauthorizedException('Invalid token');
    }

    // Проверяем существование пользователя
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true }
    });

    await prisma.$disconnect();

    if (!user) {
      console.log('❌ User not found in database');
      throw new UnauthorizedException('User not found');
    }

    console.log('✅ JWT Validation successful for user:', user.email);

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}