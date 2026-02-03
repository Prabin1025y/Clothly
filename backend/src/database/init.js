import { pool } from "../config/db.js";
import logger from "../config/logger.js";

export async function initDB(skip) {
    if (skip) {
        logger.info("Skipping db initialiation");
        return
    }

    logger.info("Running DB initialization...");

    const client = await pool.connect()

    try {
        await client.query(`BEGIN`);

        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

        await init_enums(client);
        await init_users(client);
        await init_shipping_addresses(client);
        await init_products(client);
        await init_product_images(client);

        //add foreign key to to products and product images for main primary image. This is done as product image db is only created now.
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_products_main_image'
                    AND table_name = 'products'
                ) THEN
                    ALTER TABLE products
                    ADD CONSTRAINT fk_products_main_image
                    FOREIGN KEY (main_image_id)
                    REFERENCES product_images(id)
                    ON DELETE SET NULL;
                END IF;
            END$$;
        `)

        await init_product_variants(client);
        // await init_inventories(client);
        await init_product_details(client);
        await init_reviews(client);
        await init_orders(client);

        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_reviews_order'
                    AND table_name = 'reviews'
                ) THEN
                    ALTER TABLE reviews
                    ADD CONSTRAINT fk_reviews_order
                    FOREIGN KEY (order_id)
                    REFERENCES orders(id)
                    ON DELETE SET NULL;
                END IF;
            END$$;
        `)

        await init_order_items(client);
        await init_carts(client);
        await init_cart_items(client);
        await init_favourites(client);
        await init_notifications(client);
        await init_message_threads(client);
        await init_messages(client);

        await client.query("COMMIT");

        logger.info("databse initialized successfully!!");
    } catch (error) {
        await client.query("ROLLBACK");
        console.log("Error occured while initializing database", error);
    } finally {
        client.release();
    }
}

async function init_enums(client) {
    await client.query(`
        DO $$
        BEGIN
            -- user_role
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('customer', 'admin');
            END IF;

            -- product_status
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
                CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
            END IF;

            -- order_status
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
                CREATE TYPE order_status AS ENUM ('pending','paid','shipped','delivered','cancelled','refunded','returned', 'expired');
            END IF;

            -- cart_type
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cart_type') THEN
                CREATE TYPE cart_type AS ENUM ('active','saved','wishlist_cart');
            END IF;

            -- notification_type
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
                CREATE TYPE notification_type AS ENUM ('order_update','promo','system','message','shipping');
            END IF;

            -- message_thread_status
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_thread_status') THEN
                CREATE TYPE message_thread_status AS ENUM ('open','closed');
            END IF;

            -- view_source
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'view_source') THEN
                CREATE TYPE view_source AS ENUM ('organic','referral','ad');
            END IF;
        END
        $$;
    `);
}

async function init_users(client) {
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                public_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
                clerk_id TEXT UNIQUE NOT NULL,
                image_url TEXT,
                email VARCHAR(320) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                role user_role NOT NULL DEFAULT 'customer',
                is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                locale VARCHAR(16),
                default_shipping_address_id BIGINT,
                last_login_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                deleted_at TIMESTAMP WITH TIME ZONE
            );
        `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS unique_active_email ON users(email) WHERE deleted_at IS NULL;`);
}

async function init_shipping_addresses(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS shipping_addresses (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            label VARCHAR(64),
            recipient_name VARCHAR(255) NOT NULL,
            country VARCHAR(128) DEFAULT 'nepal',
            district VARCHAR(512) NOT NULL,
            province VARCHAR(128) NOT NULL,
            city VARCHAR(128) NOT NULL,
            tole_name VARCHAR(512),
            postal_code VARCHAR(32),
            phone VARCHAR(50) NOT NULL,
            base_shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 100,
            is_default BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user ON shipping_addresses(user_id);`);
    await client.query(`CREATE UNIQUE INDEX one_default_address_per_user ON shipping_addresses(user_id) WHERE is_default = TRUE;`)
}

async function init_products(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS products(
            id BIGSERIAL PRIMARY KEY,
            sku VARCHAR(128) UNIQUE,
            public_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
            name VARCHAR(512) NOT NULL,
            slug VARCHAR(512) UNIQUE,
            short_description VARCHAR(1024),
            description TEXT,
            status product_status NOT NULL DEFAULT 'draft',
            main_image_id BIGINT,
            original_price NUMERIC(12, 2),
            current_price NUMERIC(12,2),
            currency CHAR(3) DEFAULT 'NPR',
            sold_count BIGINT NOT NULL DEFAULT 0,
            review_count INT NOT NULL DEFAULT 0,
            average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
            is_featured BOOLEAN NOT NULL DEFAULT FALSE,
            is_returnable BOOLEAN NOT NULL DEFAULT TRUE,
            warranty_info VARCHAR(512),
            created_by BIGINT REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            deleted_at TIMESTAMP WITH TIME ZONE,
            search_vector TSVECTOR GENERATED ALWAYS AS (
                setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(short_description, '')), 'B')
            ) STORED
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(short_description,'')));`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN (search_vector);`);
}

async function init_product_images(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS  product_images (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            url VARCHAR(2048) NOT NULL,
            alt_text VARCHAR(512),
            is_primary BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary);`);
}

