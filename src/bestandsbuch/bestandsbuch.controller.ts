import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { BestandsbuchService } from './bestandsbuch.service';
import { CreateBestandsbuchEntryDto } from './dto/create-bestandsbuch-entry.dto';

@UseGuards(JwtGuard)
@Controller('api/v1/bestandsbuch')
export class BestandsbuchController {
  private readonly logger = new Logger(BestandsbuchController.name);

  constructor(private readonly svc: BestandsbuchService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('year') year?: string,
    @Query('hiveId') hiveId?: string,
  ) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    this.logger.debug(`List bestandsbuch entries user=${user.id} year=${parsedYear ?? '-'} hiveId=${hiveId ?? '-'}`);
    return this.svc.findAll(user.id, { year: parsedYear, hiveId });
  }

  @Get('years')
  findYears(@CurrentUser() user: { id: string }) {
    return this.svc.findYears(user.id);
  }

  @Post()
  create(@Body() dto: CreateBestandsbuchEntryDto, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Create bestandsbuch entry user=${user.id} hiveId=${dto.hiveId ?? '-'} date=${dto.applicationDate ?? '-'}`);
    return this.svc.create(dto, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateBestandsbuchEntryDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Update bestandsbuch entry id=${id} user=${user.id}`);
    return this.svc.update(id, dto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Delete bestandsbuch entry id=${id} user=${user.id}`);
    await this.svc.remove(id, user.id);
    return { success: true };
  }
}
