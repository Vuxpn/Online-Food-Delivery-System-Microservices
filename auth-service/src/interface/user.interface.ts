export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  role: 'BUYER' | 'SELLER';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: 'BUYER' | 'SELLER';
}
