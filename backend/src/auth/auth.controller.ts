import { Body, Controller, Post, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Определяем контроллер для маршрутов аутентификации
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Регистрация пользователя
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const tokens = await this.authService.register(dto);
    this.setCookies(res, tokens);
    return res.json({ message: 'Registered' });
  }

  // Вход пользователя
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(dto);
    this.setCookies(res, tokens);
    return res.json({ message: 'Logged in' });
  }

  // Обновление токенов
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException();
    const tokens = await this.authService.refresh(refreshToken);
    this.setCookies(res, tokens);
    return res.json({ message: 'Tokens refreshed' });
  }

  // Выход пользователя
  @Post('logout')
  @UseGuards(AuthGuard('jwt')) // Защищаем маршрут JWT-аутентификацией
  async logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out' });
  }

  // Устанавливаем токены в cookies
  private setCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: false, sameSite: 'lax' });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: false, sameSite: 'lax' });
  }
}