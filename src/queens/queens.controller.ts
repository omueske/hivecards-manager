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
  create(@Body() dto: CreateQueenDto, @CurrentUser() user: { id: string }) {
    this.logger.log(`Create queen user=${user.id}`);
    return this.svc.create(dto, user.id);
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
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateQueenDto>,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Update queen id=${id} user=${user.id}`);
    return this.svc.update(id, dto, user.id);
  }

  @Post(':id/assign')
  assignToHive(
    @Param('id') id: string,
    @Body() dto: AssignQueenDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Assign queen id=${id} to hiveId=${dto.hiveId} user=${user.id}`);
    return this.svc.assignToHive(id, dto, user.id);
  }

  @Post(':id/remove-from-hive')
  removeFromHive(
    @Param('id') id: string,
    @Body() dto: RemoveQueenFromHiveDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Remove queen id=${id} from hive user=${user.id}`);
    return this.svc.removeFromHive(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.log(`Delete queen id=${id} user=${user.id}`);
    return this.svc.remove(id, user.id);
  }
}
