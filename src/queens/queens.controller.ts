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
import { QueensService } from './queens.service';
import { CreateQueenDto, AssignQueenDto, RemoveQueenFromHiveDto } from './dto/create-queen.dto';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('api/v1/queens')
export class QueensController {
  private readonly logger = new Logger(QueensController.name);
  constructor(private readonly svc: QueensService) {}

  @Post()
  async create(@Body() dto: CreateQueenDto, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Create queen request status=${dto.status ?? 'spare'} user=${user.id}`);
    const res = await this.svc.create(dto, user.id);
    this.logger.log(`Created queen id=${(res as any).id} status=${(res as any).status} user=${user.id}`);
    return res;
  }

  @Get()
  findAll(
    @Query('hiveId') hiveId: string,
    @CurrentUser() user: { id: string },
  ) {
    if (hiveId) {
      this.logger.debug(`List queens by hiveId=${hiveId} user=${user.id}`);
      return this.svc.findByHive(hiveId, user.id);
    }
    this.logger.debug(`List all queens user=${user.id}`);
    return this.svc.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Get queen id=${id} user=${user.id}`);
    return this.svc.findOne(id, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateQueenDto>,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Update queen request id=${id} fields=${Object.keys(dto).join(',')} user=${user.id}`);
    const res = await this.svc.update(id, dto, user.id);
    this.logger.log(`Updated queen id=${id} user=${user.id}`);
    return res;
  }

  @Post(':id/assign')
  async assignToHive(
    @Param('id') id: string,
    @Body() dto: AssignQueenDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Assign queen request id=${id} to hiveId=${dto.hiveId} from=${dto.from ?? 'now'} user=${user.id}`);
    const res = await this.svc.assignToHive(id, dto, user.id);
    this.logger.log(`Assigned queen id=${id} to hiveId=${dto.hiveId} user=${user.id}`);
    return res;
  }

  @Post(':id/remove-from-hive')
  async removeFromHive(
    @Param('id') id: string,
    @Body() dto: RemoveQueenFromHiveDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Remove queen from hive request id=${id} to=${dto.to ?? 'now'} user=${user.id}`);
    const res = await this.svc.removeFromHive(id, dto, user.id);
    this.logger.log(`Removed queen id=${id} from hive → status=spare user=${user.id}`);
    return res;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Delete queen request id=${id} user=${user.id}`);
    await this.svc.remove(id, user.id);
    this.logger.log(`Deleted queen id=${id} user=${user.id}`);
  }
}
