# Meenavan | மீனவன் — Seafood E-commerce Platform Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Database Schema](#2-database-schema)
3. [API Documentation](#3-api-documentation)
4. [Laravel Backend Setup](#4-laravel-backend-setup)
5. [Next.js Frontend Setup](#5-nextjs-frontend-setup)

---

## 1. Project Overview

### Project Structure

```
meenavan-ecommerce/
├── frontend/
│   ├── public-site/         # Customer-facing website
│   └── admin-panel/         # Admin dashboard
├── backend/                 # Laravel API
└── docs/                    # Documentation
```

### Technology Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- Zustand (State Management)
- React Query (Data Fetching)
- Framer Motion (Animations)

**Backend**
- Laravel 10
- MySQL 8.0
- Laravel Sanctum (API Authentication)
- Laravel Queue (Job Processing)
- Laravel Storage (File Management)

**External Integrations**
- WhatsApp Business API
- Payment Gateway (Optional)
- Image CDN

### Application Structure

**Public Site (Customer Portal)**
- Product browsing and search
- Category filtering
- Shopping cart
- Checkout flow
- WhatsApp order integration
- User authentication
- Order tracking

**Admin Panel**
- Dashboard with analytics
- Product management (CRUD)
- Order management
- Customer management
- Offers and banners
- Delivery area configuration
- Business settings
- Reports and analytics

### Key Features

**Customer Features**
1. Browse seafood products with Tamil/English support
2. Filter by category, price, availability
3. Select weight and cutting options
4. Add to cart with real-time updates
5. Checkout with delivery details
6. WhatsApp order confirmation
7. Order history and tracking
8. User profile management

**Admin Features**
1. Product management with image upload
2. Stock and inventory tracking
3. Order processing workflow
4. Customer data management
5. Promotional banner management
6. Delivery area and charges setup
7. Sales reports and analytics
8. Business settings configuration

### Database Overview

Core tables: `users`, `products`, `categories`, `orders`, `order_items`, `customers`, `delivery_areas`, `delivery_charges`, `banners`, `offers`, `stocks`, `settings`

### API Architecture

**Authentication**
- Sanctum token-based authentication
- Admin role-based access control
- Customer session management

**API Endpoint Structure**
```
/api/v1/auth/*         Authentication
/api/v1/products/*     Product operations
/api/v1/categories/*   Category operations
/api/v1/cart/*         Cart operations
/api/v1/orders/*       Order operations
/api/v1/customers/*    Customer operations
/api/v1/delivery/*     Delivery operations
/api/v1/admin/*        Admin operations
```

### Deployment Strategy

**Frontend** (Vercel/Netlify): Environment variables, API URL setup, build optimisation

**Backend** (DigitalOcean/AWS): Laravel API server, MySQL database, Redis queue worker, file storage (S3/Local)

---

## 2. Database Schema

### Entity Relationship Overview

```
users (Admin/Staff)
  ↓
products → categories
  ↓         ↓
stocks    offers
  ↓
orders → order_items → cutting_options
  ↓
customers
  ↓
delivery_areas → delivery_charges
```

---

### Table Schemas

#### 1. users

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

#### 2. customers

```sql
CREATE TABLE customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    default_address TEXT,
    landmark VARCHAR(255),
    delivery_area_id BIGINT UNSIGNED,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_order_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_area_id) REFERENCES delivery_areas(id),
    INDEX idx_phone (phone),
    INDEX idx_email (email)
);
```

#### 3. categories

```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);
```

#### 4. products

```sql
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_en TEXT,
    description_ta TEXT,

    -- Pricing
    price_per_kg DECIMAL(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    discounted_price DECIMAL(10, 2) GENERATED ALWAYS AS (
        price_per_kg - (price_per_kg * discount_percentage / 100)
    ) STORED,

    -- Product Info
    sku VARCHAR(100) UNIQUE,
    freshness_tag VARCHAR(100),
    nutritional_info JSON,

    -- Images
    primary_image VARCHAR(500),
    gallery_images JSON,

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    min_order_quantity DECIMAL(8, 2) DEFAULT 0.5,
    max_order_quantity DECIMAL(8, 2) DEFAULT 10,

    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,

    -- Stats
    view_count INT DEFAULT 0,
    order_count INT DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INT DEFAULT 0,

    -- Status
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    INDEX idx_price (discounted_price),
    FULLTEXT idx_search (name_en, name_ta, description_en)
);
```

#### 5. cutting_options

```sql
CREATE TABLE cutting_options (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description_en TEXT,
    description_ta TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO cutting_options (name_en, name_ta, code, display_order) VALUES
('Whole',        'முழுமையாக',              'whole',        1),
('Curry Cut',    'குழம்பு வெட்டு',         'curry_cut',    2),
('Fry Cut',      'பொரியல் வெட்டு',         'fry_cut',      3),
('Cleaned',      'சுத்தம் செய்யப்பட்ட',   'cleaned',      4),
('Skin Removed', 'தோல் நீக்கப்பட்ட',      'skin_removed', 5);
```

#### 6. orders

```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,

    -- Customer snapshot
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),

    -- Delivery
    delivery_address TEXT NOT NULL,
    landmark VARCHAR(255),
    delivery_area_id BIGINT UNSIGNED,
    delivery_area_name VARCHAR(255),
    delivery_notes TEXT,

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_charge DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Status
    status ENUM(
        'pending','confirmed','processing',
        'out_for_delivery','delivered','cancelled','refunded'
    ) DEFAULT 'pending',
    payment_method ENUM('cod','online','bank_transfer') DEFAULT 'cod',
    payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',

    -- WhatsApp
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMP NULL,
    whatsapp_message TEXT,

    -- Timestamps
    confirmed_at TIMESTAMP NULL,
    processing_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,

    -- Tracking
    estimated_delivery_time TIMESTAMP NULL,
    delivery_person_name VARCHAR(255),
    delivery_person_phone VARCHAR(20),
    admin_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (delivery_area_id) REFERENCES delivery_areas(id),
    INDEX idx_order_number (order_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

#### 7. order_items

```sql
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,

    -- Product snapshot
    product_name_en VARCHAR(255) NOT NULL,
    product_name_ta VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),

    -- Order details
    weight_kg DECIMAL(8, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    cutting_option_id BIGINT UNSIGNED,
    cutting_option_name VARCHAR(100),

    -- Pricing snapshot
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,

    special_instructions TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (cutting_option_id) REFERENCES cutting_options(id),
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);
```

#### 8. delivery_areas

```sql
CREATE TABLE delivery_areas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    postal_codes JSON,
    landmarks TEXT,
    delivery_time_min INT DEFAULT 30,
    delivery_time_max INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
);

INSERT INTO delivery_areas (name_en, name_ta, delivery_time_min, delivery_time_max, display_order) VALUES
('Jaffna Town', 'யாழ்ப்பாணம் நகரம்', 20, 40, 1),
('Nallur',      'நல்லூர்',            25, 45, 2),
('Chunnakam',   'சுன்னாகம்',          30, 50, 3),
('Kokuvil',     'கொக்குவில்',          35, 55, 4),
('Kondavil',    'கொண்டாவில்',          30, 50, 5);
```

#### 9. delivery_charges

```sql
CREATE TABLE delivery_charges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    delivery_area_id BIGINT UNSIGNED NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    charge_amount DECIMAL(10, 2) NOT NULL,
    is_free_above_amount DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_area_id) REFERENCES delivery_areas(id) ON DELETE CASCADE,
    INDEX idx_area (delivery_area_id)
);

