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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { BreedingBookService } from './breeding-book.service';
import { CreateBreedingBookEntryDto } from './dto/create-breeding-book-entry.dto';
import { ImportBreedingBookCsvDto } from './dto/import-breeding-book-csv.dto';

@UseGuards(JwtGuard)
@Controller('api/v1/breeding-book')
export class BreedingBookController {
  private readonly logger = new Logger(BreedingBookController.name);

  constructor(private readonly svc: BreedingBookService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('queenId') queenId?: string,
    @Query('hiveId') hiveId?: string,
  ) {
    this.logger.debug(`List breeding book entries user=${user.id} queenId=${queenId ?? '-'} hiveId=${hiveId ?? '-'}`);
    return this.svc.findAll(user.id, { queenId, hiveId });
  }

  @Get('export-csv')
  async exportCsv(
    @CurrentUser() user: { id: string },
    @Query('queenId') queenId: string | undefined,
    @Query('hiveId') hiveId: string | undefined,
    @Res() res: Response,
  ) {
    this.logger.debug(
      `Export breeding book CSV user=${user.id} queenId=${queenId ?? '-'} hiveId=${hiveId ?? '-'}`,
    );
    const csv = await this.svc.exportCsv(user.id, { queenId, hiveId });
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="breeding-book-${date}.csv"`);
    res.status(200).send(`\uFEFF${csv}`);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Get breeding book entry id=${id} user=${user.id}`);
    return this.svc.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateBreedingBookEntryDto, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Create breeding book entry user=${user.id} queenId=${dto.queenId ?? '-'} code1a=${dto.code1a ?? '-'}`);
    return this.svc.create(dto, user.id);
  }

  @Post('import-csv')
  importCsv(@Body() dto: ImportBreedingBookCsvDto, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Import breeding book CSV user=${user.id} bytes=${dto.csvContent?.length ?? 0}`);
    return this.svc.importCsv(dto.csvContent, user.id);
  }

  @Post('preview-csv')
  previewCsv(@Body() dto: ImportBreedingBookCsvDto, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Preview breeding book CSV user=${user.id} bytes=${dto.csvContent?.length ?? 0}`);
    return this.svc.previewCsv(dto.csvContent);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateBreedingBookEntryDto,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.debug(`Update breeding book entry id=${id} user=${user.id}`);
    return this.svc.update(id, dto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    this.logger.debug(`Delete breeding book entry id=${id} user=${user.id}`);
    await this.svc.remove(id, user.id);
    return { success: true };
  }
}
