"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StorageController_1 = require("../controllers/StorageController");
const router = (0, express_1.Router)();
router.get('/', StorageController_1.getAllStorages);
router.post('/', StorageController_1.createStorage);
exports.default = router;
