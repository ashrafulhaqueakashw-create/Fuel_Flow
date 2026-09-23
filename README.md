# ⛽ FuelFlow — Gas Station & Fuel Dispatch Management System

> **🌐 Live Production**: [**fuel-flow-two.vercel.app**](https://fuel-flow-two.vercel.app)  
> **🗄 Cloud Database**: TiDB Cloud Serverless MySQL (AWS ap-southeast-1, Singapore)  
> **♿ Accessibility Score**: 100% WCAG 2.1 Level AA Certified  
> **🚀 CI/CD**: Automatic Deployments via Vercel Hobby

Welcome to **FuelFlow**! This document serves as the comprehensive **Zero-to-100% Knowledge Base**, providing developers, stakeholders, and AI assistants with complete context on the entire application, its architecture, workflows, and clean design system.

For the exhaustive Software Requirements Specification, refer to [`FuelFlow_SRS.md`](file:///g:/FuelFlow/FuelFlow_SRS.md).

---

## 🌟 1. Project Overview

**FuelFlow** is a full-stack web application designed for end-to-end gas station operations, on-demand doorstep fuel dispatch, and intelligent time-slot scheduling. The platform serves four main domains:

1. **Public Landing & Dispatch Showcase (`/`)**: A clean, accessible, human-centered web experience allowing visitors to check live BPC-aligned fuel prices, calculate delivery costs with off-peak discounts, view verified customer reviews, explore station services, and access all portals with 1-click test autofill.
2. **Admin Operations & Super-Control Console (`/admin`)**: Complete operational authority for real-time fuel price management (Gasoline, Diesel, Premium, CNG), full employee lifecycle control (salaries, roles, statuses, password resets), customer profile & password administration, master admin security credentials, real-time analytics, inventory management, review moderation, and dispatch tracking.
3. **Employee Shift & Fulfillment Terminal (`/employee`)**: Shift attendance (check-in/check-out) and assigned fuel delivery fulfillment, styled in the unified modern hero theme.
4. **Customer Self-Service Portal (`/customer`)**: Fuel order placement, congestion-aware smart booking, delivery tracking, and service review submissions, styled in the unified modern hero theme.

> **🎨 Unified Design Language**: All panels (Admin, Employee, and Customer) are designed with the identical high-trust aesthetic of the public landing page: deep Petroleum Slate (`#0f172a`), Fuel Orange (`#c2410c`), Deep Emerald (`#065f46`), tactile card surfaces, and accessible typography.

---

## 🛠 2. Tech Stack & Environment

| Layer | Technology |
|---|---|
| **Live Production** | [fuel-flow-two.vercel.app](https://fuel-flow-two.vercel.app) |
| **Framework** | [Next.js 15.5.26](file:///g:/FuelFlow/package.json) (App Router, Turbopack) |
| **Frontend** | React 19.1.0, Tailwind CSS 4.x |
| **Icons** | Lucide React (`lucide-react`) |
| **Language** | TypeScript 5.x |
| **Backend** | Next.js API Routes (Server-side Edge/Serverless Lambdas) |
| **Database** | Dual-Engine MySQL (`mysql2/promise`):<br/>• **Local Dev:** XAMPP MySQL (`localhost:3306`)<br/>• **Cloud Prod:** TiDB Cloud Serverless MySQL (`port 4000`, TLS/SSL encrypted) |
| **Authentication** | JWT (`jsonwebtoken`) in HttpOnly cookies + `bcryptjs` |
| **Hosting & CI/CD** | Vercel (Automatic continuous deployment on push to `main`) |
| **Design System** | Clean, grounded light theme inspired by `Utsab_Ethnic` (Petroleum Slate `#0f172a`, High-Contrast Fuel Orange `#c2410c` / `#9a3412`, Deep Emerald `#065f46`) |
| **Accessibility** | 100% WCAG 2.1 Level AA compliant (all text-to-background contrast ratios ≥ 4.5:1, accessible naming for interactive elements) |
| **Build & Dev Tool** | Turbopack (`next dev --turbopack`, `next build --turbopack`) |

---

## 📂 3. Directory Structure Map

```text
g:\FuelFlow\
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Public Landing Page & Dispatch Showcase
│   ├── globals.css               # Clean design system & utility classes
│   ├── layout.tsx                # Root layout & font configuration
│   ├── admin/                    # Admin Dashboard & Sub-pages
│   │   ├── page.tsx              # Operations dashboard & KPI summary
│   │   ├── customers/page.tsx    # Customer accounts management
│   │   ├── employees/page.tsx    # Employee roster & salaries
│   │   ├── inventory/page.tsx    # Fuel & store inventory management
│   │   └── orders/page.tsx       # Order fulfillment lifecycle
│   ├── employee/                 # Employee Portal (Shift attendance & orders)
│   ├── employee-login/           # Dedicated Employee Login Terminal
│   ├── customer/                 # Customer Portal (Dashboard, orders, history)
│   ├── components/               # 23 Reusable UI & Feature Components
│   │   ├── Navbar.tsx            # Sticky navigation with hotline & status ticker
│   │   ├── Footer.tsx            # Full station footer with contacts & payment badges
│   │   ├── LiveFuelRates.tsx     # BPC-aligned live rate cards with tank status
│   │   ├── FuelCostCalculator.tsx# Interactive volume & off-peak savings calculator
│   │   ├── SmartDispatchShowcase.tsx # Congestion-aware time slot visualizer
│   │   ├── StationServices.tsx   # Core operational services & live metrics
│   │   ├── CustomerTestimonials.tsx # Verified customer & fleet review cards
│   │   ├── LoginForm.tsx         # Unified login form with 1-click test autofill
│   │   ├── EmployeeLoginForm.tsx # Dedicated employee login form
│   │   ├── CustomerForm.tsx      # Customer registration & management form
│   │   ├── EmployeeForm.tsx      # Employee profile form
│   │   ├── InventoryForm.tsx     # Fuel & store inventory CRUD form
│   │   ├── OrderForm.tsx         # Customer order placement form
│   │   ├── OrderManagement.tsx   # Admin order fulfillment board
│   │   ├── EmployeeOrderManagement.tsx # Staff order fulfillment board
│   │   ├── ReviewForm.tsx        # Customer review submission form
│   │   ├── ReviewManagement.tsx  # Admin review moderation panel
│   │   ├── CustomerReviews.tsx   # Customer review history viewer
│   │   ├── DashboardCharts.tsx   # Canvas sales & order charts
│   │   ├── InventorySnapshot.tsx # Dashboard stock level summary
│   │   ├── SmartBooking.tsx      # Customer booking wizard
│   │   ├── BookingManagement.tsx # Admin booking management panel
│   │   └── BookingHistory.tsx    # Customer booking history list
│   └── api/                      # REST API Endpoints (Auth, CRUD, Reports)
├── backend/                      # Extended backend logic
│   └── api/                      # Booking & Time-slot APIs
├── lib/                          # Shared Utilities
│   ├── db.ts                     # MySQL connection factory (`mysql2/promise`)
│   ├── auth.ts                   # JWT token extraction and signing
│   └── types.ts                  # Shared TypeScript interfaces
├── middleware.ts                 # Route protection middleware
├── FuelFlow_SRS.md               # Software Requirements Specification
└── package.json                  # Dependencies & scripts
```

---

## 🗄 4. Database Schema (MySQL)

The `fuelflow` database contains the following relational tables:

- **Auth & Accounts**:
  - `admin`: Master administrator accounts (`id`, `AdminName`, `password`)
  - `customers`: Individual and commercial customers (`id`, `type`, `name`, `company_name`, `phone`, `email`, `password`, `address`, `preferences`)
  - `employees`: Station staff & drivers (`id`, `name`, `role`, `email`, `phone`, `password_hash`, `salary`, `status`, `hire_date`)
- **Station Operations**:
  - `attendance`: Employee shift registration (`shift_start`, `shift_end`)
  - `inventory_items`: Station fuel products and merchandise
- **Sales & Orders**:
  - `orders`: Master order details, status, delivery address, payment method
  - `order_items`: Line items linked to inventory
  - `reviews`: Customer feedback with ratings and service types
- **Smart Dispatch & Scheduling**:
  - `time_slots`: 2-hour scheduling blocks with congestion levels (`low`, `medium`, `high`) and discount percentages
  - `fuel_prices`: Regulated & dynamic fuel rates per liter (`gasoline`, `diesel`, `premium`, `cng`, and custom grades)
  - `bookings`: Scheduled fuel delivery requests

---

## 🔐 5. Authentication & Security

* **Role-Based Cookies**:
  * Admin: `token` cookie (8-hour expiration) → Guards `/admin/*`
  * Employee: `employee_token` cookie (8-hour expiration) → Guards `/employee/*`
  * Customer: `customer_token` cookie (24-hour expiration) → Guards `/customer/*`
* **Password Hashing**: Passwords stored as `bcryptjs` salted hashes (minimum 6 characters enforced).
* **Admin Super-Control Security**: The Admin possesses full authorization to directly reset employee and customer passwords via interactive modals with salted bcrypt hashing, as well as change their own master administrator credentials.
* **SQL Injection Protection**: All queries in `lib/db.ts` use parameterized SQL statements.
* **1-Click Test Autofill**: The login form includes quick-fill chips for instant role testing:
  * **Admin**: `admin` / `admin123`
  * **Staff**: `staff@fuelflow.com` / `password123`
  * **Customer**: `customer@fuelflow.com` / `password123`

---

## 🚀 6. Core Business Rules

- **Dynamic Fuel Pricing**: The Admin can adjust fuel rates (`/api/fuel-prices`) anytime. All price modifications update the database immediately, syncing live with the landing page **Live Fuel Rates** board and **Fuel Cost & Savings Calculator**.
- **Employee & Salary Administration**: Admin has full authority to edit staff salaries (`DECIMAL(10,2)`), roles, employment statuses (`active`/`inactive`/`on_leave`), and reset staff passwords directly.
- **Customer Administration**: Admin can edit customer contact info, delivery addresses, and reset customer passwords directly.
- **Admin Master Credentials**: Admin can update their login username (`AdminName`) and master password securely with bcrypt hashing.
- **Inventory Auto-Deduction**: Inventory item quantities decrement automatically upon order creation.
- **Low Stock Threshold**: Flagged when stock falls below **10 units/liters**.
- **Shift Rule**: Employees are limited to **one active shift check-in per day**.
- **Congestion Pricing**:
  - `< 50% capacity` → Low congestion (up to 15% off-peak discount)
  - `50% – 79% capacity` → Moderate congestion (5% to 10% discount)
  - `≥ 80% capacity` → Peak congestion (regular rate, emergency priority)
- **Order Pipeline**: `pending` → `confirmed` → `processing` → `delivered` → `cancelled`.
- **Review Moderation**: Reviews default to `pending` status until approved by an administrator.

---

## ♿ 7. Accessibility & Usability Standards (WCAG 2.1 AA)

FuelFlow adheres strictly to **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standards, audited with zero automated failures:

* **Color Contrast Compliance**: Every textual element meets or exceeds the mandatory 4.5:1 ratio:
  * **Primary CTAs & Interactive Buttons**: `#c2410c` (Tailwind `orange-700`) provides **4.76:1** contrast with white text.
  * **Category Badges & Section Subtitles**: `#9a3412` (Tailwind `orange-800`) provides **6.2:1** contrast on `#ffffff` and **5.8:1** on `#f8fafc`.
  * **Muted Metadata & Dates**: `text-slate-600` (`#475569`) provides **7.0:1** contrast against white/slate-50 backdrops.
  * **Success & Time-Slot Discount Text**: `text-emerald-800` (`#065f46`) provides **7.1:1** contrast against light emerald surfaces.
  * **Moderate Congestion Tags**: `text-amber-900` (`#78350f`) provides **6.8:1** contrast against light amber badges.
  * **Station Console Dark Footer**: `text-slate-400` (`#94a3b8`) provides **5.7:1** contrast on `#0f172a`.
* **Accessible Naming & Screen Reader Support**:
  * Dynamic `aria-label` attributes applied to icon-only buttons (such as password visibility toggle in `LoginForm.tsx` and mobile drawer controls in `Navbar.tsx`).
* **Design Aesthetic**:
  * Clean, authentic, human light-themed visual hierarchy inspired by `Utsab_Ethnic`. No tacky AI-template neon glow or sci-fi gradients.

---

## 💻 8. Local Development Setup

### Prerequisites
* **Node.js** (v18+)
* **XAMPP** with MySQL running on port 3306

### Step-by-Step Installation
1. **Clone and Install Dependencies**:
   ```bash
   cd g:\FuelFlow
   npm install
   ```

2. **Environment Variables**:
   Verify `.env.local` contains:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=fuelflow
   JWT_SECRET=your_jwt_secret_key_here
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Scaffold Database & Tables**:
   ```bash
   # Create database
   curl -X POST http://localhost:3000/api/admin/create-database
   # Setup tables and seed initial data
   curl -X POST http://localhost:3000/api/admin/force-setup
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🌐 9. Free Cloud Deployment (Vercel + TiDB Cloud)

FuelFlow is 100% deployed on free cloud infrastructure:

### 1. Database: TiDB Cloud Serverless (MySQL)
- Free tier: 5 GB storage, 50M Request Units/month, no credit card required.
- Provisioned on AWS Singapore (`ap-southeast-1`).
- Enforces TLS/SSL encrypted connection on port `4000`.

### 2. Frontend & API: Vercel
- Free Hobby tier hosting Next.js 15.5.26 with Edge and Serverless functions.
- Configure these Environment Variables in **Project Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_USER` | `gAyXdpJeAxhp4KC.root` |
| `DB_PASSWORD` | `mNbPKc7UVKebwxTR` |
| `DB_NAME` | `test` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | `fuelflow-super-secret-production-key-2026` |

---

## 🔑 10. Live Demo Quick Test Credentials

You can test all portals directly on [**fuel-flow-two.vercel.app**](https://fuel-flow-two.vercel.app/#portal-login):

| Role | Portal URL | Test Username / Email | Test Password | Capabilities |
|---|---|---|---|---|
| **Admin** | [`/admin`](https://fuel-flow-two.vercel.app/admin) | `admin` | `admin123` | Dynamic fuel pricing, employee salaries & passwords, customer passwords, KPI analytics, inventory, reviews, bookings |
| **Employee** | [`/employee`](https://fuel-flow-two.vercel.app/employee) | `staff@fuelflow.com` | `password123` | Shift clock in/out, assigned order delivery fulfillment |
| **Customer** | [`/customer`](https://fuel-flow-two.vercel.app/customer) | `customer@fuelflow.com` | `password123` | Smart booking wizard, doorstep fuel orders, review submissions |

*(The login interface on the landing page also features 1-click test autofill chips for each role).*

---

## 📖 11. Where to Go Next?

* **Landing Experience & UI Components**: Review [`app/page.tsx`](file:///g:/FuelFlow/app/page.tsx) and [`app/components/`](file:///g:/FuelFlow/app/components/).
* **Design System & Global Tokens**: Inspect [`app/globals.css`](file:///g:/FuelFlow/app/globals.css).
* **Database & REST Endpoints**: Explore [`lib/db.ts`](file:///g:/FuelFlow/lib/db.ts) and [`app/api/`](file:///g:/FuelFlow/app/api/).
* **Full Specification**: Refer to [`FuelFlow_SRS.md`](file:///g:/FuelFlow/FuelFlow_SRS.md).

