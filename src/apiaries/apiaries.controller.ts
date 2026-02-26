import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Logger,
  Param,
  Put,
  Delete,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
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
  async create(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateApiaryDto,
    @CurrentUser() user: { id: string },
  ) {
    if (!dto.name || !dto.name.trim()) {
      this.logger.warn('Create apiary attempt missing name');
      throw new BadRequestException('name required');
    }
    this.logger.debug(`Create apiary request name=${dto.name} user=${user.id}`);
    const res = await this.apiariesService.create(dto, user.id);
    this.logger.log(`Created apiary id=${(res as any).id} name=${dto.name} user=${user.id}`);
    return res;
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    this.logger.debug(`List apiaries user=${user.id}`);
    return this.apiariesService.findAll(user.id);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Get apiary id=${id} user=${user.id}`);
    return this.apiariesService.findOne(id, user.id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateApiaryDto>,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Update apiary request id=${id} fields=${Object.keys(dto).join(',')} user=${user.id}`);
    const res = await this.apiariesService.update(id, dto, user.id);
    this.logger.log(`Updated apiary id=${id} user=${user.id}`);
    return res;
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Delete apiary request id=${id} user=${user.id}`);
    const res = await this.apiariesService.remove(id, user.id);
    this.logger.log(`Deleted apiary id=${id} user=${user.id}`);
    return res;
  }
}
