export interface Product {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  images?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreatedEvent {
  productId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  images?: string[];
  createdBy: string;
  createdAt: string;
}
