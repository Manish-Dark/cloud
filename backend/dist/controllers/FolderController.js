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
exports.deleteFolder = exports.createFolder = exports.getFoldersByStorage = void 0;
const Folder_1 = require("../models/Folder");
// GET /api/folders?storage_id=xxx
const getFoldersByStorage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const storage_id = req.query.storage_id;
    try {
        const query = storage_id ? { storage_id } : {};
        const folders = yield Folder_1.Folder.find(query);
        res.status(200).json(folders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});
exports.getFoldersByStorage = getFoldersByStorage;
// POST /api/folders
const createFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folder = new Folder_1.Folder(req.body);
        yield folder.save();
        res.status(201).json(folder);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create folder' });
    }
});
exports.createFolder = createFolder;
// DELETE /api/folders/:id
const deleteFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Folder_1.Folder.findByIdAndDelete(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete folder' });
    }
});
exports.deleteFolder = deleteFolder;
