import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface UserDoc extends BaseDoc {
  username: string;
  password: string;
  rating: number;
  numRatings: number;
}

export default class UserConcept {
  public readonly users = new DocCollection<UserDoc>("users");

  async create(username: string, password: string) {
    await this.canCreate(username, password);
    const rating = 100;
    const numRatings = 1;
    const _id = await this.users.createOne({ username, password, rating, numRatings });
    return { msg: "User created successfully!", user: await this.users.readOne({ _id }) };
  }

  private sanitizeUser(user: UserDoc) {
    // eslint-disable-next-line
    const { password, ...rest } = user; // remove password
    return rest;
  }

  async getUserById(_id: ObjectId) {
    const user = await this.users.readOne({ _id });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.sanitizeUser(user);
  }

  async getUserByUsername(username: string) {
    const user = await this.users.readOne({ username });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.sanitizeUser(user);
  }

  async idsToUsernames(ids: ObjectId[]) {
    const users = await this.users.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToUser = new Map(users.map((user) => [user._id.toString(), user]));
    return ids.map((id) => idToUser.get(id.toString())?.username ?? "DELETED_USER");
  }

  async getUsers(username?: string) {
    // If username is undefined, return all users by applying empty filter
    const filter = username ? { username } : {};
    const users = (await this.users.readMany(filter)).map(this.sanitizeUser);
    return users;
  }

  async authenticate(username: string, password: string) {
    const user = await this.users.readOne({ username, password });
    if (!user) {
      throw new NotAllowedError("Username or password is incorrect.");
    }
    return { msg: "Successfully authenticated.", _id: user._id };
  }

  async update(_id: ObjectId, update: Partial<UserDoc>) {
    if (update.username !== undefined) {
      await this.isUsernameUnique(update.username);
    }
    this.sanitizeUpdate(update);
    await this.users.updateOne({ _id }, update);
    return { msg: "User updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.users.deleteOne({ _id });
    return { msg: "User deleted!" };
  }

  async userExists(_id: ObjectId) {
    const maybeUser = await this.users.readOne({ _id });
    if (maybeUser === null) {
      throw new NotFoundError(`User not found!`);
    }
  }

  private async canCreate(username: string, password: string) {
    if (!username || !password) {
      throw new BadValuesError("Username and password must be non-empty!");
    }
    await this.isUsernameUnique(username);
  }

  private async isUsernameUnique(username: string) {
    if (await this.users.readOne({ username })) {
      throw new NotAllowedError(`User with username ${username} already exists!`);
    }
  }
  async rateUser(_id: ObjectId, rate: number) {
    const maybeUser = await this.users.readOne({ _id });
    console.log(maybeUser, _id);
    if (maybeUser === null) {
      throw new NotFoundError(`User not found!`);
    }
    let newTotal = maybeUser.numRatings + 1;
    let newRating = maybeUser.numRatings * maybeUser.rating + rate; //newTotal
    maybeUser.numRatings = newTotal;
    maybeUser.rating = newRating;
  }
  async getRating(_id: ObjectId) {
    const maybeUser = await this.users.readOne({ _id });
    console.log(maybeUser, _id);
    if (maybeUser === null) {
      throw new NotFoundError(`User not found!`);
    }
    return maybeUser.rating;
  }
  private sanitizeUpdate(update: Partial<UserDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["password", "username"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}
