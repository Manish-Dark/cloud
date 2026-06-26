"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFileFromTelegram = exports.deleteFileFromTelegram = exports.uploadFileToTelegram = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
/**
 * Sends a file buffer to the Telegram channel and returns the file_id and message_id.
 */
const uploadFileToTelegram = (fileBuffer, fileName, mimeType) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
    const API_BASE = process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org';
    if (!BOT_TOKEN || !CHANNEL_ID) {
        throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set in .env');
    }
    const form = new form_data_1.default();
    form.append('chat_id', CHANNEL_ID);
    form.append('document', fileBuffer, { filename: fileName, contentType: mimeType });
    const response = yield axios_1.default.post(`${API_BASE}/bot${BOT_TOKEN}/sendDocument`, form, { headers: form.getHeaders() });
    if (!response.data.ok) {
        throw new Error(`Telegram API error: ${JSON.stringify(response.data)}`);
    }
    const result = response.data.result;
    const telegramFileId = ((_a = result.document) === null || _a === void 0 ? void 0 : _a.file_id) || ((_c = (_b = result.photo) === null || _b === void 0 ? void 0 : _b.pop()) === null || _c === void 0 ? void 0 : _c.file_id) || '';
    const messageId = result.message_id;
    return { file_id: telegramFileId, message_id: messageId };
});
exports.uploadFileToTelegram = uploadFileToTelegram;
/**
 * Deletes a message (containing a file) from Telegram.
 */
const deleteFileFromTelegram = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
    const API_BASE = process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org';
    if (!BOT_TOKEN || !CHANNEL_ID)
        return;
    try {
        const res = yield axios_1.default.post(`${API_BASE}/bot${BOT_TOKEN}/deleteMessage`, {
            chat_id: CHANNEL_ID,
            message_id: messageId
        });
        if (res.data.ok) {
            console.log(`Successfully deleted Telegram message ${messageId}`);
        }
        else {
            console.error(`Telegram deleteMessage returned not ok: ${JSON.stringify(res.data)}`);
        }
    }
    catch (error) {
        console.error(`Failed to delete Telegram message ${messageId}:`, error.message);
    }
});
exports.deleteFileFromTelegram = deleteFileFromTelegram;
/**
 * Downloads a file from Telegram using its file_id.
 */
const downloadFileFromTelegram = (telegramFileId) => __awaiter(void 0, void 0, void 0, function* () {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const API_BASE = process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org';
    if (!BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN not set in .env');
    }
    // 1. Get file path
    const getFileRes = yield axios_1.default.get(`${API_BASE}/bot${BOT_TOKEN}/getFile?file_id=${telegramFileId}`);
    if (!getFileRes.data.ok) {
        throw new Error(`Telegram getFile error: ${JSON.stringify(getFileRes.data)}`);
    }
    const filePath = getFileRes.data.result.file_path;
    // 2. Download the actual file content
    const downloadRes = yield axios_1.default.get(`${API_BASE}/file/bot${BOT_TOKEN}/${filePath}`, {
        responseType: 'arraybuffer'
    });
    return Buffer.from(downloadRes.data);
});
exports.downloadFileFromTelegram = downloadFileFromTelegram;
