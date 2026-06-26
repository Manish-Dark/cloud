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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
const SECRET_KEY = process.env.SECRET_KEY || 'fallback_secret_key';
const ACCESS_TOKEN_EXPIRE_IN_SECS = parseInt(process.env.ACCESS_TOKEN_EXPIRE_IN_SECS || '1800', 10);
// POST /api/auth/login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const user = yield User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const access_token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRE_IN_SECS });
        res.json({ access_token, user: { id: user._id, email: user.email } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// POST /api/auth/register  (for new users via the register form)
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const existing = yield User_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }
        const password_hash = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_1.User({ email: email.toLowerCase(), password_hash });
        yield user.save();
        const access_token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRE_IN_SECS });
        res.status(201).json({ access_token, user: { id: user._id, email: user.email } });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
