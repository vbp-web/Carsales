# Carsales (AutoApex) — Automotive Accessories & Fitment Platform

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Mongoose_8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![GitHub](https://img.shields.io/badge/GitHub-Carsales-181717?logo=github&logoColor=white)](https://github.com/vbp-web/Carsales)

**Carsales (AutoApex)** is a full-stack automotive e-commerce platform engineered for precision aftermarket car accessories and vehicle upgrades. It provides certified vehicle compatibility filtering, real-time GPS shipment tracking, simulated Razorpay payment flows, GST-compliant PDF invoice generation, and an administrator control room.

---

## 📸 Key Platform Features

- **Precision Vehicle Fitment Engine**: Filter thousands of accessories by Year, Brand, and Model (Hyundai Creta, Tata Nexon, Mahindra Thar, Toyota Fortuner, etc.) with verified laser-mold fitment badges.
- **Real-Time GPS Tracking Rail**: 7-stage interactive milestone rail (`PLACED` &rarr; `CONFIRMED` &rarr; `PROCESSING` &rarr; `PACKED` &rarr; `SHIPPED` &rarr; `OUT_FOR_DELIVERY` &rarr; `DELIVERED`) with live hub location and delivery associate contact details.
- **Razorpay Payment Gateway Integration**: Secure checkout modal supporting simulated UPI / QR (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking with server-side signature validation.
- **GST Tax Invoice Generator**: Automatic, downloadable PDF invoices with HSN codes, IGST/CGST breakdowns, delivery address, and carrier AWB details via `jsPDF`.
- **Admin Control Room**: Real-time sales telemetry, low-stock threshold triggers, order status progression, coupon creator, and customer review moderation.
- **Multi-Device Responsive**: Optimized for all viewports from compact mobile devices (360px+) to tablets and ultra-wide desktop monitors.
- **MongoDB Atlas + Mongoose 8**: Cloud persistence with automatic schema initialization, fallback in-memory store, and catalog seeding.
- **ImageKit CDN**: Automotive photography served via high-performance cloud CDN.

---

## 🔐 Pre-Seeded Demo Credentials

Use these verified credentials to sign in and test the platform:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `customer123` | Vehicle Garage, Order Tracking, Wishlist, Checkout |
| **Administrator** | `admin@example.com` | `admin123` | Full Admin Console, Inventory Control, Order Status |

---

## 🗂 Project Architecture

```
auto-main/
├── api/                       # Vercel serverless entrypoint
│   └── index.ts               # Serverless Express handler
├── server/                    # Backend API and Database
│   ├── db/
│   │   ├── connection.ts      # MongoDB Atlas connection lifecycle
│   │   ├── models.ts          # Mongoose 8 schemas (User, Product, Order, etc.)
│   │   ├── seedData.ts        # Seed dataset (products, cars, coupons, users)
│   │   └── store.ts           # Hybrid data access layer (Atlas + in-memory fallback)
│   ├── routes/                # Express API routes (/auth, /products, /orders, /admin)
│   └── server.ts              # Unified dev server with Vite middleware
├── src/                       # Frontend React Application
│   ├── components/
│   │   ├── auth/              # AuthModal (Sign In / Registration)
│   │   ├── cart/              # CartDrawer (Slide-out bag with threshold bar)
│   │   ├── checkout/          # RazorpayModal (UPI, Cards, Net Banking)
│   │   ├── common/            # Navbar, Footer, ProductCard, CarSelector, VehicleModal
│   │   └── orders/            # OrderTrackingProgressBar (7-milestone rail)
│   ├── context/               # React Context (Auth, Cart, Wishlist, Vehicle, Theme, Toast)
│   ├── services/              # API client service layer
│   ├── utils/                 # PDF invoice generation (jsPDF)
│   ├── views/                 # Top-level views (Home, Catalog, ProductDetail, Checkout, Admin, Orders)
│   ├── App.tsx                # Dynamic view router and root container
│   ├── main.tsx               # Client entry point
│   └── index.css              # Tailwind CSS v4 styling rules
├── scripts/
│   └── verifyAndSeed.ts       # Standalone verification and seeding CLI script
├── vercel.json                # Vercel serverless routing configuration
├── vite.config.ts             # Vite build configuration
└── package.json               # Dependencies and scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Server Port
PORT=3000

# MongoDB Atlas Connection URI
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/autoapex?retryWrites=true&w=majority"

# JWT Secret for Session Tokens
JWT_SECRET="apex_super_secret_jwt_key_2026"
```

> **Note**: The `.env` file contains sensitive credentials and is excluded from Git via `.gitignore`.

---

## 🚀 Getting Started Locally

### 1. Clone the Repository

```bash
git clone https://github.com/vbp-web/Carsales.git
cd Carsales
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify & Seed MongoDB Atlas (Optional)

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The unified development server will launch at:
**`http://localhost:3000`**

### 5. Type-Check and Build

```bash
# Type check (TypeScript)
npm run lint

# Production build (Frontend + Serverless)
npm run build
```

---

## ☁️ Deployment Guide

### Deploying to Vercel

1. **Push to GitHub**:
   Ensure your code is committed and pushed to [https://github.com/vbp-web/Carsales](https://github.com/vbp-web/Carsales).

2. **Import into Vercel**:
   - Navigate to [vercel.com](https://vercel.com) and log in.
   - Click **Add New...** &rarr; **Project**.
   - Select the `Carsales` repository.

3. **Configure Environment Variables on Vercel**:
   Under **Settings &rarr; Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure string for signing tokens.

4. **Deploy**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**.

Vercel will build the frontend assets into `/dist` and route `/api/*` requests through the serverless function in `/api/index.ts`.

---

## 🛠 Tech Stack Details

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern UI components with hooks and context |
| **Vite** | Fast HMR development server and production bundler |
| **TypeScript** | Strict compile-time typing across frontend and backend |
| **Tailwind CSS v4** | Utility-first styling with responsive breakpoint grids |
| **Express.js** | RESTful routing, authentication middleware, and dev server |
| **MongoDB Atlas / Mongoose 8** | Cloud NoSQL persistence with resilient fallback |
| **jsPDF** | Client-side GST tax invoice creation and formatting |
| **Lucide Icons** | Consistent iconography across views and tracking steps |

---

## 📄 License

This project is licensed under the MIT License.
