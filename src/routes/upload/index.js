"use strict";

const express = require("express");
const uploadController = require("../../controllers/upload.controller");

const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");

const { authenticationV2 } = require("../../auth/authUtils");
const { uploadDisk } = require("../../configs/multer.config");

//router.use(authenticationV2);
router.post("/product", asyncHandler(uploadController.uploadFileUrl));
router.post("/product/local", uploadDisk.single('file'), asyncHandler(uploadController.uploadFileLocal));

module.exports = router;

 