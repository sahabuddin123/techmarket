# TechMarket BD — Enterprise E-Commerce & Surveillance Ecosystem
## Full System Architecture, Domain Models & Technical Documentation

---

## 1. System Overview

**TechMarket BD** is a high-performance, enterprise-grade e-commerce platform and specialized surveillance engineering system built on **Laravel 12 (PHP 8.4+)**, **React + TypeScript (Inertia.js)**, **MySQL 8**, and **Redis**.

The platform powers a multi-channel consumer storefront alongside an advanced **CCTV System Builder / Estimator Engine** capable of calculating complex bills of materials (BOM), storage requirements, cable losses, PoE power budgets, installation services, after-sales warranties, multi-site enterprise project management, and executive business intelligence.

---

## 2. Technology Stack & Key Libraries

- **Backend Framework**: Laravel 12.x on PHP 8.4+
- **Frontend Layer**: React 18 + TypeScript, Inertia.js client-side routing
- **Styling & Design System**: Tailwind CSS v3 / Vanilla CSS design tokens with support for multiple storefront versions (`v1`, `v2`, `v3`)
- **Database**: MySQL 8.0 with transactional engines, strict foreign keys, and indexes
- **Caching & Queue**: Redis
- **Icons & Visuals**: `lucide-react`
- **Testing**: PHPUnit with feature suites covering 100% of calculation rules, quotation workflows, warranty operations, and analytics

---

## 3. Storefront Version Registry Architecture

The platform supports dynamic, hot-swappable storefront versions:
- **Version 1 (`v1`)**: Classic e-commerce layout with high product density.
- **Version 2 (`v2`)**: Modern tech retail experience featuring high-impact hero banners, flash sales, quick-action cards, and trust badges.
- **Version 3 (`v3`)**: Premium tech lifestyle experience featuring gadget showcases, video review integrations, and split trending sections.

All versions resolve through the unified `versionRegistry.js` and render seamlessly across desktop and mobile devices.

---

## 4. CCTV Estimator & Surveillance Engine (Phases 1–10)

The CCTV Estimator is an end-to-end rules-driven surveillance system builder structured into 10 distinct phases:

### Phase 1 — Domain & Database Architecture
- **Catalog Integration**: Extends `products` with `cctv_product_profiles` storing technical attributes:
  - System architecture (`ip_poe`, `analog_hdtvi`, `analog_hdcvi`, `analog_ahd`, `wireless_wifi`).
  - Video resolution (`2mp_1080p`, `4mp_2k`, `8mp_4k`).
  - Compression codecs (`h264`, `h265`, `h265_plus`).
  - Maximum storage capacity (SATA bays, max TB per bay).
  - PoE channel budget & maximum wattage per port.
- **Data Integrity**: Dedicated database enums for `CctvSystemType`, `CctvResolution`, `CctvCodec`, `CctvStorageLocation`, `CctvPremiseType`, and `CctvQuoteStatus`.

### Phase 2 — Calculation, Compatibility & Recommendation Engine
- **Storage Calculator (`CctvStorageCalculator.php`)**:
  - Authoritative calculation: $\text{Storage (GB)} = \frac{\text{Bitrate (Kbps)} \times 3600 \times \text{Hours/Day} \times \text{Days} \times \text{Motion Factor}}{8 \times 1024 \times 1024}$.
  - Applies 40% compression gain for `h265` and 70% efficiency for `h265_plus`.
- **Cable Calculator (`CctvCableCalculator.php`)**:
  - Distance calculation factoring multi-floor vertical risers, per-run margins, and bulk roll sizing (305m per box).
- **Power & PoE Budget Calculator (`CctvPowerAndPoeCalculator.php`)**:
  - Port-level PoE budget verification with 20% safety margin and UPS backup runtime calculations.
- **Compatibility Engine (`CctvCompatibilityService.php`)**:
  - Real-time validation preventing mismatched architectures (e.g. Analog cameras with IP NVRs, or camera counts exceeding recorder channel capacity).

### Phase 3 — Admin Configuration Suite
- Comprehensive admin management suite:
  - **Product Profiles**: Technical metadata editor attached to catalog products.
  - **Rule Engine**: Dynamic compatibility and recommendation rule configuration.
  - **Calculation Parameters**: Real-time adjustment of bitrates, FPS multipliers, and safety margins.
  - **Live Rule Tester**: Sandbox for testing calculation algorithms against live inventory.

### Phase 4 — Customer-Facing CCTV Estimator UI
- Step-by-step interactive wizard (`/cctv-estimator`):
  1. Premise type & surveillance purpose selection.
  2. Camera channel count and environment distribution (indoor vs outdoor, night vision range).
  3. Recorder and storage retention duration (days / recording mode).
  4. Cabling distance and accessory bundling.
  5. Installation package selection.
  6. Instant, real-time BOM generation and checkout integration.

