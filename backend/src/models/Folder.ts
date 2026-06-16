import mongoose, { Document, Schema } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  storage_id: mongoose.Types.ObjectId;
  parent_folder_id?: mongoose.Types.ObjectId;
}

const folderSchema = new Schema<IFolder>({
  name: { type: String, required: true },
  storage_id: { type: Schema.Types.ObjectId, ref: 'Storage', required: true },
  parent_folder_id: { type: Schema.Types.ObjectId, ref: 'Folder', default: null }
}, { timestamps: true });

export const Folder = mongoose.model<IFolder>('Folder', folderSchema);
