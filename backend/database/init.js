import { sql } from "../config/db.js";
import logger from "../config/logger.js";

export async function initDB(skip) {
    try {

        // Very cheap metadata check: does the marker table exist?
        // neon's sql`` returns an array of rows for SELECTs.
        // const existsRes = await sql`SELECT to_regclass('public._app_initialized') AS marker;`;
        // const markerPresent = Array.isArray(existsRes) && existsRes[0] && existsRes[0].marker !== null;
        // console.log(existsRes)

        // if (markerPresent && !force) {
        //     console.log("DB already initialized — skipping initDB.");
        //     return;
        // }

        // if (force && markerPresent) {
        //     console.log("Force init requested — re-running initialization (dev only).");
        //     // In dev we remove the marker row so init_* steps run again.
        //     // NOTE: do NOT drop your real tables here in production.
        //     await sql`DELETE FROM _app_initialized;`;
        // }

        if (skip) {
            logger.info("Skipping db initialiation");
            return
        }

        logger.info("Running DB initialization...");

        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

        await init_enums();
        await init_users();
        await init_shipping_addresses();
        await init_products();
        await init_product_images();

        //add foreign key to to products and product images for main primary image. This is done as product image db is only created now.
        await sql`
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
        `

        await init_product_variants();
        // await init_inventories();
        await init_product_details();
        await init_reviews();
        await init_orders();

        await sql`
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
        `

        await init_order_items();
        await init_carts();
        await init_cart_items();
        await init_favourites();
        await init_notifications();
        await init_message_threads();
        await init_messages();

        logger.info("databse initialized successfully!!");
    } catch (error) {
        console.log("Error occured while initializing database", error);
    }
}

async function init_enums() {
    await sql`
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
                CREATE TYPE order_status AS ENUM ('pending','paid','shipped','delivered','cancelled','refunded','returned');
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
    `;
}

async function init_users() {
    await sql`
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
        `;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`;
    await sql`CREATE UNIQUE INDEX unique_active_email ON users(email) WHERE deleted_at IS NULL;`;
}

async function init_shipping_addresses() {
    await sql`
        CREATE TABLE IF NOT EXISTS shipping_addresses (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            label VARCHAR(64),
            recipient_name VARCHAR(255),
            line1 VARCHAR(512),
            line2 VARCHAR(512),
            city VARCHAR(128),
            state VARCHAR(128),
            postal_code VARCHAR(32),
            country VARCHAR(128),
            phone VARCHAR(50),
            is_default BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user ON shipping_addresses(user_id);`;
}

async function init_products() {
    await sql`
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
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(short_description,'')));`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);`
}

async function init_product_images() {
    await sql`
        CREATE TABLE IF NOT EXISTS  product_images (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            url VARCHAR(2048) NOT NULL,
            alt_text VARCHAR(512),
            is_primary BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary);`
}

async function init_product_variants() {
    await sql`
        CREATE TABLE IF NOT EXISTS product_variants (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            sku VARCHAR(128) UNIQUE,
            color VARCHAR(128) NOT NULL,
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
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);`
}

// async function init_inventories() {
//     await sql`
//         CREATE TABLE IF NOT EXISTS inventories(
//             id BIGSERIAL PRIMARY KEY,
//             variant_id BIGINT NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
//             available INT NOT NULL DEFAULT 0 CHECK(available >= 0),
//             reserved INT NOT NULL DEFAULT 0 CHECK(reserved >= 0),
//             on_hold INT NOT NULL DEFAULT 0 CHECK(on_hold >= 0),
//             updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
//     );
//     `

//     await sql`CREATE INDEX IF NOT EXISTS idx_inventories_variant ON inventories(variant_id);`
// }

async function init_product_details() {
    await sql`
        CREATE TABLE IF NOT EXISTS product_details (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            sort_order INT NOT NULL DEFAULT 0,
            text VARCHAR(1024) NOT NULL,
            CONSTRAINT uq_product_detail_order UNIQUE (product_id, sort_order)
        );
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_product_details_product ON product_details(product_id);`
}

async function init_reviews() {
    await sql`
        CREATE TABLE IF NOT EXISTS reviews (
            id BIGSERIAL PRIMARY KEY,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            order_id BIGINT, -- optional FK to orders (defined later)
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title VARCHAR(255),
            body TEXT,
            images JSONB,
            is_verified_purchase BOOLEAN DEFAULT FALSE,
            helpful_count INT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);`
}

async function init_orders() {
    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id BIGSERIAL PRIMARY KEY,
            public_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
            status order_status NOT NULL DEFAULT 'pending',
            subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
            shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
            tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
            discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
            total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
            currency CHAR(3) DEFAULT 'USD',
            shipping_address_id BIGINT REFERENCES shipping_addresses(id),
            billing_address_id BIGINT REFERENCES shipping_addresses(id),
            payment_method VARCHAR(255),
            placed_at TIMESTAMP WITH TIME ZONE,
            paid_at TIMESTAMP WITH TIME ZONE,
            shipped_at TIMESTAMP WITH TIME ZONE,
            delivered_at TIMESTAMP WITH TIME ZONE,
            cancelled_at TIMESTAMP WITH TIME ZONE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at);`
}

async function init_order_items() {
    await sql`
        CREATE TABLE IF NOT EXISTS order_items (
            id BIGSERIAL PRIMARY KEY,
            order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE SET NULL,
            variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL,
            sku VARCHAR(128),
            product_name VARCHAR(512),
            quantity INT NOT NULL CHECK (quantity > 0),
            unit_price NUMERIC(12,2) NOT NULL,
            original_unit_price NUMERIC(12,2),
            discount NUMERIC(12,2) DEFAULT 0,
            tax NUMERIC(12,2) DEFAULT 0,
            total_line_amount NUMERIC(12,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);`
}

async function init_carts() {
    await sql`
        CREATE TABLE IF NOT EXISTS carts (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type cart_type NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            expires_at TIMESTAMP WITH TIME ZONE
        );
    `

    await sql`CREATE UNIQUE INDEX IF NOT EXISTS uq_carts_user_active ON carts(user_id) WHERE (type = 'active');`;
}

async function init_cart_items() {
    await sql`
        CREATE TABLE IF NOT EXISTS cart_items (
            id BIGSERIAL PRIMARY KEY,
            cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
            variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
            quantity INT NOT NULL CHECK (quantity >= 1),
            price_snapshot NUMERIC(12,2),
            added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);`
}

async function init_favourites() {
    await sql`
        CREATE TABLE IF NOT EXISTS favorites (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE (user_id, product_id)
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);`
}

async function init_notifications() {
    await sql`
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
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);`
}

async function init_message_threads() {
    await sql`
        CREATE TABLE IF NOT EXISTS message_threads (
            id BIGSERIAL PRIMARY KEY,
            thread_key UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- customer who started
            last_message_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_message_threads_user ON message_threads(user_id);`
}

async function init_messages() {
    await sql`
        CREATE TABLE IF NOT EXISTS messages (
            id BIGSERIAL PRIMARY KEY,
            thread_id BIGINT NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
            sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
            body TEXT NOT NULL,
            attachments JSONB,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);`
}



