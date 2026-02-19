import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(email: string, password: string, username?: string) {
    this.logger.log(`Registering user email=${email}`);
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      this.logger.warn(`Registration failed - email already registered: ${email}`);
      throw new BadRequestException('Email already registered');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new this.userModel({ email, passwordHash, username });
    await user.save();
    this.logger.log(`User created id=${user._id.toString()} email=${user.email}`);
    return { id: user._id.toString(), email: user.email, username: user.username, createdAt: user.createdAt };
  }

  async validateUser(email: string, password: string) {
    this.logger.log(`Validating user credentials for email=${email}`);
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      this.logger.warn(`No user found for email=${email}`);
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      this.logger.warn(`Password mismatch for email=${email}`);
      return null;
    }
    this.logger.log(`User validated email=${email} id=${user._id.toString()}`);
    return user;
  }

  signTokens(userId: string) {
    this.logger.log(`Signing tokens for userId=${userId}`);
    const payload = { sub: userId };
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });
    // Do not log tokens themselves
    return { accessToken, refreshToken };
  }

  verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret';
      return jwt.verify(token, secret) as { sub: string };
    } catch (e: any) {
      this.logger.warn(`verifyToken failed: ${e?.name || 'Error'} - ${e?.message || ''}`);
      return null;
    }
  }
}
