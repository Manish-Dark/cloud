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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccess = exports.updateAccess = exports.createAccess = exports.getAccessesByStorage = void 0;
const Access_1 = require("../models/Access");
const User_1 = require("../models/User");
// GET /api/access?storage_id=xxx  — fetch all accesses for a storage, populated with user email
const getAccessesByStorage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const storage_id = req.query.storage_id;
    try {
        const query = storage_id ? { storage_id } : {};
        const accesses = yield Access_1.Access.find(query).populate('user_id', 'email');
        res.status(200).json(accesses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch accesses' });
    }
});
exports.getAccessesByStorage = getAccessesByStorage;
// POST /api/access
const createAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, storage_id, access_type } = req.body;
    try {
        // find user by email
        const user = yield User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404).json({ error: `User with email '${email}' not found` });
            return;
        }
        // check if already exists
        const existing = yield Access_1.Access.findOne({ user_id: user._id, storage_id });
        if (existing) {
            res.status(409).json({ error: 'Access already granted for this user on this storage' });
            return;
        }
        const access = new Access_1.Access({ user_id: user._id, storage_id, access_type });
        yield access.save();
        const populated = yield access.populate('user_id', 'email');
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create access' });
    }
});
exports.createAccess = createAccess;
// PUT /api/access/:id
const updateAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const access = yield Access_1.Access.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user_id', 'email');
        if (!access) {
            res.status(404).json({ error: 'Access not found' });
            return;
        }
        res.status(200).json(access);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update access' });
    }
});
exports.updateAccess = updateAccess;
// DELETE /api/access/:id
const deleteAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Access_1.Access.findByIdAndDelete(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete access' });
    }
});
exports.deleteAccess = deleteAccess;
