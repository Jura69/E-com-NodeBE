"use strict";

const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandler");
const productController = require("../../controllers/product.controller");
const router = express.Router();

//authentication
router.use(authenticationV2);
///////////////////////////

router.post("", asyncHandler(productController.createProduct));

module.exports = router;
