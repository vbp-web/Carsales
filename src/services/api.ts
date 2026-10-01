import {
  Product,
  CarBrand,
  CarModel,
  Category,
  CartItem,
  Order,
  Review,
  Coupon,
  Address,
  User
} from '../types/index.ts';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('autoapex_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Network request failed');
  }

  return data.data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (userData: { name: string; email: string; phone?: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    me: () => request<{ user: User; addresses: Address[] }>('/auth/me'),
    forgotPassword: (email: string) =>
      request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
  },

  // Addresses
  addresses: {
    getAll: () => request<Address[]>('/users/addresses'),
    create: (addressData: Omit<Address, 'id' | 'userId'>) =>
      request<Address>('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData)
      }),
    update: (id: string, updates: Partial<Address>) =>
      request<Address>(`/users/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/users/addresses/${id}`, {
        method: 'DELETE'
      })
  },

  // Products
  products: {
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return request<{ products: Product[]; total: number; page: number; totalPages: number }>(
        `/products?${query.toString()}`
      );
    },
    getByIdOrSlug: (idOrSlug: string) => request<Product & { reviews: Review[] }>(`/products/${idOrSlug}`),
    checkCompatibility: (productId: string, brand: string, model: string, year: number) => {
      const q = new URLSearchParams({ brand, model, year: String(year) });
      return request<{ isCompatible: boolean; universal: boolean; matchedRule: string }>(
        `/products/${productId}/compatibility?${q.toString()}`
      );
    },
    create: (productData: any) =>
      request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      }),
    update: (id: string, productData: any) =>
      request<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/products/${id}`, {
        method: 'DELETE'
      })
  },

  // Cars
  cars: {
    getBrands: () => request<CarBrand[]>('/cars/brands'),
    getModels: (brandId?: string) =>
      request<CarModel[]>(brandId ? `/cars/models?brandId=${encodeURIComponent(brandId)}` : '/cars/models')
  },

  // Categories
  categories: {
    getAll: () => request<Category[]>('/categories'),
    create: (catData: any) =>
      request<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(catData)
      })
  },

  // Cart
  cart: {
    get: () => request<CartItem[]>('/cart'),
    add: (item: { productId: string; quantity: number; selectedVehicle?: any }) =>
      request<CartItem[]>('/cart', {
        method: 'POST',
        body: JSON.stringify(item)
      }),
    update: (itemId: string, quantity: number) =>
      request<CartItem[]>(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      }),
    remove: (itemId: string) =>
      request<CartItem[]>(`/cart/${itemId}`, {
        method: 'DELETE'
      }),
    clear: () =>
      request<{ message: string }>('/cart', {
        method: 'DELETE'
      })
  },

  // Wishlist
  wishlist: {
    get: () => request<Product[]>('/wishlist'),
    toggle: (productId: string) =>
      request<{ inWishlist: boolean; wishlist: string[] }>('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId })
      })
  },

  // Coupons
  coupons: {
    getAll: () => request<Coupon[]>('/coupons'),
    validate: (code: string, amount: number) =>
      request<{ valid: boolean; message: string; discount: number; coupon: Coupon }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, amount })
      }),
    create: (data: any) =>
      request<Coupon>('/coupons', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Payments
  payments: {
    createOrder: (amount: number, currency = 'INR') =>
      request<{ orderId: string; amount: number; currency: string; keyId: string; prefill: { name: string; email: string } }>(
        '/payments/create-order',
        {
          method: 'POST',
          body: JSON.stringify({ amount, currency })
        }
      ),
    verify: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature?: string }) =>
      request<{ verified: boolean; paymentId: string; orderId: string }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Orders
  orders: {
    getAll: () => request<Order[]>('/orders'),
    getById: (id: string) => request<Order>(`/orders/${id}`),
    getTracking: (id: string) => request<any>(`/orders/${id}/tracking`),
    advanceTracking: (id: string) =>
      request<Order>(`/orders/${id}/track-advance`, {
        method: 'POST'
      }),
    resetTracking: (id: string) =>
      request<Order>(`/orders/${id}/track-reset`, {
        method: 'POST'
      }),
    create: (orderData: any) =>
      request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),
    updateStatus: (id: string, status: string) =>
      request<Order>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
  },

  // Reviews
  reviews: {
    getForProduct: (productId: string) => request<Review[]>(`/products/${productId}/reviews`),
    create: (productId: string, review: { rating: number; title: string; comment: string }) =>
      request<Review>(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(review)
      })
  },

  // Recommendations
  recommendations: {
    get: (params: { userId?: string; carBrand?: string; carModel?: string; carYear?: number; category?: string; limit?: number } = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) q.append(k, String(v));
      });
      return request<Product[]>(`/recommendations?${q.toString()}`);
    },
    getSimilar: (productId: string) => request<Product[]>(`/recommendations/similar/${productId}`)
  },

  // Admin
  admin: {
    getAnalytics: () => request<any>('/admin/analytics'),
    getInventory: () => request<Product[]>('/admin/inventory'),
    getUsers: () => request<User[]>('/admin/users'),
    getReviews: () => request<Review[]>('/admin/reviews'),
    updateReviewStatus: (id: string, status: string) =>
      request<Review>(`/admin/reviews/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
  },

  // Database Status (MongoDB Atlas)
  db: {
    getStatus: () => request<any>('/db/status')
  }
};

