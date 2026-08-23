<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Dynamic CCTV Service Types Table
        Schema::create('cctv_service_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 50)->unique(); // equipment_only, installation, site_survey, maintenance, etc.
            $table->text('description')->nullable();
            $table->string('pricing_type', 50)->default('per_camera'); // fixed, per_camera, per_floor, per_meter, rule_based
            $table->decimal('base_rate', 10, 2)->default(0.00);
            $table->decimal('unit_rate', 10, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 2. CCTV Site Surveys Table
        Schema::create('cctv_site_surveys', function (Blueprint $table) {
            $table->id();
            $table->string('survey_number', 50)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('estimate_id')->nullable()->constrained('cctv_estimates')->onDelete('set null');
            $table->string('customer_name', 150);
            $table->string('customer_phone', 50);
            $table->string('customer_email', 150)->nullable();
            $table->string('project_name', 150)->nullable();
            $table->text('project_address')->nullable();
            $table->string('district', 100)->default('Dhaka');
            $table->string('upazila_area', 100)->nullable();
            $table->date('preferred_date')->nullable();
            $table->string('preferred_time', 50)->nullable();
            $table->integer('floors_count')->default(1);
            $table->string('project_type', 50)->default('commercial_office');
            $table->integer('estimated_camera_count')->default(4);
            $table->string('status', 40)->default('requested')->index(); // requested, pending_review, scheduled, assigned, in_progress, completed, cancelled, rejected
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('scheduled_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('site_photos')->nullable();
            $table->timestamps();
        });

        // 3. CCTV Site Survey Reports Table
        Schema::create('cctv_site_survey_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained('cctv_site_surveys')->onDelete('cascade');
            $table->integer('actual_camera_count')->default(4);
            $table->integer('indoor_cameras')->default(2);
            $table->integer('outdoor_cameras')->default(2);
            $table->integer('ptz_cameras')->default(0);
            $table->string('recommended_system_type', 30)->default('ip');
            $table->decimal('cable_length_meters', 10, 2)->default(100.00);
            $table->decimal('power_requirement_watts', 10, 2)->default(60.00);
            $table->string('installation_difficulty', 30)->default('standard'); // easy, standard, complex, hazardous
            $table->text('special_materials')->nullable();
            $table->text('technician_notes')->nullable();
            $table->json('photos')->nullable();
            $table->foreignId('converted_estimate_id')->nullable()->constrained('cctv_estimates')->onDelete('set null');
            $table->timestamps();
        });

        // 4. CCTV Installation Jobs Table
        Schema::create('cctv_installation_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_number', 50)->unique();
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('quote_id')->nullable()->constrained('cctv_quotes')->onDelete('set null');
            $table->foreignId('estimate_id')->nullable()->constrained('cctv_estimates')->onDelete('set null');
            $table->string('customer_name', 150);
            $table->string('customer_phone', 50);
            $table->text('customer_address');
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('scheduled_date')->nullable();
            $table->string('scheduled_time', 50)->nullable();
            $table->string('status', 40)->default('pending')->index(); // pending, scheduled, assigned, in_progress, completed, cancelled, rescheduled
            $table->dateTime('actual_start_at')->nullable();
            $table->dateTime('actual_end_at')->nullable();
            $table->integer('camera_count')->default(4);
            $table->integer('installed_camera_count')->default(0);
            $table->json('equipment_checklist')->nullable();
            $table->json('testing_checklist')->nullable(); // camera_test, night_vision_test, recording_test, playback_test, storage_test, network_test, mobile_app_test
            $table->text('technician_notes')->nullable();
            $table->json('completion_photos')->nullable();
            $table->text('customer_signature')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cctv_installation_jobs');
        Schema::dropIfExists('cctv_site_survey_reports');
        Schema::dropIfExists('cctv_site_surveys');
        Schema::dropIfExists('cctv_service_types');
    }
};
