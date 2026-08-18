<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('page_title')->nullable()->after('name');
            $table->text('subtitle')->nullable()->after('page_title');
            $table->string('seo_title')->nullable()->after('subtitle');
            $table->text('meta_description')->nullable()->after('seo_title');
            $table->text('meta_keywords')->nullable()->after('meta_description');
            $table->longText('seo_intro')->nullable()->after('meta_keywords');
            $table->boolean('sidebar_visible')->default(true)->after('seo_intro');
            $table->string('default_sort')->default('latest')->after('sidebar_visible');
            $table->json('filter_config')->nullable()->after('default_sort');
        });

        Schema::create('category_content_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('heading')->nullable();
            $table->string('section_type')->default('rich_text'); // rich_text, table, faq, features, html
            $table->longText('content')->nullable();
            $table->json('data')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('category_faqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('question');
            $table->text('answer');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('category_price_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('product_name');
            $table->string('price');
            $table->string('specs')->nullable();
            $table->string('custom_link')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_price_tables');
        Schema::dropIfExists('category_faqs');
        Schema::dropIfExists('category_content_sections');

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'page_title',
                'subtitle',
                'seo_title',
                'meta_description',
                'meta_keywords',
                'seo_intro',
                'sidebar_visible',
                'default_sort',
                'filter_config',
            ]);
        });
    }
};
