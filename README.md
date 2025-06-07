# 🏗️ Online Food Delivery System Microservices

Online food delivery system using **Microservices** architecture with **Event-Driven Architecture (EDA)**, built with **NestJS**, **Kafka**, and **PostgreSQL**.

## 📋 Table of Contents

-   [System Overview](#-system-overview)
-   [System Architecture](#️-system-architecture)
-   [Service Roles](#-service-roles)
-   [Technologies Used](#️-technologies-used)
-   [Installation Guide](#-installation-guide)

## 🔍 System Overview

The system consists of 4 main microservices operating independently and communicating via Apache Kafka:

-   **Auth Service**: API Gateway + Authentication & Authorization
-   **Inventory Service**: Product & Inventory Management
-   **Order Service**: Order Processing & Management
-   **Tracking Service**: Order Tracking & Delivery Simulation

## 🏛️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Gateway    │    │     Kafka       │
│   (Client)      ├────┤  (Auth Service) ├────┤   (Message Bus) │
│                 │    │   Port: 3000    │    │   Port: 9092    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                       ┌────────┼───────────────────────┼─────────┐
                       │        │                       │         │
              ┌─────────▼───┐ ┌──▼──────────┐ ┌─────────▼────┐ ┌──▼─────────┐
              │ Inventory   │ │Order Service │ │Tracking      │ │PostgreSQL  │
              │ Service     │ │              │ │Service       │ │Databases   │
              │Port: 3001   │ │              │ │              │ │            │
              └─────────────┘ └─────────────────┘ └──────────────┘ └────────────┘
```

### 🔄 Communication Patterns

1. **Synchronous**: Frontend ↔ Auth Service (REST APIs)
2. **Asynchronous**: Service-to-Service communication via Kafka events
3. **Request-Response**: Using Kafka for data queries between services

## 👥 Service Roles

### 🔐 Auth Service (API Gateway)

-   **Port**: 3000
-   **Database**: PostgreSQL (Users)
-   **Main Role**:
    -   API Gateway for the entire system
    -   Authentication & Authorization with JWT
    -   Role-based access control (BUYER/SELLER)
    -   Proxy requests to other services

**Detailed Functions**:

-   ✅ User registration/login
-   ✅ JWT token management
-   ✅ Role-based guards (BUYER/SELLER)
-   ✅ Product management APIs (proxy to Inventory Service)
-   ✅ Order management APIs (proxy to Order Service)
-   ✅ Request routing and load balancing

**API Endpoints**:

```
POST /auth/register     # Register user
POST /auth/login        # Login
GET  /auth/profile      # Get user information
POST /auth/logout       # Logout

# Product APIs (SELLER only)
POST   /product         # Create product
GET    /product         # Get seller's products
PUT    /product/:id     # Update product
DELETE /product/:id     # Delete product

# Public Product APIs
GET /product/all        # Get all products
GET /product/:id        # Get product details

# Order APIs (BUYER only)
POST /order             # Create order
GET  /order             # Get order history
GET  /order/:id         # Get order details
PUT  /order/:id/cancel  # Cancel order
```

### 📦 Inventory Service

-   **Port**: 3001
-   **Database**: PostgreSQL (Products, InventoryHistory)
-   **Main Role**: Product and inventory management

**Detailed Functions**:

-   ✅ Product CRUD operations
-   ✅ Stock management and inventory tracking
-   ✅ Product search and filtering
-   ✅ Inventory history logging
-   ✅ Stock validation for orders

**Kafka Events**:

```
# Receive events
product.created    # Create new product
product.updated    # Update product
product.deleted    # Delete product
order.delivered    # Update stock after delivery
order.cancelled    # Handle order cancellation

# Response patterns
get.allproducts    # Return all products
get.productsbyuser # Return user's products
get.productbyid    # Return product details
```

### 🛒 Order Service

-   **Database**: PostgreSQL (Orders, OrderItems)
-   **Main Role**: Order processing and management

**Detailed Functions**:

-   ✅ Order creation and validation
-   ✅ Order status tracking
-   ✅ Order history management
-   ✅ Order cancellation
-   ✅ Integration with Inventory and Tracking services

**Kafka Events**:

```
# Receive events
order.created      # Process new order
order.cancelled    # Handle order cancellation
order.delivered    # Update delivery status

# Send events
order.confirmed    # Confirm order

# Response patterns
get.orderhistory   # Return order history
get.orderbyid      # Return order details
```

### 🚚 Tracking Service

-   **Main Role**: Order tracking and delivery simulation

**Detailed Functions**:

-   ✅ Order status updates
-   ✅ Delivery simulation with real timeline
-   ✅ Real-time tracking notifications
-   ✅ Automatic status progression

**Kafka Events**:

```
# Receive events
order.confirmed    # Start tracking
order.cancelled    # Stop tracking

# Send events
order.status_updated # Update status
order.delivered      # Complete delivery
```

**Delivery Timeline**:

```
CONFIRMED → PROCESSING (30s) → SHIPPED (60s) → DELIVERED (90s)
```

## 🚀 Installation Guide

### Prerequisites

-   **Docker** and **Docker Compose** (required)
-   **Node.js** 18+ (for local development)
-   **Git** to clone repository

### 1. Clone Repository

```bash
git clone <repository-url>
cd EDA-Project
```

### 2. Setup Environment Variables

Create `.env.development` file for each service:

**.env.development**:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/name_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRATION="24h"
PORT=3000
NODE_ENV=development
```

### 3. Start Infrastructure with Docker Compose

```bash
# Initialize entire infrastructure (Kafka, Zookeeper, PostgreSQL)
docker-compose up -d

# Check services status
docker-compose ps

# View logs of all services
docker-compose logs -f

# View logs of specific service
docker-compose logs -f kafka
docker-compose logs -f zookeeper
```

### 4. Install Dependencies and Database Migration

**For each service, execute:**

```bash
# Auth Service
cd auth-service
npm install
npm run prisma generate
npm run prisma:migrate-save
cd ..

# Inventory Service
cd inventory-service
npm install
npm run prisma generate
npm run prisma:migrate-save
cd ..

# Order Service
cd order-service
npm install
npm run prisma generate
npm run prisma:migrate-save
cd ..

# Tracking Service
cd tracking-service
npm install
cd ..
```

### 5. Start Services

**Option 1: Run all services with Docker**

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

**Option 2: Run each service separately (Development)**

```bash
# Terminal 1: Auth Service
cd auth-service
npm run start:dev

# Terminal 2: Inventory Service
cd inventory-service
npm run start:dev

# Terminal 3: Order Service
cd order-service
npm run start:dev

# Terminal 4: Tracking Service
cd tracking-service
npm run start:dev
```
