import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import ReactionConcept from "./reaction";

export interface DirectMessageDoc extends BaseDoc {
  author: ObjectId;
  to: ObjectId;
  messege: string;
  reaction: null | ReactionConcept;
}

export default class DirectMessageConcept {
  private allMessages = new DocCollection<DirectMessageDoc>("messages");

  async sendMessage(author: ObjectId, messege: string, to: ObjectId, reaction: null) {
    const messege_id = await this.allMessages.createOne({ author, to, messege, reaction });
    return { msg: "message made successfully", messege: messege_id, authorId: author, to: to };
  }

  private sanitizeMessage(messege: DirectMessageDoc) {
    // eslint-disable-next-line
    const { author, to, reaction, ...rest } = messege; // remove password
    return rest;
  }

  async getMessege(message: string) {
    const messege = await this.allMessages.readOne({ message });
    if (messege === null) {
      throw new NotFoundError(`Message not found!`);
    }
    return this.sanitizeMessage(messege);
  }

  async isAuthor(user: ObjectId, message_id: ObjectId) {
    const message = await this.allMessages.readOne({ _id: message_id });
    if (!message) {
      throw new NotFoundError(`Message ${message_id} does not exist!`);
    }
    if (message.author.toString() !== user.toString()) {
      throw new MessageAuthorNotMatchError(user, message_id);
    }
  }

  async editMessage(user: ObjectId, _id: ObjectId, new_message: string) {
    await this.isAuthor(user, _id);
    const message = await this.allMessages.readOne({ _id });
    let content = "";
    if (message !== undefined) {
      content = message!.messege;
    }
    if (content !== undefined) {
      content = new_message;
    }
    return "Message edited sucessfully";
  }

  async deleteMessage(user: ObjectId, _id: ObjectId) {
    await this.isAuthor(user, _id);
    await this.allMessages.deleteOne({ _id });
    return "This messege deleted succesfully";
  }

  async react(author: ObjectId, user: ObjectId, messege_id: ObjectId) {
    const message = await this.allMessages.readOne({ messege_id });
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
