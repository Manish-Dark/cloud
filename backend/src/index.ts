import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Load from parent directory

import cors from 'cors';
import userRoutes from './routes/userRoutes';
import fileRoutes from './routes/fileRoutes';
import folderRoutes from './routes/folderRoutes';
import storageRoutes from './routes/storageRoutes';
import accessRoutes from './routes/accessRoutes';
import workerRoutes from './routes/workerRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

app.get('/', (req, res) => {
  res.send('Manish-Dark API is running');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/storages', storageRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/workers', workerRoutes);
