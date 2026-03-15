export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  user?: User;
}
