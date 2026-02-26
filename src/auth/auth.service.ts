import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  async register(email: string, password: string, username?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    this.logger.debug(`Register request email=${normalizedEmail} username=${username ?? '-'}`);
    const existing = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (existing) {
      this.logger.warn(`Registration failed - email already registered: ${normalizedEmail}`);
      throw new BadRequestException('Email already registered');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = new this.userModel({
      email: normalizedEmail,
      passwordHash,
      username,
      emailVerificationToken,
      emailVerificationExpires,
    });
    await user.save();
    this.logger.log(`New user created id=${user._id.toString()} email=${user.email}`);
    this.logger.debug(`Verification token generated expires=${emailVerificationExpires.toISOString()}`);
    // Send verification email (non-blocking — don't fail registration if mail fails)
    this.mailService.sendVerificationEmail(normalizedEmail, emailVerificationToken, user.username).catch(err =>
      this.logger.warn(`Failed to send verification email to ${normalizedEmail}: ${err?.message}`),
    );
    return { id: user._id.toString(), email: user.email, username: user.username, createdAt: user.createdAt };
  }

  async verifyEmail(token: string) {
    this.logger.debug(`Looking up verification token token=${token.slice(0, 8)}...`);
    const user = await this.userModel
      .findOne({ emailVerificationToken: token })
      .exec();
    if (!user) throw new BadRequestException('Invalid or expired verification token');
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      this.logger.warn(`Verification token expired for token=${token.slice(0, 8)}...`);
      throw new BadRequestException('Verification token expired');
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    this.logger.log(`Email verified for userId=${user._id.toString()} email=${user.email}`);
    return { ok: true };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
    // Always return success to avoid user enumeration
    if (!user) {
      this.logger.warn(`forgotPassword: no user for email=${normalizedEmail}`);
      return { ok: true };
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    this.mailService.sendPasswordResetEmail(normalizedEmail, token, user.username).catch(err =>
      this.logger.warn(`Failed to send reset email to ${normalizedEmail}: ${err?.message}`),
    );
    this.logger.log(`Password reset email sent to ${normalizedEmail}`);
    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({ passwordResetToken: token }).exec();
    if (!user) throw new BadRequestException('Invalid or expired reset token');
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token expired');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    this.logger.log(`Password reset for userId=${user._id.toString()}`);
    return { ok: true };
  }

  async validateUser(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    this.logger.debug(`Validating credentials for email=${normalizedEmail}`);
    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (!user) {
      this.logger.warn(`No user found for email=${normalizedEmail}`);
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      this.logger.warn(`Password mismatch for email=${normalizedEmail}`);
      return null;
    }
    if (!user.emailVerified) {
      this.logger.warn(`Login blocked - email not verified for userId=${user._id.toString()}`);
      throw new BadRequestException('Email not verified');
    }
    this.logger.log(`User validated email=${normalizedEmail} id=${user._id.toString()}`);
    return user;
  }

  signTokens(userId: string) {
    this.logger.debug(`Signing JWT tokens for userId=${userId}`);
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
    } catch (e: any) {
      this.logger.warn(`verifyToken failed: ${e?.name || 'Error'} - ${e?.message || ''}`);
      return null;
    }
  }
}
