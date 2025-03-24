'use strict'

const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const express = require("express");
const router = express.Router();
const CommentController = require("../../controllers/comment.controller");

// authentication
router.use(authenticationV2);

router.post('', asyncHandler(CommentController.createComment));
router.delete('', asyncHandler(CommentController.deleteComment));
router.get('', asyncHandler(CommentController.getCommentsByParentId));

module.exports = router;