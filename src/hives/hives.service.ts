import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hive, HiveDocument } from './schemas/hive.schema';
import { CreateHiveDto } from './dto/create-hive.dto';

@Injectable()
export class HiveService {
  private readonly logger = new Logger(HiveService.name);
  constructor(@InjectModel(Hive.name) private hiveModel: Model<HiveDocument>) {}

  async create(dto: CreateHiveDto) {
    this.logger.log(`Creating hive in DB hiveNumber=${dto.hiveNumber}`);
    const doc = new this.hiveModel(dto);
    await doc.save();
    this.logger.log(`Saved hive to DB id=${doc._id.toString()}`);
    return this.toResponse(doc);
  }

  async findAll(filter = {}, page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.hiveModel.find(filter).skip(skip).limit(limit).lean().exec(),
      this.hiveModel.countDocuments(filter).exec(),
    ]);
    this.logger.log(`DB findAll returned ${total} items (page=${page} limit=${limit})`);
    return { pagination: { page, limit, total }, items } as any;
  }

  async findOne(id: string) {
    this.logger.log(`DB findOne id=${id}`);
    const doc = await this.hiveModel.findById(id).lean().exec();
    if (!doc) {
      this.logger.warn(`Hive not found id=${id}`);
      throw new NotFoundException('Hive not found');
    }
    return doc;
  }

  async update(id: string, dto: Partial<CreateHiveDto>) {
    this.logger.log(`DB update id=${id} changes=${JSON.stringify(dto)}`);
    const doc = await this.hiveModel.findByIdAndUpdate(id, dto, { new: true }).lean().exec();
    if (!doc) {
      this.logger.warn(`Update failed - hive not found id=${id}`);
      throw new NotFoundException('Hive not found');
    }
    return doc;
  }

  async remove(id: string) {
    // soft delete: set status=archived
    this.logger.log(`DB archive hive id=${id}`);
    const doc = await this.hiveModel.findByIdAndUpdate(id, { status: 'archived' }, { new: true }).lean().exec();
    if (!doc) {
      this.logger.warn(`Archive failed - hive not found id=${id}`);
      throw new NotFoundException('Hive not found');
    }
    return;
  }

  private toResponse(doc: HiveDocument) {
    return { ...doc.toObject(), id: doc._id } as any;
  }
}
