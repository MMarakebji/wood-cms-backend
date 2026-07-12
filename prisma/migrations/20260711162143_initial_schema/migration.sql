-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_sessions" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" INET,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_settings" (
    "id" SMALLINT NOT NULL DEFAULT 1,
    "company_name" VARCHAR(150) NOT NULL,
    "logo_url" TEXT NOT NULL,
    "logo_public_id" TEXT NOT NULL,
    "logo_alt_text" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(255),
    "address_line_1" VARCHAR(255) NOT NULL,
    "address_line_2" VARCHAR(255),
    "privacy_policy_text" VARCHAR(100),
    "privacy_policy_url" TEXT,
    "footer_text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homepage_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_sections" (
    "id" UUID NOT NULL,
    "section_key" VARCHAR(80) NOT NULL,
    "section_type" VARCHAR(40) NOT NULL,
    "title" VARCHAR(255),
    "subtitle" VARCHAR(255),
    "body" TEXT,
    "button_text" VARCHAR(100),
    "button_link" VARCHAR(255),
    "background_image_url" TEXT,
    "background_image_public_id" TEXT,
    "background_image_alt_text" VARCHAR(255),
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_images" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_public_id" TEXT NOT NULL,
    "alt_text" VARCHAR(255) NOT NULL,
    "caption" VARCHAR(255),
    "display_order" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homepage_section_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_items" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "title" VARCHAR(180),
    "description" TEXT NOT NULL,
    "icon_name" VARCHAR(80),
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homepage_section_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "description" TEXT,
    "button_text" VARCHAR(100),
    "button_link" VARCHAR(255),
    "image_url" TEXT NOT NULL,
    "image_public_id" TEXT NOT NULL,
    "image_alt_text" VARCHAR(255) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "short_description" VARCHAR(500),
    "description" TEXT,
    "image_url" TEXT,
    "image_public_id" TEXT,
    "image_alt_text" VARCHAR(255),
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "short_description" VARCHAR(500),
    "description" TEXT,
    "base_price" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'CZK',
    "price_unit" VARCHAR(40),
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_features" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "feature_type" VARCHAR(20) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_public_id" TEXT NOT NULL,
    "alt_text" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" UUID NOT NULL,
    "product_id" UUID,
    "list_name" VARCHAR(160) NOT NULL,
    "item_name" VARCHAR(160),
    "length_mm" INTEGER,
    "width_mm" INTEGER,
    "thickness_mm" INTEGER,
    "volume_m3" DECIMAL(10,4),
    "price_per_m3" DECIMAL(12,2),
    "price_per_piece" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'CZK',
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'NEW',
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_sessions_token_hash_key" ON "refresh_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_sessions_admin_id_idx" ON "refresh_sessions"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_sections_section_key_key" ON "homepage_sections"("section_key");

-- CreateIndex
CREATE INDEX "homepage_sections_is_active_display_order_idx" ON "homepage_sections"("is_active", "display_order");

-- CreateIndex
CREATE INDEX "homepage_section_images_section_id_idx" ON "homepage_section_images"("section_id");

-- CreateIndex
CREATE INDEX "homepage_section_items_section_id_idx" ON "homepage_section_items"("section_id");

-- CreateIndex
CREATE INDEX "banners_is_active_display_order_idx" ON "banners"("is_active", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_is_active_display_order_idx" ON "services"("is_active", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_is_active_display_order_idx" ON "products"("is_active", "display_order");

-- CreateIndex
CREATE INDEX "product_features_product_id_idx" ON "product_features"("product_id");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_product_id_sort_order_key" ON "product_images"("product_id", "sort_order");

-- CreateIndex
CREATE INDEX "price_lists_product_id_idx" ON "price_lists"("product_id");

-- CreateIndex
CREATE INDEX "price_lists_is_active_display_order_idx" ON "price_lists"("is_active", "display_order");

-- CreateIndex
CREATE INDEX "contact_messages_status_created_at_idx" ON "contact_messages"("status", "created_at");

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_images" ADD CONSTRAINT "homepage_section_images_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_items" ADD CONSTRAINT "homepage_section_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- =========================================================
-- Custom constraints required by the Wood Products CMS
-- =========================================================

-- Homepage section ordering
ALTER TABLE "homepage_sections"
ADD CONSTRAINT "homepage_sections_display_order_check"
CHECK ("display_order" >= 0);

ALTER TABLE "homepage_section_images"
ADD CONSTRAINT "homepage_section_images_display_order_check"
CHECK ("display_order" >= 0);

ALTER TABLE "homepage_section_items"
ADD CONSTRAINT "homepage_section_items_display_order_check"
CHECK ("display_order" >= 0);

-- Banner ordering
ALTER TABLE "banners"
ADD CONSTRAINT "banners_display_order_check"
CHECK ("display_order" >= 0);

-- Service ordering
ALTER TABLE "services"
ADD CONSTRAINT "services_display_order_check"
CHECK ("display_order" >= 0);

-- Product price and ordering
ALTER TABLE "products"
ADD CONSTRAINT "products_base_price_check"
CHECK ("base_price" IS NULL OR "base_price" >= 0);

ALTER TABLE "products"
ADD CONSTRAINT "products_display_order_check"
CHECK ("display_order" >= 0);

-- Product feature validation
ALTER TABLE "product_features"
ADD CONSTRAINT "product_features_type_check"
CHECK ("feature_type" IN ('BENEFIT', 'DRAWBACK'));

ALTER TABLE "product_features"
ADD CONSTRAINT "product_features_display_order_check"
CHECK ("display_order" >= 0);

-- Product image ordering
ALTER TABLE "product_images"
ADD CONSTRAINT "product_images_sort_order_check"
CHECK ("sort_order" >= 0);

-- Only one image may be primary for each product
CREATE UNIQUE INDEX "product_images_one_primary_per_product"
ON "product_images" ("product_id")
WHERE "is_primary" = TRUE;

-- Price-list dimension validation
ALTER TABLE "price_lists"
ADD CONSTRAINT "price_lists_length_mm_check"
CHECK ("length_mm" IS NULL OR "length_mm" > 0);

ALTER TABLE "price_lists"
ADD CONSTRAINT "price_lists_width_mm_check"
CHECK ("width_mm" IS NULL OR "width_mm" > 0);

ALTER TABLE "price_lists"
ADD CONSTRAINT "price_lists_thickness_mm_check"
CHECK ("thickness_mm" IS NULL OR "thickness_mm" > 0);

-- Price-list price and volume validation
ALTER TABLE "price_lists"
ADD CONSTRAINT "price_lists_volume_m3_check"
CHECK ("volume_m3" IS NULL OR "volume_m3" >= 0);

ALTER TABLE "price_lists"
ADD CONSTRAINT "price_lists_price_per_m3_check"
CHECK ("price_per_m3" IS NULL OR "price_per_m3" >= 0);

ALTER TABLE "price_lists"
ADD CONSTRAINT "price_lists_price_per_piece_check"
CHECK ("price_per_piece" IS NULL OR "price_per_piece" >= 0);

ALTER TABLE "price_lists"
ADD CONSTRAINT "price_lists_display_order_check"
CHECK ("display_order" >= 0);

-- Contact-message status validation
ALTER TABLE "contact_messages"
ADD CONSTRAINT "contact_messages_status_check"
CHECK ("status" IN ('NEW', 'READ', 'ARCHIVED'));