import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BestandsbuchEntry, BestandsbuchEntryDocument } from './schemas/bestandsbuch-entry.schema';
import { CreateBestandsbuchEntryDto } from './dto/create-bestandsbuch-entry.dto';
import { Hive, HiveDocument } from '../hives/schemas/hive.schema';
import { Apiary, ApiaryDocument } from '../apiaries/schemas/apiary.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Inspection, InspectionDocument } from '../inspections/schemas/inspection.schema';

type MutationOptions = {
  skipInspectionSync?: boolean;
};

@Injectable()
export class BestandsbuchService {
  private readonly logger = new Logger(BestandsbuchService.name);

  constructor(
    @InjectModel(BestandsbuchEntry.name)
    private readonly model: Model<BestandsbuchEntryDocument>,
    @InjectModel(Hive.name)
    private readonly hiveModel: Model<HiveDocument>,
    @InjectModel(Apiary.name)
    private readonly apiaryModel: Model<ApiaryDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Inspection.name)
    private readonly inspectionModel: Model<InspectionDocument>,
  ) {}

  async findAll(userId: string, query: { year?: number; hiveId?: string }): Promise<any[]> {
    const filter: Record<string, unknown> = { userId };
    if (query.year) filter.year = query.year;
    if (query.hiveId) filter.hiveId = query.hiveId;

    const docs = await this.model.find(filter).sort({ applicationDate: -1, sequenceNo: -1 }).lean().exec();
    return (docs as any[]).map((doc) => ({ ...doc, id: String(doc._id) }));
  }

  async findYears(userId: string): Promise<number[]> {
    const years = await this.model.distinct('year', { userId }).exec();
    return (years as number[])
      .filter((value) => Number.isInteger(value) && value > 1900)
      .sort((a, b) => b - a);
  }

  async create(dto: CreateBestandsbuchEntryDto, userId: string, options: MutationOptions = {}): Promise<any> {
    const normalized = await this.normalizeAndFill(dto, userId);
    const doc = await this.model.create({ ...normalized, userId, source: normalized.source ?? 'manual' });

    this.logger.log(`Created bestandsbuch entry id=${String(doc._id)} user=${userId}`);

    if (!options.skipInspectionSync) {
      await this.ensureInspectionForEntry({ ...doc.toObject(), id: String(doc._id) }, userId);
    }

    return { ...doc.toObject(), id: String(doc._id) };
  }

  async update(
    id: string,
    dto: CreateBestandsbuchEntryDto,
    userId: string,
    options: MutationOptions = {},
  ): Promise<any> {
    const existing = await this.model.findOne({ _id: id, userId }).lean().exec();
    if (!existing) throw new NotFoundException('Bestandsbuch entry not found');

    const normalized = await this.normalizeAndFill({ ...(existing as any), ...dto }, userId);
    const updated = await this.model
      .findOneAndUpdate({ _id: id, userId }, { $set: normalized }, { new: true, lean: true })
      .exec();

    if (!updated) throw new NotFoundException('Bestandsbuch entry not found');
    this.logger.log(`Updated bestandsbuch entry id=${id} user=${userId}`);

    if (!options.skipInspectionSync) {
      await this.ensureInspectionForEntry({ ...(updated as any), id }, userId);
    }

    return { ...(updated as any), id: String((updated as any)._id) };
  }

  async remove(id: string, userId: string, options: MutationOptions = {}): Promise<void> {
    const existing = await this.model.findOne({ _id: id, userId }).lean().exec();
    if (!existing) throw new NotFoundException('Bestandsbuch entry not found');

    await this.model.deleteOne({ _id: id, userId }).exec();
    this.logger.log(`Deleted bestandsbuch entry id=${id} user=${userId}`);

    if (!options.skipInspectionSync && (existing as any).inspectionId) {
      await this.inspectionModel.deleteOne({ _id: (existing as any).inspectionId, userId }).exec();
    }
  }

  async syncFromInspection(inspection: any, userId: string): Promise<void> {
    if (!inspection || inspection.type !== 'treatment') return;

    const existing = await this.model
      .findOne({ userId, inspectionId: String(inspection.id || inspection._id) })
      .lean()
      .exec();

    const payload: CreateBestandsbuchEntryDto = {
      inspectionId: String(inspection.id || inspection._id),
      hiveId: String(inspection.hiveId ?? ''),
      applicationDate: inspection.date,
      medicineName: inspection.treatmentAgent,
      amount: inspection.treatmentAmount,
      notes: inspection.notes,
      source: 'inspection-sync' as any,
    };

    if (existing) {
      await this.update(String((existing as any)._id), payload, userId, { skipInspectionSync: true });
      return;
    }

    await this.create(payload, userId, { skipInspectionSync: true });
  }

  async removeByInspectionId(inspectionId: string, userId: string): Promise<void> {
    if (!inspectionId) return;
    await this.model.deleteMany({ userId, inspectionId }).exec();
  }

  private async ensureInspectionForEntry(entry: any, userId: string): Promise<void> {
    if (!entry.hiveId || !entry.applicationDate) return;

    const hiveObjectId = Types.ObjectId.isValid(String(entry.hiveId))
      ? new Types.ObjectId(String(entry.hiveId))
      : null;
    if (!hiveObjectId) return;

    const payload: any = {
      hiveId: hiveObjectId,
      date: String(entry.applicationDate).slice(0, 10),
      type: 'treatment',
      treatmentAgent: entry.medicineName,
      treatmentAmount: entry.amount,
      notes: entry.notes,
    };

    if (entry.inspectionId) {
      await this.inspectionModel
        .findOneAndUpdate(
          { _id: entry.inspectionId, userId },
          { $set: payload },
          { new: true },
        )
        .exec();
      return;
    }

    const existing = await this.inspectionModel
      .findOne({
        userId,
        hiveId: hiveObjectId,
        date: payload.date,
        type: 'treatment',
        treatmentAgent: payload.treatmentAgent,
        treatmentAmount: payload.treatmentAmount,
      })
      .lean()
      .exec();

    if (existing) {
      await this.model
        .updateOne({ _id: entry.id, userId }, { $set: { inspectionId: String((existing as any)._id) } })
        .exec();
      return;
    }

    const created = await this.inspectionModel.create({ ...payload, userId, hiveId: hiveObjectId });
    await this.model
      .updateOne({ _id: entry.id, userId }, { $set: { inspectionId: String((created as any)._id) } })
      .exec();
  }

  private async normalizeAndFill(dto: CreateBestandsbuchEntryDto, userId: string): Promise<any> {
    const normalized: any = {
      ...dto,
      source: (dto as any).source ?? 'manual',
    };

    if (!normalized.applicationDate) {
      normalized.applicationDate = new Date().toISOString().slice(0, 10);
    }
    normalized.applicationDate = String(normalized.applicationDate).slice(0, 10);

    const parsedYear = Number(normalized.applicationDate.slice(0, 4));
    if (!normalized.year && Number.isInteger(parsedYear)) {
      normalized.year = parsedYear;
    }

    normalized.sheetNumber = normalized.sheetNumber || 1;

    if (!normalized.sequenceNo) {
      normalized.sequenceNo = await this.nextSequenceNo(userId, normalized.year);
    }

    const user = await this.userModel.findById(userId).lean().exec();
    if (user) {
      if (!normalized.beekeeperName) normalized.beekeeperName = (user as any).username;
      if (!normalized.treatedBy) normalized.treatedBy = (user as any).username;
      if (!normalized.streetHouseNumber) normalized.streetHouseNumber = (user as any).streetHouseNumber;
      if (!normalized.postalCode) normalized.postalCode = (user as any).postalCode;
      if (!normalized.city) normalized.city = (user as any).city;
      if (!normalized.phone) normalized.phone = (user as any).phone;
      if (!normalized.operationNumber) normalized.operationNumber = (user as any).operationNumber;
    }

    if (normalized.hiveId) {
      const hive = await this.hiveModel.findOne({ _id: normalized.hiveId, userId }).lean().exec();
      if (hive) {
        const hiveNumber = String((hive as any).hiveNumber || '').trim();
        const apiaryId = (hive as any).apiaryId;
        let apiaryName: string;
        if (apiaryId) {
          const apiary = await this.apiaryModel.findOne({ _id: apiaryId, userId }).lean().exec();
          if (apiary && !normalized.apiaryName) {
            normalized.apiaryName = String((apiary as any).name || '').trim();
          }
          apiaryName = String((apiary as any)?.name || normalized.apiaryName || '').trim();
        } else {
          apiaryName = String(normalized.apiaryName || '').trim();
        }

        if (!normalized.hiveLabel) {
          normalized.hiveLabel = [apiaryName, hiveNumber].filter(Boolean).join(' - ') || hiveNumber;
        }
      }
    }

    if (!normalized.medicineName && (dto as any).treatmentAgent) {
      normalized.medicineName = (dto as any).treatmentAgent;
    }

    return normalized;
  }

  private async nextSequenceNo(userId: string, year?: number): Promise<number> {
    if (!year) return 1;
    const last = await this.model
      .findOne({ userId, year })
      .sort({ sequenceNo: -1 })
      .lean()
      .exec();
    return Math.max(1, Number((last as any)?.sequenceNo || 0) + 1);
  }
}
