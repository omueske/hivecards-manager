import { Controller, Get, Put, Body, UseGuards, Logger, Req } from '@nestjs/common';
import { JwtGuard } from '../common/jwt.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

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
    if (!u) return { id: uid };
    return { id: u._id.toString(), email: u.email, username: u.username };
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
    return { id: (u._id as any).toString(), email: u.email, username: u.username };
  }
}
