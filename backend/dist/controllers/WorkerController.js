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
exports.createWorker = exports.getAllWorkers = void 0;
const StorageWorker_1 = require("../models/StorageWorker");
const getAllWorkers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workers = yield StorageWorker_1.StorageWorker.find();
        res.status(200).json(workers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch storage workers' });
    }
});
exports.getAllWorkers = getAllWorkers;
const createWorker = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const worker = new StorageWorker_1.StorageWorker(req.body);
        yield worker.save();
        res.status(201).json(worker);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create storage worker' });
    }
});
exports.createWorker = createWorker;
