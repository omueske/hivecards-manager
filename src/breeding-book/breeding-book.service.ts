import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BreedingBookEntry, BreedingBookEntryDocument } from './schemas/breeding-book-entry.schema';
import { CreateBreedingBookEntryDto } from './dto/create-breeding-book-entry.dto';
import { Queen, QueenDocument } from '../queens/schemas/queen.schema';

@Injectable()
export class BreedingBookService {
  private readonly logger = new Logger(BreedingBookService.name);
  private readonly exportHeaders = [
    'NST',
    'ANPAARTYP',
    'L1A',
    'LV1A',
    'Z1A',
    'NR1A',
    'J1A',
    '1A',
    'LINIE',
    'BEMERK',
    ...Array.from({ length: 7 }).flatMap((_, index) => {
      const nr = index + 1;
      return [`BIMI${nr}`, `BIMIGR${nr}`, `BIMID${nr}`, `BOMI${nr}`, `BOMITG${nr}`, `BOMID${nr}`];
    }),
  ] as const;

  constructor(
    @InjectModel(BreedingBookEntry.name)
    private readonly model: Model<BreedingBookEntryDocument>,
    @InjectModel(Queen.name)
    private readonly queenModel: Model<QueenDocument>,
  ) {}

  async findAll(userId: string, query: { queenId?: string; hiveId?: string }): Promise<any[]> {
    const filter: any = { userId };
    if (query.queenId) filter.queenId = query.queenId;
    if (query.hiveId) filter.hiveId = query.hiveId;

    const docs = await this.model.find(filter).sort({ createdAt: -1 }).lean().exec();
    return (docs as any[]).map((d) => ({ ...d, id: String(d._id) }));
  }

  async findOne(id: string, userId: string): Promise<any> {
    const doc = await this.model.findOne({ _id: id, userId }).lean().exec();
    if (!doc) throw new NotFoundException('Breeding book entry not found');
    return { ...(doc as any), id: String((doc as any)._id) };
  }

  async exportCsv(
    userId: string,
    query: { queenId?: string; hiveId?: string },
  ): Promise<string> {
    const filter: any = { userId };
    if (query.queenId) filter.queenId = query.queenId;
    if (query.hiveId) filter.hiveId = query.hiveId;

    const docs = await this.model.find(filter).sort({ createdAt: 1 }).lean().exec();
    this.logger.log(`Exporting breeding book CSV user=${userId} rows=${docs.length}`);

    const lines: string[] = [this.exportHeaders.join(';')];
    for (const doc of docs as any[]) {
      const row = this.exportHeaders.map((header) => this.toCsvCell(this.getExportValue(doc, header))).join(';');
      lines.push(row);
    }

    return lines.join('\n');
  }

  async create(dto: CreateBreedingBookEntryDto, userId: string): Promise<any> {
    const normalized = await this.normalizeAndLink(dto, userId);
    const doc = await this.model.create({
      ...normalized,
      userId,
      importFields: normalized.importFields ?? {},
      bimiSeries: normalized.bimiSeries ?? [],
      bomiSeries: normalized.bomiSeries ?? [],
      dateInputMode: normalized.dateInputMode ?? 'full',
    });

    this.logger.log(`Created breeding book entry id=${String(doc._id)} user=${userId}`);
    return { ...doc.toObject(), id: String(doc._id) };
  }

  async importCsv(csvContent: string, userId: string): Promise<any> {
    const analysis = this.analyzeCsv(csvContent);
    let imported = 0;
    const errors = [...analysis.errors];

    for (const item of analysis.validRows) {
      try {
        await this.create(item.dto, userId);
        imported += 1;
      } catch (error: any) {
        errors.push(`Line ${item.lineNo}: ${error?.message || 'Import failed'}`);
      }
    }

    return {
      total: analysis.total,
      imported,
      failed: errors.length,
      errors,
    };
  }

  previewCsv(csvContent: string): any {
    const analysis = this.analyzeCsv(csvContent);
    return {
      total: analysis.total,
      valid: analysis.validRows.length,
      invalid: analysis.errors.length,
      errors: analysis.errors,
      previewRows: analysis.previewRows,
    };
  }

