# Project Documentation: MERN Stack Book Store (BookVerse)

---

## 1. Introduction

* **Project Title**: BOOK STORE (BookVerse)
* **Academic/Development Team & Roles**:
  1. **Roopesh Araja** - Technical Architecture, Entity Relation Diagram, Features, Roles and Responsibilities
  2. **Palla Satya Ramanaidu** - MVC Pattern, Creating Project Folder, Client Setup
  3. **Bandi Sravya** - Server Setup, Backend Structure, Development and Explanation, Configure MongoDB
  4. **Vijaya Raju Jakkamsetti** - Create Database Connection, Create Schema and Models, Frontend Structure, Development and Explanation
  5. **Vankayala Jaya Chandra Srinivas** - Steps for Execution, Demo Screenshots, Drive Link

---

## 2. Project Overview

### Purpose
The **BOOK STORE** (BookVerse) application is a full-stack e-commerce web platform designed to streamline online book shopping. Built using the MERN stack (MongoDB, Express, React, Node), it provides a responsive interface where customers can browse catalog entries, maintain wishlists, and purchase books. The system supports role-based features separating customers, sellers, and system administrators.

### Key Features
* **Role-Based Login & Security**: Tabbed authentication separating Users, Sellers, and Administrators using JSON Web Tokens (JWT) and Bcrypt password hashing.
* **Seller Book Catalog Management**: Approved sellers can create, read, update, and delete (CRUD) their listed books including image uploads.
* **Customer Catalog Exploration**: Customers can search by title or author, filter by category/genre, view descriptions, and add items to a local wishlist.
* **Instant Checkout**: Simplified "Buy Now" checkout collecting customer delivery names and addresses, creating orders and decrementing book inventory.
* **Fulfillment Tracker**: Sellers can monitor pending orders for their books and transition the shipping status (e.g. `pending` to `ontheway` or `delivered`).
* **Admin Control Center**: Administrators review system stats via counters and a custom SVG bar chart, manage user accounts (edit/delete details), approve newly registered sellers, and audit/delete user orders.

---

## 3. Technical Architecture

### Frontend (React)
The client interface is built with React.js bootstrapped via Vite.
* **Global Context**: `AuthContext` holds the logged-in session, auth token, and handles login/logout/signup HTTP requests.
* **Router**: React Router Dom handles routes dynamically, ensuring standard users see custom shopping elements, sellers see catalog controls, and admins access management views.
* **Styling**: Leverages custom CSS in `index.css` paired with Bootstrap for responsiveness, styled using a warm cream background (`#FDFBF7`) and earthy brown accents (`#7D4016`).

### Backend (Node.js & Express.js)
The backend service is built using Node.js and Express.js adhering to the Model-View-Controller (MVC) architectural pattern.
* **Database Driver**: Mongoose ORM coordinates connections and operations on MongoDB.
* **Middlewares**: 
  - `authMiddleware.js` parses Authorization headers (`Bearer <JWT>`) to validate claims and enforce route permissions.
  - `upload.js` configures Multer to store uploaded book cover images in the server's `uploads/` directory.

### Database Schema (MongoDB)
Data is stored across 5 collections in MongoDB Atlas:
1. **Admins (`AdminSchema`)**: `name`, `email`, `password`, `userId` (ObjectId referencing self).
2. **Sellers (`SellerSchema`)**: `name`, `email`, `password`, `isApproved` (Boolean).
3. **Users (`UserSchema`)**: `name`, `email`, `password`.
4. **Books (`BookSchema`)**: `title`, `author`, `genre`, `description`, `price`, `quantity`, `image`, `sellerId`, `sellerName`.
5. **Orders (`MyOrderSchema`)**: `userId`, `bookId`, `productName`, `customerName`, `address`, `sellerId`, `sellerName`, `bookingDate`, `deliveryDate`, `warranty`, `price`, `status`, `image`.

---

## 4. Setup & Setup Instructions

### Prerequisites
* Node.js (v16+) and npm installed locally.
* A MongoDB Atlas account and cluster configured.

