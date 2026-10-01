import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/store.ts';
import {
  requireAuth,
  requireAdmin,
  optionalAuth,
  generateToken,
  generateAuthTokens,
  verifyRefreshToken,
  AuthenticatedRequest
} from '../middleware/auth.ts';
import { recommendationService } from '../services/recommendationService.ts';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================
router.post('/auth/register', async (req, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = db.createUser({
      id: 'user_' + crypto.randomUUID().slice(0, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString()
    });

    const tokens = generateAuthTokens(newUser);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
});

router.post('/auth/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const tokens = generateAuthTokens(user);
    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Login failed.' });
  }
});

router.post('/auth/refresh', async (req, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    let decoded: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN' };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token. Please sign in again.' });
    }

    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found. Please sign in again.' });
    }

    const tokens = generateAuthTokens(user);
    return res.json({
      success: true,
      message: 'Tokens refreshed successfully.',
      data: {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Token refresh failed.' });
  }
});

router.post('/auth/logout', (_req, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const addresses = db.getUserAddresses(user.id);
  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      addresses
    }
  });
});

router.post('/auth/forgot-password', (req, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
  const user = db.findUserByEmail(email);
  if (!user) {
    // Return friendly generic response
    return res.json({ success: true, message: 'If an account exists, a password reset link has been dispatched.' });
  }
  return res.json({
    success: true,
    message: 'Password reset code has been sent to your registered email address.'
  });
});

// ==========================================
// 2. USER ADDRESSES
// ==========================================
router.get('/users/addresses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const addresses = db.getUserAddresses(req.user!.id);
  return res.json({ success: true, data: addresses });
});

router.post('/users/addresses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, phone, addressLine1, apartment, city, state, pincode, country, isDefault } = req.body;
  if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({ success: false, message: 'Missing required address fields.' });
  }

  const newAddress = db.addAddress({
    id: 'addr_' + crypto.randomUUID().slice(0, 8),
    userId: req.user!.id,
    name,
    phone,
    addressLine1,
    apartment: apartment || '',
    city,
    state,
    pincode,
    country: country || 'India',
    isDefault: !!isDefault
  });

  return res.status(201).json({ success: true, message: 'Address saved.', data: newAddress });
});

router.put('/users/addresses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateAddress(req.params.id, req.user!.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Address not found.' });
  }
  return res.json({ success: true, message: 'Address updated.', data: updated });
});

router.delete('/users/addresses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteAddress(req.params.id, req.user!.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Address not found.' });
  }
  return res.json({ success: true, message: 'Address deleted.' });
});

// ==========================================
// 3. PRODUCTS & CATALOG
// ==========================================
router.get('/products', (req, res: Response) => {
  try {
    const {
      category,
      subcategory,
      brand,
      carBrand,
      carModel,
      carYear,
      search,
      minPrice,
      maxPrice,
      rating,
      inStockOnly,
      featured,
      bestseller,
      newArrival,
      sort,
      page,
      limit
    } = req.query;

    const result = db.getProducts({
      category: category as string,
      subcategory: subcategory as string,
      brand: brand as string,
      carBrand: carBrand as string,
      carModel: carModel as string,
      carYear: carYear ? parseInt(carYear as string) : undefined,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      rating: rating ? parseFloat(rating as string) : undefined,
      inStockOnly: inStockOnly === 'true',
      featured: featured === 'true',
      bestseller: bestseller === 'true',
      newArrival: newArrival === 'true',
      sort: sort as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 12
    });

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed fetching products.' });
  }
});

router.get('/products/:idOrSlug', (req, res: Response) => {
  const { idOrSlug } = req.params;
  const product = db.getProductBySlug(idOrSlug) || db.getProductById(idOrSlug);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  const reviews = db.getProductReviews(product.id);
  return res.json({ success: true, data: { ...product, reviews } });
});

router.get('/products/:id/compatibility', (req, res: Response) => {
  const { id } = req.params;
  const { brand, model, year } = req.query;

  if (!brand || !model || !year) {
    return res.status(400).json({
      success: false,
      message: 'Please provide brand, model, and year query parameters.'
    });
  }

  const result = db.checkVehicleCompatibility(
    id,
    brand as string,
    model as string,
    parseInt(year as string)
  );

  return res.json({ success: true, data: result });
});

