"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FolderController_1 = require("../controllers/FolderController");
const router = (0, express_1.Router)();
router.get('/', FolderController_1.getFoldersByStorage);
router.post('/', FolderController_1.createFolder);
router.delete('/:id', FolderController_1.deleteFolder);
exports.default = router;
