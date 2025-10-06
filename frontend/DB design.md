
---

# High-level entities

* `users` (customers & staff/admins)
* `products` (t-shirt listings)
* `product_images`
* `product_variants` (color + size combinations)
* `inventories` (stock per variant)
* `prices` (history, optional) / or price fields on variants
* `product_details` (bullet points)
* `product_keywords` (many-to-many via `keywords`)
* `reviews`
* `orders` and `order_items` (sold items info)
* `shipping_addresses` and `shipping_methods`
* `carts` and `cart_items`
* `favorites` (wishlist)
* `notifications` (per user)
* `messages` (customer ↔ admin threads)
* `product_views` / `sales_aggregate` (for popularity)
* `admins` (or `users.role` field)
* `audit_logs` (optional)

---

# Naming / Conventions

* All tables plural lowercase snake_case.
* Use surrogate primary keys (bigserial / BIGINT) named `id`.
* Timestamps: `created_at`, `updated_at`, `deleted_at` (for soft deletes).
* Use `uuid` for public-facing ids if desired (e.g., `public_id`).

---

# Table definitions (attributes, types, constraints, indices, relationships)

### 1) `users`

Represents customers and staff (role-based).

* `id` (PK, BIGINT, auto-increment)
* `public_id` (UUID, unique) — safe to expose in URLs
* `email` (VARCHAR, NOT NULL, UNIQUE, indexed)
* `password_hash` (VARCHAR, NULLABLE for social login)
* `full_name` (VARCHAR, NOT NULL)
* `phone` (VARCHAR, UNIQUE, nullable)
* `role` (ENUM: 'customer','admin','support' etc.) — default 'customer'
* `is_verified` (BOOLEAN) — email verified
* `locale` (VARCHAR) — e.g., "en-NP"
* `created_at`, `updated_at`, `deleted_at`
* `last_login_at` (nullable)
* `default_shipping_address_id` (FK -> `shipping_addresses.id`, nullable)
* **Indexes**: `email`, `public_id`, `role`

Notes: store payment tokens in secure PCI-compliant vault/service; keep only token reference.

---

### 2) `shipping_addresses`

* `id` (PK)
* `user_id` (FK -> `users.id`, NOT NULL)
* `label` (VARCHAR) e.g., "Home", "Office"
* `recipient_name`
* `line1`, `line2`, `city`, `state`, `postal_code`, `country`
* `phone`
* `is_default` (BOOLEAN)
* `created_at`, `updated_at`, `deleted_at`
* **Constraints**: (user_id, label) unique optional.

---

### 3) `products`

Top-level t-shirt listing. A product may have many color/size variants.

* `id` (PK)
* `sku` (VARCHAR, UNIQUE) — product-level SKU or SKU prefix
* `public_id` (UUID, UNIQUE)
* `name` (VARCHAR, NOT NULL)
* `slug` (VARCHAR, UNIQUE) — for SEO URLs
* `short_description` (VARCHAR)
* `description` (TEXT) — full HTML or markdown
* `status` (ENUM: 'draft','active','archived')
* `main_image_id` (FK -> `product_images.id`, nullable) — quick reference
* `original_price` (DECIMAL(10,2)) — suggested MSRP or base price
* `current_price` (DECIMAL(10,2)) — if product-level price applies
* `currency` (CHAR(3)) — ISO code
* `sold_count` (BIGINT DEFAULT 0) — denormalized, updated on sale
* `review_count` (INT DEFAULT 0) — denormalized
* `average_rating` (NUMERIC(3,2) DEFAULT 0.00) — denormalized
* `is_featured` (BOOLEAN) — optional promo
* `is_returnable` (BOOLEAN)
* `warranty_info` (VARCHAR) optional
* `created_by` (FK -> `users.id`) — uploader/admin
* `created_at`, `updated_at`, `deleted_at`
* **Indexes**: `slug`, `name` (text index), `status`, `is_featured`

Notes: Price fields can be overridden per variant. If the platform supports complex pricing (sales by region/time), use `product_prices` table.

---

### 4) `product_images`