### Installation & Environment Variables
1. Clone or extract the project files to your directory.
2. In the `backend` folder, create a `.env` file containing:
   ```env
   PORT=8000
   MONGO_URI=mongodb+srv://23pa1a5761_db_user:AR15l56xvSCDDLmM@book-store.ouo6cb6.mongodb.net/bookverse?appName=Book-Store
   JWT_SECRET=bookversesecrettokenkey12345
   ```
3. Run `npm install` in both `/backend` and `/frontend` folders to install dependencies.

---

## 5. Folder Structure

### Client (React Frontend - `/frontend`)
```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx            # Routing and page layouts
    ├── main.jsx           # App bootstrapping and CSS imports
    ├── index.css          # Custom warm beige and brown CSS stylesheet
    ├── components/
    │   ├── Navbar.jsx     # Role-based headers
    │   └── OrderModal.jsx # Detail overlay modal for user orders
    ├── context/
    │   └── AuthContext.jsx# Session management and API gateways
    └── pages/
        ├── Home.jsx       # Landing page (hero, categories, contact footer)
        ├── UserHome.jsx   # Best Sellers & Recommendations grid
        ├── BooksList.jsx  # Catalog grid with search, filter, and Wishlist
        ├── BookDetail.jsx # Cover layout and Buy Now checkout trigger
        ├── Wishlist.jsx   # Saved items list
        ├── MyOrders.jsx   # Customer order tracking page
        ├── LoginRegister.jsx # Tabbed login cards
        ├── SellerDashboard.jsx # Seller analytics and chart
        ├── SellerProducts.jsx  # Seller's listed products list
        ├── SellerAddBook.jsx   # Create book listing form
        ├── SellerOrders.jsx    # Seller's order status manager
        └── AdminDashboard.jsx  # Admin summaries, chart, and users list
```

### Server (Node.js Backend - `/backend`)
```
backend/
├── .env                  # Port, database connection, JWT secret
├── package.json          # Express and mongoose dependency mappings
├── server.js             # Express entry point
├── seed.js               # Database population script
├── verify_backend.js     # Direct database query test script
├── db/
│   └── config.js         # Connection exporter compatibility layer
├── config/
│   └── connect.js        # Mongoose MongoDB Atlas connection logic
├── middlewares/
│   ├── authMiddleware.js # Token parse and role authentication
│   └── upload.js         # Multer files configuration
├── models/
│   ├── Admin/
│   │   └── AdminSchema.js
│   ├── Seller/
│   │   └── SellerSchema.js
│   └── Users/
│       ├── UserSchema.js
│       ├── BookSchema.js
│       └── MyOrderSchema.js
├── controllers/
│   ├── AdminControllers.js
│   ├── SellerControllers.js
│   └── UsersController.js
└── routes/
    ├── adminRoutes.js
    ├── sellerRoutes.js
    └── userRoutes.js
```

---

## 6. Running the Application

Start the backend and frontend dev servers locally using two terminal windows:

