import { ObjectId } from "mongodb";

import { getExpressRouter, Router } from "./framework/router";

import { Friend, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { ProfileDoc } from "./concepts/profile";
import { ReactionDoc } from "./concepts/reaction";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.post("/user/directMessage")
  async sendMessage(to: UserDoc, from: UserDoc, message: string) {
    throw new Error("not implemented yet");
  }
  @Router.put("directMessage/user/update")
  async editMessage(user: UserDoc, message: string, new_message: string) {
    throw new Error("not implemented yet");
  }
  @Router.delete("directMessage/user/:message")
  async deleteMessage(user: UserDoc, message: string) {
    throw new Error("not implemented yet");
  }
  @Router.post("/directMessage/user/:reaction")
  async reactMessage(user: UserDoc, reaction: ReactionDoc, message: string) {
    throw new Error("not implemented yet");
  }
  @Router.post("reaction/user/:media")
  async makeReaction(media: PostDoc, reaction: ReactionDoc, user: UserDoc) {
    throw new Error("not implemented yet");
  }
  @Router.delete("reaction/user/:media")
  async deleteReaction(media: PostDoc, user: UserDoc) {
    throw new Error("not implemented yet");
  }
  @Router.post("reaction/user/:notify")
  async notifyReaction(from: UserDoc, to: UserDoc, reaction: ReactionDoc) {
    throw new Error("not implemented yet");
  }
  @Router.get("reaction/user/:media/all")
  async searchReactions(user: UserDoc, media: PostDoc) {
    throw new Error("not implemented yet");
  }
  @Router.post("comment/user/:media")
  async postComment(user: UserDoc, media: PostDoc) {
    throw new Error("not implemented yet");
  }
  @Router.delete("comment/user/:media")
  async deleteComment(user: UserDoc, media: PostDoc) {
    throw new Error("not implemented yet");
  }
  @Router.post("comment/user/:notify")
  async notifyUser(to: UserDoc, from: UserDoc) {
    throw new Error("not implemented yet");
  }
  @Router.post("freindliness/user/:rate")
  async rateUser(to: UserDoc, from: UserDoc, rate: string) {
    throw new Error("not implemented yet");
  }
  @Router.put("friendliness/user/: overallscore")
  async updateOverallScore(user: UserDoc, scores: UserDoc) {
    throw new Error("not implemented yet");
  }

  @Router.post("profile/user/_id")
  async createProfile(user: UserDoc) {
    throw new Error("not implemented yet");
  }
  @Router.put("profile/user/:edit")
  async editProfile(user: UserDoc, profile: ProfileDoc) {
    throw new Error("not implemented yet");
  }
  @Router.post("spotdiscovery/user/:media")
  async spotdiscoverypost(user: UserDoc, spot: PostDoc) {
    throw new Error("not implemented yet");
  }
  @Router.put("spotdiscovery/user/:media")
  async updatesdpost(user: UserDoc, spot: PostDoc) {
    throw new Error("not implemented yet");
  }
  @Router.delete("spotdiscovery/user/:delmedia")
  async deletespot(user: UserDoc, spot: PostDoc) {
    throw new Error("not implemented yet");
  }
  @Router.get("spotdiscovery/user/: getReviews")
  async getReviews(spot: string) {
    throw new Error("not implemented yet");
  }
}

export default getExpressRouter(new Routes());
