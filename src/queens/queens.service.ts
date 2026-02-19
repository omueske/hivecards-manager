import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Queen, QueenDocument } from './schemas/queen.schema';
import { CreateQueenDto, AssignQueenDto, RemoveQueenFromHiveDto } from './dto/create-queen.dto';

@Injectable()
export class QueensService implements OnModuleInit {
  private readonly logger = new Logger(QueensService.name);

  constructor(
    @InjectModel(Queen.name) private queenModel: Model<QueenDocument>,
    @InjectModel('Hive') private hiveModel: Model<any>,
  ) {}

  /** Auto-migrate queen fields from Hive documents on startup */
  async onModuleInit() {
    try {
      const hivesWithQueenData = await this.hiveModel
        .find({
          $or: [
            { queenYear: { $exists: true, $ne: null } },
            { queenColor: { $exists: true, $ne: '' } },
            { queenOrigin: { $exists: true, $ne: '' } },
            { matingType: { $exists: true, $ne: '' } },
          ],
          _queenMigrated: { $ne: true },
        })
        .lean()
        .exec();

      for (const hive of hivesWithQueenData) {
        const hiveId = String(hive._id);
        const existing = await this.queenModel
          .findOne({
            userId: hive.userId,
            'hiveHistory.hiveId': hiveId,
            'hiveHistory.to': null,
          })
          .exec();

        if (!existing) {
          const queen = new this.queenModel({
            userId: hive.userId,
            queenYear: hive.queenYear,
            queenColor: hive.queenColor,
            queenOrigin: hive.queenOrigin,
            matingType: hive.matingType,
            queenMarked: hive.queenMarked ?? false,
            status: 'active',
            hiveHistory: [{ hiveId, from: hive.installationDate ? new Date(hive.installationDate) : new Date() }],
          });
          await queen.save();
          this.logger.log(`Migrated queen from hive ${hiveId}`);
        }

        await this.hiveModel.updateOne({ _id: hive._id }, { $set: { _queenMigrated: true } }).exec();
      }

      if (hivesWithQueenData.length > 0) {
        this.logger.log(`Queen migration complete: ${hivesWithQueenData.length} hive(s) processed`);
      }
    } catch (err) {
      this.logger.warn('Queen migration skipped: ' + (err as Error).message);
    }
  }

  async create(dto: CreateQueenDto, userId: string): Promise<any> {
    const doc = new this.queenModel({ ...dto, userId, status: dto.status ?? 'spare' });
    await doc.save();
    return this.toResponse(doc);
  }

  async findAll(userId: string): Promise<any[]> {
    const docs = await this.queenModel.find({ userId }).sort({ createdAt: -1 }).lean().exec();
    return (docs as any[]).map((d) => ({ ...d, id: d._id }));
  }

  async findOne(id: string, userId: string): Promise<any> {
    const doc = await this.queenModel.findOne({ _id: id, userId }).lean().exec();
    if (!doc) throw new NotFoundException('Queen not found');
    return { ...(doc as any), id: (doc as any)._id };
  }

  async findByHive(hiveId: string, userId: string): Promise<any[]> {
    const docs = await this.queenModel
      .find({ userId, 'hiveHistory.hiveId': hiveId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return (docs as any[]).map((d) => ({ ...d, id: d._id }));
  }

  async update(id: string, dto: Partial<CreateQueenDto>, userId: string): Promise<any> {
    const doc = await this.queenModel
      .findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true, lean: true })
      .exec();
    if (!doc) throw new NotFoundException('Queen not found');
    return { ...(doc as any), id: (doc as any)._id };
  }

  /**
   * Assign a queen to a hive.
   * - Closes any open assignment on the queen (previous hive)
   * - Removes any currently active queen from the target hive (closes her assignment → status spare)
   * - Adds new assignment entry + sets status to active
   */
  async assignToHive(id: string, dto: AssignQueenDto, userId: string): Promise<any> {
    const queen = await this.queenModel.findOne({ _id: id, userId }).exec();
    if (!queen) throw new NotFoundException('Queen not found');

    const from = dto.from ? new Date(dto.from) : new Date();

    // Close any open assignment on this queen
    for (const entry of queen.hiveHistory) {
      if (!entry.to) {
        (entry as any).to = from;
      }
    }

    // Remove any other active queen from the target hive
    const currentQueens = await this.queenModel
      .find({
        userId,
        _id: { $ne: queen._id },
        'hiveHistory.hiveId': dto.hiveId,
        'hiveHistory.to': null,
      })
      .exec();

    for (const cq of currentQueens) {
      for (const entry of cq.hiveHistory) {
        if (!entry.to && entry.hiveId === dto.hiveId) {
          (entry as any).to = from;
        }
      }
      cq.status = 'spare';
      cq.markModified('hiveHistory');
      await cq.save();
    }

    queen.hiveHistory.push({ hiveId: dto.hiveId, from });
    queen.status = 'active';
    queen.markModified('hiveHistory');
    await queen.save();

    return this.toResponse(queen);
  }

  /**
   * Remove a queen from its current hive → status becomes spare
   */
  async removeFromHive(id: string, dto: RemoveQueenFromHiveDto, userId: string): Promise<any> {
    const queen = await this.queenModel.findOne({ _id: id, userId }).exec();
    if (!queen) throw new NotFoundException('Queen not found');

    const to = dto.to ? new Date(dto.to) : new Date();

    let changed = false;
    for (const entry of queen.hiveHistory) {
      if (!entry.to) {
        (entry as any).to = to;
        changed = true;
      }
    }

    if (changed) {
      queen.status = 'spare';
      queen.markModified('hiveHistory');
      await queen.save();
    }

    return this.toResponse(queen);
  }

  async remove(id: string, userId: string): Promise<void> {
    const res = await this.queenModel.deleteOne({ _id: id, userId }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Queen not found');
  }

  private toResponse(doc: QueenDocument): any {
    const obj = doc.toObject();
    return { ...obj, id: obj._id };
  }
}