### Backend Server
```bash
cd backend
npm start
```
*(Runs on [http://127.0.0.1:8000](http://127.0.0.1:8000))*

### Frontend Client
```bash
cd frontend
npm run dev
```
*(Runs on [http://localhost:5173](http://localhost:5173))*

---

## 7. API Documentation

### Authentication & Users
* **POST `/api/users/register`**: Register customer. Body: `{ name, email, password }`.
* **POST `/api/users/login`**: Authenticate customer. Body: `{ email, password }`.
* **GET `/api/users/profile`**: Retrieve profile details. Header: `Authorization: Bearer <JWT>`.

### Books
* **GET `/api/users/books`**: Fetch catalog. Optional Queries: `?search=title&genre=fiction`.
* **GET `/api/users/books/:id`**: Get detailed book fields.

### Orders
* **POST `/api/users/orders`**: Checkout. Body: `{ bookId, customerName, address, price }`.
* **GET `/api/users/orders`**: List orders for logged-in user.

### Seller Endpoints
* **POST `/api/seller/register`**: Register seller (isApproved: false).
* **POST `/api/seller/login`**: Authenticate seller (only approved accounts).
* **GET `/api/seller/stats`**: Retrieve seller's book & order metrics.
* **POST `/api/seller/books`**: Create book listing (Multipart Form-Data).
* **PUT `/api/seller/orders/:id/status`**: Update order shipping status. Body: `{ status }`.

### Admin Endpoints
* **GET `/api/admin/stats`**: Retrieve counts of Users, Vendors, Items, and Orders.
* **PUT `/api/admin/sellers/approve/:id`**: Toggle vendor `isApproved` to true.
* **DELETE `/api/admin/users/:id`**: Delete a user account and their orders.
* **GET `/api/admin/user-orders/:userId`**: Fetch orders placed by a user (modal display).

---

## 8. Authentication & Security

* **Hashing**: Password strings are hashed using **Bcryptjs** (10 salt rounds) during registration.
* **Token Access**: JWT tokens are signed using a secret key, containing user attributes (id, email, role, name), expiring in 30 days.
* **Local Storage**: Saved in `localStorage` on the frontend, and sent via HTTP headers: `Authorization: Bearer <Token>`.
* **Route Protection**: Middleware verifies the token signature and compares user roles before execution.

---

## 9. User Interface Layouts

* **Home Page**: Styled with a cream `#FDFBF7` background, a centered hero banner, categories with emojis, and contact details.
* **Admin dashboard**: Shows counts of USERS, Vendors, Items, and Orders. Includes an SVG bar chart and management tables.
* **Seller portal**: Includes summary stats, books lists, add book forms, and order tracker sheets.
* **Customer workflow**: Tabbed authentication forms, catalog list view, split Description/Info details page, Buy Now checkout modal, and order cards.

---

## 10. Testing Strategy

* **Seeder Check**: The `seed.js` script clears the database and populates 3 users, 2 sellers, 6 books, and 2 orders.
* **Database Verification**: We run `verify_backend.js` which connects to MongoDB Atlas and validates record counts.
* **Vite Compilation**: Build checks are validated via `npm run build` to ensure zero compilation or import path warnings.

---

## 12. Known Issues

* **Network Whitelisting**: If MongoDB Atlas returns a `Connection Refused` error, verify that the IP Access List on Atlas is set to allow connections from anywhere (`0.0.0.0/0`).
* **Upload Image Size**: Multer is currently restricted to a maximum file size of 5MB. Uploading larger book cover images will throw a size limit exception.

---

## 13. Future Enhancements

* **Direct Checkout Payment Gateway**: Integrate Stripe or PayPal API for actual payment transactions.
* **Seller Inventory Alerts**: Implement automatic email alerts using Nodemailer when listed books reach low stock levels.
* **Interactive Reviews**: Allow customers to submit star ratings and detailed review comments which recalculate the average rating dynamically.

---

## 11. Screenshots

* **Live Project Demo Link**: [Render Web Service URL](https://book-store-nzxy.onrender.com/)
* **Screenshots Showcase**:
  1. **Home Page**:
     ![1. Guest Home Page](media__1784304688594.png)
     *Figure 1: UI of the BookVerse landing page display showing branding, search exploration buttons, and guest portal entry badges.*
  2. **Admin Login Page**:
     ![2. Admin Login Page](media__1784304710940.png)
     *Figure 2: Authentication card panel interface for the system administrator login portal.*
  3. **Seller Dashboard**:
     ![3. Seller Dashboard](media__1784304891346.png)
     *Figure 3: Seller summary cards for Items and Total Orders, and the SVG bar chart indicating the seller's metrics.*
  4. **Seller Products List**:
     ![4. Seller Products List](media__1784304891353.png)
     *Figure 4: Seller catalog sheet showing listed items with title, author, genre, price, and cover image.*
  5. **Seller Orders Management**:
     ![5. Seller Orders Management](media__1784304931230.png)
     *Figure 5: Fulfilling orders interface for sellers to trace ordered items, prices, booking dates, and update statuses.*
