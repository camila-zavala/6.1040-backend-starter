import CommentConcept from "./concepts/comment";
import DirectMessageConcept from "./concepts/directmessage";
import FriendConcept from "./concepts/friend";
import PostConcept from "./concepts/post";
import ProfileConcept from "./concepts/profile";
import ReactionConcept from "./concepts/reaction";
import SpotDiscoveryConcept from "./concepts/spotdiscovery";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const DirectMessage = new DirectMessageConcept();
export const Comment = new CommentConcept();
export const SpotDiscovery = new SpotDiscoveryConcept();
export const Profile = new ProfileConcept();
export const Reaction = new ReactionConcept();