* `id` (PK)
* `product_id` (FK -> `products.id`, NOT NULL)
* `url` (VARCHAR, NOT NULL) — CDN URL or storage reference
* `alt_text` (VARCHAR)
* `sort_order` (INT DEFAULT 0)
* `is_primary` (BOOLEAN DEFAULT FALSE)
* `metadata` (JSONB) — e.g., sizes, focal point
* `created_at`, `updated_at`
* **Constraint / Validation**: Application should ensure `COUNT(product_images WHERE product_id = X) >= 2` if business requires >1 image. (You can also enforce via trigger.)

---

### 5) `keywords`

Store keyword/tag list once.

* `id`
* `name` (VARCHAR UNIQUE, indexed)
* `created_at`, `updated_at`

### 6) `product_keywords` (many-to-many)

* `product_id` (FK -> `products.id`, PK composite)
* `keyword_id` (FK -> `keywords.id`, PK composite)

---

### 7) `product_variants`

A variant = a color + size combination (unique per product).

* `id` (PK)
* `product_id` (FK -> `products.id`, NOT NULL)
* `sku` (VARCHAR, UNIQUE) — full variant SKU
* `color` (VARCHAR, NOT NULL) — e.g., "Charcoal", or color code
* `color_code` (VARCHAR) — hex if needed
* `size` (ENUM or VARCHAR) — e.g., 'XS','S','M','L','XL','XXL' (consider a `sizes` table if you support custom sizes)
* `variant_attributes` (JSONB) — additional attributes (fit, fabric, cut)
* `original_price` (DECIMAL) — optional override
* `current_price` (DECIMAL) — optional override
* `weight_grams` (INT) — for shipping
* `barcode` (VARCHAR) optional
* `created_at`, `updated_at`, `deleted_at`
* **Unique constraint**: (`product_id`, `color`, `size`) unique
* **Indexes**: `sku`, (`product_id`, `color`), (`product_id`, `size`)

---

### 8) `inventories`

Track stock per variant, supports warehouses if needed.

* `id` (PK)
* `variant_id` (FK -> `product_variants.id`, UNIQUE, NOT NULL)
* `available` (INT NOT NULL DEFAULT 0)
* `reserved` (INT NOT NULL DEFAULT 0) — e.g., items in carts but not checked out
* `on_hold` (INT) — e.g., returns in transit
* `reorder_threshold` (INT)
* `reorder_amount` (INT)
* `last_restocked_at`
* `warehouse_id` (FK optional)
* `updated_at`
* **Constraint**: `available >= 0`, `reserved >= 0`, `available + reserved + on_hold >= 0`

Notes: Application must check & decrement atomically at checkout (use DB transactions).

---

### 9) `product_details`

Bullet points / features per product (ordered).

* `id`
* `product_id` (FK)
* `sort_order` (INT)
* `text` (VARCHAR) — bullet point
* **Unique**: (product_id, sort_order)

---

### 10) `reviews`

Customer reviews and ratings.

* `id`
* `product_id` (FK -> products)
* `user_id` (FK -> users)
* `order_id` (FK -> orders, nullable) — for verified purchase
* `rating` (INT, 1..5) — CHECK between 1 and 5
* `title` (VARCHAR)
* `body` (TEXT)
* `images` (JSONB) — list of image URLs
* `is_verified_purchase` (BOOLEAN) — set when order item matches
* `is_approved` (BOOLEAN default FALSE) — moderation
* `helpful_count` (INT default 0)
* `created_at`, `updated_at`, `deleted_at`
* **Unique constraint**: optionally limit one review per user per order_item/product
* **Indices**: `product_id`, `user_id`, (`product_id`, `is_approved`, `created_at`)

Notes: Upon approved review insertion, update `products.average_rating` and `products.review_count` via trigger or background job.

---

### 11) `orders`

High-level order record.

* `id`
* `public_id` (UUID)
* `user_id` (FK -> users)
* `status` (ENUM: 'pending','paid','shipped','delivered','cancelled','refunded','returned')
* `subtotal` (DECIMAL)
* `shipping_cost` (DECIMAL)
* `tax_amount` (DECIMAL)
* `discount_amount` (DECIMAL)
* `total_amount` (DECIMAL) — final charged
* `currency`
* `shipping_address_id` (FK)
* `billing_address_id` (FK)
* `payment_method` (VARCHAR) — token label
* `placed_at`, `paid_at`, `shipped_at`, `delivered_at`, `cancelled_at`
* `notes` (TEXT)
* `created_at`, `updated_at`
* **Indexes**: `user_id`, `public_id`, `status`, `placed_at`