INSERT INTO delivery_charges (delivery_area_id, min_order_amount, charge_amount, is_free_above_amount) VALUES
(1, 0, 100.00, 2000.00),
(2, 0, 150.00, 2500.00),
(3, 0, 200.00, 3000.00),
(4, 0, 200.00, 3000.00),
(5, 0, 200.00, 3000.00);
```

#### 10. stocks

```sql
CREATE TABLE stocks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    type ENUM('in','out','adjustment') NOT NULL,
    reason VARCHAR(255),
    reference_type VARCHAR(50),
    reference_id BIGINT UNSIGNED,
    notes TEXT,
    previous_quantity DECIMAL(10, 2),
    new_quantity DECIMAL(10, 2),
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_created_at (created_at)
);
```

#### 11. banners

```sql
CREATE TABLE banners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_ta VARCHAR(255),
    subtitle_en VARCHAR(255),
    subtitle_ta VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    mobile_image_url VARCHAR(500),
    link_url VARCHAR(500),
    button_text_en VARCHAR(100),
    button_text_ta VARCHAR(100),
    background_color VARCHAR(20),
    text_color VARCHAR(20),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
);
```

#### 12. offers

```sql
CREATE TABLE offers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_ta VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ta TEXT,
    code VARCHAR(50) UNIQUE,
    discount_type ENUM('percentage','fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    applicable_to ENUM('all','category','product') DEFAULT 'all',
    applicable_ids JSON,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_customer_limit INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
);
```

#### 13. offer_usages

```sql
CREATE TABLE offer_usages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    offer_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_offer (offer_id),
    INDEX idx_customer (customer_id)
);
```

#### 14. product_reviews

```sql
CREATE TABLE product_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by BIGINT UNSIGNED,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_approved (is_approved)
);
```

#### 15. settings

```sql
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    group_name VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key_name),
    INDEX idx_group (group_name)
);