  async update(id: string, dto: CreateBreedingBookEntryDto, userId: string): Promise<any> {
    const exists = await this.model.exists({ _id: id, userId });
    if (!exists) throw new NotFoundException('Breeding book entry not found');

    const normalized = await this.normalizeAndLink(dto, userId);
    const updated = await this.model
      .findOneAndUpdate(
        { _id: id, userId },
        {
          $set: {
            ...normalized,
            importFields: normalized.importFields ?? {},
            bimiSeries: normalized.bimiSeries ?? [],
            bomiSeries: normalized.bomiSeries ?? [],
            dateInputMode: normalized.dateInputMode ?? 'full',
          },
        },
        { new: true, lean: true },
      )
      .exec();

    if (!updated) throw new NotFoundException('Breeding book entry not found');
    this.logger.log(`Updated breeding book entry id=${id} user=${userId}`);
    return { ...(updated as any), id: String((updated as any)._id) };
  }

  async remove(id: string, userId: string): Promise<void> {
    const res = await this.model.deleteOne({ _id: id, userId }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Breeding book entry not found');
    this.logger.log(`Deleted breeding book entry id=${id} user=${userId}`);
  }

  private async normalizeAndLink(dto: CreateBreedingBookEntryDto, userId: string): Promise<any> {
    const code1a = this.buildCode1A(dto);
    const matingType = this.toQueenMatingType(dto);
    const queenColor = this.yearToQueenColor(dto.j1a);
    const queenOrigin = dto.l1a?.trim()?.toUpperCase();
    const queenNotes = dto.notes?.trim();
    const result: any = {
      ...dto,
      code1a,
      l1a: queenOrigin,
    };

    if (dto.queenId) {
      const queen = await this.queenModel.findOne({ _id: dto.queenId, userId }).exec();
      if (!queen) throw new NotFoundException('Queen not found');

      const queenUpdates: Record<string, unknown> = {};
      if (!queen.name && code1a) {
        queenUpdates.name = code1a;
      }
      if (matingType && queen.matingType !== matingType) {
        queenUpdates.matingType = matingType;
      }
      if (!queen.queenYear && dto.j1a) {
        queenUpdates.queenYear = dto.j1a;
      }
      if (!queen.queenColor && queenColor) {
        queenUpdates.queenColor = queenColor;
      }
      if (!queen.queenOrigin && queenOrigin) {
        queenUpdates.queenOrigin = queenOrigin;
      }
      if (!queen.notes && queenNotes) {
        queenUpdates.notes = queenNotes;
      }
      if (Object.keys(queenUpdates).length > 0) {
        await this.queenModel.updateOne({ _id: queen._id, userId }, { $set: queenUpdates }).exec();
      }

      await this.assignQueenToHiveIfNeeded(queen, dto.hiveId, userId);

      result.queenId = String(queen._id);
      result.queenNameSnapshot = queen.name;
      return result;
    }

    if (!code1a) {
      return result;
    }

    const existing = await this.queenModel.findOne({ userId, name: code1a }).exec();
    if (existing) {
      const queenUpdates: Record<string, unknown> = {};
      if (!existing.name && code1a) {
        queenUpdates.name = code1a;
      }
      if (matingType && existing.matingType !== matingType) {
        queenUpdates.matingType = matingType;
      }
      if (!existing.queenYear && dto.j1a) {
        queenUpdates.queenYear = dto.j1a;
      }
      if (!existing.queenColor && queenColor) {
        queenUpdates.queenColor = queenColor;
      }
      if (!existing.queenOrigin && queenOrigin) {
        queenUpdates.queenOrigin = queenOrigin;
      }
      if (!existing.notes && queenNotes) {
        queenUpdates.notes = queenNotes;
      }
      if (Object.keys(queenUpdates).length > 0) {
        await this.queenModel.updateOne({ _id: existing._id, userId }, { $set: queenUpdates }).exec();
      }

      await this.assignQueenToHiveIfNeeded(existing, dto.hiveId, userId);

      result.queenId = String(existing._id);
      result.queenNameSnapshot = existing.name;
      return result;
    }

    const created = await this.queenModel.create({
      userId,
      name: code1a,
      queenYear: dto.j1a,
      queenColor,
      queenOrigin,
      matingType,
      status: 'spare',
      notes: queenNotes,
    });

    await this.assignQueenToHiveIfNeeded(created, dto.hiveId, userId);

    this.logger.log(`Auto-created queen id=${String(created._id)} name=${code1a} user=${userId}`);
    result.queenId = String(created._id);
    result.queenNameSnapshot = created.name;
    return result;
  }

  private async assignQueenToHiveIfNeeded(queen: any, hiveId: string | undefined, userId: string): Promise<void> {
    if (!hiveId) return;

    const from = new Date();
    const history = Array.isArray(queen.hiveHistory) ? queen.hiveHistory : [];
    const openEntry = history.find((entry: any) => !entry?.to);

    if (openEntry?.hiveId === hiveId) {
      if (queen.status !== 'active') {
        queen.status = 'active';
      }
      if (typeof queen.save === 'function') {
        await queen.save();
      } else {
        await this.queenModel.updateOne({ _id: queen._id, userId }, { $set: { status: 'active' } }).exec();
      }
      return;
    }

    for (const entry of history) {
      if (!entry?.to) {
        entry.to = from;
      }
    }

    const currentQueens = await this.queenModel
      .find({
        userId,
        _id: { $ne: queen._id },
        'hiveHistory.hiveId': hiveId,
        'hiveHistory.to': null,
      })
      .exec();

    for (const currentQueen of currentQueens) {
      const currentHistory = Array.isArray(currentQueen.hiveHistory) ? currentQueen.hiveHistory : [];
      for (const entry of currentHistory) {
        if (!entry?.to && entry.hiveId === hiveId) {
          entry.to = from;
        }
      }
      currentQueen.status = 'spare';
      if (typeof currentQueen.markModified === 'function') {
        currentQueen.markModified('hiveHistory');
      }
      await currentQueen.save();
    }

    history.push({ hiveId, from });
    queen.hiveHistory = history;
    queen.status = 'active';
    if (typeof queen.markModified === 'function') {
      queen.markModified('hiveHistory');
    }
    if (typeof queen.save === 'function') {
      await queen.save();
      return;
    }

    await this.queenModel
      .updateOne(
        { _id: queen._id, userId },
        {
          $set: { status: 'active' },
          $push: { hiveHistory: { hiveId, from } },
        },
      )
      .exec();
  }

  private buildCode1A(dto: CreateBreedingBookEntryDto): string | undefined {
    if (dto.code1a && dto.code1a.trim().length > 0) {
      return dto.code1a.trim().toUpperCase();
    }

    if (!dto.l1a || !dto.lv1a || !dto.z1a || !dto.nr1a || !dto.j1a) {
      return undefined;
    }

    return `${dto.l1a.toUpperCase()}-${dto.lv1a}-${dto.z1a}-${dto.nr1a}-${dto.j1a}`;
  }

  private toQueenMatingType(dto: CreateBreedingBookEntryDto): string | undefined {
    const type = dto.anpaarTyp ?? dto.paarTyp;
    if (type === 1) return 'instrumentell';
    if (type === 2) return 'Belegstelle';
    if (type === 3) return 'Standbegattet';
    if (type === 4) return 'Inselbegattung';
    return undefined;
  }

  private yearToQueenColor(year?: number): string | undefined {
    if (!year || year < 1000) return undefined;
    const map: Record<number, string> = {
      0: 'Blau',
      1: 'Weiß',
      2: 'Gelb',
      3: 'Rot',
      4: 'Grün',
      5: 'Blau',
      6: 'Weiß',
      7: 'Gelb',
      8: 'Rot',
      9: 'Grün',
    };
    return map[year % 10];
  }

  private mapImportRow(raw: Record<string, string>): CreateBreedingBookEntryDto {
    const dto: CreateBreedingBookEntryDto = {
      code1a: this.pick(raw, ['1A']),
      l1a: this.pick(raw, ['L1A']),
      lv1a: this.toInt(this.pick(raw, ['LV1A'])),
      z1a: this.toInt(this.pick(raw, ['Z1A'])),
      nr1a: this.toInt(this.pick(raw, ['NR1A'])),
      j1a: this.toInt(this.pick(raw, ['J1A'])),
      nst: this.toInt(this.pick(raw, ['NST'])),
      anpaarTyp: this.toInt(this.pick(raw, ['ANPAARTYP'])),
      paarTyp: this.toInt(this.pick(raw, ['PAARTYP'])),
      line: this.pick(raw, ['LINIE']),
      notes: this.pick(raw, ['BEMERK', 'BEMERKUNG_LP', 'BEMERKUNG_ABST']),
      entryDate: this.pick(raw, ['BOMID', 'BOMID1', 'BIMID1', 'SCHLUPF', 'BESAMT', 'EIABLAGE']),
      importFields: raw,
    };

    const bimiSeries: any[] = [];
    const bomiSeries: any[] = [];
    for (let i = 1; i <= 7; i++) {
      const bimi = this.toInt(this.pick(raw, [`BIMI${i}`]));
      const bimiGr = this.toInt(this.pick(raw, [`BIMIGR${i}`]));
      const bimiDate = this.pick(raw, [`BIMID${i}`]);
      if (bimi !== undefined || bimiGr !== undefined || bimiDate) {
        bimiSeries.push({ nr: i, value: bimi, gramm: bimiGr, dateRaw: bimiDate });
      }

      const bomi = this.toInt(this.pick(raw, [`BOMI${i}`]));
      const bomiDays = this.toInt(this.pick(raw, [`BOMITG${i}`]));
      const bomiDate = this.pick(raw, [`BOMID${i}`]);
      if (bomi !== undefined || bomiDays !== undefined || bomiDate) {
        bomiSeries.push({ nr: i, value: bomi, days: bomiDays, dateRaw: bomiDate });
      }
    }

    if (bimiSeries.length > 0) dto.bimiSeries = bimiSeries;
    if (bomiSeries.length > 0) dto.bomiSeries = bomiSeries;

    return dto;
  }

  private analyzeCsv(csvContent: string): {
    total: number;
    validRows: Array<{ lineNo: number; dto: CreateBreedingBookEntryDto }>;
    errors: string[];
    previewRows: Array<{ lineNo: number; code1a?: string; nst?: number; anpaarTyp?: number; status: 'valid' | 'invalid'; message?: string }>;
  } {
    const rows = this.parseSemicolonCsv(csvContent);
    if (rows.length < 2) {
      return {
        total: 0,
        validRows: [],
        errors: ['CSV has no data rows'],
        previewRows: [],
      };
    }

    const headers = rows[0].map((h) => h.trim().toUpperCase());
    const errors: string[] = [];
    const validRows: Array<{ lineNo: number; dto: CreateBreedingBookEntryDto }> = [];
    const previewRows: Array<{ lineNo: number; code1a?: string; nst?: number; anpaarTyp?: number; status: 'valid' | 'invalid'; message?: string }> = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const lineNo = rowIndex + 1;
      if (!row || row.every((v) => !String(v).trim())) {
        continue;
      }

      try {
        const raw = this.rowToObject(headers, row);
        const dto = this.mapImportRow(raw);
        const validationError = this.validateImportDto(dto);
        const code1a = this.buildCode1A(dto);
        const anpaarTyp = dto.anpaarTyp ?? dto.paarTyp;

        if (validationError) {
          const msg = `Line ${lineNo}: ${validationError}`;
          errors.push(msg);
          if (previewRows.length < 10) {
            previewRows.push({ lineNo, code1a, nst: dto.nst, anpaarTyp, status: 'invalid', message: validationError });
          }
          continue;
        }

        validRows.push({ lineNo, dto });
        if (previewRows.length < 10) {
          previewRows.push({ lineNo, code1a, nst: dto.nst, anpaarTyp, status: 'valid' });
        }
      } catch (error: any) {
        const message = error?.message || 'Import failed';
        const msg = `Line ${lineNo}: ${message}`;
        errors.push(msg);
        if (previewRows.length < 10) {
          previewRows.push({ lineNo, status: 'invalid', message });
        }
      }
    }

    return {
      total: rows.length - 1,
      validRows,
      errors,
      previewRows,
    };
  }