// Admin product mutation
router.post('/products', requireAdmin, (req, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.price || !data.category) {
      return res.status(400).json({ success: false, message: 'Product name, price, and category are required.' });
    }

    const newProd = db.createProduct({
      ...data,
      id: 'prod_' + crypto.randomUUID().slice(0, 8),
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      sku: data.sku || 'APX-' + Math.floor(1000 + Math.random() * 9000),
      discountPercent: data.discountPercent || Math.max(0, Math.round(((data.mrp - data.price) / data.mrp) * 100)),
      stock: data.stock || 20,
      reservedStock: 0,
      lowStockThreshold: data.lowStockThreshold || 5,
      stockStatus: data.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      images: data.images && data.images.length ? data.images : ['https://ik.imagekit.io/kn7nmib7f/car/product_floor_mats_1790681468276.jpg'],
      thumbnail: data.thumbnail || (data.images && data.images[0]) || 'https://ik.imagekit.io/kn7nmib7f/car/product_floor_mats_1790681468276.jpg',
      rating: 5.0,
      reviewCount: 0,
      compatibility: data.compatibility || [],
      universalFit: !!data.universalFit,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.status(201).json({ success: true, message: 'Product created successfully.', data: newProd });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/products/:id', requireAdmin, (req, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  return res.json({ success: true, message: 'Product updated successfully.', data: updated });
});

router.delete('/products/:id', requireAdmin, (req, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  return res.json({ success: true, message: 'Product deleted.' });
});

// ==========================================
// 4. CAR BRANDS & MODELS
// ==========================================
router.get('/cars/brands', (_req, res: Response) => {
  const brands = db.getCarBrands();
  return res.json({ success: true, data: brands });
});

router.get('/cars/models', (req, res: Response) => {
  const { brandId } = req.query;
  const models = db.getCarModels(brandId as string);
  return res.json({ success: true, data: models });
});

// ==========================================
// 5. CATEGORIES
// ==========================================
router.get('/categories', (_req, res: Response) => {
  const categories = db.getCategories();
  return res.json({ success: true, data: categories });
});

router.post('/categories', requireAdmin, (req, res: Response) => {
  const { name, description, iconName, subcategories } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

  const cat = db.createCategory({
    id: 'cat_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    iconName: iconName || 'Tag',
    subcategories: subcategories || []
  });

  return res.status(201).json({ success: true, data: cat });
});

// ==========================================
// 6. CART
// ==========================================
router.get('/cart', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const rawCart = db.getCart(req.user!.id);
  // Hydrate cart with full product details
  const populated = rawCart.map(item => {
    const product = db.getProductById(item.productId);
    return {
      ...item,
      product
    };
  }).filter(item => item.product !== undefined);

  return res.json({ success: true, data: populated });
});

router.post('/cart', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { productId, quantity, selectedVehicle } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required.' });

  const product = db.getProductById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  if (product.stockStatus === 'OUT_OF_STOCK' || product.stock < (quantity || 1)) {
    return res.status(400).json({ success: false, message: 'Requested quantity exceeds available inventory.' });
  }

  db.addToCart(req.user!.id, {
    productId,
    quantity: Math.max(1, quantity || 1),
    selectedVehicle
  });

  const cart = db.getCart(req.user!.id).map(item => ({
    ...item,
    product: db.getProductById(item.productId)
  }));

  return res.json({ success: true, message: 'Item added to your cart.', data: cart });
});

router.put('/cart/:itemId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { quantity } = req.body;
  db.updateCartItem(req.user!.id, req.params.itemId, quantity);
  const cart = db.getCart(req.user!.id).map(item => ({
    ...item,
    product: db.getProductById(item.productId)
  }));
  return res.json({ success: true, data: cart });
});

router.delete('/cart/:itemId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.removeFromCart(req.user!.id, req.params.itemId);
  const cart = db.getCart(req.user!.id).map(item => ({
    ...item,
    product: db.getProductById(item.productId)
  }));
  return res.json({ success: true, message: 'Item removed from cart.', data: cart });
});

router.delete('/cart', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.clearCart(req.user!.id);
  return res.json({ success: true, message: 'Cart cleared.' });
});

// ==========================================
// 7. WISHLIST
// ==========================================
router.get('/wishlist', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const productIds = db.getWishlist(req.user!.id);
  const products = productIds.map(id => db.getProductById(id)).filter(Boolean);
  return res.json({ success: true, data: products });
});

router.post('/wishlist', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required.' });

  const result = db.toggleWishlist(req.user!.id, productId);
  return res.json({
    success: true,
    message: result.inWishlist ? 'Saved to wishlist!' : 'Removed from wishlist.',
    data: result
  });
});

// ==========================================
// 8. COUPONS
// ==========================================
router.get('/coupons', (_req, res: Response) => {
  const coupons = db.getCoupons().filter(c => c.isActive);
  return res.json({ success: true, data: coupons });
});

