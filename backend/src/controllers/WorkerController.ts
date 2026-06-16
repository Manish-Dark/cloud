import { Request, Response } from 'express';
import { StorageWorker } from '../models/StorageWorker';

export const getAllWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await StorageWorker.find();
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage workers' });
  }
};

export const createWorker = async (req: Request, res: Response) => {
  try {
    const worker = new StorageWorker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create storage worker' });
  }
};
