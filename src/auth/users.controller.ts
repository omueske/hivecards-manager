import { Controller, Get, Put, Body, UseGuards, Logger, Req, BadRequestException, Param } from '@nestjs/common';
import { JwtGuard } from '../common/jwt.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Roles } from '../common/roles.decorator';
import {
  BREEDER_ASSOCIATIONS,
  findBreederAssociation,
  parseBreederAssociationCode,
} from './breeder-associations.data';

@Controller('api/v1/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private normalizeBreederProfile(body: any): any {
    const update: any = {};

    if (body?.breederAssociationCode !== undefined) {
      const parsed = parseBreederAssociationCode(body.breederAssociationCode);
      if (!parsed) {
        throw new BadRequestException('breederAssociationCode must be a valid association code');
      }
      update.breederCountry = parsed.country;
      update.breederAssociation = parsed.associationNumber;
    }

    if (body?.breederCountry !== undefined) {
      if (typeof body.breederCountry !== 'string') {
        throw new BadRequestException('breederCountry must be a string');
      }
      const value = body.breederCountry.trim().toUpperCase();
      if (value.length !== 2) {
        throw new BadRequestException('breederCountry must be 2 characters');
      }
      update.breederCountry = value;
    }

    if (body?.breederAssociation !== undefined) {
      if (!Number.isInteger(body.breederAssociation) || body.breederAssociation < 1 || body.breederAssociation > 99) {
        throw new BadRequestException('breederAssociation must be an integer between 1 and 99');
      }
      update.breederAssociation = body.breederAssociation;
    }

    if (body?.breederNumber !== undefined) {
      if (!Number.isInteger(body.breederNumber) || body.breederNumber < 1 || body.breederNumber > 999) {
        throw new BadRequestException('breederNumber must be an integer between 1 and 999');
      }
      update.breederNumber = body.breederNumber;
    }

    if (body?.defaultApiaryNumber !== undefined) {
      if (!Number.isInteger(body.defaultApiaryNumber) || body.defaultApiaryNumber < 1 || body.defaultApiaryNumber > 99) {
        throw new BadRequestException('defaultApiaryNumber must be an integer between 1 and 99');
      }
      update.defaultApiaryNumber = body.defaultApiaryNumber;
    }

    if (body?.defaultMatingType !== undefined) {
      if (![1, 2, 3, 4].includes(body.defaultMatingType)) {
        throw new BadRequestException('defaultMatingType must be 1, 2, 3 or 4');
      }
      update.defaultMatingType = body.defaultMatingType;
    }

    if (body?.isObmann !== undefined) {
      if (typeof body.isObmann !== 'boolean') {
        throw new BadRequestException('isObmann must be a boolean');
      }
      update.isObmann = body.isObmann;
      if (!body.isObmann) {
        update.obmannNumber = undefined;
      }
    }

    if (body?.obmannNumber !== undefined) {
      if (!Number.isInteger(body.obmannNumber) || body.obmannNumber < 1 || body.obmannNumber > 999) {
        throw new BadRequestException('obmannNumber must be an integer between 1 and 999');
      }
      if (body?.isObmann === false) {
        throw new BadRequestException('obmannNumber requires isObmann=true');
      }
      update.obmannNumber = body.obmannNumber;
    }

    if (body?.dateInputMode !== undefined) {
      if (!['full', 'dayMonth', 'week'].includes(body.dateInputMode)) {
        throw new BadRequestException('dateInputMode must be full, dayMonth or week');
      }
      update.dateInputMode = body.dateInputMode;
    }

    const effectiveCountry = update.breederCountry;
    const effectiveAssociation = update.breederAssociation;
    if (
      typeof effectiveCountry === 'string' &&
      Number.isInteger(effectiveAssociation) &&
      !findBreederAssociation(effectiveCountry, effectiveAssociation)
    ) {
      throw new BadRequestException('breederCountry and breederAssociation must match a known association code');
    }

    return update;
  }

  private normalizeProfileContact(body: any): any {
    const update: any = {};

    if (body?.streetHouseNumber !== undefined) {
      if (typeof body.streetHouseNumber !== 'string') {
        throw new BadRequestException('streetHouseNumber must be a string');
      }
      update.streetHouseNumber = body.streetHouseNumber.trim();
    }

    if (body?.postalCode !== undefined) {
      if (typeof body.postalCode !== 'string') {
        throw new BadRequestException('postalCode must be a string');
      }
      update.postalCode = body.postalCode.trim();
    }

    if (body?.city !== undefined) {
      if (typeof body.city !== 'string') {
        throw new BadRequestException('city must be a string');
      }
      update.city = body.city.trim();
    }

    if (body?.phone !== undefined) {
      if (typeof body.phone !== 'string') {
        throw new BadRequestException('phone must be a string');
      }
      update.phone = body.phone.trim();
    }

    if (body?.operationNumber !== undefined) {
      if (typeof body.operationNumber !== 'string') {
        throw new BadRequestException('operationNumber must be a string');
      }
      update.operationNumber = body.operationNumber.trim();
    }

    return update;
  }

  private toUserResponse(u: any): any {
    return {
      id: u._id.toString(),
      email: u.email,
      username: u.username,
      emailVerified: !!u.emailVerified,
      role: (u as any).role === 'admin' ? 'admin' : 'user',
      streetHouseNumber: u.streetHouseNumber,
      postalCode: u.postalCode,
      city: u.city,
      phone: u.phone,
      operationNumber: u.operationNumber,
      breederCountry: u.breederCountry,
      breederAssociation: u.breederAssociation,
      breederAssociationCode: findBreederAssociation(u.breederCountry, u.breederAssociation)?.code,
      breederNumber: u.breederNumber,
      defaultApiaryNumber: u.defaultApiaryNumber,
      defaultMatingType: u.defaultMatingType,
      isObmann: !!u.isObmann,
      obmannNumber: u.obmannNumber,
      dateInputMode: u.dateInputMode,
    };
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async me(@Req() req: any) {
    const uid = req.user?.id;
    this.logger.log(`Get current user id=${uid}`);
    const u = await this.userModel.findById(uid).lean().exec();
    if (!u) return { id: uid, role: req.user?.role ?? 'user' };
    return this.toUserResponse(u);
  }

  @UseGuards(JwtGuard)
  @Get('breeder-associations')
  async breederAssociations() {
    this.logger.debug(`List breeder associations count=${BREEDER_ASSOCIATIONS.length}`);
    return BREEDER_ASSOCIATIONS;
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
    Object.assign(update, this.normalizeProfileContact(body));
    Object.assign(update, this.normalizeBreederProfile(body));
    await this.userModel.findByIdAndUpdate(uid, update).exec();
    const u = await this.userModel.findById(uid).lean().exec();
    if (!u) throw new Error('User not found');
    return this.toUserResponse(u);
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
