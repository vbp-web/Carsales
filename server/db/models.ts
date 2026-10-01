import mongoose, { Schema } from 'mongoose';
import {
  User,
  Product,
  CarBrand,
  CarModel,
  Category,
  Address,
  CartItem,
  Order,
  Review,
  Coupon,
  Notification
} from '../types/index.ts';

// 1. User Schema
const UserSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    defaultAddressId: { type: String }
  },
  { timestamps: true }
);

// 2. Compatibility Rule Sub-Schema
const CompatibilityRuleSchema = new Schema(
  {
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    modelId: { type: String, required: true },
    modelName: { type: String, required: true },
    yearStart: { type: Number, required: true },
    yearEnd: { type: Number, required: true },
    universal: { type: Boolean, default: false },
    notes: { type: String }
  },
  { _id: false }
);

// 3. Product Schema
const ProductSchema = new Schema<Product>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    reservedStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    stockStatus: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'IN_STOCK'
    },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    specifications: { type: Schema.Types.Mixed, default: {} },
    compatibility: [CompatibilityRuleSchema],
    universalFit: { type: Boolean, default: false },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    warranty: { type: String, default: '1 Year Warranty' },
    deliveryDays: { type: Number, default: 3 },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// 4. Car Brand Schema
const CarBrandSchema = new Schema<CarBrand>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    country: { type: String, required: true },
    logo: { type: String },
    modelsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 5. Car Model Schema
const CarModelSchema = new Schema<CarModel>(
  {
    id: { type: String, required: true, unique: true, index: true },
    brandId: { type: String, required: true, index: true },
    brandName: { type: String, required: true },
    name: { type: String, required: true, index: true },
    bodyType: {
      type: String,
      enum: ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Luxury'],
      required: true
    },
    years: [{ type: Number }]
  },
  { timestamps: true }
);

// 6. Category Schema
const CategorySchema = new Schema<Category>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    iconName: { type: String, required: true },
    subcategories: [{ type: String }],
    productCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 7. Address Schema
const AddressSchema = new Schema<Address>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// 8. Cart Item Schema
const CartItemSchema = new Schema<CartItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedVehicle: {
      brand: { type: String },
      model: { type: String },
      year: { type: Number }
    },
    addedAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// 9. Wishlist Schema
interface WishlistDoc {
  userId: string;
  productIds: string[];
}
const WishlistSchema = new Schema<WishlistDoc>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    productIds: [{ type: String }]
  },
  { timestamps: true }
);

// 10. Order Schema
const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    vehicleCompatibility: { type: String }
  },
  { _id: false }
);

const TimelineEntrySchema = new Schema(
  {
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, default: '' },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const OrderSchema = new Schema<Order>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [OrderItemSchema],
    shippingAddress: { type: Object, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: {
      method: { type: String, required: true },
      razorpayOrderId: { type: String, required: true },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
      },
      paidAt: { type: String }
    },
    orderStatus: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'],
      default: 'PLACED'
    },
    trackingNumber: { type: String, required: true },
    carrier: { type: String, default: 'Delhivery Automotive Express' },
    statusTimeline: [TimelineEntrySchema],
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// 11. Review Schema
const ReviewSchema = new Schema<Review>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'APPROVED'
    },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// 12. Coupon Schema
const CouponSchema = new Schema<Coupon>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 10000 },
    startDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

// 13. Notification Schema
const NotificationSchema = new Schema<Notification>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['ORDER', 'PAYMENT', 'PROMO', 'SYSTEM'], default: 'SYSTEM' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// Export Mongoose Models with re-use check (prevents OverwriteModelError in hot reloads/serverless)
export const UserModel: mongoose.Model<User> = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);
export const ProductModel: mongoose.Model<Product> = (mongoose.models.Product as mongoose.Model<Product>) || mongoose.model<Product>('Product', ProductSchema);
export const CarBrandModel: mongoose.Model<CarBrand> = (mongoose.models.CarBrand as mongoose.Model<CarBrand>) || mongoose.model<CarBrand>('CarBrand', CarBrandSchema);
export const CarModelModel: mongoose.Model<CarModel> = (mongoose.models.CarModel as mongoose.Model<CarModel>) || mongoose.model<CarModel>('CarModel', CarModelSchema);
export const CategoryModel: mongoose.Model<Category> = (mongoose.models.Category as mongoose.Model<Category>) || mongoose.model<Category>('Category', CategorySchema);
export const AddressModel: mongoose.Model<Address> = (mongoose.models.Address as mongoose.Model<Address>) || mongoose.model<Address>('Address', AddressSchema);
export const CartItemModel: mongoose.Model<CartItem> = (mongoose.models.CartItem as mongoose.Model<CartItem>) || mongoose.model<CartItem>('CartItem', CartItemSchema);
export const WishlistModel: mongoose.Model<WishlistDoc> = (mongoose.models.Wishlist as mongoose.Model<WishlistDoc>) || mongoose.model<WishlistDoc>('Wishlist', WishlistSchema);
export const OrderModel: mongoose.Model<Order> = (mongoose.models.Order as mongoose.Model<Order>) || mongoose.model<Order>('Order', OrderSchema);
export const ReviewModel: mongoose.Model<Review> = (mongoose.models.Review as mongoose.Model<Review>) || mongoose.model<Review>('Review', ReviewSchema);
export const CouponModel: mongoose.Model<Coupon> = (mongoose.models.Coupon as mongoose.Model<Coupon>) || mongoose.model<Coupon>('Coupon', CouponSchema);
export const NotificationModel: mongoose.Model<Notification> = (mongoose.models.Notification as mongoose.Model<Notification>) || mongoose.model<Notification>('Notification', NotificationSchema);
