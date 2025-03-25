'use strict'

const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const express = require("express");
const router = express.Router();
const NotificationController = require("../../controllers/notification.controller");
//Here not login


// authentication //
router.use(authenticationV2);
////////////////////

router.get("", asyncHandler(NotificationController.listNotiByUser));



module.exports = router;