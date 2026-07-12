import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ListContactMessagesQueryDto } from './dto/list-contact-messages-query.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';

@Injectable()
export class ContactMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: {
        name: createDto.name.trim(),
        phone: createDto.phone.trim(),
        message: createDto.message.trim(),
        status: 'NEW',
      },

      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findAll(queryDto: ListContactMessagesQueryDto) {
    const page = queryDto.page;
    const limit = queryDto.limit;
    const skip = (page - 1) * limit;

    const search = queryDto.search?.trim();

    const where: Prisma.ContactMessageWhereInput = {
      ...(queryDto.status
        ? {
            status: queryDto.status,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                message: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [messages, total, newCount, readCount, archivedCount] =
      await this.prisma.$transaction([
        this.prisma.contactMessage.findMany({
          where,

          orderBy: {
            createdAt: 'desc',
          },

          skip,
          take: limit,

          select: {
            id: true,
            name: true,
            phone: true,
            message: true,
            status: true,
            readAt: true,
            createdAt: true,
          },
        }),

        this.prisma.contactMessage.count({
          where,
        }),

        this.prisma.contactMessage.count({
          where: {
            status: 'NEW',
          },
        }),

        this.prisma.contactMessage.count({
          where: {
            status: 'READ',
          },
        }),

        this.prisma.contactMessage.count({
          where: {
            status: 'ARCHIVED',
          },
        }),
      ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
      counts: {
        new: newCount,
        read: readCount,
        archived: archivedCount,
        all: newCount + readCount + archivedCount,
      },
    };
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: {
        id,
      },
    });

    if (!message) {
      throw new NotFoundException('Contact message was not found');
    }

    return message;
  }

  async updateStatus(id: string, updateDto: UpdateContactMessageStatusDto) {
    const existingMessage = await this.findOne(id);

    const status = updateDto.status;

    let readAt = existingMessage.readAt;

    if (status === 'NEW') {
      readAt = null;
    }

    if (status === 'READ' && !existingMessage.readAt) {
      readAt = new Date();
    }

    if (status === 'ARCHIVED' && !existingMessage.readAt) {
      readAt = new Date();
    }

    return this.prisma.contactMessage.update({
      where: {
        id,
      },
      data: {
        status,
        readAt,
      },
    });
  }
}
