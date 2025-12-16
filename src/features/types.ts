export interface Author {
  _id: string;
  username: string;
  avatar: string;
}

export interface Post {
  _id: string;
  content: string;
  images: string[];
  author: Author;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  parentId: string;
  likeCount: number;
}

export interface User {
  _id: string | null;
  username: string;
  fullName?: string;
  shortDescription?: string;
  email: string;
  avatar: string;
  followers: string[];
  followings: string[];
}

export interface Notification {
  _id: string;
  type: "FOLLOW" | "LIKE" | "POST_REPLY";
  message: string;
  senderId: User;
  recipientId: string;
  postId?: Post;
  read: boolean;
  createdAt: string;
}

export interface Interaction {
  _id: string;
  isDeleted: boolean;
  userId: string;
  userActivityType: string;
  dwellTime: number | null;
  searchText: string | null;
  postId: Post | null;
  isEmbedded: boolean;
  lastEmbeddedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface InteractionsResponse {
  total: number;
  interactions: Interaction[];
}

export enum UserActivityType {
  LIKE = "LIKE",
  SHARE = "SHARE",
  SEARCH = "SEARCH",
  POST_VIEW = "POST_VIEW",
  POST_CLICK = "POST_CLICK",
  UNLIKE = "UNLIKE",
  REPLY_POST = "REPLY_POST",
}
