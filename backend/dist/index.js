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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' }); // Load from parent directory
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const folderRoutes_1 = __importDefault(require("./routes/folderRoutes"));
const storageRoutes_1 = __importDefault(require("./routes/storageRoutes"));
const accessRoutes_1 = __importDefault(require("./routes/accessRoutes"));
const workerRoutes_1 = __importDefault(require("./routes/workerRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in .env");
    process.exit(1);
}
mongoose_1.default.connect(MONGO_URI)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
        console.log(`Backend server is running on port ${PORT}`);
    });
}))
    .catch(err => {
    console.error("MongoDB connection error:", err);
});
// API root check removed to serve frontend
// Mount Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/files', fileRoutes_1.default);
app.use('/api/folders', folderRoutes_1.default);
app.use('/api/storages', storageRoutes_1.default);
app.use('/api/access', accessRoutes_1.default);
app.use('/api/workers', workerRoutes_1.default);
const path_1 = __importDefault(require("path"));
const frontendPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(frontendPath));
app.get(/.*/, (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
