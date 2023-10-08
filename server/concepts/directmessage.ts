import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import ReactionConcept from "./reaction";

export interface DirectMessageDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  reaction?: ReactionConcept;
}

export default class DirectMessageConcept {
  private allMessages = new DocCollection<DirectMessageDoc>("messages");

  async sendMessage(author: ObjectId, content: string) {
    const messgae_id = await this.allMessages.createOne({ author, content });
    return "message made successfully";
  }

  async isAuthor(user: ObjectId, message_id: ObjectId) {
    const message = await this.allMessages.readOne({ message_id });
    if (!message) {
      throw new NotFoundError(`Message ${message_id} does not exist!`);
    }
    if (message.author.toString() !== user.toString()) {
      throw new MessageAuthorNotMatchError(user, message_id);
    }
  }

  async editMessage(user: ObjectId, message_id: ObjectId, new_message: string) {
    await this.isAuthor(user, message_id);
    const message = await this.allMessages.readOne({ message_id });
    let content = message?.content;
    if (content !== undefined) {
      content = new_message;
    }
    return "Message edited sucessfully";
  }

  async deleteMessage(user: ObjectId, message_id: ObjectId) {
    await this.isAuthor(user, message_id);
    await this.allMessages.deleteOne(message_id);
  }

  async react(author: ObjectId, user: ObjectId, message_id: ObjectId) {
    const message = await this.allMessages.readOne({ message_id });
    if (message !== undefined) {
      let react = message?.reaction;
      if (react !== undefined) {
        react = new ReactionConcept();
      }
    }
  }
}

export class MessageAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
