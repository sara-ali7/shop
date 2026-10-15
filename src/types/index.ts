export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  images: string[];
  category: Category;
  creationAt: string;
  updatedAt: string;
}

export interface ProductInput {
  title: string;
  price: number;
  description: string;
  categoryId: number;
  images: string[];
}

export interface CategoryInput {
  name: string;
  image: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
  creationAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: "admin" | "customer";
}

export interface EmailAvailabilityResponse {
  isAvailable: boolean;
}

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string | null;
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface SimulatedOrder {
  reference: string;
  placedAt: string;
  customer: CheckoutFormData;
  items: CartItem[];
  total: number;
}

export type ProductSort =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";