INSERT INTO settings (key_name, value, type, group_name, is_public) VALUES
('business_name',             'Meenavan | மீனவன்',    'string',  'business', TRUE),
('business_phone',            '0712341017',             'string',  'business', TRUE),
('business_email',            'info@meenavan.lk',       'string',  'business', TRUE),
('whatsapp_number',           '94712341017',            'string',  'whatsapp', TRUE),
('whatsapp_message_template', 'Hello Meenavan...',      'string',  'whatsapp', FALSE),
('min_order_amount',          '500',                    'number',  'order',    TRUE),
('free_delivery_above',       '2000',                   'number',  'delivery', TRUE),
('currency_symbol',           'Rs.',                    'string',  'business', TRUE),
('site_maintenance',          'false',                  'boolean', 'system',   TRUE);
```

#### 16. activity_logs

```sql
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    model_id BIGINT UNSIGNED,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_data JSON,
    new_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_model (model, model_id),
    INDEX idx_created_at (created_at)
);
```

### Performance Indexes

```sql
CREATE INDEX idx_products_search      ON products(is_active, is_available, category_id);
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status, created_at);
CREATE INDEX idx_orders_status_date   ON orders(status, created_at);
CREATE INDEX idx_customers_active     ON customers(is_active, total_orders);
```

### Reporting Views

```sql
CREATE VIEW daily_sales AS
SELECT
    DATE(created_at) AS sale_date,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders
FROM orders
GROUP BY DATE(created_at);

CREATE VIEW product_performance AS
SELECT
    p.id,
    p.name_en,
    p.category_id,
    p.stock_quantity,
    p.order_count,
    p.rating_average,
    SUM(oi.subtotal) AS total_revenue,
    SUM(oi.quantity) AS total_units_sold
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id;
```

### Important Notes

- **Prices** — stored in Sri Lankan Rupees (LKR)
- **Weights** — stored in kilograms (KG) with 2 decimal precision
- **Images** — URLs stored; files live in Laravel Storage or CDN
- **Timestamps** — all UTC
- **`discounted_price`** — generated column, auto-calculated on save
- **JSON fields** — used for gallery images, nutritional info, postal codes

---

## 3. API Documentation

**Base URL:** `http://api.meenavan.lk/api/v1`  
**Authentication:** Bearer Token (Laravel Sanctum)

---

### Authentication

#### POST `/auth/register`

```json
// Request
{
  "name": "John Doe",
  "phone": "0712345678",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}

// Response
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": 1, "name": "John Doe", "phone": "0712345678", "email": "john@example.com" },
    "token": "1|abc123..."
  }
}
```

#### POST `/auth/login`

```json
// Request
{ "phone": "0712345678", "password": "password123" }

// Response
{ "success": true, "data": { "user": {}, "token": "2|xyz456..." } }
```

#### POST `/auth/admin/login`

```json
// Request
{ "email": "admin@meenavan.lk", "password": "admin123" }

// Response
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Admin", "email": "admin@meenavan.lk", "role": "super_admin" },
    "token": "3|admin789..."
  }
}
```

#### POST `/auth/logout`

```
Authorization: Bearer {token}
```

---

### Public Endpoints (No Auth)

