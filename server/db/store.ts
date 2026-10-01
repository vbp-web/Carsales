import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  CarBrand,
  CarModel,
  Category,
  Product,
  Coupon,
  User,
  Review,
  Address,
  CartItem,
  Order,
  Notification
} from '../types/index.ts';
import {
  SEED_BRANDS,
  SEED_MODELS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_COUPONS,
  SEED_REVIEWS,
  createDemoUsers
} from './seedData.ts';
import { connectMongoDB, getMongoStatus } from './mongodb.ts';
import {
  UserModel,
  ProductModel,
  CarBrandModel,
  CarModelModel,
  CategoryModel,
  AddressModel,
  CartItemModel,
  WishlistModel,
  OrderModel,
  ReviewModel,
  CouponModel,
  NotificationModel
} from './models.ts';

interface DatabaseSchema {
  users: User[];
  products: Product[];
  carBrands: CarBrand[];
  carModels: CarModel[];
  categories: Category[];
  addresses: Address[];
  carts: Record<string, CartItem[]>; // userId -> CartItem[]
  wishlists: Record<string, string[]>; // userId -> productId[]
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  notifications: Notification[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    products: [],
    carBrands: [],
    carModels: [],
    categories: [],
    addresses: [],
    carts: {},
    wishlists: {},
    orders: [],
    reviews: [],
    coupons: [],
    notifications: []
  };

  private initialized = false;
  private isMongoActive = false;

  async init() {
    if (this.initialized) return;

    // 1. Check for MongoDB Atlas connection
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (mongoUri) {
      try {
        console.log('🔄 [Database] Attempting connection to MongoDB Atlas...');
        const conn = await connectMongoDB();
        if (conn) {
          this.isMongoActive = true;
          console.log('✅ [Database] Successfully connected to MongoDB Atlas cluster.');

          // Check if database needs initial seeding
          const userCount = await UserModel.countDocuments();
          const productCount = await ProductModel.countDocuments();

          if (userCount === 0 || productCount === 0) {
            console.log('🌱 [MongoDB Atlas] Empty database detected. Auto-seeding catalog & demo data into Atlas...');
            await this.seedMongoAtlas();
            console.log('✨ [MongoDB Atlas] Initial seeding completed successfully.');
          }

          // Hydrate memory cache from MongoDB Atlas
          await this.syncFromMongoAtlas();
          console.log(`📦 [MongoDB Atlas] Synced ${this.data.products.length} products, ${this.data.users.length} users, ${this.data.orders.length} orders into active memory.`);
          this.initialized = true;
          return;
        }
      } catch (err: any) {
        console.warn('⚠️ [MongoDB Atlas] Could not establish initial connection:', err.message);
        console.warn('⚠️ [Database] Falling back to local JSON storage.');
        this.isMongoActive = false;
      }
    } else {
      console.log('ℹ️ [Database] MONGODB_URI not configured. Operating in local JSON storage mode.');
      console.log('ℹ️ [Database] To connect to MongoDB Atlas, add MONGODB_URI to your .env or Vercel Environment Variables.');
    }

    // 2. Local JSON File fallback
    await this.initLocalFile();
    this.initialized = true;
  }

