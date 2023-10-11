import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";
import { PostDoc } from "./post";

export interface LocationsDoc extends BaseDoc {
  name: string;
  photos: PostDoc;
  reviews: ReviewsDocs;
}
export interface ReviewsDocs extends BaseDoc {
  author: ObjectId;
  content: string;
  upvote: number;
}

export default class SpotDiscoveryConcept {
  private locations = new DocCollection<LocationsDoc>("locations");
  private reviews = new DocCollection<ReviewsDocs>("Reviews");

  async createSpot(author: ObjectId, name: string, photos: PostDoc, reviews: ReviewsDocs) {
    await this.locations.createOne({ name, photos, reviews });
    const content = "";
    const upvote = 0;
    await this.reviews.createOne({ author, content, upvote });
    return "New spot created sucessfully!";
  }

  async createReview(author:ObjectId, content: string){
    const upvote = 0;
    await this.reviews.createOne({author, content, upvote});
    return "new review created successfully";
  }

  async addImage(location: ObjectId, author: ObjectId, update: Partial<LocationsDoc>){
    this.sanitizeUpdate(update);
    await this.locations.updateOne({location}, update); 
    return "image added succesfully"
  }

  private sanitizeUpdate(update: Partial<LocationsDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["photos", "reviews"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

