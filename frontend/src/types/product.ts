export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: Pagination;
}

export type StatusFilter = 'inStock' | 'lowStock' | 'outOfStock';

export interface ProductListParams {
  search?: string;
  category?: string;
  status?: StatusFilter;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'category' | 'price' | 'quantity' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export type QuantityUpdateInput =
  | { quantity: number }
  | { operation: 'increase' | 'decrease'; amount: number };

export interface CategoryBreakdownEntry {
  category: string;
  count: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  categoryBreakdown: CategoryBreakdownEntry[];
}