#### GET `/categories`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_en": "Fish",
      "name_ta": "மீன்",
      "slug": "fish",
      "icon": "🐟",
      "image_url": "https://cdn.meenavan.lk/categories/fish.jpg",
      "product_count": 45
    }
  ]
}
```

#### GET `/products`

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category_id` | int | Filter by category |
| `search` | string | Search name/description |
| `min_price` | decimal | Minimum price |
| `max_price` | decimal | Maximum price |
| `sort` | string | `price_low`, `price_high`, `popular`, `newest`, `rating` |
| `is_available` | boolean | Available products only |
| `per_page` | int | Items per page (default: 20) |
| `page` | int | Page number |

```json
// Response
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name_en": "Yellow Fin Tuna",
        "name_ta": "மஞ்சள் துடுப்பு சூரை",
        "slug": "yellow-fin-tuna",
        "price_per_kg": 1200.00,
        "discount_percentage": 10,
        "discounted_price": 1080.00,
        "primary_image": "https://cdn.meenavan.lk/products/tuna-1.jpg",
        "freshness_tag": "Caught Today",
        "is_available": true,
        "stock_quantity": 25.50,
        "rating_average": 4.5,
        "rating_count": 23,
        "is_featured": true
      }
    ],
    "per_page": 12,
    "total": 45,
    "last_page": 4
  }
}
```

#### GET `/products/{slug}`

Returns full product details including `nutritional_info`, `gallery_images`, `reviews`, and `related_products`.

#### GET `/cutting-options`

```json
{
  "success": true,
  "data": [
    { "id": 1, "name_en": "Whole",      "name_ta": "முழுமையாக",      "code": "whole" },
    { "id": 2, "name_en": "Curry Cut",  "name_ta": "குழம்பு வெட்டு", "code": "curry_cut" }
  ]
}
```

#### GET `/delivery-areas`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_en": "Jaffna Town",
      "name_ta": "யாழ்ப்பாணம் நகரம்",
      "delivery_time_min": 20,
      "delivery_time_max": 40,
      "delivery_charge": { "charge_amount": 100.00, "is_free_above_amount": 2000.00 }
    }
  ]
}
```

#### GET `/banners`

Returns active hero banners with `title_en`, `title_ta`, `image_url`, `mobile_image_url`, `link_url`, `button_text_en`.

#### GET `/settings/public`

```json
{
  "success": true,
  "data": {
    "business_name": "Meenavan | மீனவன்",
    "business_phone": "0712341017",
    "whatsapp_number": "94712341017",
    "currency_symbol": "Rs.",
    "min_order_amount": 500,
    "free_delivery_above": 2000
  }
}
```

---

### Customer Endpoints (Auth Required)

#### GET `/customer/profile`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "0712345678",
    "email": "john@example.com",
    "default_address": "No. 123, Main Street",
    "delivery_area": { "id": 1, "name_en": "Jaffna Town" },
    "total_orders": 15,
    "total_spent": 45000.00
  }
}
```

#### PUT `/customer/profile`

```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "default_address": "New Address",
  "delivery_area_id": 2
}
```

#### GET `/customer/orders`

Query parameters: `status`, `per_page`, `page`

#### GET `/customer/orders/{orderNumber}`

Returns full order with `items[]`, `timeline[]`, pricing breakdown.

---

### Cart & Checkout

#### POST `/cart/add`

```json
// Request
{
  "product_id": 1,
  "weight_kg": 1.0,
  "quantity": 1,
  "cutting_option_id": 2,
  "special_instructions": "Remove scales"
}

// Response
{ "success": true, "message": "Product added to cart", "data": { "cart_count": 3, "cart_total": 4500.00 } }
```

#### GET `/cart`

Returns `items[]` with product details and a `summary` with `subtotal`, `delivery_charge`, `discount`, `total`.

#### PUT `/cart/{itemId}` / DELETE `/cart/{itemId}`

Update or remove a cart item.

#### POST `/checkout/calculate`

```json
// Request
{ "delivery_area_id": 1, "offer_code": "FIRST10" }

// Response
{
  "success": true,
  "data": {
    "subtotal": 4500.00,
    "delivery_charge": 100.00,
    "delivery_area": "Jaffna Town",
    "discount": 450.00,
    "discount_description": "10% off with code FIRST10",
    "total": 4150.00,
    "estimated_delivery": "30-45 minutes"
  }
}
```

#### POST `/orders`

