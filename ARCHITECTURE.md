# Architecture Overview

## 🏗️ Project Architecture

Namma Market is a full-stack monorepo application with the following architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/HTTPS
                   ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend (React + Vite + TypeScript)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • React 18 Components                            │  │
│  │ • React Router for navigation                    │  │
│  │ • Tailwind CSS for styling                       │  │
│  │ • TanStack Query for data fetching               │  │
│  │ • Zustand for state management                   │  │
│  │ • Zod for schema validation                      │  │
│  │ • Axios for HTTP requests                        │  │
│  └──────────────────────────────────────────────────┘  │
│  Port: 5173 (Development) / 5173 (Production)         │
└──────────────────┬──────────────────────────────────────┘
                   │ REST API Calls
                   │ http://localhost:8080/api
                   ▼
┌─────────────────────────────────────────────────────────┐
│    Backend (Spring Boot 3 + Java 21 + PostgreSQL)       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ REST Controllers                                 │  │
│  │   ├── AuthController                             │  │
│  │   ├── ProductController                          │  │
│  │   ├── OrderController                            │  │
│  │   ├── ShopController                             │  │
│  │   └── UserController                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Service Layer (Business Logic)                   │  │
│  │   ├── AuthService (JWT, OAuth)                   │  │
│  │   ├── ProductService                             │  │
│  │   ├── OrderService                               │  │
│  │   ├── PaymentService (Razorpay Integration)      │  │
│  │   └── NotificationService                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Repository Layer (Data Access)                   │  │
│  │   ├── UserRepository                             │  │
│  │   ├── ProductRepository                          │  │
│  │   ├── OrderRepository                            │  │
│  │   ├── ShopRepository                             │  │
│  │   └── PaymentRepository                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Security Configuration                           │  │
│  │   ├── JWT Token Authentication                   │  │
│  │   ├── CORS Configuration                         │  │
│  │   ├── Spring Security                            │  │
│  │   └── Role-Based Access Control (RBAC)           │  │
│  └──────────────────────────────────────────────────┘  │
│  Port: 8080                                             │
│  Context Path: /api                                     │
└──────────────────┬──────────────────────────────────────┘
                   │ JDBC/JPA
                   ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL Database (Port: 5432)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Tables:                                          │  │
│  │ • users (Authentication & User Data)             │  │
│  │ • products (Product Catalog)                     │  │
│  │ • shops (Shop Information)                       │  │
│  │ • orders (Order Management)                      │  │
│  │ • payments (Payment Records)                     │  │
│  │ • reviews (User Reviews)                         │  │
│  │ • categories (Product Categories)                │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── ui/              # UI components (Button, Card, etc.)
│   │   ├── layout/          # Layout components
│   │   ├── forms/           # Form components
│   │   └── common/          # Common components
│   ├── pages/               # Page components (routes)
│   │   ├── auth/            # Authentication pages
│   │   ├── products/        # Product pages
│   │   ├── shops/           # Shop pages
│   │   ├── orders/          # Order pages
│   │   └── profile/         # User profile pages
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   └── useOrders.ts
│   ├── services/            # API client services
│   │   ├── api.ts           # Axios instance
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── payment.service.ts
│   ├── store/               # State management (Zustand)
│   │   ├── auth.store.ts
│   │   ├── product.store.ts
│   │   └── cart.store.ts
│   ├── lib/                 # Utilities and helpers
│   │   ├── api-client.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   └── common.types.ts
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env.example             # Environment template
├── .env.local               # Local environment (git ignored)
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies
├── Dockerfile               # Docker image config
└── README.md                # Frontend documentation
```

### Backend Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/marketlocalshops/
│   │   │   ├── controller/              # REST Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── OrderController.java
│   │   │   │   ├── ShopController.java
│   │   │   │   └── UserController.java
│   │   │   ├── service/                 # Business Logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── ProductService.java
│   │   │   │   ├── OrderService.java
│   │   │   │   ├── PaymentService.java
│   │   │   │   └── NotificationService.java
│   │   │   ├── repository/              # Data Access
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── OrderRepository.java
│   │   │   │   ├── ShopRepository.java
│   │   │   │   └── PaymentRepository.java
│   │   │   ├── entity/                  # JPA Entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Product.java
│   │   │   │   ├── Order.java
│   │   │   │   ├── Shop.java
│   │   │   │   ├── Payment.java
│   │   │   │   └── Review.java
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── config/                  # Configuration Classes
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── JwtConfig.java
│   │   │   ├── security/                # Security Components
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   └── JwtAuthenticationFilter.java
│   │   │   ├── exception/               # Exception Handlers
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── CustomException.java
│   │   │   └── Application.java         # Main Application Class
│   │   ├── resources/
│   │   │   ├── application.yml          # Spring configuration
│   │   │   ├── application-dev.yml      # Development profile
│   │   │   ├── application-prod.yml     # Production profile
│   │   │   └── db/migration/            # Flyway migrations
│   │   │       ├── V1__Initial_Schema.sql
│   │   │       ├── V2__Add_Users_Table.sql
│   │   │       └── V3__Add_Products_Table.sql
│   ├── test/
│   │   └── java/com/marketlocalshops/
│   │       ├── controller/              # Controller Tests
│   │       ├── service/                 # Service Tests
│   │       └── integration/             # Integration Tests
├── pom.xml                  # Maven dependencies
├── mvnw                     # Maven wrapper (Linux/Mac)
├── mvnw.cmd                 # Maven wrapper (Windows)
├── .env.example             # Environment template
├── .env.local               # Local environment (git ignored)
├── Dockerfile               # Docker image config
├── docker-compose.yml       # Docker Compose config
└── README.md                # Backend documentation
```

