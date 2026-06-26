"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WorkerController_1 = require("../controllers/WorkerController");
const router = (0, express_1.Router)();
router.get('/', WorkerController_1.getAllWorkers);
router.post('/', WorkerController_1.createWorker);
exports.default = router;
