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
  create(
    @Body() dto: CreateInspectionDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Create inspection hiveId=${dto.hiveId} type=${dto.type ?? 'note'} user=${user.id}`);
    return this.svc.create(dto, user.id);
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
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateInspectionDto>,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Update inspection id=${id} user=${user.id}`);
    return this.svc.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Delete inspection id=${id} user=${user.id}`);
    return this.svc.remove(id, user.id);
  }
}
