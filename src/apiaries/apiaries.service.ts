import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Apiary, ApiaryDocument } from './schemas/apiary.schema';
import { CreateApiaryDto } from './dto/create-apiary.dto';
import { Hive, HiveDocument } from '../hives/schemas/hive.schema';

@Injectable()
export class ApiariesService {
  private readonly logger = new Logger(ApiariesService.name);
  constructor(
    @InjectModel(Apiary.name) private apiaryModel: Model<ApiaryDocument>,
    @InjectModel(Hive.name) private hiveModel: Model<HiveDocument>,
  ) {}

  async create(dto: CreateApiaryDto, userId: string) {
    this.logger.log(`Creating apiary name=${dto.name}`);
    const doc = new this.apiaryModel({ ...dto, userId });
    await doc.save();
    this.logger.log(`Created apiary id=${doc._id.toString()}`);
    return { ...doc.toObject(), id: doc._id } as any;
  }

  async findAll(userId: string) {
    const docs = await this.apiaryModel.find({ userId }).lean().exec();
    return (docs || []).map((d) => ({ ...d, id: d._id }));
  }

  async findOne(id: string, userId: string) {
    const doc = await this.apiaryModel.findOne({ _id: id, userId }).lean().exec();
    if (!doc) throw new NotFoundException('Apiary not found');
    return { ...doc, id: doc._id };
  }

  async update(id: string, dto: Partial<CreateApiaryDto>, userId: string) {
    const doc = await this.apiaryModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Apiary not found');
    return { ...doc, id: doc._id };
  }

  async remove(id: string, userId: string) {
    await this.hiveModel.updateMany({ apiaryId: id, userId }, { $unset: { apiaryId: 1 } }).exec();
    const res = await this.apiaryModel.findOneAndDelete({ _id: id, userId }).lean().exec();
    if (!res) throw new NotFoundException('Apiary not found');
    return { ok: true };
  }
}
