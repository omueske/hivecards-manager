import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { HiveService } from './hives.service';
import { CreateHiveDto } from './dto/create-hive.dto';
import { JwtGuard } from '../common/jwt.guard';
import { ValidationPipe } from '@nestjs/common';

@Controller('api/v1/hives')
export class HiveController {
  constructor(private readonly hiveService: HiveService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body(new ValidationPipe({ whitelist: true })) dto: CreateHiveDto) {
    if (!dto.hiveNumber) throw new BadRequestException('hiveNumber required');
    return this.hiveService.create(dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(@Query('apiaryId') apiaryId?: string, @Query('page') page = '1', @Query('limit') limit = '25') {
    const filter: any = {};
    if (apiaryId) filter.apiaryId = apiaryId;
    return this.hiveService.findAll(filter, Number(page), Number(limit));
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hiveService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateHiveDto>) {
    return this.hiveService.update(id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.hiveService.remove(id);
  }
}
