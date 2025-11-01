import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('wishes')
@UseGuards(AuthGuard('jwt')) // ВРЕМЕННО ЗАКОММЕНТИРУЙТЕ ЭТУ СТРОКУ ДЛЯ ТЕСТИРОВАНИЯ
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get()
  findAll(@Request() req) {
    console.log('📦 Fetching wishes for user:', req.user?.userId);
    return this.wishesService.findAll(req.user?.userId);
  }

  @Post()
  create(@Body() createWishDto: CreateWishDto, @Request() req) {
    console.log('➕ Creating wish for user:', req.user?.userId);
    return this.wishesService.create(createWishDto, req.user?.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWishDto: UpdateWishDto, @Request() req) {
    console.log('✏️ Updating wish:', id, 'for user:', req.user?.userId);
    return this.wishesService.update(+id, updateWishDto, req.user?.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    console.log('🗑️ Deleting wish:', id, 'for user:', req.user?.userId);
    return this.wishesService.remove(+id, req.user?.userId);
  }

  @Patch(':id/toggle')
  toggleComplete(@Param('id') id: string, @Request() req) {
    console.log('🔄 Toggling wish:', id, 'for user:', req.user?.userId);
    return this.wishesService.toggleComplete(+id, req.user?.userId);
  }
}