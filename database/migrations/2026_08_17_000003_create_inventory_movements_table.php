<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('type', [
                'purchase', 
                'adjustment', 
                'sale', 
                'return', 
                'cancelled_order', 
                'damaged', 
                'reserved', 
                'released'
            ]);
            $table->integer('quantity'); // positive for additions, negative for deductions
            $table->integer('resulting_stock');
            $table->string('reference_type')->nullable(); // e.g. App\Models\Order
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
