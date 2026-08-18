<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend Brands Table with banner, rich description, and SEO metadata
        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'banner')) {
                $table->string('banner')->nullable()->after('logo');
            }
            if (!Schema::hasColumn('brands', 'description')) {
                $table->text('description')->nullable()->after('banner');
            }
            if (!Schema::hasColumn('brands', 'website_url')) {
                $table->string('website_url')->nullable()->after('description');
            }
            if (!Schema::hasColumn('brands', 'is_featured')) {
                $table->boolean('is_featured')->default(true)->after('website_url');
            }
            if (!Schema::hasColumn('brands', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('is_featured');
            }
            if (!Schema::hasColumn('brands', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('is_active');
            }
            if (!Schema::hasColumn('brands', 'meta_title')) {
                $table->string('meta_title')->nullable()->after('sort_order');
            }
            if (!Schema::hasColumn('brands', 'meta_description')) {
                $table->text('meta_description')->nullable()->after('meta_title');
            }
        });

        // 2. Extend BlogPost Table with tags, excerpt, read time, and SEO metadata
        Schema::table('blog_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('blog_posts', 'excerpt')) {
                $table->text('excerpt')->nullable()->after('category');
            }
            if (!Schema::hasColumn('blog_posts', 'tags')) {
                $table->json('tags')->nullable()->after('excerpt');
            }
            if (!Schema::hasColumn('blog_posts', 'read_time')) {
                $table->string('read_time')->default('5 min read')->after('tags');
            }
            if (!Schema::hasColumn('blog_posts', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('is_published');
            }
            if (!Schema::hasColumn('blog_posts', 'meta_title')) {
                $table->string('meta_title')->nullable()->after('is_featured');
            }
            if (!Schema::hasColumn('blog_posts', 'meta_description')) {
                $table->text('meta_description')->nullable()->after('meta_title');
            }
        });

        // 3. Extend CmsPage Table with banner and structured section blocks
        Schema::table('cms_pages', function (Blueprint $table) {
            if (!Schema::hasColumn('cms_pages', 'banner')) {
                $table->string('banner')->nullable()->after('content');
            }
            if (!Schema::hasColumn('cms_pages', 'sections')) {
                $table->json('sections')->nullable()->after('banner');
            }
        });

        // 4. Create Service Requests Table for customer hardware repair/servicing
        if (!Schema::hasTable('service_requests')) {
            Schema::create('service_requests', function (Blueprint $table) {
                $table->id();
                $table->string('tracking_code')->unique(); // e.g. SR-2026-9281
                $table->string('customer_name');
                $table->string('customer_phone');
                $table->string('customer_email')->nullable();
                $table->string('device_type'); // Laptop, Desktop, GPU, Monitor, etc.
                $table->string('brand_name')->nullable();
                $table->text('issue_description');
                $table->date('preferred_date')->nullable();
                $table->string('service_branch')->default('Dhaka Multiplan Center');
                $table->text('address')->nullable();
                $table->enum('status', ['pending', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'])->default('pending');
                $table->string('assigned_technician')->nullable();
                $table->text('admin_notes')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        // 5. Create EMI Partners Table for bank financing information
        if (!Schema::hasTable('emi_partners')) {
            Schema::create('emi_partners', function (Blueprint $table) {
                $table->id();
                $table->string('bank_name');
                $table->string('logo')->nullable();
                $table->decimal('min_amount', 12, 2)->default(5000.00);
                $table->json('available_tenures'); // e.g. ["3", "6", "9", "12", "18", "24", "36"]
                $table->string('interest_rate_note')->default('0% Interest on selected credit cards');
                $table->text('terms')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('emi_partners');
        Schema::dropIfExists('service_requests');

        Schema::table('cms_pages', function (Blueprint $table) {
            $table->dropColumn(['banner', 'sections']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['excerpt', 'tags', 'read_time', 'is_featured', 'meta_title', 'meta_description']);
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['banner', 'description', 'website_url', 'is_featured', 'is_active', 'sort_order', 'meta_title', 'meta_description']);
        });
    }
};
