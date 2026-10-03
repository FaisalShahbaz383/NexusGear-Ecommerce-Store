# Task 4: Secure E-Commerce Engine with Checkout Sandbox

A production-ready, high-assurance E-Commerce microservice and Single-Page Application engineered using the **MERN Stack** (MongoDB, Express.js, React 18 with Vite, Node.js) and embedded **Stripe Sandbox Elements**.

---

## 🏛 System Architecture Overview

```
Secure E-Commerce Engine with Checkout Sandbox/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Resilient Mongoose connection handler
│   │   └── stripe.js             # Stripe SDK & Sandbox fallback engine
│   ├── controllers/
│   │   ├── authController.js     # User registration, JWT login, profile, user directory
│   │   ├── checkoutController.js # Server-side price verification & Stripe Payment Intent
│   │   ├── orderController.js    # Order lifecycle, atomic stock reservation & metrics
│   │   ├── productController.js  # Product catalog CRUD, stock queries, user reviews
│   │   └── supportController.js  # Support inquiries dispatching & ticket resolution
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT bearer extraction & role-based access control
│   │   └── errorMiddleware.js    # 404 handler & JSON error standardizer
│   ├── models/
│   │   ├── Order.js              # Order schema, payment intent proof, fulfillment status
│   │   ├── Product.js            # Catalog schema, stock count, subdocument reviews
│   │   ├── SupportTicket.js      # Customer ticket schema, status, admin response
│   │   └── User.js               # User schema with bcrypt pre-save password hashing
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── checkoutRoutes.js     # /api/checkout endpoints
│   │   ├── orderRoutes.js        # /api/orders endpoints
│   │   ├── productRoutes.js      # /api/products endpoints
│   │   └── supportRoutes.js      # /api/support endpoints
│   ├── utils/
│   │   ├── generateToken.js      # Signed JWT utility (userId + role)
│   │   └── seedData.js           # Database seeder with sample accounts & catalog
│   ├── .env                      # Environment secrets
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express application entrypoint
│
└── frontend/
    ├── public/                   # Static browser assets
    ├── src/
    │   ├── api/
    │   │   └── api.js            # Axios client with JWT request interceptor
    │   ├── components/
    │   │   ├── AdminSidebar.jsx  # Admin portal vertical navigation
    │   │   ├── Footer.jsx        # Security protocols & ecosystem footer
    │   │   ├── Navbar.jsx        # Brand header, cart counter & auth dropdown
    │   │   ├── ProductCard.jsx   # Item card with live stock alerts & cart action
    │   │   ├── ProtectedRoute.jsx# Auth & role-based route guard
    │   │   └── StarRating.jsx    # Interactive 5-star rating component
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Global user state & token persistence
    │   │   └── CartContext.jsx   # Cart state with live price sync & localStorage
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx # 4 KPI cards, revenue, low-stock watchlist
    │   │   │   ├── AdminOrders.jsx    # Master orders fulfillment status manager
    │   │   │   ├── AdminProducts.jsx  # Catalog CRUD table & quick restock controls
    │   │   │   └── AdminSupport.jsx   # Split-inbox support desk & reply console
    │   │   ├── Auth.jsx          # Dual-tab Sign In / Register portal with demo autofill
    │   │   ├── Checkout.jsx      # Stripe Elements sandbox & address validation
    │   │   ├── Home.jsx          # Storefront product grid, category filter, real-time search
    │   │   ├── OrderHistory.jsx  # Past client orders with fulfillment status tracking
    │   │   ├── OrderSuccess.jsx  # Transaction confirmation receipt & stock summary
    │   │   ├── ProductDetails.jsx# Deep item specs, stock status & user reviews
    │   │   └── Support.jsx       # Customer inquiry submission & ticket tracker
    │   ├── App.jsx               # Application routes & layout wrapper
    │   ├── index.css             # Tailwind base styles & glassmorphism classes
    │   └── main.jsx              # React DOM mounting
    ├── index.html                # HTML5 entry with modern typography
    ├── package.json              # Frontend dependencies (React, Vite, Stripe, Tailwind)
    ├── postcss.config.js         # PostCSS configuration
    ├── tailwind.config.js        # Tailwind CSS theme configuration
    └── vite.config.js            # Vite build configuration with local API proxy
```

---

## 🔐 Key Security & Architectural Highlights

1. **Server-Side Price Calculation & Anti-Tampering:**
   - The client never passes price totals directly to payment processors.
   - When `/api/checkout/create-payment-intent` is invoked, the server iterates through the requested item IDs, queries the MongoDB `Product` collection directly, computes items total, applies 8% sales tax, checks free shipping thresholds ($100+), and computes the exact Stripe `amount` in cents.
2. **Atomic Inventory Reservation:**
   - When Stripe authorization succeeds, the system automatically subtracts purchased quantities directly from MongoDB using atomic operations (`$inc: { countInStock: -qty }`).
   - If stock is insufficient, the checkout prevents purchase and notifies the buyer.
3. **Role-Based Authorization & Bcrypt Hashing:**
   - Passwords are automatically hashed with 10 salt rounds via `bcryptjs` before persisting in MongoDB.
   - Routes are protected by `protect` (verifies signed JWT) and `admin` (restricts to users with `role: 'admin'`).
4. **Stripe Elements Sandbox:**
   - Supports live test keys (`sk_test_...` / `pk_test_...`) as well as integrated sandbox fallback simulation, ensuring the application is 100% testable out of the box with zero external configuration required.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd "backend"

# Install backend dependencies
npm install

# Seed demo users, hardware products, orders, and tickets
npm run seed

# Start Express API server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup
Open a second terminal:
```bash
cd "frontend"

# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 👥 Pre-Configured Demo Accounts

| Account Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@ecommerce.com` | `admin123` | Full access to Admin Dashboard, Catalog CRUD, Order Fulfillment & Support Inbox |
| **Customer** | `customer@ecommerce.com` | `customer123` | Storefront browsing, Cart, Sandbox Checkout, Order History & Reviews |

*(Tip: Both accounts can also be instantly autofilled using the one-click demo buttons on the `/auth` page!)*

---

## 🧪 Testing the Complete Workflow

1. **Sign In:** Go to `/auth`, click **Customer** demo autofill, and click **Authenticate**.
2. **Browse Catalog:** On `/`, search for "Apex" or select the "Electronics" category chip.
3. **Inspect Inventory:** Click the product to view `/product/:id`. Notice the low stock indicator (e.g. "Only 3 Left").
4. **Submit a Review:** Rate the item 5 stars, write feedback, and see the average rating recalculate.
5. **Checkout via Stripe Sandbox:** Add the item to cart, proceed to `/checkout`. Review the server-calculated tax and shipping, verify the prefilled Stripe test card (`4242 4242 4242 4242`), and click **Pay & Complete Order**.
6. **Order Receipt & Stock Verification:**
   - The `/order-success/:id` receipt confirms the Stripe transaction ID.
   - Return to the storefront or product details: the stock count has been atomically decremented!
7. **Admin Fulfillment & Support:**
   - Sign in as `admin@ecommerce.com` / `admin123`.
   - Access the **Admin Panel** (`/admin`) to inspect Revenue, Total Orders, and Low Stock Alerts.
   - In `/admin/orders`, transition the order from `Processing` → `Shipped` → `Delivered`.
   - In `/admin/support`, review submitted customer inquiries and reply directly.
