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
  type: "FOLLOW" | "LIKE";
  message: string;
  senderId: User;
  recipientId: string;
  postId?: Post;
  commentId?: Comment;
  read: boolean;
  createdAt: string;
}
