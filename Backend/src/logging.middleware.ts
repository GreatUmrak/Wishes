import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('📨 Incoming Request:', {
      method: req.method,
      url: req.url,
      cookies: req.cookies,
      'user-agent': req.headers['user-agent'],
    });

    const originalSend = res.send;
    res.send = function(body) {
      console.log('📤 Response:', {
        statusCode: res.statusCode,
        url: req.url,
      });
      return originalSend.call(this, body);
    };

    next();
  }
}