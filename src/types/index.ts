export type UserRole = 'admin' | 'cashier';
export type PaymentMethod = 'cash' | 'card';

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
}

export interface User {
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  cashier: string;
  paymentMethod: PaymentMethod;
}

export interface ShiftReport {
  startTime: number;
  endTime: number;
  cashier: string;
  sales: Sale[];
  totalRevenue: number;
  totalItems: number;
  cashRevenue: number;
  cardRevenue: number;
}
