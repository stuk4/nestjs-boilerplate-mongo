import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { EnumRole } from '../../auth/interfaces/auth.interfaces';
import { Profile } from './profile.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, index: true, unique: true })
  username: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({
    type: [String],
    default: [],
  })
  ipAddresses: string[];

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], enum: EnumRole, default: [EnumRole.user] })
  roles: EnumRole[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: Profile.name })
  profile: Profile;
}

export const UserSchema = SchemaFactory.createForClass(User);
