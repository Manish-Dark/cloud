import { Request, Response } from 'express';
import { Storage } from '../models/Storage';

export const getAllStorages = async (req: Request, res: Response) => {
  try {
    const storages = await Storage.find();
    res.status(200).json(storages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storages' });
  }
};

export const createStorage = async (req: Request, res: Response) => {
  try {
    const storage = new Storage(req.body);
    await storage.save();
    res.status(201).json(storage);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create storage' });
  }
};
