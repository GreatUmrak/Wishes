import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.wish.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const wish = await this.prisma.wish.findUnique({
      where: { id },
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return wish;
  }

  async create(createWishDto: CreateWishDto, userId: number) {
    return this.prisma.wish.create({
      data: {
        ...createWishDto,
        userId,
      },
    });
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.wish.update({
      where: { id },
      data: updateWishDto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.wish.delete({
      where: { id },
    });
  }

  async toggleComplete(id: number, userId: number) {
    const wish = await this.findOne(id, userId);

    return this.prisma.wish.update({
      where: { id },
      data: {
        isCompleted: !wish.isCompleted,
        updatedAt: new Date()
      },
    });
  }
}