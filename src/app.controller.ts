import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

type DatabaseHealthRow = {
  database: string;
  serverTime: Date;
};

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/database')
  @ApiOperation({
    summary: 'Check the PostgreSQL database connection',
  })
  async checkDatabase() {
    const [result] = await this.prisma.$queryRaw<DatabaseHealthRow[]>`
        SELECT
          current_database() AS database,
          NOW() AS "serverTime"
      `;

    return {
      success: true,
      message: 'Database connection is working',
      data: result,
    };
  }
}
