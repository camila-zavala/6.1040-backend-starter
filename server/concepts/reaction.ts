import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { DirectMessageDoc } from "./directmessage";
import { NotAllowedError, NotFoundError } from "./errors";
import { PostDoc } from "./post";
import { UserDoc } from "./user";

export interface ReactionDoc extends BaseDoc {
  author: ObjectId;
  media: ObjectId;
  reaction: string;
}

export default class ReactionConcept {
  private allReactions = new DocCollection<ReactionDoc>("Reactions");

  async createReaction(author: ObjectId, media: ObjectId, reaction: string) {
    const messgae_id = await this.allReactions.createOne({ author, media, reaction });
    return "reaction made successfully";
  }
  async getReactionsForPost(media: ObjectId) {
    const reactions = await this.allReactions.readMany({ media });
    return reactions;
  }

  async removeReaction(user: ObjectId, reaction_id: ObjectId) {
    this.isAuthor(user, reaction_id);
    await this.allReactions.deleteOne({ reaction_id });
    return "Reaction deleted successfully";
  }

  async isAuthor(user: ObjectId, reaction_id: ObjectId) {
    const reaction = await this.allReactions.readOne({ _id: reaction_id });
    if (!reaction) {
      throw new NotFoundError(`Message ${reaction_id} does not exist!`);
    }
    if (reaction.author.toString() !== user.toString()) {
      throw new ReactionAuthorNotMatchError(user, reaction_id);
    }
  }

  async notifyUser(user: UserDoc, content: PostDoc | DirectMessageDoc) {
    throw new Error("not implemented yet");
  }
}
export class ReactionAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
