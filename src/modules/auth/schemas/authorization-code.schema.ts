import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type AuthorizationCodeDocument = HydratedDocument<AuthorizationCode>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class AuthorizationCode extends Document {
  @Prop({ required: true, index: true })
  code: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: User.name, required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;
}

export const AuthorizationCodeSchema =
  SchemaFactory.createForClass(AuthorizationCode);
