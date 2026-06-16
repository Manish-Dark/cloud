import axios from 'axios';
import FormData from 'form-data';

/**
 * Sends a file buffer to the Telegram channel and returns the file_id and message_id.
 */
export const uploadFileToTelegram = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ file_id: string; message_id: number }> => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
  const API_BASE = process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org';

  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set in .env');
  }

  const form = new FormData();
  form.append('chat_id', CHANNEL_ID);
  form.append('document', fileBuffer, { filename: fileName, contentType: mimeType });

  const response = await axios.post(
    `${API_BASE}/bot${BOT_TOKEN}/sendDocument`,
    form,
    { headers: form.getHeaders() }
  );

  if (!response.data.ok) {
    throw new Error(`Telegram API error: ${JSON.stringify(response.data)}`);
  }

  const result = response.data.result;
  const telegramFileId: string = result.document?.file_id || result.photo?.pop()?.file_id || '';
  const messageId: number = result.message_id;
  
  return { file_id: telegramFileId, message_id: messageId };
};

/**
 * Deletes a message (containing a file) from Telegram.
 */
export const deleteFileFromTelegram = async (messageId: number): Promise<void> => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
  const API_BASE = process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org';

  if (!BOT_TOKEN || !CHANNEL_ID) return;

  try {
    const res = await axios.post(`${API_BASE}/bot${BOT_TOKEN}/deleteMessage`, {
      chat_id: CHANNEL_ID,
      message_id: messageId
    });
    if (res.data.ok) {
      console.log(`Successfully deleted Telegram message ${messageId}`);
    } else {
      console.error(`Telegram deleteMessage returned not ok: ${JSON.stringify(res.data)}`);
    }
  } catch (error: any) {
    console.error(`Failed to delete Telegram message ${messageId}:`, error.message);
  }
};

/**
 * Downloads a file from Telegram using its file_id.
 */
export const downloadFileFromTelegram = async (telegramFileId: string): Promise<Buffer> => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const API_BASE = process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org';

  if (!BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not set in .env');
  }

  // 1. Get file path
  const getFileRes = await axios.get(`${API_BASE}/bot${BOT_TOKEN}/getFile?file_id=${telegramFileId}`);
  if (!getFileRes.data.ok) {
    throw new Error(`Telegram getFile error: ${JSON.stringify(getFileRes.data)}`);
  }

  const filePath = getFileRes.data.result.file_path;

  // 2. Download the actual file content
  const downloadRes = await axios.get(`${API_BASE}/file/bot${BOT_TOKEN}/${filePath}`, {
    responseType: 'arraybuffer'
  });

  return Buffer.from(downloadRes.data);
};
