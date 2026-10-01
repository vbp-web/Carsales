export interface CompatibilityRule {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  yearStart: number;
  yearEnd: number;
  universal?: boolean;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  sku: string;
  price: number;
  mrp: number;
  discountPercent: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  compatibility: CompatibilityRule[];
  universalFit: boolean;
  tags: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  warranty: string;
  deliveryDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarBrand {
  id: string;
  name: string;
  country: string;
  logo?: string;
  modelsCount?: number;
}

export interface CarModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  bodyType: 'SUV' | 'Sedan' | 'Hatchback' | 'MUV' | 'Luxury';
  years: number[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  subcategories: string[];
  productCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
  defaultAddressId?: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVehicle?: {
    brand: string;
    model: string;
    year: number;
  };
  addedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  vehicleCompatibility?: string;
}

export interface TimelineEntry {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  shipping: number;
  total: number;
  payment: {
    method: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paidAt?: string;
  };
  orderStatus: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  trackingNumber: string;
  carrier: string;
  statusTimeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  description: string;
}

export interface VehicleSelection {
  brand: string;
  model: string;
  year: number;
}
