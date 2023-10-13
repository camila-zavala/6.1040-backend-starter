import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface LocationsDoc extends BaseDoc {
  name: string;
  photos: Array<string>;
  reviews: Array<ReviewsDocs>;
}
export interface ReviewsDocs extends BaseDoc {
  location: ObjectId;
  author: ObjectId;
  content: string;
  upvote: number;
}

export default class SpotDiscoveryConcept {
  private locations = new DocCollection<LocationsDoc>("locations");
  private reviews = new DocCollection<ReviewsDocs>("Reviews");

  private sanitizeLocation(location: LocationsDoc) {
    // eslint-disable-next-line
    const { photos, reviews, ...rest } = location; // remove password
    return rest;
  }

  async getLocation(location_name: string) {
    const location = await this.locations.readOne({ location_name });
    if (location === null) {
      throw new NotFoundError(`Location not found!`);
    }
    return this.sanitizeLocation(location);
  }

  async createSpot(author: ObjectId, name: string, photos: Array<string>, reviews: Array<ReviewsDocs>) {
    await this.locations.createOne({ name, photos, reviews });
    const content = "";
    const upvote = 0;
    await this.reviews.createOne({ author, content, upvote });
    return "New spot created sucessfully!";
  }

  async createReview(author: ObjectId, content: string, location: ObjectId) {
    const upvote = 0;
    await this.reviews.createOne({ location, author, content, upvote });
    return "new review created successfully";
  }

  async updateReview(author: ObjectId, review: ObjectId, update: Partial<ReviewsDocs>) {
    this.sanitizeReviewUpdate(update);
    await this.reviews.updateOne({ review }, update);
    return "Review updated successfully!";
  }
  async addImage(location: ObjectId, author: ObjectId, update: Partial<LocationsDoc>) {
    this.sanitizeLocationUpdate(update);
    await this.locations.updateOne({ location }, update);
    return "image added succesfully";
  }

  async deleteReview(author: ObjectId, review: ObjectId) {
    this.isAuthor(author, review);
    await this.reviews.deleteOne({ review });
    return "Review deleted successfully";
  }

  async getReviews(location: ObjectId) {
    const reviews = await this.reviews.readMany({ location });
    return { reviews: reviews, msg: "reviews retrieved sucessfully" };
  }

  async isAuthor(user: ObjectId, review_id: ObjectId) {
    const review = await this.reviews.readOne({ _id: review_id });
    if (!review) {
      throw new NotFoundError(`Message ${review_id} does not exist!`);
    }
    if (review.author.toString() !== user.toString()) {
      throw new ReviewAuthorNotMatchError(user, review_id);
    }
  }

  private sanitizeLocationUpdate(update: Partial<LocationsDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["photos"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
  private sanitizeReviewUpdate(update: Partial<LocationsDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class ReviewAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
