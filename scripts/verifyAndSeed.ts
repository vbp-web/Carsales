import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectMongoDB } from '../server/db/mongodb.ts';
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
} from '../server/db/models.ts';
import {
  SEED_BRANDS,
  SEED_MODELS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_COUPONS,
  SEED_REVIEWS,
  createDemoUsers
} from '../server/db/seedData.ts';
import { Address, Order } from '../server/types/index.ts';

async function seedAll() {
  console.log('🚀 Connecting to MongoDB Atlas...');
  const conn = await connectMongoDB();
  if (!conn) {
    console.error('❌ MONGODB_URI not found or connection failed.');
    process.exit(1);
  }

  console.log(`Connected to host: ${mongoose.connection.host}, database: ${mongoose.connection.name}`);
  console.log('🧹 Purging any existing collections in MongoDB Atlas...');

  await Promise.all([
    UserModel.deleteMany({}),
    ProductModel.deleteMany({}),
    CarBrandModel.deleteMany({}),
    CarModelModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    AddressModel.deleteMany({}),
    CartItemModel.deleteMany({}),
    WishlistModel.deleteMany({}),
    OrderModel.deleteMany({}),
    ReviewModel.deleteMany({}),
    CouponModel.deleteMany({}),
    NotificationModel.deleteMany({})
  ]);

  console.log('🌱 Inserting all seed data into MongoDB Atlas...');

  // 1. Users
  const demoUsers = await createDemoUsers();
  await UserModel.insertMany(demoUsers);
  console.log(`✅ Users inserted: ${demoUsers.length}`);

  // 2. Car Brands
  await CarBrandModel.insertMany(SEED_BRANDS);
  console.log(`✅ Car Brands inserted: ${SEED_BRANDS.length}`);

  // 3. Car Models
  await CarModelModel.insertMany(SEED_MODELS);
  console.log(`✅ Car Models inserted: ${SEED_MODELS.length}`);

  // 4. Categories
  await CategoryModel.insertMany(SEED_CATEGORIES);
  console.log(`✅ Categories inserted: ${SEED_CATEGORIES.length}`);

  // 5. Products
  await ProductModel.insertMany(SEED_PRODUCTS);
  console.log(`✅ Products inserted: ${SEED_PRODUCTS.length}`);

  // 6. Coupons
  await CouponModel.insertMany(SEED_COUPONS);
  console.log(`✅ Coupons inserted: ${SEED_COUPONS.length}`);

  // 7. Reviews
  await ReviewModel.insertMany(SEED_REVIEWS);
  console.log(`✅ Reviews inserted: ${SEED_REVIEWS.length}`);

  // 8. Demo Address
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
  console.log('✅ Demo Address inserted: 1');

  // 9. Demo Order
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
        image: 'https://ik.imagekit.io/kn7nmib7f/car/product_floor_mats_1790681468276.jpg',
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
  console.log('✅ Demo Order inserted: 1');

  // 10. Demo Wishlist
  await WishlistModel.create({
    userId: 'user_customer_demo',
    productIds: ['prod_4k_dual_dashcam_pro', 'prod_nappa_leather_seat_creta']
  });
  console.log('✅ Demo Wishlist inserted: 1');

  // 11. Notifications
  await NotificationModel.create({
    id: 'notif_welcome_1',
    userId: 'user_customer_demo',
    type: 'PROMO',
    title: 'Welcome to AutoApex!',
    message: 'Use code CAR10 at checkout for an instant 10% discount on vehicle accessories.',
    isRead: false,
    createdAt: new Date().toISOString()
  });
  console.log('✅ Notifications inserted: 1');

  // Verification counts
  const [usersCount, productsCount, brandsCount, modelsCount, categoriesCount, ordersCount, reviewsCount, couponsCount] =
    await Promise.all([
      UserModel.countDocuments(),
      ProductModel.countDocuments(),
      CarBrandModel.countDocuments(),
      CarModelModel.countDocuments(),
      CategoryModel.countDocuments(),
      OrderModel.countDocuments(),
      ReviewModel.countDocuments(),
      CouponModel.countDocuments()
    ]);

  console.log('\n📊 --- MongoDB Atlas Seed Report ---');
  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Users: ${usersCount}`);
  console.log(`Products: ${productsCount}`);
  console.log(`Car Brands: ${brandsCount}`);
  console.log(`Car Models: ${modelsCount}`);
  console.log(`Categories: ${categoriesCount}`);
  console.log(`Orders: ${ordersCount}`);
  console.log(`Reviews: ${reviewsCount}`);
  console.log(`Coupons: ${couponsCount}`);
  console.log('🎉 All seed data successfully written into MongoDB Atlas!\n');

  await mongoose.disconnect();
}

seedAll().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