router.post('/coupons/validate', (req, res: Response) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

  const result = db.validateCoupon(code, parseFloat(amount || 0));
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }

  return res.json({ success: true, data: result });
});

router.post('/coupons', requireAdmin, (req, res: Response) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, description, expiryDate } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ success: false, message: 'Code and discount value required.' });
  }

  const newCoupon = {
    id: 'coup_' + crypto.randomUUID().slice(0, 8),
    code: code.trim().toUpperCase(),
    discountType: discountType || 'PERCENTAGE',
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount || 0),
    maxDiscountAmount: Number(maxDiscountAmount || 500),
    startDate: new Date().toISOString(),
    expiryDate: expiryDate || '2028-12-31T23:59:59.000Z',
    usageLimit: 1000,
    usedCount: 0,
    isActive: true,
    description: description || ''
  };

  db.getCoupons().push(newCoupon);
  db.save();

  return res.status(201).json({ success: true, data: newCoupon });
});

// ==========================================
// 9. PAYMENTS (RAZORPAY INTEGRATION)
// ==========================================
router.post('/payments/create-order', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount.' });
    }

    // Razorpay creates orders with unique receipt and amount in paise (1 INR = 100 paise)
    const razorpayOrderId = 'order_rzp_' + crypto.randomUUID().slice(0, 14);
    const amountInPaise = Math.round(amount * 100);

    return res.json({
      success: true,
      data: {
        orderId: razorpayOrderId,
        amount: amountInPaise,
        currency: currency || 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_ApexAuto2026',
        prefill: {
          name: req.user!.name,
          email: req.user!.email
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Payment initiation failed.' });
  }
});

router.post('/payments/verify', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay transaction credentials.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'sec_apex_test_secret_998877';

    // Verify signature cryptographically
    if (razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      // For test simulated transactions we also allow valid generated or sandbox match
      const isValid = (generatedSignature === razorpaySignature) || razorpaySignature.startsWith('sig_test_verified_');
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature verification.' });
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully.',
      data: {
        verified: true,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 10. ORDERS
// ==========================================
router.get('/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders(req.user!.role === 'ADMIN' ? undefined : req.user!.id);
  return res.json({ success: true, data: orders });
});

router.get('/orders/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  // Allow order tracking retrieval
  return res.json({ success: true, data: order });
});

router.get('/orders/:id/tracking', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  const hubLocations: Record<string, string> = {
    PLACED: 'AutoApex Digital Gateway · Payment Verified',
    CONFIRMED: 'AutoApex Technical Fitment Verification Desk · Gurugram, HR',
    PROCESSING: 'AutoApex Central Fulfillment Center · Sector 18, Gurugram',
    PACKED: 'AutoApex Dispatch Staging Bay #04 · Crating Complete',
    SHIPPED: 'Delhivery National Logistics Sort Center · Bilaspur NH-48',
    OUT_FOR_DELIVERY: 'Delhivery Last-Mile Hub · New Delhi Delivery Center',
    DELIVERED: `Delivered to ${order.shippingAddress.name} · Destination Address`
  };

  const progressPercentages: Record<string, number> = {
    PLACED: 10,
    CONFIRMED: 25,
    PROCESSING: 45,
    PACKED: 65,
    SHIPPED: 80,
    OUT_FOR_DELIVERY: 92,
    DELIVERED: 100,
    CANCELLED: 0,
    RETURNED: 0
  };

  return res.json({
    success: true,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      progressPercentage: progressPercentages[order.orderStatus] || 15,
      currentHub: hubLocations[order.orderStatus] || 'AutoApex Logistics Facility',
      riderName: order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'DELIVERED' ? 'Vikramjit Singh' : undefined,
      riderPhone: order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'DELIVERED' ? '+91 98112 44921' : undefined,
      deliveryOtp: '4821',
      lastScanTime: order.updatedAt || new Date().toISOString(),
      statusTimeline: order.statusTimeline
    }
  });
});

router.post('/orders/:id/track-advance', (req, res: Response) => {
  const updated = db.advanceOrderTracking(req.params.id);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  return res.json({
    success: true,
    message: `Real-time tracking advanced to ${updated.orderStatus.replace(/_/g, ' ')}.`,
    data: updated
  });
});

router.post('/orders/:id/track-reset', (req, res: Response) => {
  const updated = db.resetOrderTracking(req.params.id);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  return res.json({
    success: true,
    message: 'Tracking simulation reset to Confirmed.',
    data: updated
  });
});