  private validateImportDto(dto: CreateBreedingBookEntryDto): string | undefined {
    if (!dto.nst) {
      return 'NST is required';
    }
    if (!dto.anpaarTyp && !dto.paarTyp) {
      return 'ANPAARTYP or PAARTYP is required';
    }
    if (!dto.code1a && !(dto.l1a && dto.lv1a && dto.z1a && dto.nr1a && dto.j1a)) {
      return '1A or L1A/LV1A/Z1A/NR1A/J1A is required';
    }
    return undefined;
  }

  private parseSemicolonCsv(input: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let index = 0; index < input.length; index++) {
      const char = input[index];
      const next = input[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          index++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ';' && !inQuotes) {
        row.push(cell);
        cell = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') index++;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
        continue;
      }

      cell += char;
    }

    if (cell.length > 0 || row.length > 0) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  }

  private rowToObject(headers: string[], row: string[]): Record<string, string> {
    const out: Record<string, string> = {};
    for (let index = 0; index < headers.length; index++) {
      const key = headers[index];
      out[key] = (row[index] ?? '').trim();
    }
    return out;
  }

  private pick(raw: Record<string, string>, keys: string[]): string | undefined {
    for (const key of keys) {
      const val = raw[key];
      if (val !== undefined && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
    return undefined;
  }

  private toInt(value?: string): number | undefined {
    if (!value || value.trim() === '') return undefined;
    const num = Number(value.replace(',', '.'));
    if (!Number.isFinite(num)) return undefined;
    return Math.trunc(num);
  }

  private getExportValue(doc: any, header: string): string | number | undefined {
    const code1a = doc.code1a || this.buildCode1A(doc);
    const anpaarTyp = doc.anpaarTyp ?? doc.paarTyp;

    if (header === 'NST') return doc.nst;
    if (header === 'ANPAARTYP') return anpaarTyp;
    if (header === 'L1A') return doc.l1a;
    if (header === 'LV1A') return doc.lv1a;
    if (header === 'Z1A') return doc.z1a;
    if (header === 'NR1A') return doc.nr1a;
    if (header === 'J1A') return doc.j1a;
    if (header === '1A') return code1a;
    if (header === 'LINIE') return doc.line;
    if (header === 'BEMERK') return doc.notes;

    const bimiMatch = header.match(/^BIMI(\d)$/);
    if (bimiMatch) {
      const nr = Number(bimiMatch[1]);
      const sample = (doc.bimiSeries || []).find((item: any) => item?.nr === nr);
      return sample?.value;
    }
    const bimiGrMatch = header.match(/^BIMIGR(\d)$/);
    if (bimiGrMatch) {
      const nr = Number(bimiGrMatch[1]);
      const sample = (doc.bimiSeries || []).find((item: any) => item?.nr === nr);
      return sample?.gramm;
    }
    const bimiDateMatch = header.match(/^BIMID(\d)$/);
    if (bimiDateMatch) {
      const nr = Number(bimiDateMatch[1]);
      const sample = (doc.bimiSeries || []).find((item: any) => item?.nr === nr);
      return sample?.dateRaw;
    }
    const bomiMatch = header.match(/^BOMI(\d)$/);
    if (bomiMatch) {
      const nr = Number(bomiMatch[1]);
      const sample = (doc.bomiSeries || []).find((item: any) => item?.nr === nr);
      return sample?.value;
    }
    const bomiTgMatch = header.match(/^BOMITG(\d)$/);
    if (bomiTgMatch) {
      const nr = Number(bomiTgMatch[1]);
      const sample = (doc.bomiSeries || []).find((item: any) => item?.nr === nr);
      return sample?.days;
    }
    const bomiDateMatch = header.match(/^BOMID(\d)$/);
    if (bomiDateMatch) {
      const nr = Number(bomiDateMatch[1]);
      const sample = (doc.bomiSeries || []).find((item: any) => item?.nr === nr);
      if (sample?.dateRaw) return sample.dateRaw;
      if (nr === 1) return doc.entryDate;
      return undefined;
    }

    return undefined;
  }

  private toCsvCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    const raw = String(value);
    if (!/[;"\n\r]/.test(raw)) return raw;
    return `"${raw.replace(/"/g, '""')}"`;
  }
}
