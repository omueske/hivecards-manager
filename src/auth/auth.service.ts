import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(email: string, password: string, username?: string) {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) throw new BadRequestException('Email already registered');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new this.userModel({ email, passwordHash, username });
    await user.save();
    return { id: user._id.toString(), email: user.email, username: user.username, createdAt: user.createdAt };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  signTokens(userId: string) {
    const payload = { sub: userId };
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret';
      return jwt.verify(token, secret) as { sub: string };
    } catch (e) {
      return null;
    }
  }
}
