import mongoose, { Document, Schema } from 'mongoose';

export interface IStorage extends Document {
  name: string;
  chat_id: number;
}

const storageSchema = new Schema<IStorage>({
  name: { type: String, required: true },
  chat_id: { type: Number, required: true }
});

export const Storage = mongoose.model<IStorage>('Storage', storageSchema);
