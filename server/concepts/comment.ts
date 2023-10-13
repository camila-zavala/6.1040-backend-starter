import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import { PostDoc } from "./post";

export interface CommentDoc extends BaseDoc {
  author: ObjectId;
  comment: string;
  media: ObjectId;
}

export default class CommentConcept {
  private comments = new DocCollection<CommentDoc>("comments");

  private sanitizeComment(comment: CommentDoc) {
    // eslint-disable-next-line
    const { author, media, ...rest } = comment; // remove password
    return rest;
  }

  async getComment(comment: string) {
    const commented = await this.comments.readOne({ comment });
    if (commented === null) {
      throw new NotFoundError(`Comment not found!`);
    }
    return this.sanitizeComment(commented);
  }

  async createComment(author: ObjectId, comment: string, id: ObjectId) {
    const comment_id = await this.comments.createOne({ author, comment, media: id });
    return { msg: "Comment made succesfully", mediaId: id, commentId: comment_id, authorId: author };
  }
  async deleteComment(author: ObjectId, _id: ObjectId) {
    await this.isAuthor(author, _id);
    await this.comments.deleteOne({ _id });
    return "Comment deleted successfully";
  }

  async notifyUser(author: ObjectId, user: ObjectId, media: PostDoc) {
    throw new Error("not implemented yet");
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (!comment) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (comment.author.toString() !== user.toString()) {
      throw new CommentAuthorNotMatchError(user, _id);
    }
  }
  async getComments(id: ObjectId) {
    const comments = await this.comments.readMany({ media: id });
    return comments;
  }
}
export class CommentAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