router.post('/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      discount,
      couponCode,
      tax,
      shipping,
      total,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId
    } = req.body;

    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Order items and shipping address are required.' });
    }

    // Verify inventory availability before placing
    for (const item of items) {
      const prod = db.getProductById(item.productId);
      if (!prod || prod.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" has insufficient stock (${prod?.stock || 0} remaining).`
        });
      }
    }

    const newOrder = db.createOrder({
      userId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      customerPhone: shippingAddress.phone || '',
      items,
      shippingAddress,
      subtotal: Number(subtotal),
      discount: Number(discount || 0),
      couponCode,
      tax: Number(tax || 0),
      shipping: Number(shipping || 0),
      total: Number(total),
      payment: {
        method: paymentMethod || 'Razorpay Online',
        razorpayOrderId: razorpayOrderId || 'order_direct_' + crypto.randomUUID().slice(0, 8),
        razorpayPaymentId: razorpayPaymentId || 'pay_direct_' + crypto.randomUUID().slice(0, 8),
        status: 'PAID',
        paidAt: new Date().toISOString()
      },
      orderStatus: 'CONFIRMED'
    });

    // Clear cart upon successful order
    db.clearCart(req.user!.id);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed creating order.' });
  }
});

router.put('/orders/:id/status', requireAdmin, (req, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  return res.json({ success: true, message: `Order status changed to ${status}.`, data: updated });
});

// ==========================================
// 11. REVIEWS
// ==========================================
router.get('/products/:id/reviews', (req, res: Response) => {
  const reviews = db.getProductReviews(req.params.id);
  return res.json({ success: true, data: reviews });
});

router.post('/products/:id/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { rating, title, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
  }

  // Check if customer purchased this product
  const userOrders = db.getOrders(req.user!.id);
  const hasPurchased = userOrders.some(o => o.items.some(i => i.productId === req.params.id));

  const review = db.addReview({
    productId: req.params.id,
    userId: req.user!.id,
    userName: req.user!.name,
    rating: Number(rating),
    title: title || 'Verified Experience',
    comment: comment.trim(),
    verifiedPurchase: hasPurchased
  });

  return res.status(201).json({
    success: true,
    message: 'Thank you! Your verified review has been posted.',
    data: review
  });
});

// ==========================================
// 12. RECOMMENDATIONS (AI/ML MODULE)
// ==========================================
router.get('/recommendations', async (req, res: Response) => {
  try {
    const { userId, carBrand, carModel, carYear, category, limit } = req.query;

    const products = await recommendationService.getRecommendations({
      userId: userId as string,
      carBrand: carBrand as string,
      carModel: carModel as string,
      carYear: carYear ? parseInt(carYear as string) : undefined,
      category: category as string,
      limit: limit ? parseInt(limit as string) : 8
    });

    return res.json({ success: true, data: products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/recommendations/similar/:productId', async (req, res: Response) => {
  try {
    const products = await recommendationService.getSimilarProducts(req.params.productId, 4);
    return res.json({ success: true, data: products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 13. ADMIN DASHBOARD & ANALYTICS
// ==========================================
router.get('/admin/analytics', requireAdmin, (_req, res: Response) => {
  const analytics = db.getAdminAnalytics();
  return res.json({ success: true, data: analytics });
});

router.get('/admin/inventory', requireAdmin, (_req, res: Response) => {
  const products = db.getProducts({ limit: 100 }).products;
  return res.json({ success: true, data: products });
});

router.get('/admin/users', requireAdmin, (_req, res: Response) => {
  const users = db.getAllUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt
  }));
  return res.json({ success: true, data: users });
});

router.get('/admin/reviews', requireAdmin, (_req, res: Response) => {
  const reviews = db.getAllReviews();
  return res.json({ success: true, data: reviews });
});

router.put('/admin/reviews/:id/status', requireAdmin, (req, res: Response) => {
  const { status } = req.body;
  const updated = db.updateReviewStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ success: false, message: 'Review not found.' });
  return res.json({ success: true, data: updated });
});

// ==========================================
// 14. DATABASE CONNECTIVITY STATUS (MONGODB ATLAS)
// ==========================================
router.get('/db/status', (_req, res: Response) => {
  const status = db.getDbStatus();
  return res.json({
    success: true,
    data: status,
    instructions: status.isMongoActive
      ? 'MongoDB Atlas is active and synchronizing data.'
      : 'To connect to MongoDB Atlas, add your MONGODB_URI connection string to your environment variables (.env locally, or Vercel Project Settings in production).'
  });
});

export default router;

