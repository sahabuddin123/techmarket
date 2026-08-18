<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'seo_title')) {
                $table->string('seo_title')->nullable()->after('meta_title');
            }
            if (!Schema::hasColumn('products', 'canonical_url')) {
                $table->string('canonical_url')->nullable()->after('focus_keyword');
            }
            if (!Schema::hasColumn('products', 'meta_robots')) {
                $table->string('meta_robots')->default('index, follow')->after('canonical_url');
            }
            if (!Schema::hasColumn('products', 'og_title')) {
                $table->string('og_title')->nullable()->after('meta_robots');
            }
            if (!Schema::hasColumn('products', 'og_description')) {
                $table->text('og_description')->nullable()->after('og_title');
            }
            if (!Schema::hasColumn('products', 'og_image')) {
                $table->string('og_image')->nullable()->after('og_description');
            }
            if (!Schema::hasColumn('products', 'twitter_title')) {
                $table->string('twitter_title')->nullable()->after('og_image');
            }
            if (!Schema::hasColumn('products', 'twitter_description')) {
                $table->text('twitter_description')->nullable()->after('twitter_title');
            }
            if (!Schema::hasColumn('products', 'twitter_image')) {
                $table->string('twitter_image')->nullable()->after('twitter_description');
            }
            if (!Schema::hasColumn('products', 'is_indexable')) {
                $table->boolean('is_indexable')->default(true)->after('twitter_image');
            }
            if (!Schema::hasColumn('products', 'seo_score')) {
                $table->integer('seo_score')->default(0)->after('is_indexable');
            }
            if (!Schema::hasColumn('products', 'seo_last_updated_at')) {
                $table->timestamp('seo_last_updated_at')->nullable()->after('seo_score');
            }
        });

        Schema::create('product_slug_redirects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('old_slug')->index();
            $table->string('new_slug');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_slug_redirects');

        Schema::table('products', function (Blueprint $table) {
            $cols = [
                'seo_title', 'canonical_url', 'meta_robots',
                'og_title', 'og_description', 'og_image',
                'twitter_title', 'twitter_description', 'twitter_image',
                'is_indexable', 'seo_score', 'seo_last_updated_at'
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('products', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
