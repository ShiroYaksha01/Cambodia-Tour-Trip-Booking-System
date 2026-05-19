# Cambodia Tour Trip Booking System

A full-stack application for managing tour bookings in Cambodia. Built with **NestJS** (Backend) and **Vue 3** (Frontend).

---


# Project Overview — Anajak Tour

## Introduction

**Anajak Tour** is a web-based tourism platform designed to help tourists and local travelers in Cambodia discover, compare, and book tourism-related services within a single centralized system. Instead of searching for tour providers, hotels, transportation services, or accommodations individually across different platforms, users can browse and book services conveniently through one integrated platform.

The platform functions similarly to how food delivery applications like GrabFood gather restaurants into one marketplace, but Anajak Tour focuses on tourism services within Cambodia. The system supports domestic travel routes such as Phnom Penh to Siem Reap, Kampot, Mondulkiri, Koh Rong, and other Cambodian destinations.

Anajak Tour aims to simplify trip planning by allowing customers to search and book complete travel packages or individual tourism services directly from providers.

---

# System Objectives

The main objectives of Anajak Tour are:

- To centralize tourism-related services into a single platform
- To simplify the process of discovering and booking tours in Cambodia
- To provide providers with a digital platform to promote and manage their services
- To support online booking and mock e-payment processing
- To allow administrators to monitor bookings, providers, and platform revenue

---

# Main Features

## Guest Features

Guests can:
- Browse the homepage
- Search and view available services
- View service details
- Register and login to the system

---

## Customer Features

Customers can:
- Manage personal profiles
- Browse tourism services and packages
- Make direct bookings for services
- Complete checkout using a simulated payment system
- View booking history and booking details
- View booking payment status
- Leave reviews for services
- Submit support tickets or report bad services
- Download booking information and itinerary as PDF for offline access

---

## Provider Features

Providers can:
- Manage provider profile information
- Create, update, and delete tourism services
- Manage tour packages or individual services
- View customer bookings
- Monitor revenue and platform commission deductions
- Manage inventory and service capacity (e.g., limited van seats or room availability)
- View payment status of bookings

---

## Admin Features

Administrators can:
- Manage customers and providers
- View all bookings within the platform
- Monitor platform revenue and provider earnings
- View payment information and transaction records
- Handle reports and support tickets
- Monitor overall system activity through the admin dashboard

---

# Booking and Payment Workflow

The platform uses a direct booking workflow:

1. Customer browses and selects a service
2. Customer chooses quantity and booking details
3. The system creates a pending booking
4. Customer proceeds to the payment page
5. The payment process is simulated (mock payment)
6. After successful payment:
   - Booking status becomes confirmed
   - Payment status becomes paid
   - Platform commission is calculated
   - Provider earnings are recorded

The system does not perform real money transfers. Instead, payment information and transaction records are simulated and stored in the database to demonstrate the business workflow of an online booking platform.

---

# Technology Stack

## Frontend
- Vue.js
- TypeScript
- Vue Router
- Pinia

---

## Backend
- NestJS
- TypeScript
- PostgreSQL
- TypeORM

---

## Development Tools
- Docker
- Postman
- GitHub
- Figma

---

# System Roles

The system contains three main authenticated roles:

| Role | Purpose |
|---|---|
| Customer | Browse and book tourism services |
| Provider | Manage services and bookings |
| Admin | Monitor and manage the platform |

Guests can also browse public pages without authentication.

---

# Scope Limitation

To keep the project manageable within the academic development timeline, several advanced features are simplified or excluded:


- Real payment gateway integration is replaced with mock payment simulation
- Real-time chat functionality is excluded
- Seasonal pricing is excluded
- International flight booking is not included
- The platform focuses only on tourism services within Cambodia

---

# Expected Outcome

By the end of development, Anajak Tour will provide:
- A centralized tourism booking platform
- Role-based management system
- Booking and mock payment workflow
- Provider business management features
- Administrative monitoring dashboard

The project demonstrates full-stack web development concepts including authentication, role-based authorization, database management, booking workflows, payment simulation, and RESTful API integration.


## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ 
- **PostgreSQL**: v14+ 
- **npm**: v9+

---

### 2. Backend Setup (`/backend`)

1.  **Install dependencies**:
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Configuration**:
    Create a `.env` file in the `backend` folder:
    ```env
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USER=your_user
    DATABASE_PASSWORD=your_password
    DATABASE_NAME=tour_booking
    JWT_SECRET=your_super_secret_key
    JWT_EXPIRATION=1d
    PORT=3000
    ```

3.  **Database Migration**:
    Initialize your database schema:
    ```bash
    npm run migration:run
    ```

4.  **Start the server**:
    ```bash
    npm run start:dev
    ```

---

### 3. Frontend Setup (`/frontend`)

1.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The app will usually be available at `http://localhost:5173`.

---

## Database Management (TypeORM Migrations)

Always use migrations to keep the database in sync between developers.

- **Generate Migration**: After changing an `.entity.ts` file:
  ```bash
  npm run migration:generate -- src/database/migrations/DescriptionOfChange
  ```
- **Apply Migrations**:
  ```bash
  npm run migration:run
  ```
- **Revert**:
  ```bash
  npm run migration:revert
  ```

---

## GitHub Workflow (For Developers)

Before pushing your code to GitHub, follow these critical steps:

### 1. Security Check
- **NEVER** commit the `.env` file. It is already added to `.gitignore`.
- If you add new environment variables, update the `.env.example` file (if available) or inform the team.

### 2. Clean Code & Build
Run linting and ensure the project builds locally:
```bash
# In backend
npm run lint
npm run build

# In frontend
npm run build
```

### 3. Standard Push Process
1.  **Pull latest changes**: `git pull origin main`
2.  **Check status**: `git status`
3.  **Add changes**: `git add .`
4.  **Commit with a clear message**: `git commit -m "feat: add user registration logic"`
5.  **Push**: `git push origin your-branch-name`

---

## Project Structure

-   `backend/`: NestJS application, TypeORM entities, and migrations.
-   `frontend/`: Vue 3 application with Vite and TailwindCSS.
-   `backend/src/database/migrations/`: History of database changes.
-   `backend/src/modules/`: Business logic separated by features (Auth, Users, Providers).
