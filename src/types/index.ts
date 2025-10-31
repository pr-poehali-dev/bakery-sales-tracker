export type UserRole = 'admin' | 'cashier';

export interface User {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  salesCount: number;
  customImage?: string;
}

export interface CartItem extends Product {
  quantity: number;
  coffeeSize?: 'small' | 'medium' | 'large';
  customPrice?: number;
}

export interface Cart {
  id: string;
  name: string;
  items: CartItem[];
  createdAt: number;
  startTime: number | null;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  cashier: string;
  paymentMethod: 'cash' | 'card';
  returned?: boolean;
  returnTimestamp?: number;
  returnReason?: string;
}

export interface WriteOff {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  reason: string;
  timestamp: number;
  cashier: string;
}
