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
} from '@nestjs/common';
import { QueensService } from './queens.service';
import { CreateQueenDto, AssignQueenDto, RemoveQueenFromHiveDto } from './dto/create-queen.dto';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('api/v1/queens')
export class QueensController {
  constructor(private readonly svc: QueensService) {}

  @Post()
  create(@Body() dto: CreateQueenDto, @CurrentUser() user: { id: string }) {
    return this.svc.create(dto, user.id);
  }

  @Get()
  findAll(
    @Query('hiveId') hiveId: string,
    @CurrentUser() user: { id: string },
  ) {
    if (hiveId) return this.svc.findByHive(hiveId, user.id);
    return this.svc.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.svc.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateQueenDto>,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.update(id, dto, user.id);
  }

  @Post(':id/assign')
  assignToHive(
    @Param('id') id: string,
    @Body() dto: AssignQueenDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.assignToHive(id, dto, user.id);
  }

  @Post(':id/remove-from-hive')
  removeFromHive(
    @Param('id') id: string,
    @Body() dto: RemoveQueenFromHiveDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.removeFromHive(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.svc.remove(id, user.id);
  }
}
