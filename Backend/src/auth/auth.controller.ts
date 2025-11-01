import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    console.log('👤 Registration attempt for:', dto.email);

    const result = await this.authService.register(dto);

    console.log('✅ Registration successful, setting cookies');
    this.setCookies(res, result);

    return res.json({
      message: 'Registered',
      accessToken: result.accessToken,
      user: result.user
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    console.log('🔐 Login attempt for:', dto.email);

    const result = await this.authService.login(dto);

    console.log('✅ Login successful, setting cookies');
    this.setCookies(res, result);

    return res.json({
      message: 'Logged in',
      accessToken: result.accessToken,
      user: result.user
    });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    console.log('🔄 Refresh token attempt');

    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      console.log('❌ No refresh token in cookies');
      throw new UnauthorizedException();
    }

    const tokens = await this.authService.refresh(refreshToken);
    this.setCookies(res, tokens);

    return res.json({ message: 'Tokens refreshed' });
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out' });
  }

  @Get('debug')
  async debug(@Req() req: Request, @Res() res: Response) {
    console.log('📋 Debug - Cookies:', req.cookies);
    console.log('🔑 Debug - Headers:', req.headers);

    return res.json({
      cookies: req.cookies,
      headers: req.headers,
      message: 'Debug endpoint'
    });
  }

  private setCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log('🍪 Cookies set for accessToken');
  }
}