async function init_product_variants(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS product_variants (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            sku VARCHAR(128) UNIQUE,
            color VARCHAR(128) NOT NULL,
            hex_color CHAR(7) NOT NULL,
            CHECK (hex_color ~ '^#[0-9A-Fa-f]{6}$'),
            size VARCHAR(32) NOT NULL,
            original_price NUMERIC(12,2),
            current_price NUMERIC(12,2),
            barcode VARCHAR(128),
            available INT NOT NULL DEFAULT 0 CHECK(available >= 0),
            reserved INT NOT NULL DEFAULT 0 CHECK(reserved >= 0),
            on_hold INT NOT NULL DEFAULT 0 CHECK(on_hold >= 0),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            deleted_at TIMESTAMP WITH TIME ZONE,
            CONSTRAINT uq_variant_product_color_size UNIQUE (product_id, color, size)
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);`);
}

async function init_product_details(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS product_details (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            text VARCHAR(1024) NOT NULL
        );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_product_details_product ON product_details(product_id);`);
}

async function init_reviews(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            order_id BIGINT, -- optional FK to orders (defined later)
            rating FLOAT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title VARCHAR(255),
            body TEXT,
            images JSONB,
            is_verified_purchase BOOLEAN DEFAULT FALSE,
            helpful_count INT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);`);
}
export const getOrders = async (req, res) => {
    try {
        const LIMIT = 20;

        // Parse and validate query parameters
        const page = Number.parseInt(req.query.page ?? "1", 10);
        const sort_filter = req.query.sort ?? "date_desc";
        const status_filter = [].concat(req.query.status || []);
        const search_query = (req.query.search ?? "").toString().trim().replace(/\s+/g, ' ');

        // Validation
        const valid_status = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned', 'expired'];
        const valid_sort = ['date_asc', 'date_desc', 'price_asc', 'price_desc'];

        // Validate status filters
        for (const status of status_filter) {
            if (!valid_status.includes(String(status).toLowerCase().trim())) {
                return res.status(400).json({ message: "Invalid status filter!!" });
            }
        }

        // Validate sort filter
        if (!valid_sort.includes(String(sort_filter).toLowerCase().trim())) {
            return res.status(400).json({ message: "Invalid sort filter!!" });
        }

        // Validate page
        if (!Number.isFinite(page) || page < 1) {
            return res.status(400).json({ message: "Invalid page parameter!!" });
        }

        const offset = (page - 1) * LIMIT;
        const status = status_filter.length > 0 ? status_filter : valid_status;

        // Build search condition - reusable for both queries
        const searchCondition = search_query ? sql`
            AND EXISTS (
                SELECT 1
                FROM order_items oi2
                LEFT JOIN products p2 ON p2.id = oi2.product_id
                WHERE oi2.order_id = o.id
                AND (
                    to_tsvector('english', coalesce(p2.name,'') || ' ' || coalesce(p2.short_description,'')) 
                    @@ plainto_tsquery('english', ${search_query})
                    OR p2.name ILIKE ${'%' + search_query + '%'}
                    OR p2.short_description ILIKE ${'%' + search_query + '%'}
                )
            )
        ` : sql``;

        // Get count of all filtered orders
        const totalOrdersResult = await sql`
            SELECT COUNT(DISTINCT o.id)::int AS total
            FROM orders o
            WHERE o.status = ANY(${status})
                ${searchCondition}
        `;

        const total = totalOrdersResult?.[0]?.total ?? 0;

        if (total === 0) {
            return res.status(200).json({
                data: [],
                meta: {
                    totalOrders: 0,
                    totalPages: 1,
                    page: 1,
                    limit: LIMIT
                }
            });
        }

        const totalPages = Math.max(1, Math.ceil(total / LIMIT));

        // Get orders with their IDs first (with pagination and sorting)
        const orderIds = await sql`
            SELECT o.id
            FROM orders o
            WHERE o.status = ANY(${status})
                ${searchCondition}
            ${sort_filter === 'price_desc' ? sql`ORDER BY o.total_amount DESC NULLS LAST, o.id DESC` : sql``}
            ${sort_filter === 'price_asc' ? sql`ORDER BY o.total_amount ASC NULLS LAST, o.id DESC` : sql``}
            ${sort_filter === 'date_desc' ? sql`ORDER BY o.created_at DESC, o.id DESC` : sql``}
            ${sort_filter === 'date_asc' ? sql`ORDER BY o.created_at ASC, o.id ASC` : sql``}
            LIMIT ${LIMIT} OFFSET ${offset}
        `;

        if (orderIds.length === 0) {
            return res.status(200).json({
                data: [],
                meta: {
                    totalOrders: total,
                    totalPages: totalPages,
                    page,
                    limit: LIMIT
                }
            });
        }

        const orderIdList = orderIds.map(row => row.id);

        // Get full order details with all items
        const ordersWithItems = await sql`
            SELECT
                o.id AS order_id,
                o.public_id AS order_public_id,
                o.transaction_id,
                o.subtotal,
                o.shipping_cost,
                o.tax_amount,
                o.discount_amount,
                o.total_amount,
                o.status AS order_status,
                o.currency,
                o.payment_method,
                o.placed_at,
                o.paid_at,
                o.shipped_at,
                o.delivered_at,
                o.notes,
                o.created_at AS order_created_at,
                o.updated_at AS order_updated_at,

                oi.id AS item_id,
                oi.public_id AS item_public_id,
                oi.product_id,
                oi.variant_id,
                oi.product_name,
                oi.status AS item_status,
                oi.quantity,
                oi.unit_price,
                oi.cancelled_at,
                oi.created_at AS item_created_at,
                (oi.unit_price * oi.quantity) AS item_total_price,

                p.slug AS product_slug,
                p.name AS product_name,
                p.short_description AS product_description,
                
                pv.color,
                pv.hex_color,
                pv.size,
                
                pi.url AS image_url,
                pi.alt_text AS image_alt_text

            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id = oi.product_id
            LEFT JOIN product_variants pv ON pv.id = oi.variant_id
            LEFT JOIN LATERAL (
                SELECT url, alt_text
                FROM product_images
                WHERE product_id = oi.product_id
                AND is_primary = TRUE
                LIMIT 1
            ) pi ON TRUE

            WHERE o.id = ANY(${orderIdList})
            ORDER BY 
                CASE 
                    WHEN ${sort_filter} = 'price_desc' THEN o.total_amount 
                END DESC NULLS LAST,
                CASE 
                    WHEN ${sort_filter} = 'price_asc' THEN o.total_amount 
                END ASC NULLS LAST,
                CASE 
                    WHEN ${sort_filter} = 'date_desc' THEN o.created_at 
                END DESC,
                CASE 
                    WHEN ${sort_filter} = 'date_asc' THEN o.created_at 
                END ASC,
                o.id DESC,
                oi.id ASC
        `;

        // Transform flat results into nested structure
        const ordersMap = new Map();

        for (const row of ordersWithItems) {
            const orderId = row.order_id;

            // Initialize order if not exists
            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, {
                    id: row.order_id,
                    public_id: row.order_public_id,
                    transaction_id: row.transaction_id,
                    subtotal: row.subtotal,
                    shipping_cost: row.shipping_cost,
                    tax_amount: row.tax_amount,
                    discount_amount: row.discount_amount,
                    total_amount: row.total_amount,
                    status: row.order_status,
                    currency: row.currency,
                    payment_method: row.payment_method,
                    placed_at: row.placed_at,
                    paid_at: row.paid_at,
                    shipped_at: row.shipped_at,
                    delivered_at: row.delivered_at,
                    notes: row.notes,
                    created_at: row.order_created_at,
                    updated_at: row.order_updated_at,
                    items: []
                });
            }

            // Add order item if exists (handle case where order has no items)
            if (row.item_id) {
                const order = ordersMap.get(orderId);
                order.items.push({
                    id: row.item_id,
                    public_id: row.item_public_id,
                    product_id: row.product_id,
                    variant_id: row.variant_id,
                    product_name: row.product_name,
                    status: row.item_status,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    total_price: row.item_total_price,
                    cancelled_at: row.cancelled_at,
                    created_at: row.item_created_at,
                    product: {
                        slug: row.product_slug,
                        name: row.product_name,
                        description: row.product_description
                    },
                    variant: row.variant_id ? {
                        color: row.color,
                        hex_color: row.hex_color,
                        size: row.size
                    } : null,
                    image: row.image_url ? {
                        url: row.image_url,
                        alt_text: row.image_alt_text
                    } : null
                });
            }
        }

        // Convert map to array
        const data = Array.from(ordersMap.values());

        // Return response
        return res.status(200).json({
            data,
            meta: {
                totalOrders: total,
                totalPages: totalPages,
                page,
                limit: LIMIT
            }
        });

    } catch (error) {
        logger.error("Error while getting orders!!", error);
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
};

async function init_carts(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS carts (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type cart_type NOT NULL DEFAULT 'active',
            total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            expires_at TIMESTAMP WITH TIME ZONE
        );
    `);

    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_carts_user_active ON carts(user_id) WHERE (type = 'active');`);
}

async function init_cart_items(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
            id BIGSERIAL PRIMARY KEY,
            cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
            variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
            quantity INT NOT NULL CHECK (quantity >= 1),
            price_snapshot NUMERIC(12,2),
            added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);`);
}

async function init_favourites(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS favorites (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE (user_id, product_id)
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);`);
}

async function init_notifications(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type notification_type NOT NULL,
            title VARCHAR(255),
            body TEXT,
            metadata JSONB,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            sent_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);`);
}

async function init_message_threads(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS message_threads (
            id BIGSERIAL PRIMARY KEY,
            thread_key UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- customer who started
            last_message_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_message_threads_user ON message_threads(user_id);`);
}

async function init_messages(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id BIGSERIAL PRIMARY KEY,
            thread_id BIGINT NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
            sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
            body TEXT NOT NULL,
            attachments JSONB,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);`);
}