---

### 12) `order_items`

Sold items info (each line).

* `id`
* `order_id` (FK -> orders)
* `product_id` (FK)
* `variant_id` (FK -> product_variants)
* `sku` (VARCHAR) — copy at time of sale
* `product_name` (VARCHAR) — copy at time of sale
* `quantity` (INT)
* `unit_price` (DECIMAL) — price per unit at sale (after discount)
* `original_unit_price` (DECIMAL)
* `discount` (DECIMAL) — total discount for that line
* `tax` (DECIMAL)
* `total_line_amount` (DECIMAL)
* `size`, `color` copy fields optional
* `created_at`, `updated_at`
* **Constraints**: quantity > 0

Notes: For "Sold items count with all info" you can query `SUM(order_items.quantity)` grouped by product/variant. Denormalize `products.sold_count` for fast "most popular" queries.

---

### 13) `shipping_methods`

* `id`, `code`, `name`, `estimated_days`, `cost_formula` (JSON), `active`, `created_at`

---

### 14) `carts`

Each customer can maintain one or more carts (e.g., saved carts).

* `id`
* `user_id` (FK -> users, UNIQUE) — one active cart per user OR allow multiple with a `type`
* `type` (ENUM: 'active','saved','wishlist_cart')
* `created_at`, `updated_at`, `expires_at`

### 15) `cart_items`

* `id`
* `cart_id` (FK -> carts)
* `variant_id` (FK -> product_variants)
* `quantity` (INT)
* `price_snapshot` (DECIMAL) — price at time added
* `added_at`, `updated_at`
* **Constraint**: quantity >= 1
* **Index**: `cart_id`

Note: `reserved` inventory can be updated when item is added to cart (if you reserve), or only when ordering (recommended to reserve for limited stock with TTL).

---

### 16) `favorites` (wishlist)

* `id`
* `user_id` (FK)
* `product_id` (FK)
* `added_at`
* **Unique**: (user_id, product_id)

---

### 17) `notifications`

User notifications (order updates, promos).

* `id`
* `user_id` (FK -> users)
* `type` (ENUM: 'order_update','promo','system','message','shipping')
* `title`
* `body` (TEXT)
* `metadata` (JSONB) — e.g., order_id, link
* `is_read` (BOOLEAN DEFAULT FALSE)
* `sent_at`
* `created_at`
* **Index**: `user_id`, `is_read`

Notes: Keep push token management in separate table (for push/email/SMS).

---

### 18) `messages` (customer ↔ admin)

Simple threaded messages so customers can message admin.

* `id`
* `thread_id` (FK -> message_threads.id) or `thread_key` (UUID)
* `sender_id` (FK -> users.id)
* `recipient_id` (FK -> users.id, nullable if broadcast)
* `body` (TEXT)
* `attachments` (JSONB)
* `is_read` (BOOLEAN)
* `created_at`, `updated_at`

### 19) `message_threads`

* `id`
* `product_id` (FK, nullable) — optional context
* `user_id` (FK) — customer starter
* `subject`
* `last_message_at`
* `status` (open/closed)
* **Index**: `user_id`, `last_message_at`

---

### 20) `product_views` (for analytics / popularity)

* `id`
* `product_id`
* `user_id` (nullable)
* `session_id` (nullable)
* `viewed_at`
* `source` (ENUM: 'organic','referral','ad')

Use this to compute popularity (views, conversion rate).

---

### 21) `sales_aggregate` (cached popular info)

Perf table updated periodically / via trigger to quickly show top-9.

* `product_id` (PK, FK)
* `period` (ENUM: 'all_time','30d','7d','24h')
* `sold_count` (INT)
* `revenue` (DECIMAL)
* `views` (INT)
* `popularity_score` (NUMERIC) — computed using formula
* `updated_at`

App will query `sales_aggregate WHERE period='all_time' ORDER BY popularity_score DESC LIMIT 9`.

---

### 22) `audit_logs` (optional)

Record important changes: who changed product price, inventory, etc.

---

# Referential relationships summary

