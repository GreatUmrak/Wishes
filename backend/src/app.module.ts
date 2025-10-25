import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WishesModule } from './wishes/wishes.module';

@Module({
  imports: [PrismaModule, AuthModule,  WishesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
