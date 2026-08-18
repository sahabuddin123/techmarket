<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Customer Wishlist Table
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });

        // 2. Customer Address Book Table
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('label')->default('Home'); // Home, Office, Other
            $table->string('name');
            $table->string('phone');
            $table->text('address');
            $table->string('district');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 3. Dynamic Shipping Rates & Zones Table
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->string('zone_name');
            $table->string('district')->nullable(); // Null means default for zone
            $table->decimal('rate', 10, 2);
            $table->string('estimated_days')->default('24-48 hours');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Dynamic Payment Methods Configuration Table
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // COD, bKash, Nagad, Rocket, Card
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 5. Customer Product Questions & Answers Table
        Schema::create('product_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('question');
            $table->text('answer')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });

        // 6. Dynamic CMS Pages Table
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // 7. Dynamic Blog Posts Table
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('Hardware News');
            $table->longText('content');
            $table->string('image')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('cms_pages');
        Schema::dropIfExists('product_questions');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('shipping_rates');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('wishlists');
    }
};