### Phase 5 — Advanced Builder UX, Presets & Comparison
- **Budget Matching Engine**: Recommends system packages fitting within client-specified target budgets.
- **Configuration Presets**: Automatic generation of `Value Budget`, `Balanced Commercial`, and `Pro Enterprise` presets based on premise type.
- **System Comparison Matrix**: Side-by-side technical comparison of different configurations.

### Phase 6 — Professional Quotation, PDF, Cart & Checkout
- **Instant Quotation Generation**: Generates shareable quotations (`/cctv/quote/{token}`) with 7-day validity.
- **Printable Blade Layout**: Formatted commercial PDF/print layout (`/cctv/quote/{token}/print`).
- **Cart & Order Conversion**: Direct "Accept & Checkout" workflow snapshotting BOM line items directly into the e-commerce order system.

### Phase 7 — Installation & Site Survey Management
- **Site Survey Booking**: Customers can schedule on-site technician evaluations (`/cctv/site-survey`).
- **Work Orders**: Admin dispatch system for managing field technician assignments, scheduled dates, and pre-installation checklists.

### Phase 8 — After-Sales, Warranty & Service Center
- **Installed Equipment Register (`cctv_installed_equipment`)**: Tracks serial numbers, installation dates, and locations.
- **Hardware Warranties (`cctv_warranties`)**: Auto-provisions and monitors manufacturer/extended warranty validity.
- **Customer Support Hub**: Client self-service portal for tracking equipment health and opening trouble tickets.
- **Admin Service Center**: Technician dispatch, spare parts consumption, and warranty claim processing.

### Phase 9 — Enterprise Project Management
- **Multi-Site Hierarchy**: Structure large projects into `Projects` &rarr; `Sites` &rarr; `Buildings` &rarr; `Floors` &rarr; `Zones`.
- **Project Change Requests**: Formal engineering change orders for enterprise clients.
- **Formal Project Handover**: Digital sign-off and site commissioning documentation.

### Phase 10 — Enterprise Analytics & Business Intelligence
- **Authoritative Executive KPIs**: Net CCTV revenue, quote pipeline value, conversion rates, and hardware counts.
- **Date Range Bracketing**: Timezone-aware (`Asia/Dhaka`) filtering across custom dates, months, quarters, and years.
- **5-Stage Conversion Funnel**: Tracks user journey from estimate creation to paid order.
- **Operational Alert Center**: Proactive alerts for expiring hardware warranties, urgent service tickets, and unassigned work orders.
- **Custom Report Builder**: Exportable reporting tool for management and accounting.

---

## 5. Directory Structure & Key Files

```text
├── app/
│   ├── Enums/Cctv/                 # CCTV Domain Enums
│   ├── Http/Controllers/
│   │   ├── Admin/
│   │   │   ├── CctvAdminController.php
│   │   │   └── CctvAnalyticsAdminController.php
│   │   ├── CctvCustomerServiceController.php
│   │   ├── CctvEnterpriseProjectController.php
│   │   ├── CctvEstimatorController.php
│   │   ├── CctvInstallationController.php
│   │   └── CctvQuoteViewController.php
│   ├── Models/Cctv/                # CCTV Eloquent Models
│   ├── Repositories/Cctv/          # Product Profiles & Estimation Repositories
│   └── Services/Cctv/              # Calculation & Analytics Services
├── database/
│   ├── migrations/                 # CCTV Database Schemas
│   └── seeders/                    # TechMarket Gadget & Catalog Seeders
├── resources/
│   ├── js/
│   │   ├── Components/Admin/       # Admin Sidebar & Header
│   │   ├── Pages/
│   │   │   ├── Account/            # Customer Portal (Equipment, Service, Projects)
│   │   │   ├── Admin/Cctv/         # Admin CCTV Suites (7 Config + 3 Analytics)
│   │   │   └── CctvEstimator.jsx   # Customer-Facing Wizard
│   │   └── types/cctv.d.ts         # TypeScript Contracts
│   └── views/cctv/                 # Printable Quotation Blade Templates
└── tests/Feature/                  # 10 Test Suites (31 Passing Tests)
```

---

## 6. Running Tests & Compiling Assets

### Automated PHPUnit Tests
Run all CCTV test suites:
```bash
php artisan test --filter=Cctv
```

### Building Frontend Assets
Compile production assets:
```bash
npm run build
```

---

## 7. Security & Business Rules

1. **Authentication & Authorization**: Protected under Laravel authentication middleware with role/permission checks (`Admin`, `Super Admin`, `Staff`).
2. **Audit Logging**: All administrative mutations, rule updates, equipment registrations, and report saves are logged via `AuditLogger`.
3. **Data Integrity**: Enforced foreign key constraints with cascade/nullify rules prevent orphaned hardware or estimate records.
4. **Live Price Validation**: Cart additions from the Estimator strictly re-verify real-time catalog pricing and inventory stock levels.
