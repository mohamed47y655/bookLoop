export interface User {
  userID: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type BookCondition = 'Like New' | 'Good' | 'Fair' | 'Acceptable';

export interface BookVariant {
  condition: BookCondition;
  price: number;
  stock: number;
}

export interface Book {
  bookID: string;
  title: string;
  author: string;
  price: number;
  categoryID: string;
  imageURL: string;
  condition: BookCondition | 'New';
  variants?: BookVariant[];
  description: string;
  seller: { name: string; rating: number; sales: number };
  pages?: number;
  language?: string;
  isbn?: string;
}

export type OrderStatus = 'Preparing' | 'In Transit' | 'Delivered';
export type PaymentMethod = 'COD' | 'CC' | 'VfCash';

export interface Order {
  orderID: string;
  userID: string;
  bookID: string;
  condition?: BookCondition;
  quantity?: number;
  unitPrice?: number;
  shippingAddress: string;
  phone: string;
  fullName: string;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  createdAt: string;
  total: number;
}
