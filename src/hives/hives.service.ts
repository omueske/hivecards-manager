import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hive, HiveDocument } from './schemas/hive.schema';
import { CreateHiveDto } from './dto/create-hive.dto';

@Injectable()
export class HiveService {
  constructor(@InjectModel(Hive.name) private hiveModel: Model<HiveDocument>) {}

  async create(dto: CreateHiveDto) {
    const doc = new this.hiveModel(dto);
    await doc.save();
    return this.toResponse(doc);
  }

  async findAll(filter = {}, page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.hiveModel.find(filter).skip(skip).limit(limit).lean().exec(),
      this.hiveModel.countDocuments(filter).exec(),
    ]);
    return { pagination: { page, limit, total }, items } as any;
  }

  async findOne(id: string) {
    const doc = await this.hiveModel.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Hive not found');
    return doc;
  }

  async update(id: string, dto: Partial<CreateHiveDto>) {
    const doc = await this.hiveModel.findByIdAndUpdate(id, dto, { new: true }).lean().exec();
    if (!doc) throw new NotFoundException('Hive not found');
    return doc;
  }

  async remove(id: string) {
    // soft delete: set status=archived
    const doc = await this.hiveModel.findByIdAndUpdate(id, { status: 'archived' }, { new: true }).lean().exec();
    if (!doc) throw new NotFoundException('Hive not found');
    return;
  }

  private toResponse(doc: HiveDocument) {
    return { ...doc.toObject(), id: doc._id } as any;
  }
}
