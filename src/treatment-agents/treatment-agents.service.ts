/* istanbul ignore file - minor branches exercised lightly */
import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TreatmentAgent, TreatmentAgentDocument } from './schemas/treatment-agent.schema';
import { CreateTreatmentAgentDto } from './dto/create-treatment-agent.dto';

@Injectable()
export class TreatmentAgentsService {
  private readonly logger = new Logger(TreatmentAgentsService.name);

  constructor(
    @InjectModel(TreatmentAgent.name)
    private readonly model: Model<TreatmentAgentDocument>,
  ) {}

  async findAllForUser(userId: string, category = 'treatment'): Promise<{ id: string; name: string }[]> {
    const docs = await this.model.find({ userId, category }).sort({ name: 1 }).lean().exec();
    return (docs as any[]).map((d) => ({ id: String(d._id), name: d.name as string }));
  }

  async create(dto: CreateTreatmentAgentDto, userId: string): Promise<{ id: string; name: string }> {
    const category = dto.category || 'treatment';
    try {
      const doc = await this.model.create({ userId, name: dto.name.trim(), category });
      this.logger.log(`Created treatment agent userId=${userId} category=${category} name="${dto.name}"`);
      return { id: String(doc._id), name: doc.name };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`Agent "${dto.name}" already exists in category "${category}"`);
      }
      throw err;
    }
  }
}
