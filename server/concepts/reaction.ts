import { Filter } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { DirectMessageDoc } from "./directmessage";
import { PostDoc } from "./post";
import { UserDoc } from "./user";

export interface ReactionDoc extends BaseDoc {
  to: UserDoc;
  from: UserDoc;
  content: PostDoc | DirectMessageDoc;
  reaction: string;
}

export default class ReactionConcept {
  private allReactions = new DocCollection<ReactionDoc>("Reactions");

  async createReaction(to: UserDoc, from: UserDoc, content: PostDoc | DirectMessageDoc, reaction: string) {
    const messgae_id = await this.allReactions.createOne({ to, from, content, reaction });
    return "reaction made successfully";
  }
  async getReactionsForPost(query: Filter<ReactionDoc>) {
    const reactions = await this.allReactions.readMany(query, {
      sort: { dateUpdates: -1 },
    });
    return reactions;
  }
  async getReacionforMessage(to: UserDoc, from: UserDoc, message: DirectMessageDoc) {
    const query = { to: to, from: from, content: message };
    const reactionObj = await this.allReactions.readOne(query);
    const reaction = reactionObj?.reaction;
    if (reaction !== undefined) {
      return reaction;
    }
  }
  async removeReaction(user: UserDoc, media: PostDoc | DirectMessageDoc) {
    const query = { from: user, content: media };
    await this.allReactions.deleteOne(query);
    return "Reaction deleted successfully";
  }
  async notifyUser(user: UserDoc, content: PostDoc | DirectMessageDoc) {
    throw new Error("not implemented yet");
  }
}
