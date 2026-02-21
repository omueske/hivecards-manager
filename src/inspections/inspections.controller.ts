import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('api/v1/inspections')
export class InspectionsController {
  private readonly logger = new Logger(InspectionsController.name);
  constructor(private readonly svc: InspectionsService) {}

  @Post()
  async create(
    @Body() dto: CreateInspectionDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Create inspection request hiveId=${dto.hiveId} type=${dto.type ?? 'note'} user=${user.id}`);
    const res = await this.svc.create(dto, user.id);
    this.logger.log(`Created inspection id=${(res as any).id} hiveId=${dto.hiveId} type=${dto.type ?? 'note'} user=${user.id}`);
    return res;
  }

  @Get()
  findAll(
    @Query('hiveId') hiveId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`List inspections hiveId=${hiveId ?? 'all'} page=${page ?? 1} limit=${limit ?? 50} user=${user.id}`);
    return this.svc.findAll(
      hiveId,
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateInspectionDto>,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Update inspection request id=${id} fields=${Object.keys(dto).join(',')} user=${user.id}`);
    const res = await this.svc.update(id, dto, user.id);
    this.logger.log(`Updated inspection id=${id} user=${user.id}`);
    return res;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Delete inspection request id=${id} user=${user.id}`);
    await this.svc.remove(id, user.id);
    this.logger.log(`Deleted inspection id=${id} user=${user.id}`);
  }
}
