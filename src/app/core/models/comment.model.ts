export interface Comment {
  _id: string;
  postId: string;
  body: string;
  name: string; 
  userId?: string;
  createdAt: string;
  updatedAt: string;
}