```json
// Request
{
  "customer_name": "John Doe",
  "customer_phone": "0712345678",
  "delivery_address": "No. 123, Main Street, Jaffna",
  "landmark": "Near Jaffna Library",
  "delivery_area_id": 1,
  "delivery_notes": "Call before delivery",
  "payment_method": "cod",
  "offer_code": "FIRST10",
  "items": [
    { "product_id": 1, "weight_kg": 1.5, "quantity": 1, "cutting_option_id": 2 }
  ]
}

// Response
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order_number": "ORD-20240115-001",
    "total_amount": 4150.00,
    "status": "pending",
    "whatsapp_url": "https://wa.me/94712341017?text=..."
  }
}
```

---

### Admin Endpoints

#### GET `/admin/dashboard/stats`

```json
{
  "success": true,
  "data": {
    "today":          { "orders": 45, "revenue": 125000.00, "customers": 12 },
    "this_month":     { "orders": 890, "revenue": 2500000.00, "customers": 245 },
    "pending_orders": 15,
    "low_stock_products": 8,
    "total_customers": 1245,
    "total_products":  156
  }
}
```

#### Product Management

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/admin/products` | List all products |
| POST | `/admin/products` | Create product (multipart/form-data) |
| PUT | `/admin/products/{id}` | Update product |
| DELETE | `/admin/products/{id}` | Delete product |
| POST | `/admin/products/{id}/toggle-availability` | Toggle availability |
| POST | `/admin/products/{id}/stock` | Update stock |

**Stock update request:**
```json
{ "quantity_kg": 10, "type": "in", "reason": "New purchase", "notes": "Fresh arrival from port" }
```

#### Order Management

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/admin/orders` | List orders (filter by status, date, phone) |
| GET | `/admin/orders/{orderNumber}` | Order details |
| PUT | `/admin/orders/{orderNumber}/status` | Update status |
| POST | `/admin/orders/{orderNumber}/send-whatsapp` | Resend WhatsApp |

**Status update request:**
```json
{
  "status": "confirmed",
  "admin_notes": "Confirmed with customer",
  "estimated_delivery_time": "2024-01-15T14:00:00Z"
}
```

#### Delivery Management

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/admin/delivery/areas` | List areas |
| POST | `/admin/delivery/areas` | Create area |
| PUT | `/admin/delivery/areas/{id}` | Update area |
| PUT | `/admin/delivery/charges/{areaId}` | Update charges |

#### Other Admin Resources

`/admin/banners`, `/admin/offers`, `/admin/customers`, `/admin/settings` — standard CRUD via `apiResource`.

#### GET `/admin/reports/sales`

Query parameters: `date_from`, `date_to`, `group_by` (`day`, `week`, `month`)

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_orders": 450,
      "total_revenue": 1250000.00,
      "avg_order_value": 2777.78,
      "total_customers": 234
    },
    "daily_breakdown": [ { "date": "2024-01-15", "orders": 45, "revenue": 125000.00 } ],
    "top_products": [ { "product_name": "Yellow Fin Tuna", "total_sold_kg": 150.5, "revenue": 180600.00 } ]
  }
}
```

---

### Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "errors": { "field_name": ["Error detail"] }
}
```

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

### Rate Limits

| Endpoint type | Limit |
|---------------|-------|
| Public | 60 req/min |
| Authenticated | 120 req/min |
| Admin | 300 req/min |

---

## 4. Laravel Backend Setup

### Installation

```bash
composer create-project laravel/laravel meenavan-api
cd meenavan-api

composer require laravel/sanctum
composer require intervention/image
composer require spatie/laravel-activitylog
composer require spatie/laravel-backup

php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --provider="Intervention\Image\ImageServiceProvider"
```

### Environment Configuration (`.env`)

```env
APP_NAME="Meenavan API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.meenavan.lk

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=meenavan_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=meenavan.lk,admin.meenavan.lk
SESSION_DOMAIN=.meenavan.lk

WHATSAPP_NUMBER=94712341017
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM_ADDRESS=noreply@meenavan.lk

