<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_areas', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ta');
            $table->json('postal_codes')->nullable();
            $table->text('landmarks')->nullable();
            $table->integer('delivery_time_min')->default(30);
            $table->integer('delivery_time_max')->default(60);
            $table->boolean('is_active')->default(true)->index();
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('delivery_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_area_id')->constrained('delivery_areas')->onDelete('cascade');
            $table->decimal('min_order_amount', 10, 2)->default(0);
            $table->decimal('charge_amount', 10, 2);
            $table->decimal('is_free_above_amount', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 20)->unique()->index();
            $table->string('email')->nullable()->index();
            $table->text('default_address')->nullable();
            $table->string('landmark')->nullable();
            $table->foreignId('delivery_area_id')->nullable()->constrained('delivery_areas');
            $table->integer('total_orders')->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_order_at')->nullable();
            $table->timestamps();
            
            $table->index(['is_active', 'total_orders']);
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ta');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable();
            $table->string('image_url', 500)->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name_en');
            $table->string('name_ta');
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_ta')->nullable();
            
            // Pricing
            $table->decimal('price_per_kg', 10, 2);
            $table->integer('discount_percentage')->default(0);
            // In standard Laravel, virtual columns can be added via raw DB statements or specific modifiers, 
            // but for simplicity and cross-compatibility we will just store it or use storedAs.
            $table->decimal('discounted_price', 10, 2)->storedAs('price_per_kg - (price_per_kg * discount_percentage / 100)')->index();

            $table->string('sku', 100)->unique()->nullable();
            $table->string('freshness_tag', 100)->nullable();
            $table->json('nutritional_info')->nullable();
            
            $table->string('primary_image', 500)->nullable();
            $table->json('gallery_images')->nullable();
            
            $table->boolean('is_available')->default(true);
            $table->decimal('stock_quantity', 10, 2)->default(0);
            $table->decimal('min_order_quantity', 8, 2)->default(0.5);
            $table->decimal('max_order_quantity', 8, 2)->default(10);
            
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            
            $table->integer('view_count')->default(0);
            $table->integer('order_count')->default(0);
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('is_active')->default(true)->index();
            
            $table->timestamps();
            
            $table->index(['is_active', 'is_available', 'category_id']);
        });

        Schema::create('cutting_options', function (Blueprint $table) {
            $table->id();
            $table->string('name_en', 100);
            $table->string('name_ta', 100);
            $table->string('code', 50)->unique();
            $table->text('description_en')->nullable();
            $table->text('description_ta')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50)->unique();
            $table->foreignId('customer_id')->constrained('customers');
            
            $table->string('customer_name');
            $table->string('customer_phone', 20);
            $table->string('customer_email')->nullable();
            
            $table->text('delivery_address');
            $table->string('landmark')->nullable();
            $table->foreignId('delivery_area_id')->nullable()->constrained('delivery_areas');
            $table->string('delivery_area_name')->nullable();
            $table->text('delivery_notes')->nullable();
            
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_charge', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            
            $table->enum('status', [
                'pending','confirmed','processing',
                'out_for_delivery','delivered','cancelled','refunded'
            ])->default('pending')->index();
            $table->enum('payment_method', ['cod','online','bank_transfer'])->default('cod');
            $table->enum('payment_status', ['pending','paid','failed','refunded'])->default('pending');
            
            $table->boolean('whatsapp_sent')->default(false);
            $table->timestamp('whatsapp_sent_at')->nullable();
            $table->text('whatsapp_message')->nullable();
            
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('processing_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            $table->timestamp('estimated_delivery_time')->nullable();
            $table->string('delivery_person_name')->nullable();
            $table->string('delivery_person_phone', 20)->nullable();
            $table->text('admin_notes')->nullable();
            
            $table->timestamps();
            
            $table->index(['customer_id', 'status', 'created_at']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products');
            
            $table->string('product_name_en');
            $table->string('product_name_ta');
            $table->string('product_image', 500)->nullable();
            
            $table->decimal('weight_kg', 8, 2);
            $table->integer('quantity')->default(1);
            $table->foreignId('cutting_option_id')->nullable()->constrained('cutting_options');
            $table->string('cutting_option_name', 100)->nullable();
            
            $table->decimal('unit_price', 10, 2);
            $table->integer('discount_percentage')->default(0);
            $table->decimal('subtotal', 10, 2);
            
            $table->text('special_instructions')->nullable();
            $table->timestamps();
        });

        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->decimal('quantity_kg', 10, 2);
            $table->enum('type', ['in','out','adjustment']);
            $table->string('reason')->nullable();
            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('previous_quantity', 10, 2)->nullable();
            $table->decimal('new_quantity', 10, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title_en');
            $table->string('title_ta')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('subtitle_ta')->nullable();
            $table->string('image_url', 500);
            $table->string('mobile_image_url', 500)->nullable();
            $table->string('link_url', 500)->nullable();
            $table->string('button_text_en', 100)->nullable();
            $table->string('button_text_ta', 100)->nullable();
            $table->string('background_color', 20)->nullable();
            $table->string('text_color', 20)->nullable();
            $table->integer('display_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('title_en');
            $table->string('title_ta');
            $table->text('description_en')->nullable();
            $table->text('description_ta')->nullable();
            $table->string('code', 50)->unique()->nullable();
            $table->enum('discount_type', ['percentage','fixed']);
            $table->decimal('discount_value', 10, 2);
            $table->decimal('min_order_amount', 10, 2)->default(0);
            $table->decimal('max_discount_amount', 10, 2)->nullable();
            $table->enum('applicable_to', ['all','category','product'])->default('all');
            $table->json('applicable_ids')->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_count')->default(0);
            $table->integer('per_customer_limit')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
            
            $table->index(['start_date', 'end_date']);
        });

        Schema::create('offer_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('offers')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('order_id')->constrained('orders');
            $table->decimal('discount_amount', 10, 2);
            $table->timestamps();
        });

        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('order_id')->nullable()->constrained('orders');
            $table->integer('rating');
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(false)->index();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key_name', 100)->unique();
            $table->text('value')->nullable();
            $table->string('type', 50)->default('string');
            $table->string('group_name', 100)->nullable()->index();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('action', 100);
            $table->string('model', 100);
            $table->unsignedBigInteger('model_id')->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->timestamps();
            
            $table->index(['model', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('offer_usages');
        Schema::dropIfExists('offers');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cutting_options');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('delivery_charges');
        Schema::dropIfExists('delivery_areas');
    }
};
