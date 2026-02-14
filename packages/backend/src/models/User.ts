export interface User {
  _id?: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
}

export interface AuthToken {
  _id?: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}
