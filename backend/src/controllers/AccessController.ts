import { Request, Response } from 'express';
import { Access } from '../models/Access';
import { User } from '../models/User';

// GET /api/access?storage_id=xxx  — fetch all accesses for a storage, populated with user email
export const getAccessesByStorage = async (req: Request, res: Response) => {
  const storage_id = req.query.storage_id as string | undefined;
  try {
    const query = storage_id ? { storage_id } : {};
    const accesses = await Access.find(query).populate('user_id', 'email');
    res.status(200).json(accesses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accesses' });
  }
};

// POST /api/access
export const createAccess = async (req: Request, res: Response) => {
  const { email, storage_id, access_type } = req.body;
  try {
    // find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ error: `User with email '${email}' not found` });
      return;
    }
    // check if already exists
    const existing = await Access.findOne({ user_id: user._id, storage_id });
    if (existing) {
      res.status(409).json({ error: 'Access already granted for this user on this storage' });
      return;
    }
    const access = new Access({ user_id: user._id, storage_id, access_type });
    await access.save();
    const populated = await access.populate('user_id', 'email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create access' });
  }
};

// PUT /api/access/:id
export const updateAccess = async (req: Request, res: Response) => {
  try {
    const access = await Access.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user_id', 'email');
    if (!access) { res.status(404).json({ error: 'Access not found' }); return; }
    res.status(200).json(access);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update access' });
  }
};

// DELETE /api/access/:id
export const deleteAccess = async (req: Request, res: Response) => {
  try {
    await Access.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete access' });
  }
};
