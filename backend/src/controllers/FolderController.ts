import { Request, Response } from 'express';
import { Folder } from '../models/Folder';

// GET /api/folders?storage_id=xxx
export const getFoldersByStorage = async (req: Request, res: Response) => {
  const storage_id = req.query.storage_id as string | undefined;
  try {
    const query = storage_id ? { storage_id } : {};
    const folders = await Folder.find(query);
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

// POST /api/folders
export const createFolder = async (req: Request, res: Response) => {
  try {
    const folder = new Folder(req.body);
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create folder' });
  }
};

// DELETE /api/folders/:id
export const deleteFolder = async (req: Request, res: Response) => {
  try {
    await Folder.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete folder' });
  }
};
