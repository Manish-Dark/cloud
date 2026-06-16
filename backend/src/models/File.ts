import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  path: string;
  size: number;
  storage_id: mongoose.Types.ObjectId;
  is_uploaded: boolean;
}

const fileSchema = new Schema<IFile>({
  path: { type: String, required: true },
  size: { type: Number, required: true },
  storage_id: { type: Schema.Types.ObjectId, ref: 'Storage', required: true },
  is_uploaded: { type: Boolean, required: true, default: false }
});

export const File = mongoose.model<IFile>('File', fileSchema);
