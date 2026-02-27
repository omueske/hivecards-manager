import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
export type UserRole = 'user' | 'admin';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop()
  username?: string;

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop({ enum: ['user', 'admin'], default: 'user', index: true })
  role!: UserRole;

  @Prop({ uppercase: true, minlength: 2, maxlength: 2 })
  breederCountry?: string;

  @Prop({ min: 1, max: 99 })
  breederAssociation?: number;

  @Prop({ min: 1, max: 999 })
  breederNumber?: number;

  @Prop({ min: 1, max: 99 })
  defaultApiaryNumber?: number;

  @Prop({ enum: [1, 2, 3, 4] })
  defaultMatingType?: 1 | 2 | 3 | 4;

  @Prop({ default: false })
  isObmann?: boolean;

  @Prop({ min: 1, max: 999 })
  obmannNumber?: number;

  @Prop({ enum: ['full', 'dayMonth', 'week'] })
  dateInputMode?: 'full' | 'dayMonth' | 'week';

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
