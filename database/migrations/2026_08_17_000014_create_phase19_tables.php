<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('navigations')) {
            Schema::create('navigations', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('url');
                $table->string('location')->default('header')->index(); // header, footer_info, footer_policies, footer, mega_menu
                $table->foreignId('parent_id')->nullable()->constrained('navigations')->onDelete('cascade');
                $table->integer('sort_order')->default(0);
                $table->boolean('is_visible')->default(true);
                $table->boolean('open_new_tab')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('navigations');
    }
};