FRONTEND_URL=https://meenavan.lk
ADMIN_URL=https://admin.meenavan.lk
```

### Models

#### `app/Models/User.php`

```php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['name', 'email', 'phone', 'password', 'role', 'is_active'];
    protected $hidden   = ['password', 'remember_token'];
    protected $casts    = [
        'is_active'         => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }
}
```

#### `app/Models/Product.php`

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name_en', 'name_ta', 'slug',
        'description_en', 'description_ta', 'price_per_kg',
        'discount_percentage', 'sku', 'freshness_tag',
        'nutritional_info', 'primary_image', 'gallery_images',
        'is_available', 'stock_quantity', 'min_order_quantity',
        'max_order_quantity', 'is_featured', 'is_bestseller', 'is_active'
    ];

    protected $casts = [
        'price_per_kg'        => 'decimal:2',
        'stock_quantity'      => 'decimal:2',
        'min_order_quantity'  => 'decimal:2',
        'max_order_quantity'  => 'decimal:2',
        'nutritional_info'    => 'array',
        'gallery_images'      => 'array',
        'is_available'        => 'boolean',
        'is_featured'         => 'boolean',
        'is_active'           => 'boolean',
    ];

    protected $appends = ['discounted_price'];

    public function category()    { return $this->belongsTo(Category::class); }
    public function stocks()      { return $this->hasMany(Stock::class); }
    public function reviews()     { return $this->hasMany(ProductReview::class); }

    public function getDiscountedPriceAttribute(): float
    {
        if ($this->discount_percentage > 0) {
            return round($this->price_per_kg * (1 - $this->discount_percentage / 100), 2);
        }
        return $this->price_per_kg;
    }

    public function scopeActive($q)    { return $q->where('is_active', true); }
    public function scopeAvailable($q) { return $q->where('is_available', true)->where('stock_quantity', '>', 0); }
    public function scopeFeatured($q)  { return $q->where('is_featured', true); }

    public function scopeSearch($q, string $search)
    {
        return $q->where(fn($q) =>
            $q->where('name_en', 'LIKE', "%{$search}%")
              ->orWhere('name_ta', 'LIKE', "%{$search}%")
              ->orWhere('description_en', 'LIKE', "%{$search}%")
        );
    }
}
```

