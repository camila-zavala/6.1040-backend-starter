import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
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
}
