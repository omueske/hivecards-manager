import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inspection, InspectionDocument } from './schemas/inspection.schema';
import { CreateInspectionDto } from './dto/create-inspection.dto';

@Injectable()
export class InspectionsService {
  private readonly logger = new Logger(InspectionsService.name);

  constructor(
    @InjectModel(Inspection.name) private inspectionModel: Model<InspectionDocument>,
  ) {}

  async create(dto: CreateInspectionDto, userId: string): Promise<any> {
    this.logger.log(`Creating inspection hiveId=${dto.hiveId} type=${dto.type ?? 'note'}`);
    const doc = new this.inspectionModel({
      ...dto,
      hiveId: new Types.ObjectId(dto.hiveId),
      userId,
      type: dto.type ?? 'note',
    });
    await doc.save();
    this.logger.log(`Created inspection id=${doc._id} hiveId=${dto.hiveId}`);
    return this.toResponse(doc);
  }

  async findAll(hiveId: string, userId: string, page = 1, limit = 50): Promise<any> {
    const filter: any = { userId };
    if (hiveId) filter.hiveId = new Types.ObjectId(hiveId);
    this.logger.debug(`DB findAll inspections hiveId=${hiveId ?? 'all'} page=${page} limit=${limit}`);

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.inspectionModel
        .find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.inspectionModel.countDocuments(filter).exec(),
    ]);

    return {
      pagination: { page, limit, total },
      items: (items as any[]).map((d) => ({ ...d, id: d._id })),
    };
  }

  async update(id: string, dto: Partial<CreateInspectionDto>, userId: string): Promise<any> {
    this.logger.log(`Updating inspection id=${id}`);
    const doc = await this.inspectionModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: dto },
        { new: true, lean: true },
      )
      .exec();
    if (!doc) {
      this.logger.warn(`Inspection not found or not owned id=${id}`);
      throw new NotFoundException('Inspection not found');
    }
    this.logger.debug(`Updated inspection id=${id}`);
    return { ...(doc as any), id: (doc as any)._id };
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Deleting inspection id=${id}`);
    const res = await this.inspectionModel.deleteOne({ _id: id, userId }).exec();
    if (res.deletedCount === 0) {
      this.logger.warn(`Inspection not found or not owned for delete id=${id}`);
      throw new NotFoundException('Inspection not found');
    }
    this.logger.debug(`Deleted inspection id=${id}`);
  }

  private toResponse(doc: InspectionDocument): any {
    const obj = doc.toObject();
    return { ...obj, id: obj._id };
  }
}