---

## 🔌 API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/refresh-token     # Refresh JWT token
POST   /api/auth/logout            # User logout
GET    /api/auth/me                # Get current user
```

### Product Endpoints

```
GET    /api/products               # Get all products
GET    /api/products/:id           # Get product by ID
POST   /api/products               # Create product (Admin)
PUT    /api/products/:id           # Update product (Admin)
DELETE /api/products/:id           # Delete product (Admin)
GET    /api/products/category/:cat # Get products by category
```

### Shop Endpoints

```
GET    /api/shops                  # Get all shops
GET    /api/shops/:id              # Get shop by ID
POST   /api/shops                  # Create shop
PUT    /api/shops/:id              # Update shop
DELETE /api/shops/:id              # Delete shop
```

### Order Endpoints

```
GET    /api/orders                 # Get user orders
GET    /api/orders/:id             # Get order by ID
POST   /api/orders                 # Create order
PUT    /api/orders/:id             # Update order status
DELETE /api/orders/:id             # Cancel order
```

### Payment Endpoints

```
POST   /api/payments/create        # Create payment (Razorpay)
POST   /api/payments/verify        # Verify payment
GET    /api/payments/:id           # Get payment details
```

---

## 🔐 Authentication Flow

```
1. User submits login credentials
   └─> Frontend: POST /api/auth/login

2. Backend validates credentials
   └─> Service: AuthService.authenticate()

3. Backend generates JWT token
   └─> Security: JwtTokenProvider.generateToken()

4. Token sent to frontend
   └─> Response: {token, refreshToken, user}

5. Frontend stores token in localStorage
   └─> State: auth.store.ts

6. Subsequent requests include Authorization header
   └─> Header: Authorization: Bearer {token}

7. Backend validates token
   └─> Filter: JwtAuthenticationFilter

8. Access granted/denied based on roles
   └─> Config: SecurityConfig with @PreAuthorize
```

---

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'USER',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id BIGINT NOT NULL,
  shop_id BIGINT NOT NULL,
  quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🐳 Docker & Deployment

### Development Environment

Using `docker-compose.yml`:
- **PostgreSQL**: Port 5432
- **Backend**: Port 8080
- **Frontend**: Port 5173
- **Network**: namma-market-network (bridge)

### Production Deployment

Options:
1. **Docker Hub**: Push images and deploy
2. **Kubernetes**: Use manifests in `k8s/` directory
3. **Cloud**: Vercel (frontend), AWS/Heroku (backend)
4. **VM**: SSH deploy to server

---

## 🔄 Data Flow Example: Creating an Order

```
1. User clicks "Place Order" in frontend
   └─> State updated in cart.store.ts

2. Frontend sends POST /api/orders
   └─> Request: {items: [{productId, quantity}], shopId}

3. Backend receives in OrderController
   └─> @PostMapping("/")
   └─> public ResponseEntity<OrderResponse> createOrder()

4. Controller calls OrderService
   └─> service.createOrder(request)

5. Service validates inventory
   └─> Check ProductRepository.findById(productId)

6. Service creates Order entity
   └─> repository.save(order)

7. Service creates OrderItems
   └─> repository.saveAll(orderItems)

8. PaymentService initiates payment
   └─> Razorpay API integration

9. Backend returns order details
   └─> Response: {orderId, paymentLink, status}

10. Frontend receives response
    └─> Update state and redirect to payment

11. User completes payment on Razorpay
    └─> Webhook calls /api/payments/verify

12. Order status updated to CONFIRMED
    └─> Database updated
```

---

## 📊 Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- TanStack Query
- Zustand
- Axios
- Zod
- React Router v6

### Backend
- Spring Boot 3
- Java 21
- Spring Security
- Spring Data JPA
- Flyway
- PostgreSQL Driver
- JWT (JJWT)
- Lombok
- MapStruct
- Spring AMQP (RabbitMQ)
- Spring Kafka

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 16
- Docker Network

---

**This architecture ensures scalability, security, and maintainability!**
