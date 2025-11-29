import Comment, { IComment } from '../models/comment.model';
import { convertToObjectIdMongodb } from '../utils';
import { findProduct } from '../models/repositories/product.repo';
import { NotFoundError } from '../core/error.response';

interface CreateCommentParams {
  productId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
}

interface GetCommentsParams {
  productId: string;
  parentCommentId?: string | null;
  limit?: number;
  offset?: number;
}

interface DeleteCommentParams {
  commentId: string;
  productId: string;
}

export const createComment = async ({
  productId,
  userId,
  content,
  parentCommentId = null,
}: CreateCommentParams): Promise<IComment> => {
  const comment = new Comment({
    comment_productId: productId,
    comment_userId: userId as any,
    comment_content: content,
    comment_parentId: parentCommentId as any,
  });

  let rightValue: number;
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) throw new NotFoundError('parent comment not found');

    rightValue = parentComment.comment_right;

    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gte: rightValue },
      },
      {
        $inc: { comment_right: 2 },
      }
    );

    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: rightValue },
      },
      {
        $inc: { comment_left: 2 },
      }
    );
  } else {
    const maxRightValue = await Comment.findOne(
      {
        comment_productId: convertToObjectIdMongodb(productId),
      },
      'comment_right',
      {
        sort: {
          comment_right: -1,
        },
      }
    );

    if (maxRightValue) {
      rightValue = maxRightValue.comment_right + 1;
    } else {
      rightValue = 1;
    }
  }

  comment.comment_left = rightValue;
  comment.comment_right = rightValue + 1;

  await comment.save();
  return comment;
};

export const getCommentsByParentId = async ({
  productId,
  parentCommentId = null,
}: GetCommentsParams): Promise<IComment[]> => {
  if (parentCommentId) {
    const parent = await Comment.findById(parentCommentId);
    if (!parent) throw new NotFoundError('Not found comment for product');

    const comments = await Comment.find({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gt: parent.comment_left },
      comment_right: { $lte: parent.comment_right },
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      })
      .sort({
        comment_left: 1,
      });

    return comments;
  }

  const comments = await Comment.find({
    comment_productId: convertToObjectIdMongodb(productId),
    comment_parentId: parentCommentId as any,
  })
    .select({
      comment_left: 1,
      comment_right: 1,
      comment_content: 1,
      comment_parentId: 1,
    })
    .sort({
      comment_left: 1,
    });

  return comments;
};

export const deleteComment = async ({
  commentId,
  productId,
}: DeleteCommentParams): Promise<boolean> => {
  const foundProduct = await findProduct({
    product_id: productId,
    unSelect: [],
  });

  if (!foundProduct) {
    throw new NotFoundError('product not found');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  const leftValue = comment.comment_left;
  const rightValue = comment.comment_right;

  const width = rightValue - leftValue + 1;

  await Comment.deleteMany({
    comment_productId: convertToObjectIdMongodb(productId),
    comment_left: { $gte: leftValue },
    comment_right: { $lte: rightValue },
  });

  await Comment.updateMany(
    {
      comment_productId: convertToObjectIdMongodb(productId),
      comment_right: { $gt: rightValue },
    },
    {
      $inc: { comment_right: -width },
    }
  );

  await Comment.updateMany(
    {
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gt: rightValue },
    },
    {
      $inc: { comment_left: -width },
    }
  );

  return true;
};

