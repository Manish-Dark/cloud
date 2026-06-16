import mongoose, { Document, Schema } from 'mongoose';

export interface IStorageWorker extends Document {
  name: string;
  user_id: mongoose.Types.ObjectId;
  token: string;
  storage_id?: mongoose.Types.ObjectId;
}

const storageWorkerSchema = new Schema<IStorageWorker>({
  name: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  storage_id: { type: Schema.Types.ObjectId, ref: 'Storage' }
});

export const StorageWorker = mongoose.model<IStorageWorker>('StorageWorker', storageWorkerSchema);
