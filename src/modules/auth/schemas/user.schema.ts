import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { EnumRole } from '../interfaces/auth.interfaces';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], enum: EnumRole, default: [EnumRole.USER] })
  roles: EnumRole[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