  private async initLocalFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch {
      // In read-only serverless filesystems (e.g., Vercel Lambda), disk creation might be disallowed
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.products) this.data.products = [];
        if (!this.data.carBrands) this.data.carBrands = [];
        if (!this.data.carModels) this.data.carModels = [];
        if (!this.data.categories) this.data.categories = [];
        if (!this.data.addresses) this.data.addresses = [];
        if (!this.data.carts) this.data.carts = {};
        if (!this.data.wishlists) this.data.wishlists = {};
        if (!this.data.orders) this.data.orders = [];
        if (!this.data.reviews) this.data.reviews = [];
        if (!this.data.coupons) this.data.coupons = [];
        if (!this.data.notifications) this.data.notifications = [];
        return;
      } catch (err) {
        console.error('Failed reading existing database file, reseeding:', err);
      }
    }

    // Seed defaults in memory and file
    await this.seedDefaults();
    this.save();
  }

  private async seedMongoAtlas() {
    const demoUsers = await createDemoUsers();

    // Clean any empty/half-populated collections
    await Promise.allSettled([
      UserModel.deleteMany({}),
      ProductModel.deleteMany({}),
      CarBrandModel.deleteMany({}),
      CarModelModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      CouponModel.deleteMany({}),
      ReviewModel.deleteMany({}),
      AddressModel.deleteMany({}),
      OrderModel.deleteMany({})
    ]);

    await UserModel.insertMany(demoUsers);
    await ProductModel.insertMany(SEED_PRODUCTS);
    await CarBrandModel.insertMany(SEED_BRANDS);
    await CarModelModel.insertMany(SEED_MODELS);
    await CategoryModel.insertMany(SEED_CATEGORIES);
    await CouponModel.insertMany(SEED_COUPONS);
    await ReviewModel.insertMany(SEED_REVIEWS);

    const demoAddr: Address = {
      id: 'addr_demo_1',
      userId: 'user_customer_demo',
      name: 'Rohan Sharma',
      phone: '+91 91234 56789',
      addressLine1: 'Flat 402, Highline Residency, Outer Ring Road',
      apartment: 'Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      country: 'India',
      isDefault: true
    };
    await AddressModel.create(demoAddr);

    const demoOrder: Order = {
      id: 'ord_demo_9821',
      orderNumber: 'APX-2026-9821',
      userId: 'user_customer_demo',
      customerName: 'Rohan Sharma',
      customerEmail: 'customer@example.com',
      customerPhone: '+91 91234 56789',
      items: [
        {
          productId: 'prod_creta_7d_mats',
          name: 'AutoApex 7D Laser-Cut All-Weather Floor Mats for Hyundai Creta',
          sku: 'APX-FM-CRT-7D-01',
          image: '/src/assets/images/product_floor_mats_1790681468276.jpg',
          price: 4999,
          quantity: 1,
          vehicleCompatibility: 'Hyundai Creta 2024'
        }
      ],
      shippingAddress: demoAddr,
      subtotal: 4999,
      discount: 499.9,
      couponCode: 'CAR10',
      tax: 809.84,
      shipping: 0,
      total: 5308.94,
      payment: {
        method: 'Razorpay UPI',
        razorpayOrderId: 'order_test_9821',
        razorpayPaymentId: 'pay_test_9821_success',
        status: 'PAID',
        paidAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString()
      },
      orderStatus: 'SHIPPED',
      trackingNumber: 'DELHIVERY_894726154',
      carrier: 'Delhivery Automotive Express',
      statusTimeline: [
        {
          status: 'PLACED',
          title: 'Order Placed',
          description: 'Payment authorized successfully via Razorpay UPI.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
          completed: true
        },
        {
          status: 'CONFIRMED',
          title: 'Order Confirmed',
          description: 'Verified vehicle compatibility with Hyundai Creta 2024.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 1.8).toISOString(),
          completed: true
        },
        {
          status: 'PROCESSING',
          title: 'Processing & Quality Check',
          description: 'Mats precision scanned and passed quality inspection.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 1.5).toISOString(),
          completed: true
        },
        {
          status: 'PACKED',
          title: 'Packed in Secure Enclosure',
          description: 'Item packaged in waterproof protective crate.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 1).toISOString(),
          completed: true
        },
        {
          status: 'SHIPPED',
          title: 'Dispatched with Carrier',
          description: 'Dispatched with Delhivery Tracking #DELHIVERY_894726154.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
          completed: true
        },
        {
          status: 'OUT_FOR_DELIVERY',
          title: 'Out for Delivery',
          description: 'Courier agent will deliver between 10:00 AM - 2:00 PM.',
          timestamp: '',
          completed: false
        },
        {
          status: 'DELIVERED',
          title: 'Delivered',
          description: 'Package delivered at shipping address.',
          timestamp: '',
          completed: false
        }
      ],
      createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
    };
    await OrderModel.create(demoOrder);

    await WishlistModel.findOneAndUpdate(
      { userId: 'user_customer_demo' },
      { userId: 'user_customer_demo', productIds: ['prod_4k_dual_dashcam_pro', 'prod_nappa_leather_seat_creta'] },
      { upsert: true }
    );
  }

  private async syncFromMongoAtlas() {
    const [users, products, carBrands, carModels, categories, addresses, orders, reviews, coupons, notifications, cartItems, wishlists] =
      await Promise.all([
        UserModel.find().lean(),
        ProductModel.find().lean(),
        CarBrandModel.find().lean(),
        CarModelModel.find().lean(),
        CategoryModel.find().lean(),
        AddressModel.find().lean(),
        OrderModel.find().lean(),
        ReviewModel.find().lean(),
        CouponModel.find().lean(),
        NotificationModel.find().lean(),
        CartItemModel.find().lean(),
        WishlistModel.find().lean()
      ]);

    this.data.users = (users as unknown as User[]) || [];
    this.data.products = (products as unknown as Product[]) || [];
    this.data.carBrands = (carBrands as unknown as CarBrand[]) || [];
    this.data.carModels = (carModels as unknown as CarModel[]) || [];
    this.data.categories = (categories as unknown as Category[]) || [];
    this.data.addresses = (addresses as unknown as Address[]) || [];
    this.data.orders = (orders as unknown as Order[]) || [];
    this.data.reviews = (reviews as unknown as Review[]) || [];
    this.data.coupons = (coupons as unknown as Coupon[]) || [];
    this.data.notifications = (notifications as unknown as Notification[]) || [];

    // Group carts by userId
    this.data.carts = {};
    for (const item of (cartItems as unknown as CartItem[]) || []) {
      if (!this.data.carts[item.userId]) this.data.carts[item.userId] = [];
      this.data.carts[item.userId].push(item);
    }

    // Group wishlists by userId
    this.data.wishlists = {};
    for (const w of (wishlists as unknown as Array<{ userId: string; productIds: string[] }>) || []) {
      this.data.wishlists[w.userId] = w.productIds || [];
    }
  }

  private async seedDefaults() {
    const demoUsers = await createDemoUsers();
    this.data.users = demoUsers;
    this.data.products = SEED_PRODUCTS;
    this.data.carBrands = SEED_BRANDS;
    this.data.carModels = SEED_MODELS;
    this.data.categories = SEED_CATEGORIES;
    this.data.coupons = SEED_COUPONS;
    this.data.reviews = SEED_REVIEWS;

    const demoAddr: Address = {
      id: 'addr_demo_1',
      userId: 'user_customer_demo',
      name: 'Rohan Sharma',
      phone: '+91 91234 56789',
      addressLine1: 'Flat 402, Highline Residency, Outer Ring Road',
      apartment: 'Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      country: 'India',
      isDefault: true
    };
    this.data.addresses = [demoAddr];

    const demoOrder: Order = {
      id: 'ord_demo_9821',
      orderNumber: 'APX-2026-9821',
      userId: 'user_customer_demo',
      customerName: 'Rohan Sharma',
      customerEmail: 'customer@example.com',
      customerPhone: '+91 91234 56789',
      items: [
        {
          productId: 'prod_creta_7d_mats',
          name: 'AutoApex 7D Laser-Cut All-Weather Floor Mats for Hyundai Creta',
          sku: 'APX-FM-CRT-7D-01',
          image: '/src/assets/images/product_floor_mats_1790681468276.jpg',
          price: 4999,
          quantity: 1,
          vehicleCompatibility: 'Hyundai Creta 2024'
        }
      ],
      shippingAddress: demoAddr,
      subtotal: 4999,
      discount: 499.9,
      couponCode: 'CAR10',
      tax: 809.84,
      shipping: 0,
      total: 5308.94,
      payment: {
        method: 'Razorpay UPI',
        razorpayOrderId: 'order_test_9821',
        razorpayPaymentId: 'pay_test_9821_success',
        status: 'PAID',
        paidAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString()
      },
      orderStatus: 'SHIPPED',
      trackingNumber: 'DELHIVERY_894726154',
      carrier: 'Delhivery Automotive Express',
      statusTimeline: [
        {
          status: 'PLACED',
          title: 'Order Placed',
          description: 'Payment authorized successfully via Razorpay UPI.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
          completed: true
        },
        {
          status: 'CONFIRMED',
          title: 'Order Confirmed',
          description: 'Verified vehicle compatibility with Hyundai Creta 2024.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 1.8).toISOString(),
          completed: true
        },
        {
          status: 'PROCESSING',
          title: 'Processing & Quality Check',
          description: 'Mats precision scanned and passed quality inspection.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 1.5).toISOString(),
          completed: true
        },
        {
          status: 'PACKED',
          title: 'Packed in Secure Enclosure',
          description: 'Item packaged in waterproof protective crate.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 1).toISOString(),
          completed: true
        },
        {
          status: 'SHIPPED',
          title: 'Dispatched with Carrier',
          description: 'Dispatched with Delhivery Tracking #DELHIVERY_894726154.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
          completed: true
        },
        {
          status: 'OUT_FOR_DELIVERY',
          title: 'Out for Delivery',
          description: 'Courier agent will deliver between 10:00 AM - 2:00 PM.',
          timestamp: '',
          completed: false
        },
        {
          status: 'DELIVERED',
          title: 'Delivered',
          description: 'Package delivered at shipping address.',
          timestamp: '',
          completed: false
        }
      ],
      createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
    };

    this.data.orders = [demoOrder];
    this.data.wishlists['user_customer_demo'] = ['prod_4k_dual_dashcam_pro', 'prod_nappa_leather_seat_creta'];
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // In read-only serverless filesystems or missing data dir, continue safely
    }
  }

  private persistAsync(operation: string, fn: () => Promise<unknown>) {
    if (!this.isMongoActive) return;
    fn().catch(err => {
      console.error(`⚠️ [MongoDB Atlas] Async persistence error in ${operation}:`, err.message);
    });
  }

  // --- Database Mode & Status ---
  getDbStatus() {
    return {
      mode: this.isMongoActive ? 'MongoDB Atlas' : 'Local JSON Fallback',
      isMongoActive: this.isMongoActive,
      mongo: getMongoStatus(),
      counts: {
        users: this.data.users.length,
        products: this.data.products.length,
        categories: this.data.categories.length,
        carBrands: this.data.carBrands.length,
        orders: this.data.orders.length,
        reviews: this.data.reviews.length,
        coupons: this.data.coupons.length
      }
    };
  }

  // --- User Operations ---
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    this.persistAsync('createUser', () => UserModel.create(user));
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    this.persistAsync('updateUser', () => UserModel.findOneAndUpdate({ id }, { $set: updates }));
    return this.data.users[idx];
  }

  getAllUsers(): User[] {
    return this.data.users;
  }

  // --- Address Operations ---
  getUserAddresses(userId: string): Address[] {
    return this.data.addresses.filter(a => a.userId === userId);
  }

  addAddress(address: Address): Address {
    if (address.isDefault) {
      this.data.addresses.forEach(a => {
        if (a.userId === address.userId) a.isDefault = false;
      });
      this.persistAsync('unsetAddressDefaults', () =>
        AddressModel.updateMany({ userId: address.userId }, { $set: { isDefault: false } })
      );
    }
    this.data.addresses.push(address);
    this.save();
    this.persistAsync('addAddress', () => AddressModel.create(address));
    return address;
  }

  updateAddress(id: string, userId: string, updates: Partial<Address>): Address | undefined {
    const idx = this.data.addresses.findIndex(a => a.id === id && a.userId === userId);
    if (idx === -1) return undefined;
    if (updates.isDefault) {
      this.data.addresses.forEach(a => {
        if (a.userId === userId) a.isDefault = false;
      });
      this.persistAsync('unsetAddressDefaults', () =>
        AddressModel.updateMany({ userId }, { $set: { isDefault: false } })
      );
    }
    this.data.addresses[idx] = { ...this.data.addresses[idx], ...updates };
    this.save();
    this.persistAsync('updateAddress', () =>
      AddressModel.findOneAndUpdate({ id, userId }, { $set: updates })
    );
    return this.data.addresses[idx];
  }

  deleteAddress(id: string, userId: string): boolean {
    const initialLen = this.data.addresses.length;
    this.data.addresses = this.data.addresses.filter(a => !(a.id === id && a.userId === userId));
    const deleted = this.data.addresses.length < initialLen;
    if (deleted) {
      this.save();
      this.persistAsync('deleteAddress', () => AddressModel.deleteOne({ id, userId }));
    }
    return deleted;
  }

  // --- Product Operations ---
  getProducts(params?: {
    category?: string;
    subcategory?: string;
    brand?: string;
    carBrand?: string;
    carModel?: string;
    carYear?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStockOnly?: boolean;
    featured?: boolean;
    bestseller?: boolean;
    newArrival?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): { products: Product[]; total: number; page: number; totalPages: number } {
    let list = this.data.products.filter(p => p.status === 'ACTIVE');

    if (params?.category) {
      const cat = params.category.toLowerCase();
      list = list.filter(p => p.category.toLowerCase() === cat || p.slug.includes(cat));
    }

    if (params?.subcategory) {
      const sub = params.subcategory.toLowerCase();
      list = list.filter(p => p.subcategory.toLowerCase() === sub);
    }

    if (params?.brand) {
      const b = params.brand.toLowerCase();
      list = list.filter(p => p.brand.toLowerCase() === b);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.compatibility.some(c =>
          c.brandName.toLowerCase().includes(q) ||
          c.modelName.toLowerCase().includes(q)
        )
      );
    }

    // Car compatibility filter
    if (params?.carBrand || params?.carModel || params?.carYear) {
      list = list.filter(p => {
        if (p.universalFit) return true;
        return p.compatibility.some(c => {
          let match = true;
          if (c.universal) return true;
          if (params.carBrand) {
            match = match && (c.brandName.toLowerCase() === params.carBrand.toLowerCase() || c.brandId === params.carBrand);
          }
          if (params.carModel) {
            match = match && (c.modelName.toLowerCase() === params.carModel.toLowerCase() || c.modelId === params.carModel);
          }
          if (params.carYear) {
            match = match && (params.carYear >= c.yearStart && params.carYear <= c.yearEnd);
          }
          return match;
        });
      });
    }

    if (params?.minPrice !== undefined) {
      list = list.filter(p => p.price >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined) {
      list = list.filter(p => p.price <= params.maxPrice!);
    }

    if (params?.rating !== undefined) {
      list = list.filter(p => p.rating >= params.rating!);
    }

    if (params?.inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    if (params?.featured) {
      list = list.filter(p => p.isFeatured);
    }
    if (params?.bestseller) {
      list = list.filter(p => p.isBestseller);
    }
    if (params?.newArrival) {
      list = list.filter(p => p.isNewArrival);
    }

    // Sorting
    const sort = params?.sort || 'relevance';
    if (sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'discount') {
      list.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sort === 'popular') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    const total = list.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 12);
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug || p.id === slug);
  }

  createProduct(product: Product): Product {
    this.data.products.push(product);
    this.save();
    this.persistAsync('createProduct', () => ProductModel.create(product));
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    this.persistAsync('updateProduct', () => ProductModel.findOneAndUpdate({ id }, { $set: updates }));
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const len = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    const deleted = this.data.products.length < len;
    if (deleted) {
      this.save();
      this.persistAsync('deleteProduct', () => ProductModel.deleteOne({ id }));
    }
    return deleted;
  }

  // --- Car Database ---
  getCarBrands(): CarBrand[] {
    return this.data.carBrands;
  }

  getCarModels(brandId?: string): CarModel[] {
    if (!brandId) return this.data.carModels;
    return this.data.carModels.filter(m => m.brandId.toLowerCase() === brandId.toLowerCase() || m.brandName.toLowerCase() === brandId.toLowerCase());
  }

  checkVehicleCompatibility(productId: string, brandName: string, modelName: string, year: number): {
    isCompatible: boolean;
    universal: boolean;
    matchedRule?: string;
  } {
    const product = this.getProductById(productId);
    if (!product) return { isCompatible: false, universal: false };
    if (product.universalFit) {
      return { isCompatible: true, universal: true, matchedRule: 'Engineered for universal compatibility with all automotive models.' };
    }

    const matched = product.compatibility.find(c => {
      if (c.universal) return true;
      const bMatch = c.brandName.toLowerCase() === brandName.toLowerCase();
      const mMatch = c.modelName.toLowerCase() === modelName.toLowerCase();
      const yMatch = year >= c.yearStart && year <= c.yearEnd;
      return bMatch && mMatch && yMatch;
    });

    if (matched) {
      return {
        isCompatible: true,
        universal: false,
        matchedRule: `Laser-verified fitment for ${brandName} ${modelName} (${matched.yearStart}–${matched.yearEnd}).`
      };
    }

    return {
      isCompatible: false,
      universal: false,
      matchedRule: `This accessory is not certified to fit ${brandName} ${modelName} (${year}).`
    };
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  createCategory(category: Category): Category {
    this.data.categories.push(category);
    this.save();
    this.persistAsync('createCategory', () => CategoryModel.create(category));
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    this.persistAsync('updateCategory', () => CategoryModel.findOneAndUpdate({ id }, { $set: updates }));
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const len = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    const deleted = this.data.categories.length < len;
    if (deleted) {
      this.save();
      this.persistAsync('deleteCategory', () => CategoryModel.deleteOne({ id }));
    }
    return deleted;
  }

  // --- Cart Operations ---
  getCart(userId: string): CartItem[] {
    return this.data.carts[userId] || [];
  }

  addToCart(userId: string, item: {
    productId: string;
    quantity: number;
    selectedVehicle?: { brand: string; model: string; year: number };
  }): CartItem[] {
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = [];
    }
    const cart = this.data.carts[userId];
    const existingIdx = cart.findIndex(c => c.productId === item.productId);

    if (existingIdx > -1) {
      cart[existingIdx].quantity += item.quantity;
      if (item.selectedVehicle) {
        cart[existingIdx].selectedVehicle = item.selectedVehicle;
      }
      const updatedItem = cart[existingIdx];
      this.persistAsync('updateCartItem', () =>
        CartItemModel.findOneAndUpdate({ id: updatedItem.id }, { $set: updatedItem }, { upsert: true })
      );
    } else {
      const newItem: CartItem = {
        id: 'cart_' + crypto.randomUUID().slice(0, 8),
        userId,
        productId: item.productId,
        quantity: item.quantity,
        selectedVehicle: item.selectedVehicle,
        addedAt: new Date().toISOString()
      };
      cart.push(newItem);
      this.persistAsync('addCartItem', () => CartItemModel.create(newItem));
    }
    this.save();
    return cart;
  }

  updateCartItem(userId: string, cartItemId: string, quantity: number): CartItem[] {
    const cart = this.data.carts[userId] || [];
    const item = cart.find(c => c.id === cartItemId || c.productId === cartItemId);
    if (item) {
      if (quantity <= 0) {
        this.data.carts[userId] = cart.filter(c => c.id !== cartItemId && c.productId !== cartItemId);
        this.persistAsync('removeCartItem', () =>
          CartItemModel.deleteOne({ id: item.id })
        );
      } else {
        item.quantity = quantity;
        this.persistAsync('updateCartItemQty', () =>
          CartItemModel.findOneAndUpdate({ id: item.id }, { $set: { quantity } })
        );
      }
      this.save();
    }
    return this.data.carts[userId] || [];
  }

  removeFromCart(userId: string, cartItemId: string): CartItem[] {
    if (this.data.carts[userId]) {
      const target = this.data.carts[userId].find(c => c.id === cartItemId || c.productId === cartItemId);
      if (target) {
        this.persistAsync('removeCartItem', () => CartItemModel.deleteOne({ id: target.id }));
      }
      this.data.carts[userId] = this.data.carts[userId].filter(c => c.id !== cartItemId && c.productId !== cartItemId);
      this.save();
    }
    return this.data.carts[userId] || [];
  }

  clearCart(userId: string): void {
    this.data.carts[userId] = [];
    this.save();
    this.persistAsync('clearCart', () => CartItemModel.deleteMany({ userId }));
  }

  // --- Wishlist Operations ---
  getWishlist(userId: string): string[] {
    return this.data.wishlists[userId] || [];
  }

  toggleWishlist(userId: string, productId: string): { inWishlist: boolean; wishlist: string[] } {
    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = [];
    }
    const list = this.data.wishlists[userId];
    const idx = list.indexOf(productId);
    let inWishlist = false;

    if (idx > -1) {
      list.splice(idx, 1);
      inWishlist = false;
    } else {
      list.push(productId);
      inWishlist = true;
    }
    this.save();
    this.persistAsync('toggleWishlist', () =>
      WishlistModel.findOneAndUpdate({ userId }, { productIds: list }, { upsert: true })
    );
    return { inWishlist, wishlist: list };
  }

  // --- Coupons ---
  getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; message: string; discount: number; coupon?: Coupon } {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code. Check spelling and try again.', discount: 0 };
    }
    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is no longer active.', discount: 0 };
    }
    if (new Date() > new Date(coupon.expiryDate)) {
      return { valid: false, message: 'This coupon has expired.', discount: 0 };
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached.', discount: 0 };
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderAmount.toLocaleString()} required for this coupon.`,
        discount: 0
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount);
    } else {
      discount = Math.min(coupon.discountValue, coupon.maxDiscountAmount);
    }

    return {
      valid: true,
      message: `Coupon ${coupon.code} applied! ₹${discount.toFixed(0)} savings added.`,
      discount: Math.round(discount),
      coupon
    };
  }

  // --- Orders & Payments ---
  getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'trackingNumber' | 'carrier' | 'statusTimeline'>): Order {
    const timestamp = new Date().toISOString();
    const orderId = 'ord_' + crypto.randomUUID().slice(0, 8);
    const orderNumber = 'APX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = 'DELHIVERY_' + Math.floor(100000000 + Math.random() * 900000000);

    const initialTimeline = [
      {
        status: 'PLACED',
        title: 'Order Placed',
        description: 'Payment authorized and order received into AutoApex fulfillment center.',
        timestamp,
        completed: true
      },
      {
        status: 'CONFIRMED',
        title: 'Confirmed & Compatibility Verified',
        description: 'Automotive fitment checks passed with flying colors.',
        timestamp: new Date(Date.now() + 60000).toISOString(),
        completed: true
      },
      {
        status: 'PROCESSING',
        title: 'Packaging & Quality Assurance',
        description: 'Items undergoing laser dimensional scan & packaging.',
        timestamp: '',
        completed: false
      },
      {
        status: 'PACKED',
        title: 'Packed',
        description: 'Crated securely with bubble insulation.',
        timestamp: '',
        completed: false
      },
      {
        status: 'SHIPPED',
        title: 'Dispatched with Courier',
        description: `Handed over to Delhivery Express (Tracking #${trackingNumber}).`,
        timestamp: '',
        completed: false
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Courier rider on the route to shipping address.',
        timestamp: '',
        completed: false
      },
      {
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Delivered safely.',
        timestamp: '',
        completed: false
      }
    ];

    const order: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      trackingNumber,
      carrier: 'Delhivery Automotive Express',
      statusTimeline: initialTimeline,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Decrement inventory safely
    for (const item of order.items) {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock === 0) {
          prod.stockStatus = 'OUT_OF_STOCK';
        } else if (prod.stock <= prod.lowStockThreshold) {
          prod.stockStatus = 'LOW_STOCK';
        }
        this.persistAsync('updateProductStock', () =>
          ProductModel.findOneAndUpdate(
            { id: item.productId },
            { $set: { stock: prod.stock, stockStatus: prod.stockStatus } }
          )
        );
      }
    }

    // Increment coupon used count if used
    if (order.couponCode) {
      const coup = this.data.coupons.find(c => c.code === order.couponCode);
      if (coup) {
        coup.usedCount += 1;
        this.persistAsync('incrementCouponUsage', () =>
          CouponModel.findOneAndUpdate({ code: coup.code }, { $inc: { usedCount: 1 } })
        );
      }
    }

    this.data.orders.unshift(order);
    this.save();
    this.persistAsync('createOrder', () => OrderModel.create(order));
    return order;
  }

  updateOrderStatus(orderId: string, status: Order['orderStatus']): Order | undefined {
    const order = this.getOrderById(orderId);
    if (!order) return undefined;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();

    // Update timeline
    const timelineIdx = order.statusTimeline.findIndex(t => t.status === status);
    if (timelineIdx > -1) {
      for (let i = 0; i <= timelineIdx; i++) {
        order.statusTimeline[i].completed = true;
        if (!order.statusTimeline[i].timestamp) {
          order.statusTimeline[i].timestamp = new Date().toISOString();
        }
      }
    }

    this.save();
    this.persistAsync('updateOrderStatus', () =>
      OrderModel.findOneAndUpdate(
        { id: order.id },
        {
          $set: {
            orderStatus: order.orderStatus,
            updatedAt: order.updatedAt,
            statusTimeline: order.statusTimeline
          }
        }
      )
    );
    return order;
  }

  advanceOrderTracking(orderId: string): Order | undefined {
    const order = this.getOrderById(orderId);
    if (!order) return undefined;

    const stages: Order['orderStatus'][] = [
      'PLACED',
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];

    const currentIdx = stages.indexOf(order.orderStatus);
    const nextIdx = currentIdx < stages.length - 1 ? currentIdx + 1 : currentIdx;
    const nextStatus = stages[nextIdx];

    order.orderStatus = nextStatus;
    order.updatedAt = new Date().toISOString();

    const stageDescriptions: Record<string, string> = {
      CONFIRMED: 'Order confirmed. Fitment matrix verified against chassis database.',
      PROCESSING: 'Laser dimensional scan complete. Custom packaging in progress at AutoApex Central Warehouse.',
      PACKED: 'Parts securely crated with bubble foam insulation and barcoded for dispatch.',
      SHIPPED: `Handed over to ${order.carrier} (AWB #${order.trackingNumber}) at National Sort Center, Bilaspur.`,
      OUT_FOR_DELIVERY: 'Arrived at Destination Distribution Hub. Courier delivery associate is on the delivery route.',
      DELIVERED: 'Package delivered safely to customer. Contactless OTP verification completed.'
    };

    // Update status timeline
    order.statusTimeline.forEach((item, idx) => {
      if (idx <= nextIdx) {
        item.completed = true;
        if (!item.timestamp) {
          item.timestamp = new Date(Date.now() - (nextIdx - idx) * 3600 * 1000).toISOString();
        }
        if (stageDescriptions[item.status]) {
          item.description = stageDescriptions[item.status];
        }
      } else {
        item.completed = false;
        item.timestamp = '';
      }
    });

    this.save();
    this.persistAsync('advanceOrderTracking', () =>
      OrderModel.findOneAndUpdate(
        { id: order.id },
        {
          $set: {
            orderStatus: order.orderStatus,
            updatedAt: order.updatedAt,
            statusTimeline: order.statusTimeline
          }
        }
      )
    );
    return order;
  }

  resetOrderTracking(orderId: string): Order | undefined {
    const order = this.getOrderById(orderId);
    if (!order) return undefined;

    order.orderStatus = 'CONFIRMED';
    order.updatedAt = new Date().toISOString();

    order.statusTimeline.forEach((item, idx) => {
      if (idx <= 1) {
        item.completed = true;
        if (!item.timestamp) item.timestamp = new Date().toISOString();
      } else {
        item.completed = false;
        item.timestamp = '';
      }
    });

    this.save();
    this.persistAsync('resetOrderTracking', () =>
      OrderModel.findOneAndUpdate(
        { id: order.id },
        {
          $set: {
            orderStatus: order.orderStatus,
            updatedAt: order.updatedAt,
            statusTimeline: order.statusTimeline
          }
        }
      )
    );
    return order;
  }

  // --- Reviews ---
  getProductReviews(productId: string): Review[] {
    return this.data.reviews.filter(r => r.productId === productId && r.status === 'APPROVED');
  }

  addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'status'>): Review {
    const rev: Review = {
      ...reviewData,
      id: 'rev_' + crypto.randomUUID().slice(0, 8),
      helpfulCount: 0,
      status: 'APPROVED', // Default approved for responsive customer satisfaction
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(rev);

    // Recalculate product rating
    const prodReviews = this.data.reviews.filter(r => r.productId === reviewData.productId && r.status === 'APPROVED');
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      prod.rating = parseFloat(avgRating.toFixed(1));
      prod.reviewCount = prodReviews.length;
      this.persistAsync('updateProductRating', () =>
        ProductModel.findOneAndUpdate(
          { id: prod.id },
          { $set: { rating: prod.rating, reviewCount: prod.reviewCount } }
        )
      );
    }

    this.save();
    this.persistAsync('addReview', () => ReviewModel.create(rev));
    return rev;
  }

  getAllReviews(): Review[] {
    return this.data.reviews;
  }

  updateReviewStatus(id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED'): Review | undefined {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return undefined;
    rev.status = status;
    this.save();
    this.persistAsync('updateReviewStatus', () =>
      ReviewModel.findOneAndUpdate({ id }, { $set: { status } })
    );
    return rev;
  }

  // --- Admin Analytics ---
  getAdminAnalytics() {
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders.reduce((sum, o) => sum + (o.payment.status === 'PAID' ? o.total : 0), 0);
    const totalCustomers = this.data.users.filter(u => u.role === 'CUSTOMER').length;
    const totalProducts = this.data.products.length;
    const lowStockProducts = this.data.products.filter(p => p.stockStatus === 'LOW_STOCK' || p.stockStatus === 'OUT_OF_STOCK');

    // Sales by category
    const categorySales: Record<string, number> = {};
    for (const order of this.data.orders) {
      for (const item of order.items) {
        const prod = this.getProductById(item.productId);
        if (prod) {
          categorySales[prod.category] = (categorySales[prod.category] || 0) + (item.price * item.quantity);
        }
      }
    }

    // Top selling products
    const productSalesMap: Record<string, { product: Product; unitsSold: number; totalRevenue: number }> = {};
    for (const order of this.data.orders) {
      for (const item of order.items) {
        if (!productSalesMap[item.productId]) {
          const prod = this.getProductById(item.productId);
          if (prod) {
            productSalesMap[item.productId] = { product: prod, unitsSold: 0, totalRevenue: 0 };
          }
        }
        if (productSalesMap[item.productId]) {
          productSalesMap[item.productId].unitsSold += item.quantity;
          productSalesMap[item.productId].totalRevenue += (item.price * item.quantity);
        }
      }
    }

    const topSelling = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const revenueTimeline = [
      { date: 'Sep 23', revenue: 14500, orders: 3 },
      { date: 'Sep 24', revenue: 22800, orders: 5 },
      { date: 'Sep 25', revenue: 19400, orders: 4 },
      { date: 'Sep 26', revenue: 31200, orders: 7 },
      { date: 'Sep 27', revenue: 28900, orders: 6 },
      { date: 'Sep 28', revenue: 42500, orders: 9 },
      { date: 'Sep 29', revenue: 5308, orders: 1 }
    ];

    return {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      categorySales,
      topSelling,
      revenueTimeline,
      recentOrders: this.data.orders.slice(0, 8),
      dbStatus: this.getDbStatus()
    };
  }
}

export const db = new DatabaseStore();
