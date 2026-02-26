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
