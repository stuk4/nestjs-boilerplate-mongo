import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class RefreshToken extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, ref: User.name, type: mongoose.Types.ObjectId })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