#### `app/Models/Order.php`

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'customer_id', 'customer_name', 'customer_phone',
        'customer_email', 'delivery_address', 'landmark', 'delivery_area_id',
        'delivery_area_name', 'delivery_notes', 'subtotal', 'delivery_charge',
        'discount_amount', 'total_amount', 'status', 'payment_method',
        'payment_status', 'whatsapp_sent', 'admin_notes',
        'estimated_delivery_time', 'delivery_person_name', 'delivery_person_phone',
        'confirmed_at', 'processing_at', 'delivered_at', 'cancelled_at', 'cancellation_reason'
    ];

    protected $casts = [
        'subtotal'                => 'decimal:2',
        'delivery_charge'         => 'decimal:2',
        'discount_amount'         => 'decimal:2',
        'total_amount'            => 'decimal:2',
        'whatsapp_sent'           => 'boolean',
        'estimated_delivery_time' => 'datetime',
        'confirmed_at'            => 'datetime',
        'processing_at'           => 'datetime',
        'delivered_at'            => 'datetime',
        'cancelled_at'            => 'datetime',
    ];

    public function customer()     { return $this->belongsTo(Customer::class); }
    public function deliveryArea() { return $this->belongsTo(DeliveryArea::class); }
    public function items()        { return $this->hasMany(OrderItem::class); }

    public function scopePending($q)   { return $q->where('status', 'pending'); }
    public function scopeDelivered($q) { return $q->where('status', 'delivered'); }

    public static function generateOrderNumber(): string
    {
        $date  = now()->format('Ymd');
        $count = self::whereDate('created_at', now())->count() + 1;
        return 'ORD-' . $date . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
```

### Routes (`routes/api.php`)

```php
<?php
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public auth
    Route::post('/auth/register',       [AuthController::class, 'register']);
    Route::post('/auth/login',          [AuthController::class, 'login']);
    Route::post('/auth/admin/login',    [AuthController::class, 'adminLogin']);

    // Public data
    Route::get('/categories',           [CategoryController::class, 'index']);
    Route::get('/products',             [ProductController::class, 'index']);
    Route::get('/products/{slug}',      [ProductController::class, 'show']);
    Route::get('/cutting-options',      [CuttingOptionController::class, 'index']);
    Route::get('/delivery-areas',       [DeliveryAreaController::class, 'index']);
    Route::get('/banners',              [BannerController::class, 'active']);
    Route::get('/settings/public',      [SettingController::class, 'public']);

    // Authenticated customer routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout',                             [AuthController::class, 'logout']);
        Route::get('/customer/profile',                         [CustomerController::class, 'profile']);
        Route::put('/customer/profile',                         [CustomerController::class, 'updateProfile']);
        Route::get('/customer/orders',                          [CustomerController::class, 'orders']);
        Route::get('/customer/orders/{orderNumber}',            [CustomerController::class, 'orderDetail']);
        Route::post('/cart/add',                                [CartController::class, 'add']);
        Route::get('/cart',                                     [CartController::class, 'index']);
        Route::put('/cart/{itemId}',                            [CartController::class, 'update']);
        Route::delete('/cart/{itemId}',                         [CartController::class, 'remove']);
        Route::post('/checkout/calculate',                      [CartController::class, 'calculate']);
        Route::post('/orders',                                  [OrderController::class, 'store']);
    });

    // Admin routes
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('/dashboard/stats',                              [Admin\DashboardController::class, 'stats']);

        Route::apiResource('products',                              Admin\ProductController::class);
        Route::post('/products/{id}/toggle-availability',           [Admin\ProductController::class, 'toggleAvailability']);
        Route::post('/products/{id}/stock',                         [Admin\ProductController::class, 'updateStock']);

        Route::get('/orders',                                       [Admin\OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}',                         [Admin\OrderController::class, 'show']);
        Route::put('/orders/{orderNumber}/status',                  [Admin\OrderController::class, 'updateStatus']);
        Route::post('/orders/{orderNumber}/send-whatsapp',          [Admin\OrderController::class, 'sendWhatsApp']);

        Route::get('/customers',                                    [Admin\CustomerController::class, 'index']);
        Route::get('/customers/{id}',                               [Admin\CustomerController::class, 'show']);

        Route::apiResource('delivery/areas',                        Admin\DeliveryAreaController::class);
        Route::put('/delivery/charges/{areaId}',                    [Admin\DeliveryController::class, 'updateCharges']);

        Route::apiResource('banners',                               Admin\BannerController::class);
        Route::apiResource('offers',                                Admin\OfferController::class);

        Route::get('/reports/sales',                                [Admin\ReportController::class, 'sales']);
        Route::get('/settings',                                     [Admin\SettingController::class, 'index']);
        Route::put('/settings',                                     [Admin\SettingController::class, 'update']);
    });
});
```

### Admin Middleware (`app/Http/Middleware/AdminMiddleware.php`)

```php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }
        return $next($request);
    }
}
```

Register in `bootstrap/app.php` (Laravel 11) or `app/Http/Kernel.php`:
```php
'admin' => \App\Http\Middleware\AdminMiddleware::class,
```

### Commands

```bash
# Migrations & seeding
php artisan migrate
php artisan db:seed

# Storage symlink
php artisan storage:link

# Queue worker
php artisan queue:table
php artisan migrate
php artisan queue:work
```

---

## 5. Next.js Frontend Setup

### Project Structure

```
frontend/
├── public-site/
│   └── src/
│       ├── app/
│       │   ├── (public)/
│       │   │   ├── page.tsx                      # Homepage
│       │   │   ├── products/
│       │   │   │   ├── page.tsx                  # Listing
│       │   │   │   └── [slug]/page.tsx            # Detail
│       │   │   ├── cart/page.tsx
│       │   │   ├── checkout/page.tsx
│       │   │   └── orders/
│       │   │       ├── page.tsx
│       │   │       └── [orderNumber]/page.tsx
│       │   └── layout.tsx
│       ├── components/
│       │   ├── layout/        # Header, Footer, MobileNav, CategoryMenu
│       │   ├── product/       # ProductCard, ProductGrid, WeightSelector, CuttingOptions
│       │   ├── cart/          # CartDrawer, CartItem, CartSummary
│       │   ├── checkout/      # CheckoutForm, DeliveryAreaSelector
│       │   └── ui/            # Button, Input, Modal, Badge
│       ├── lib/               # api.ts, utils.ts, constants.ts
│       ├── store/             # useCartStore, useAuthStore, useUIStore
│       └── types/             # product.ts, order.ts, customer.ts
│
└── admin-panel/
    └── src/
        ├── app/
        │   ├── (auth)/login/page.tsx
        │   └── (dashboard)/
        │       ├── layout.tsx
        │       ├── dashboard/page.tsx
        │       ├── products/
        │       ├── orders/
        │       ├── customers/
        │       ├── offers/
        │       ├── delivery/
        │       ├── reports/
        │       └── settings/
        └── components/
            ├── layout/        # AdminSidebar, AdminHeader, AdminLayout
            ├── dashboard/     # StatsCard, RecentOrders, SalesChart
            ├── products/      # ProductForm, ProductTable, ImageUpload
            └── orders/        # OrderTable, OrderDetail, StatusUpdate
