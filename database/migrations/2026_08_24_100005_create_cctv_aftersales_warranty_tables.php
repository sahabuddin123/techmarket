<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Installed Equipment Register
        Schema::create('cctv_installed_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('product_name_snapshot', 255);
            $table->string('sku_snapshot', 100)->nullable();
            $table->string('serial_number', 100)->unique();
            $table->string('mac_address', 50)->nullable();
            $table->string('device_type', 50)->default('camera'); // camera, recorder, storage, psu, switch, accessory
            $table->string('camera_name', 100)->nullable();
            $table->string('location_floor', 50)->nullable();
            $table->string('location_room', 100)->nullable();
            $table->string('coverage_area', 150)->nullable();
            $table->string('ip_address', 50)->nullable();
            $table->integer('channel_number')->nullable();
            $table->date('installation_date')->nullable();
            $table->string('status', 40)->default('operational')->index(); // operational, faulty, replaced, removed, returned
            $table->text('notes')->nullable();
            $table->json('photos')->nullable();
            $table->timestamps();
        });

        // 2. CCTV Warranties
        Schema::create('cctv_warranties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('installed_equipment_id')->constrained('cctv_installed_equipment')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->string('serial_number', 100)->index();
            $table->string('warranty_type', 50)->default('manufacturer'); // manufacturer, seller, installation, extended
            $table->date('warranty_start');
            $table->date('warranty_end');
            $table->string('status', 40)->default('active')->index(); // active, expiring_soon, expired, claimed, void, cancelled
            $table->text('coverage_terms')->nullable();
            $table->text('exclusions')->nullable();
            $table->timestamps();
        });

        // 3. Diagnostic Questions
        Schema::create('cctv_diagnostic_questions', function (Blueprint $table) {
            $table->id();
            $table->string('device_type', 50)->default('camera'); // camera, recorder, storage, network
            $table->string('issue_category', 50)->default('hardware');
            $table->string('question', 255);
            $table->json('options'); // [{ "label": "Yes", "next_hint": "Check power" }]
            $table->string('resolution_hint', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. CCTV Service Requests
        Schema::create('cctv_service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 50)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('installed_equipment_id')->nullable()->constrained('cctv_installed_equipment')->onDelete('set null');
            $table->foreignId('warranty_id')->nullable()->constrained('cctv_warranties')->onDelete('set null');
            $table->string('customer_name', 150);
            $table->string('customer_phone', 50);
            $table->text('customer_address');
            $table->string('service_type_code', 50)->default('troubleshooting');
            $table->string('problem_category', 50)->default('camera'); // camera, recording, playback, network, power, storage
            $table->text('problem_description');
            $table->string('priority', 30)->default('normal')->index(); // low, normal, high, urgent
            $table->string('status', 40)->default('submitted')->index(); // submitted, under_review, approved, rejected, scheduled, assigned, technician_on_site, diagnosing, repairing, waiting_for_parts, waiting_for_customer, resolved, completed, cancelled, reopened
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('preferred_visit_date')->nullable();
            $table->string('preferred_time', 50)->nullable();
            $table->json('diagnostic_answers')->nullable();
            $table->text('internal_notes')->nullable();
            $table->json('photos')->nullable();
            $table->decimal('total_service_cost', 10, 2)->default(0.00);
            $table->decimal('warranty_covered_amount', 10, 2)->default(0.00);
            $table->decimal('customer_payable_amount', 10, 2)->default(0.00);
            $table->timestamps();
        });

        // 5. CCTV Service Visits
        Schema::create('cctv_service_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained('cctv_service_requests')->onDelete('cascade');
            $table->foreignId('technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('visit_number', 50)->unique();
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->string('status', 40)->default('scheduled'); // scheduled, on_site, in_progress, completed, cancelled
            $table->text('diagnosis_notes')->nullable();
            $table->text('work_performed')->nullable();
            $table->json('checklist')->nullable();
            $table->json('photos')->nullable();
            $table->timestamps();
        });

        // 6. Spare Parts Consumption
        Schema::create('cctv_service_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained('cctv_service_requests')->onDelete('cascade');
            $table->foreignId('service_visit_id')->nullable()->constrained('cctv_service_visits')->onDelete('set null');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity_used')->default(1);
            $table->decimal('unit_price', 10, 2)->default(0.00);
            $table->boolean('is_warranty_covered')->default(false);
            $table->foreignId('technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 7. Equipment Replacement History
        Schema::create('cctv_equipment_replacements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained('cctv_service_requests')->onDelete('cascade');
            $table->foreignId('old_equipment_id')->constrained('cctv_installed_equipment')->onDelete('cascade');
            $table->foreignId('new_equipment_id')->nullable()->constrained('cctv_installed_equipment')->onDelete('set null');
            $table->string('old_serial_number', 100);
            $table->string('new_serial_number', 100);
            $table->text('reason');
            $table->foreignId('replaced_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 8. Warranty Claims
        Schema::create('cctv_warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number', 50)->unique();
            $table->foreignId('warranty_id')->constrained('cctv_warranties')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('service_request_id')->nullable()->constrained('cctv_service_requests')->onDelete('set null');
            $table->foreignId('installed_equipment_id')->constrained('cctv_installed_equipment')->onDelete('cascade');
            $table->date('claim_date');
            $table->text('issue_description');
            $table->string('status', 40)->default('submitted')->index(); // submitted, under_review, approved, rejected, sent_to_manufacturer, repairing, replacement_processing, returned, completed, cancelled
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cctv_warranty_claims');
        Schema::dropIfExists('cctv_equipment_replacements');
        Schema::dropIfExists('cctv_service_parts');
        Schema::dropIfExists('cctv_service_visits');
        Schema::dropIfExists('cctv_service_requests');
        Schema::dropIfExists('cctv_diagnostic_questions');
        Schema::dropIfExists('cctv_warranties');
        Schema::dropIfExists('cctv_installed_equipment');
    }
};
