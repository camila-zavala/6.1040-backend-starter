import { ObjectId } from "mongodb";

import { getExpressRouter, Router } from "./framework/router";

import { Comment, DirectMessage, Friend, Post, Profile, Reaction, SpotDiscovery, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { ProfileDoc } from "./concepts/profile";
import ReactionConcept, { ReactionDoc } from "./concepts/reaction";
import { LocationsDoc, ReviewsDocs } from "./concepts/spotdiscovery";
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
  async deleteUser(session: WebSessionDoc, name: string) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    const profile_id = (await Profile.getProfile(name))._id;
    await Profile.deleteProfile(profile_id);
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
    const created = await Post.create(user, content, [], options);
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

  @Router.post("/directMessege")
  async sendMessage(session: WebSessionDoc, to: string, messege: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await DirectMessage.sendMessage(user, messege, toId, null);
  }
  @Router.put("/directMessege/:id")
  async editMessage(session: WebSessionDoc, id: ObjectId, new_message: string) {
    const user = WebSession.getUser(session);
    return await DirectMessage.editMessage(user, id, new_message);
  }
  @Router.delete("/directMessege/:id")
  async deleteMessage(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    return await DirectMessage.deleteMessage(user, id);
  }
  @Router.post("/directMessage/:id")
  async reactMessage(user: string, reaction: ReactionConcept, message: string) {
    throw new Error("not implemented yet");
  }

  @Router.post("/reaction")
  async createReaction(session: WebSessionDoc, media: ObjectId, reaction: string) {
    const user = WebSession.getUser(session);
    await Reaction.createReaction(user, media, reaction);
  }
  @Router.delete("/reaction/delete/:id")
  async deleteReaction(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    await Reaction.removeReaction(user, id);
  }
  @Router.post("/reaction/user/:notify")
  async notifyReaction(from: UserDoc, to: UserDoc, reaction: ReactionDoc) {
    throw new Error("not implemented yet");
  }
  @Router.get("/reaction/:id")
  async getReactions(media: ObjectId) {
    await Reaction.getReactionsForPost(media);
  }

  @Router.post("/comment")
  async createComment(session: WebSessionDoc, comment: string, media: ObjectId) {
    const user = WebSession.getUser(session);
    return await Comment.createComment(user, comment, media);
  }

  @Router.delete("/comment/:id")
  async deleteComment(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    return await Comment.deleteComment(user, id);
  }
  @Router.post("/comment/:notify")
  async notifyUser(to: UserDoc, from: UserDoc) {
    throw new Error("not implemented yet");
  }
  @Router.post("/user/:rate")
  async rateUser(username: string, rate: number) {
    const user_to_rate = (await User.getUserByUsername(username))._id;
    await User.rateUser(user_to_rate, rate);
  }
  @Router.get("/user/:rating")
  async updateRating(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    await User.getRating(user);
  }

  @Router.post("/profile/")
  async createProfile(session: WebSessionDoc, name: string, biography: string) {
    const user = WebSession.getUser(session);
    await Profile.createProfile(user, name, biography, "", []);
  }

  @Router.put("/profile/:edit")
  async editProfile(session: WebSessionDoc, profile: string, update: Partial<ProfileDoc>) {
    const user = WebSession.getUser(session);
    const profile_id = (await Profile.getProfile(profile))._id;
    await Profile.updateProfile(profile_id, update);
  }

  @Router.post("/spotdiscovery")
  async createSpot(session: WebSessionDoc, name: string, photos: Array<string>, reviews: Array<ReviewsDocs>) {
    const user = WebSession.getUser(session);
    await SpotDiscovery.createSpot(user, name, photos, reviews);
  }
  @Router.put("/spotdiscovery/:id")
  async addImage(session: WebSessionDoc, location: string, update: Partial<LocationsDoc>) {
    const user = WebSession.getUser(session);
    const location_id = (await SpotDiscovery.getLocation(location))._id;
    await SpotDiscovery.addImage(location_id, user, update);
  }
  @Router.put("/spotdiscovery/:id")
  async updateReview(session: WebSessionDoc, id: ObjectId, update: Partial<ReviewsDocs>) {
    const user = WebSession.getUser(session);
    await SpotDiscovery.updateReview(user, id, update);
  }

  @Router.delete("/spotdiscovery/delete/:id")
  async deleteReview(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    await SpotDiscovery.deleteReview(user, id);
  }

  @Router.get("/spotdiscovery/location/: getReviews")
  async getReviews(location: string) {
    const location_id = (await SpotDiscovery.getLocation(location))._id;
    await SpotDiscovery.getReviews(location_id);
  }
}

export default getExpressRouter(new Routes());
