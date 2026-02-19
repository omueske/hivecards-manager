import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { HiveService } from './hives.service';
import { CreateHiveDto } from './dto/create-hive.dto';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ValidationPipe } from '@nestjs/common';

@Controller('api/v1/hives')
export class HiveController {
  private readonly logger = new Logger(HiveController.name);
  constructor(private readonly hiveService: HiveService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateHiveDto,
    @CurrentUser() user: { id: string },
  ) {
    if (!dto.hiveNumber) {
      this.logger.warn('Create hive attempt missing hiveNumber');
      throw new BadRequestException('hiveNumber required');
    }
    this.logger.log(`Creating hive hiveNumber=${dto.hiveNumber} apiaryId=${dto.apiaryId ?? 'N/A'}`);
    const res = await this.hiveService.create(dto, user.id);
    this.logger.log(`Created hive id=${(res as any).id}`);
    return res;
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('apiaryId') apiaryId?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '25',
  ) {
    const filter: any = {};
    if (apiaryId) filter.apiaryId = apiaryId;
    if (status) filter.status = status;
    this.logger.log(`Find all hives filter=${JSON.stringify(filter)} page=${page} limit=${limit}`);
    const res = await this.hiveService.findAll(filter, user.id, Number(page), Number(limit));
    this.logger.log(`FindAll returned ${((res as any).pagination?.total ?? (res as any).items?.length ?? 0)} hives`);
    return res;
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.log(`Find hive id=${id}`);
    const res = await this.hiveService.findOne(id, user.id);
    this.logger.log(`Found hive id=${id}`);
    return res;
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateHiveDto>,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Update hive id=${id} changes=${JSON.stringify(dto)}`);
    const res = await this.hiveService.update(id, dto, user.id);
    this.logger.log(`Updated hive id=${id}`);
    return res;
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.log(`Remove (archive) hive id=${id}`);
    const res = await this.hiveService.remove(id, user.id);
    this.logger.log(`Archived hive id=${id}`);
    return res;
  }
}
