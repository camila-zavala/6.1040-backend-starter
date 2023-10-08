import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import FriendConcept from "./friend";
import PostConcept from "./post";
import UserConcept from "./user";

export interface MediaOptions {
  photos: HTMLImageElement;
}

export interface ProfileDoc extends BaseDoc {
  user: UserConcept;
  name: ObjectId;
  biography: ObjectId;
  profilePicture: ObjectId;
  posts?: Set<PostConcept>;
  reviews?: Set<{ location: string; review: string }>;
  freinds: Set<FriendConcept>;
  friendlinessScore: ObjectId;
}

export default class ProfileConcept {
  private allProfiles = new DocCollection<ProfileDoc>("profiles");

  async createProfile(name: ObjectId, biography: ObjectId, profilePicture: ObjectId, friendlinessScore: ObjectId) {
    const profile_id = await this.allProfiles.createOne({ name, biography, profilePicture, friendlinessScore });
    return "Profile created!";
  }
  async updateProfile(profile_id: ObjectId, update: Partial<ProfileDoc>) {
    this.sanitizeUpdate(update);
    await this.allProfiles.updateOne({ profile_id }, update);
    return "Profile updated sucessfully";
  }

  private sanitizeUpdate(update: Partial<ProfileDoc>) {
    const allowed = ["name", "biography", "profilePicture", "posts", "reviews", "friendlinessScore", "friends"];
    for (const key in update) {
      if (!allowed.includes(key)) {
        throw new NotAllowedError(`This update is not allowed. Cannot update '${key}' field`);
      }
    }
  }
  async deleteProfile(profile_id: ObjectId) {
    await this.allProfiles.deleteOne({ profile_id });
    return "Profile deleted sucessfully";
  }
  async getUser(profile_id: ObjectId) {
    const profile = await this.allProfiles.readOne({ profile_id });
    const user = profile?.user;
    if (user !== undefined) {
      return [user, profile];
    } else {
      throw new NotFoundError("Profile not Found");
    }
  }
}
