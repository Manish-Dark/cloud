import mongoose, { Document, Schema } from 'mongoose';

export interface IAccess extends Document {
  user_id: mongoose.Types.ObjectId;
  storage_id: mongoose.Types.ObjectId;
  access_type: 'R' | 'W' | 'A';
}

const accessSchema = new Schema<IAccess>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  storage_id: { type: Schema.Types.ObjectId, ref: 'Storage', required: true },
  access_type: { type: String, enum: ['R', 'W', 'A'], required: true }
});

export const Access = mongoose.model<IAccess>('Access', accessSchema);
