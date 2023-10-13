import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import PostConcept from "./post";

export interface MediaOptions {
  photos: HTMLImageElement;
}

export interface ProfileDoc extends BaseDoc {
  user: ObjectId;
  name: string;
  biography: string;
  profilePicture: string;
  posts?: Array<PostConcept>;
  reviews?: Array<{ location: string; review: string }>;
  friends: Array<ObjectId>;
}

export default class ProfileConcept {
  private allProfiles = new DocCollection<ProfileDoc>("profiles");

  async createProfile(user: ObjectId, name: string, biography: string, profilePicture: string, friends: Array<ObjectId>) {
    const profile_id = await this.allProfiles.createOne({ user, name, biography, profilePicture, friends });
    return "Profile created!";
  }
  async updateProfile(profile_id: ObjectId, update: Partial<ProfileDoc>) {
    this.sanitizeUpdate(update);
    await this.allProfiles.updateOne({ profile_id }, update);
    return "Profile updated sucessfully";
  }

  private sanitizeProfile(profile: ProfileDoc) {
    // eslint-disable-next-line
    const { friends, ...rest } = profile; // remove password
    return rest;
  }

  async getProfile(name: string) {
    const profile = await this.allProfiles.readOne({ name });
    if (profile === null) {
      throw new NotFoundError(`Location not found!`);
    }
    return this.sanitizeProfile(profile);
  }

  private sanitizeUpdate(update: Partial<ProfileDoc>) {
    const allowed = ["name", "biography", "profilePicture"];
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
