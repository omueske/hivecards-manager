import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hive, HiveDocument } from './schemas/hive.schema';
import { CreateHiveDto } from './dto/create-hive.dto';

@Injectable()
export class HiveService {
  private readonly logger = new Logger(HiveService.name);
  constructor(@InjectModel(Hive.name) private hiveModel: Model<HiveDocument>) {}

  async create(dto: CreateHiveDto, userId: string) {
    this.logger.log(`Creating hive in DB hiveNumber=${dto.hiveNumber}`);
    const doc = new this.hiveModel({ ...dto, userId });
    await doc.save();
    this.logger.log(`Saved hive to DB id=${doc._id.toString()}`);
    return this.toResponse(doc);
  }

  async findAll(filter: any = {}, userId: string, page = 1, limit = 25) {
    const scope = { ...filter, userId };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.hiveModel.find(scope).skip(skip).limit(limit).lean().exec(),
      this.hiveModel.countDocuments(scope).exec(),
    ]);
    this.logger.log(`DB findAll returned ${total} items (page=${page} limit=${limit})`);
    const mapped = (items as any[]).map((d) => ({ ...d, id: d._id }));
    return { pagination: { page, limit, total }, items: mapped } as any;
  }

  async findOne(id: string, userId: string) {
    this.logger.log(`DB findOne id=${id}`);
    const doc = await this.hiveModel.findOne({ _id: id, userId }).lean().exec();
    if (!doc) {
      this.logger.warn(`Hive not found or not owned id=${id}`);
      throw new NotFoundException('Hive not found');
    }
    return { ...doc, id: (doc as any)._id } as any;
  }

  async update(id: string, dto: Partial<CreateHiveDto>, userId: string) {
    this.logger.log(`DB update id=${id} changes=${JSON.stringify(dto)}`);
    const update: any = { ...dto };
    if ('apiaryId' in dto && (dto.apiaryId === null || dto.apiaryId === '')) {
      delete update.apiaryId;
      (update as any).$unset = { apiaryId: 1 };
    }
    const doc = await this.hiveModel
      .findOneAndUpdate({ _id: id, userId }, update, { new: true })
      .lean()
      .exec();
    if (!doc) {
      this.logger.warn(`Update failed - hive not found or not owned id=${id}`);
      throw new NotFoundException('Hive not found');
    }
    return { ...doc, id: (doc as any)._id } as any;
  }

  async remove(id: string, userId: string) {
    this.logger.log(`DB archive hive id=${id}`);
    const doc = await this.hiveModel
      .findOneAndUpdate({ _id: id, userId }, { status: 'archived' }, { new: true })
      .lean()
      .exec();
    if (!doc) {
      this.logger.warn(`Archive failed - hive not found or not owned id=${id}`);
      throw new NotFoundException('Hive not found');
    }
    return;
  }

  private toResponse(doc: HiveDocument) {
    return { ...doc.toObject(), id: doc._id } as any;
  }
}