```

### Installation

```bash
# Public site
npx create-next-app@latest public-site --typescript --tailwind --app
cd public-site
npm install zustand @tanstack/react-query axios framer-motion lucide-react react-hot-toast date-fns
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog select badge separator

# Admin panel
npx create-next-app@latest admin-panel --typescript --tailwind --app
cd admin-panel
npm install zustand @tanstack/react-query axios lucide-react react-hot-toast recharts date-fns
npx shadcn-ui@latest init
```

### Configuration

#### `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.meenavan.lk', 'cdn.meenavan.lk'],
  },
}
module.exports = nextConfig
```

#### `.env.local` — Public Site

```env
NEXT_PUBLIC_API_URL=https://api.meenavan.lk/api/v1
NEXT_PUBLIC_WHATSAPP_NUMBER=94712341017
NEXT_PUBLIC_SITE_URL=https://meenavan.lk
```

#### `.env.local` — Admin Panel

```env
NEXT_PUBLIC_API_URL=https://api.meenavan.lk/api/v1
NEXT_PUBLIC_SITE_URL=https://admin.meenavan.lk
```

#### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#491B99',
          600: '#491B99',
          700: '#6D28D9',
        },
      },
      fontFamily: {
        sans:  ['var(--font-inter)'],
        tamil: ['var(--font-noto-sans-tamil)'],
      },
    },
  },
  plugins: [],
}
export default config
```

### API Client (`lib/api.ts`)

```ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> { return this.client.get(url, config); }
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> { return this.client.post(url, data, config); }
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> { return this.client.put(url, data, config); }
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> { return this.client.delete(url, config); }
}

export const api = new ApiClient();

export const productApi = {
  getAll:    (params?: any) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
};

export const cartApi = {
  get:    ()                       => api.get('/cart'),
  add:    (data: any)              => api.post('/cart/add', data),
  update: (id: number, data: any)  => api.put(`/cart/${id}`, data),
  remove: (id: number)             => api.delete(`/cart/${id}`),
};

export const orderApi = {
  create:      (data: any)              => api.post('/orders', data),
  getAll:      ()                       => api.get('/customer/orders'),
  getByNumber: (orderNumber: string)    => api.get(`/customer/orders/${orderNumber}`),
};
```

### Cart Store (`store/useCartStore.ts`)

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  product: any;
  weight_kg: number;
  quantity: number;
  cutting_option?: any;
  subtotal: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem:    (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateItem: (itemId: number, updates: Partial<CartItem>) => void;
  clearCart:  () => void;
  toggleCart: () => void;
  getTotal:     () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem:    (item)           => set((s) => ({ items: [...s.items, { ...item, id: Date.now() }] })),
      removeItem: (itemId)         => set((s) => ({ items: s.items.filter(i => i.id !== itemId) })),
      updateItem: (itemId, updates)=> set((s) => ({ items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i) })),
      clearCart:  ()               => set({ items: [] }),
      toggleCart: ()               => set((s) => ({ isOpen: !s.isOpen })),
      getTotal:     () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
      getItemCount: () => get().items.length,
    }),
    { name: 'cart-storage' }
  )
);
```

### Running & Deployment

```bash
# Development
cd public-site  && npm run dev   # http://localhost:3000
cd admin-panel  && npm run dev   # http://localhost:3001

# Production build
npm run build && npm start

# Deploy to Vercel
npm i -g vercel
vercel  # run inside each project folder
```

Configure environment variables per project in the Vercel dashboard.
