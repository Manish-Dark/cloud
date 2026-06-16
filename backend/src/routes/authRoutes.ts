import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

const SECRET_KEY = process.env.SECRET_KEY || 'fallback_secret_key';
const ACCESS_TOKEN_EXPIRE_IN_SECS = parseInt(process.env.ACCESS_TOKEN_EXPIRE_IN_SECS || '1800', 10);

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const access_token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRE_IN_SECS }
    );

    res.json({ access_token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register  (for new users via the register form)
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = new User({ email: email.toLowerCase(), password_hash });
    await user.save();

    const access_token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRE_IN_SECS }
    );

    res.status(201).json({ access_token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