* `products` 1 — * `product_images`
* `products` 1 — * `product_variants`
* `product_variants` 1 — 1 `inventories`
* `products` 1 — * `product_details`
* `products` * — * `keywords` (via `product_keywords`)
* `users` 1 — * `orders`
* `orders` 1 — * `order_items`
* `users` 1 — * `reviews`
* `products` 1 — * `reviews`
* `users` 1 — 1 `cart` — * `cart_items`
* `users` 1 — * `favorites`
* `users` 1 — * `notifications`
* `users` 1 — * `message_threads` / `messages`

---

# Integrity & business rules (enforced in DB or app)

* **At least 2 images per product**: best enforced by application or database trigger that checks `COUNT(product_images)` on product publish.
* **Variant uniqueness**: `(product_id, color, size)` unique.
* **Stock & checkout**: inventory decrement must be done in a DB transaction; check `available - reserved >= quantity` before committing.
* **Reviews**: only allow write if user bought the product (optional) by linking to `order_items`.
* **Ratings aggregation**: update `products.average_rating` and `products.review_count` via DB triggers or background job (e.g., whenever a review is approved).
* **Sold count**: increment `products.sold_count` when order moves to `paid` or `shipped` depending on business.
* **Soft deletes**: use `deleted_at` where you want to retain history but hide from UI.
* **Sensitive data**: do not store raw payment data; store payment tokens / gateway references.

---

# Index & performance recommendations

* Full-text search index on `products.name` + `products.description` (e.g., tsvector in Postgres).
* Index `product_variants.sku` and `inventories.variant_id`.
* Composite index on `order_items.product_id` for aggregation queries.
* Index `reviews(product_id, is_approved, created_at)` for latest reviews.
* Precomputed popularity (`sales_aggregate`) to serve top-9 quickly.
* Cache `products.main_image_id`, `average_rating`, `sold_count`, `current_price` for fast reads.
* Partition `orders` by time if high volume.

---

# How to compute "Most popular 9 t-shirts"

Option A (recommended): Maintain `sales_aggregate` with a `popularity_score` computed as a weighted formula, for example:

`popularity_score = (sold_count * 5) + (views * 0.5) + (average_rating * 20) - (return_rate * 50)`

Store this for `period='all_time'` and `period='30d'`, update periodically (hourly) or via incremental updates when orders complete. Query:

`SELECT product_id FROM sales_aggregate WHERE period='all_time' ORDER BY popularity_score DESC LIMIT 9;`

Option B: On-the-fly compute via aggregate queries across `order_items` and `product_views` (expensive).

---

# Messages & Notifications flow

* `messages` are grouped in `message_threads`. A customer creates a thread which admin sees in their dashboard. Messages can be replied by admin; `notifications` are created for new replies.
* `notifications` support `metadata` to link to order or message.

---

# Extra UX-oriented fields (suggested)

* `products.tags` (deprecated if using `keywords`)
* `products.gift_wrap_available` (boolean)
* `products.care_instructions` (text)
* `product_variants.images` (list of image ids mapped to variant colors)
* `promotion` tables: `discounts`, `coupon_codes`
* `returns` / `refunds` tables

---

# Security & privacy notes

* Use hashed passwords (bcrypt/argon2); store salts appropriately.
* PCI: do not store raw card numbers; use payment gateway tokens.
* Rate-limit message endpoints and reviews to avoid spam; moderation queue for reviews.
* GDPR/Privacy: provide ability to delete user data (scrub PII) while keeping order history anonymized.

---

# Denormalization & triggers (practical suggestions)

* `products.sold_count` updated on `orders` state transitions (transactional trigger or queued job).
* `products.average_rating` and `review_count` updated when a review `is_approved` changes.
* `sales_aggregate` updated incrementally when `order_items` inserted/fulfilled.

---

# Example queries you’ll need (conceptual)

* Get product with variants & images
* Add item to cart (check inventory)
* Checkout (create order, decrement inventory, increment sold_count)
* List user notifications (unread first)
* Get 9 most popular products (from `sales_aggregate`)
* Customer messages with admin (thread listing)

---

# Decisions I made (assumptions)

* Relational DB (Postgres recommended) fits well for ACID inventory and reporting.
* Variants modeled as color+size rows — flexible for inventory and per-variant pricing.
* Reviews moderated (is_approved) and have `is_verified_purchase`.
* Popularity is precomputed for performance.
* Customers have multiple addresses and one active cart.

---
