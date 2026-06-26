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
exports.createStorage = exports.getAllStorages = void 0;
const Storage_1 = require("../models/Storage");
const getAllStorages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storages = yield Storage_1.Storage.find();
        res.status(200).json(storages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch storages' });
    }
});
exports.getAllStorages = getAllStorages;
const createStorage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storage = new Storage_1.Storage(req.body);
        yield storage.save();
        res.status(201).json(storage);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create storage' });
    }
});
exports.createStorage = createStorage;
