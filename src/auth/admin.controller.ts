import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtGuard } from '../common/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { User, UserDocument } from './schemas/user.schema';
import { Apiary, ApiaryDocument } from '../apiaries/schemas/apiary.schema';
import { Hive, HiveDocument } from '../hives/schemas/hive.schema';
import { Queen, QueenDocument } from '../queens/schemas/queen.schema';
import { Inspection, InspectionDocument } from '../inspections/schemas/inspection.schema';
import {
  TreatmentAgent,
  TreatmentAgentDocument,
} from '../treatment-agents/schemas/treatment-agent.schema';

@Controller('api/v1/admin')
@UseGuards(JwtGuard)
@Roles('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Apiary.name) private apiaryModel: Model<ApiaryDocument>,
    @InjectModel(Hive.name) private hiveModel: Model<HiveDocument>,
    @InjectModel(Queen.name) private queenModel: Model<QueenDocument>,
    @InjectModel(Inspection.name) private inspectionModel: Model<InspectionDocument>,
    @InjectModel(TreatmentAgent.name)
    private treatmentAgentModel: Model<TreatmentAgentDocument>,
  ) {}

  private sanitizeUser(user: any) {
    return {
      id: String(user._id),
      email: user.email,
      username: user.username,
      emailVerified: !!user.emailVerified,
      role: user.role === 'admin' ? 'admin' : 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private getResourceModel(type: string): Model<any> {
    const map: Record<string, Model<any>> = {
      apiaries: this.apiaryModel,
      hives: this.hiveModel,
      queens: this.queenModel,
      inspections: this.inspectionModel,
      treatmentAgents: this.treatmentAgentModel,
    };
    const model = map[type];
    if (!model) {
      throw new BadRequestException('unsupported resource type');
    }
    return model;
  }

  @Get('users')
  async listUsers() {
    const users = await this.userModel.find().sort({ createdAt: -1 }).lean().exec();
    return users.map((u) => this.sanitizeUser(u));
  }

  @Post('users')
  async createUser(@Body() body: any) {
    const email = String(body?.email || '').toLowerCase().trim();
    const password = String(body?.password || '');
    const username = typeof body?.username === 'string' ? body.username : undefined;
    const role = body?.role === 'admin' ? 'admin' : 'user';
    const emailVerified = !!body?.emailVerified;

    if (!email) throw new BadRequestException('email required');
    if (!password || password.length < 8) {
      throw new BadRequestException('password must be at least 8 characters');
    }

    const existing = await this.userModel.findOne({ email }).lean().exec();
    if (existing) throw new BadRequestException('email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await this.userModel.create({
      email,
      passwordHash,
      username,
      role,
      emailVerified,
    });

    this.logger.log(`Admin created user id=${created._id.toString()} role=${role}`);
    return this.sanitizeUser(created.toObject());
  }

  @Put('users/:id')
  async updateUser(@Param('id') userId: string, @Body() body: any) {
    if (!userId) throw new BadRequestException('id required');

    const update: any = {};

    if (typeof body?.email === 'string') {
      update.email = body.email.toLowerCase().trim();
    }
    if (typeof body?.username === 'string') {
      update.username = body.username;
    }
    if (typeof body?.emailVerified === 'boolean') {
      update.emailVerified = body.emailVerified;
    }
    if (body?.role === 'user' || body?.role === 'admin') {
      update.role = body.role;
    }
    if (typeof body?.password === 'string' && body.password.length > 0) {
      if (body.password.length < 8) {
        throw new BadRequestException('password must be at least 8 characters');
      }
      update.passwordHash = await bcrypt.hash(body.password, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(userId, update, { new: true }).lean().exec();
    if (!updated) throw new BadRequestException('user not found');

    this.logger.log(`Admin updated user id=${userId}`);
    return this.sanitizeUser(updated);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string, @Req() req: any) {
    if (!userId) throw new BadRequestException('id required');

    if (req.user?.id === userId) {
      throw new BadRequestException('cannot delete yourself');
    }

    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) throw new BadRequestException('user not found');

    await Promise.all([
      this.apiaryModel.deleteMany({ userId }).exec(),
      this.hiveModel.deleteMany({ userId }).exec(),
      this.queenModel.deleteMany({ userId }).exec(),
      this.inspectionModel.deleteMany({ userId }).exec(),
      this.treatmentAgentModel.deleteMany({ userId }).exec(),
      this.userModel.findByIdAndDelete(userId).exec(),
    ]);

    this.logger.log(`Admin deleted user id=${userId}`);
    return { ok: true };
  }

  @Get('users/:id/resources')
  async getUserResources(@Param('id') userId: string) {
    if (!userId) throw new BadRequestException('id required');

    const [apiaries, hives, queens, inspections, treatmentAgents] = await Promise.all([
      this.apiaryModel.find({ userId }).lean().exec(),
      this.hiveModel.find({ userId }).lean().exec(),
      this.queenModel.find({ userId }).lean().exec(),
      this.inspectionModel.find({ userId }).lean().exec(),
      this.treatmentAgentModel.find({ userId }).lean().exec(),
    ]);

    return {
      userId,
      counts: {
        apiaries: apiaries.length,
        hives: hives.length,
        queens: queens.length,
        inspections: inspections.length,
        treatmentAgents: treatmentAgents.length,
      },
      apiaries,
      hives,
      queens,
      inspections,
      treatmentAgents,
    };
  }

  @Put('users/:id/resources/:type/:resourceId')
  async updateUserResource(
    @Param('id') userId: string,
    @Param('type') type: string,
    @Param('resourceId') resourceId: string,
    @Body() body: any,
  ) {
    if (!userId || !resourceId) throw new BadRequestException('id required');
    if (!body || typeof body !== 'object') throw new BadRequestException('body required');

    const model = this.getResourceModel(type);

    const patch: any = { ...body };
    delete patch._id;
    delete patch.id;
    delete patch.userId;
    delete patch.createdAt;
    delete patch.updatedAt;

    const existing = await model.findOne({ _id: resourceId, userId }).lean().exec();
    if (!existing) throw new BadRequestException('resource not found for user');

    const updated = await model
      .findOneAndUpdate({ _id: resourceId, userId }, patch, { new: true })
      .lean()
      .exec();

    this.logger.log(`Admin updated resource type=${type} id=${resourceId} userId=${userId}`);
    return updated;
  }

  @Get('stats')
  async getStats() {
    const [
      totalUsers,
      adminUsers,
      verifiedUsers,
      apiaries,
      hives,
      queens,
      inspections,
      treatmentAgents,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ role: 'admin' }).exec(),
      this.userModel.countDocuments({ emailVerified: true }).exec(),
      this.apiaryModel.countDocuments().exec(),
      this.hiveModel.countDocuments().exec(),
      this.queenModel.countDocuments().exec(),
      this.inspectionModel.countDocuments().exec(),
      this.treatmentAgentModel.countDocuments().exec(),
    ]);

    return {
      users: {
        total: totalUsers,
        admin: adminUsers,
        regular: totalUsers - adminUsers,
        verified: verifiedUsers,
      },
      resources: {
        apiaries,
        hives,
        queens,
        inspections,
        treatmentAgents,
        total: apiaries + hives + queens + inspections + treatmentAgents,
      },
    };
  }
}
