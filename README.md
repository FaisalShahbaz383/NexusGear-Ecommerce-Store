Markdown
# NexusGear | High-Performance E-Commerce Engine

A production-ready, full-stack E-Commerce single-page application engineered using the **MERN Stack** (MongoDB, Express.js, React 18 with Vite, Node.js) and embedded **Stripe Sandbox Elements**.

---

## 🏛 System Architecture Overview

NexusGear/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Resilient Mongoose connection handler
│   │   └── stripe.js             # Stripe SDK & test engine
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
│   │   ├── Footer.jsx        # Customer care links & navigation footer
│   │   ├── Navbar.jsx        # Role-aware brand header, cart counter & auth dropdown
│   │   ├── ProductCard.jsx   # Item card with live stock alerts & cart action
│   │   ├── ProtectedRoute.jsx# Auth & role-based route guard
│   │   └── StarRating.jsx    # Interactive 5-star rating component
│   ├── context/
│   │   ├── AuthContext.jsx   # Global user state & token persistence
│   │   └── CartContext.jsx   # Cart state with live price sync & localStorage
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx # 4 KPI cards, gross revenue, low-stock watchlist
│   │   │   ├── AdminOrders.jsx    # Master orders fulfillment status manager
│   │   │   ├── AdminProducts.jsx  # Catalog CRUD table & quick restock controls
│   │   │   └── AdminSupport.jsx   # Split-inbox support desk & reply console
│   │   ├── Auth.jsx          # Clean Sign In / Register portal
│   │   ├── Checkout.jsx      # Encrypted Stripe Elements checkout & address validation
│   │   ├── Home.jsx          # Storefront product grid, category filter, search
│   │   ├── OrderHistory.jsx  # Past customer orders with fulfillment status tracking
│   │   ├── OrderSuccess.jsx  # Transaction confirmation receipt & stock summary
│   │   ├── ProductDetails.jsx# Deep item specs, stock status & user reviews
│   │   └── Support.jsx       # Customer inquiry submission & ticket tracker
│   ├── App.jsx               # Application routes & layout wrapper
│   ├── index.css             # Tailwind base styles & custom UI themes
│   └── main.jsx              # React DOM mounting
├── index.html                # HTML5 entry with modern typography
├── package.json              # Frontend dependencies
└── vite.config.js            # Vite build configuration with local API proxy


---

## 🔐 Key Security & Architectural Highlights

1. **Server-Side Price Calculation & Anti-Tampering:**
   - The client never passes price totals directly to payment processors.
   - When `/api/checkout/create-payment-intent` is invoked, the server iterates through requested item IDs, queries the MongoDB `Product` collection directly, computes item totals, applies 8% sales tax, checks free shipping thresholds ($100+), and calculates the exact Stripe `amount` in cents.
2. **Atomic Inventory Reservation:**
   - When Stripe authorization succeeds, the system automatically subtracts purchased quantities directly from MongoDB using atomic operations (`$inc: { countInStock: -qty }`).
   - If stock is insufficient, the checkout prevents purchase and notifies the buyer.
3. **Role-Based Authorization & Bcrypt Hashing:**
   - Passwords are automatically hashed with 10 salt rounds via `bcryptjs` before persisting in MongoDB.
   - Routes are protected by `protect` (verifies signed JWT) and `admin` (restricts access to administrative roles).
   - Strict UI segregation ensures customer accounts cannot view or interact with administrative routes or controls.
4. **Stripe Elements Integration:**
   - Powered by standard Stripe test card presets, allowing buyers to complete realistic transaction flows with simulated authorization and automated inventory updates.

---

## 👥 Customer Testing Account

To test the application workflow, sign in using the provided test customer credentials below:

| Account Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@ecommerce.com` | `customer123` | Storefront browsing, Cart management, Stripe Checkout, Order History & Reviews |

> **Administrative Panel Access:**  
> The **Admin Panel** (`/admin`) is strictly restricted to platform administrators for live store operations, inventory management, order fulfillment, and ticket resolution. Public administrative credentials are restricted for security reasons.

---

## 🧪 Testing the Customer Workflow

1. **Sign In:** Go to `/auth`, enter the **Customer** email (`customer@ecommerce.com`) and password (`customer123`), and click **Sign In**.
2. **Browse Catalog:** On the home page (`/`), filter items by category chips or search for items like "Apex" or "Headphones".
3. **Inspect Inventory:** Click any product card to view deep specifications and live inventory stock levels (e.g., "Only 3 Left").
4. **Submit a Review:** Rate an item 5 stars, write feedback, and verify the average rating update.
5. **Complete Checkout:** Add items to your cart and proceed to `/checkout`. Review the server-calculated totals, submit the order, and confirm the payment.
6. **Order Receipt & Verification:**
   - The `/order-success/:id` page generates an official transaction receipt.
   - Check the storefront or product details to see the inventory stock automatically decremented.
7. **Order & Ticket Tracking:**
   - Visit **My Orders** (`/orders`) to view past purchases and current fulfillment status updates (*Processing*, *Shipped*, *Delivered*).
   - Visit **Support** (`/support`) to submit customer service inquiries or review FAQ answers.
