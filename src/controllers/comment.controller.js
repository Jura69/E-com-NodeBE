"use strict";

const { SuccessResponse } = require("../core/success.response");
const { createComment } = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    const newSuccessResponse = new SuccessResponse({
      message: "create new comment",
      metadata: await createComment(req.body),
    });
    newSuccessResponse.send(res);
  };
}

module.exports = new CommentController();
