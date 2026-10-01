# AutoApex — Automotive Parts & Accessories E-Commerce Platform

A production-grade, full-stack automotive e-commerce platform built with React 19, TypeScript, Tailwind CSS, Express, and Vite. Features vehicle fitment filtering, real-time shipment tracking, GST-compliant PDF invoice downloads, intelligent AI recommendations, and an administrative control panel.

---

## 🚀 Quick Deployment Guide

### Step 1: Upload to GitHub

1. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name your repository (e.g., `autoapex-ecommerce`)
   - Choose **Public** or **Private**
   - **Do NOT** initialize with a README, .gitignore, or license (these are already configured in this repo)
   - Click **Create repository**

2. **Connect and push your code**:
   Open your terminal in this project directory and run:
   ```bash
   # Add your GitHub repository as the origin remote
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/autoapex-ecommerce.git

   # Push the main branch
   git push -u origin main
   ```

*(Tip: If you use the GitHub CLI, you can simply run `gh repo create autoapex-ecommerce --public --source=. --remote=origin --push`)*

---

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** → **Project**.
3. Import your newly created GitHub repository (`autoapex-ecommerce`).
4. **Project Settings** on Vercel will automatically detect the configuration from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (see Step 3 below).
   - `JWT_SECRET`: Any secure random string (e.g. `apex_prod_jwt_secret_2026`).
6. Click **Deploy**.

Your app and serverless API endpoints will be live with full routing and SSL!

---

### Step 3: Connect MongoDB Atlas (Database)

AutoApex includes full, native support for **MongoDB Atlas** with Mongoose 8. It also has a built-in hybrid mode that runs a resilient local store until your MongoDB Atlas cluster is connected.

#### Setting up MongoDB Atlas:
1. **Create Free Database**:
   - Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and register or sign in.
   - Deploy a free **M0 (Shared Cluster)** (e.g., AWS / Mumbai or Frankfurt region).
2. **Configure Network Access**:
   - In Atlas left sidebar, go to **Network Access** &rarr; **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel Serverless Functions can connect without IP restrictions.
3. **Create Database User**:
   - In Atlas left sidebar, go to **Database Access** &rarr; **Add New Database User**.
   - Set Authentication Method to **Password** (e.g., username `admin`, and create a secure password).
   - Assign **Read and write to any database** privileges.
4. **Obtain Connection String**:
   - Under **Clusters**, click **Connect** &rarr; **Drivers** (Node.js).
   - Copy the connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/autoapex?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the credentials you just created.
5. **Add to Vercel / Local `.env`**:
   - In Vercel: Go to your project &rarr; **Settings** &rarr; **Environment Variables** &rarr; Add:
     - **Key**: `MONGODB_URI`
     - **Value**: Your connection string
   - Locally: Add `MONGODB_URI="..."` to your `.env` file.

#### ✨ Automatic Database Initialization & Seeding:
When AutoApex connects to your MongoDB Atlas cluster for the first time:
- It automatically creates all necessary Mongoose collections (`users`, `products`, `orders`, `categories`, `carbrands`, `carmodels`, `coupons`, `reviews`).
- If empty, it automatically seeds 20+ vehicle catalog parts, demo customer and admin accounts, coupon codes, and vehicle fitment rules into Atlas!

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start the full-stack development server (Express + Vite)
npm run dev

# Build for production
npm run build

# Type check
npm run lint
```

Server runs on `http://localhost:3000`.

---

## 📦 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend / API**: Express.js, JWT, bcryptjs, Vercel Serverless (`/api`)
- **PDF Generation**: jsPDF (GST invoices, itemized tax breakdowns, automated pagination)
- **Deployment**: Vercel & GitHub Actions ready
