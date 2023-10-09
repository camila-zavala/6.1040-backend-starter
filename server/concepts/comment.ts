import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import { PostDoc } from "./post";

export interface CommentDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  media: PostDoc;
}

export default class CommentConcept {
  private comments = new DocCollection<CommentDoc>("comments");

  async createComment(author: ObjectId, content: string, media: PostDoc) {
    await this.comments.createOne({ author, content, media });
    return "Comment made succesfully";
  }
  async deleteComment(author: ObjectId, comment_id: ObjectId) {
    await this.isAuthor(author, comment_id);
    await this.comments.deleteOne({ comment_id });
    return "Comment deleted successfully";
  }

  async notifyUser(author: ObjectId, user: ObjectId, media: PostDoc) {
    throw new Error("not implemented yet");
  }

  async isAuthor(user: ObjectId, comment_id: ObjectId) {
    const comment = await this.comments.readOne({ comment_id });
    if (!comment) {
      throw new NotFoundError(`Post ${comment_id} does not exist!`);
    }
    if (comment.author.toString() !== user.toString()) {
      throw new CommentAuthorNotMatchError(user, comment_id);
    }
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
