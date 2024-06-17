import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { EnumGender } from '../interfaces/user.interfaces';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({
  timestamps: true,
})
export class Profile extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: false })
  bio: string;

  @Prop({
    enum: EnumGender,
  })
  gender: EnumGender;

  @Prop({ required: false })
  inactiveReason: string;

  @Prop({ required: false })
  avatarUrl: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
