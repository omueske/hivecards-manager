import { Controller, Get, Post, Body, UseGuards, Logger, Param, Put, Delete } from '@nestjs/common';
import { ApiariesService } from './apiaries.service';
import { CreateApiaryDto } from './dto/create-apiary.dto';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('api/v1/apiaries')
export class ApiariesController {
  private readonly logger = new Logger(ApiariesController.name);
  constructor(private readonly apiariesService: ApiariesService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() dto: CreateApiaryDto, @CurrentUser() user: { id: string }) {
    this.logger.log(`Create apiary name=${dto.name}`);
    return this.apiariesService.create(dto, user.id);
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    this.logger.log(`List apiaries user=${user.id}`);
    return this.apiariesService.findAll(user.id);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.log(`Get apiary id=${id}`);
    return this.apiariesService.findOne(id, user.id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateApiaryDto>,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Update apiary id=${id}`);
    return this.apiariesService.update(id, dto, user.id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.log(`Delete apiary id=${id}`);
    return this.apiariesService.remove(id, user.id);
  }
}
