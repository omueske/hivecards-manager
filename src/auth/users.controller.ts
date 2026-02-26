import { Controller, Get, Put, Body, UseGuards, Logger, Req, BadRequestException, Param } from '@nestjs/common';
import { JwtGuard } from '../common/jwt.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Roles } from '../common/roles.decorator';

@Controller('api/v1/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async me(@Req() req: any) {
    const uid = req.user?.id;
    this.logger.log(`Get current user id=${uid}`);
    const u = await this.userModel.findById(uid).lean().exec();
    if (!u) return { id: uid, role: req.user?.role ?? 'user' };
    return {
      id: u._id.toString(),
      email: u.email,
      username: u.username,
      emailVerified: !!u.emailVerified,
      role: (u as any).role === 'admin' ? 'admin' : 'user',
    };
  }

  @UseGuards(JwtGuard)
  @Put('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    const uid = req.user?.id;
    this.logger.log(`Update current user id=${uid}`);
    const update: any = {};
    if (typeof body.username === 'string') update.username = body.username;
    if (typeof body.email === 'string') update.email = body.email;
    if (typeof body.password === 'string' && body.password.length > 0) {
      const saltRounds = 10;
      update.passwordHash = await bcrypt.hash(body.password, saltRounds);
    }
    await this.userModel.findByIdAndUpdate(uid, update).exec();
    const u = await this.userModel.findById(uid).lean().exec();
    if (!u) throw new Error('User not found');
    return {
      id: (u._id as any).toString(),
      email: u.email,
      username: u.username,
      emailVerified: !!u.emailVerified,
      role: (u as any).role === 'admin' ? 'admin' : 'user',
    };
  }

  @UseGuards(JwtGuard)
  @Roles('admin')
  @Put(':id/role')
  async updateRole(@Req() _req: any, @Param('id') targetId: string, @Body() body: any) {
    const role = body?.role;
    if (!targetId || typeof targetId !== 'string') {
      throw new BadRequestException('id required');
    }
    if (role !== 'user' && role !== 'admin') {
      throw new BadRequestException('role must be user or admin');
    }
    const updated = await this.userModel.findByIdAndUpdate(targetId, { role }, { new: true }).lean().exec();
    if (!updated) throw new BadRequestException('user not found');
    this.logger.log(`Updated role for user id=${targetId} role=${role}`);
    return {
      id: (updated._id as any).toString(),
      email: updated.email,
      username: updated.username,
      role: (updated as any).role === 'admin' ? 'admin' : 'user',
    };
  }
}
