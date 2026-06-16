import mongoose, { Document, Schema } from 'mongoose';

export interface IFileChunk extends Document {
  file_id: mongoose.Types.ObjectId;
  telegram_file_id: string;
  telegram_message_id: number;
  position: number;
}

const fileChunkSchema = new Schema<IFileChunk>({
  file_id: { type: Schema.Types.ObjectId, ref: 'File', required: true },
  telegram_file_id: { type: String, required: true },
  telegram_message_id: { type: Number, required: true },
  position: { type: Number, required: true }
});

// To match the Rust constructor pattern
fileChunkSchema.statics.build = function(file_id: string, telegram_file_id: string, telegram_message_id: number, position: number) {
  return new this({
    file_id,
    telegram_file_id,
    telegram_message_id,
    position
  });
};

export const FileChunk = mongoose.model<IFileChunk>('FileChunk', fileChunkSchema);
