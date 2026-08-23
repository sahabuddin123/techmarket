<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enterprise Projects Table
        Schema::create('cctv_projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_number', 50)->unique();
            $table->string('name', 200);
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('organization_name', 150)->nullable();
            $table->string('project_type', 50)->default('commercial'); // residential, commercial, industrial, garment, hospital, institutional, warehouse
            $table->string('industry', 100)->nullable();
            $table->string('status', 40)->default('draft')->index(); // draft, survey, design, estimation, quotation, approved, installation, testing, handover, completed, on_hold, cancelled
            $table->string('priority', 30)->default('normal')->index(); // low, normal, high, urgent, critical
            $table->date('start_date')->nullable();
            $table->date('expected_completion_date')->nullable();
            $table->date('actual_completion_date')->nullable();
            $table->foreignId('project_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('sales_owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('technical_owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('budget', 14, 2)->default(0.00);
            $table->string('currency', 10)->default('BDT');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Multi-Site Project Locations
        Schema::create('cctv_project_sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('cctv_projects')->onDelete('cascade');
            $table->string('name', 150);
            $table->string('site_code', 50)->nullable();
            $table->text('address');
            $table->string('district', 100)->default('Dhaka');
            $table->string('upazila', 100)->nullable();
            $table->string('contact_person', 150)->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('site_type', 50)->default('branch'); // head_office, branch, factory, warehouse, retail
            $table->string('status', 40)->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Multi-Building Structures per Site
        Schema::create('cctv_project_buildings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('cctv_project_sites')->onDelete('cascade');
            $table->string('name', 150);
            $table->string('building_code', 50)->nullable();
            $table->integer('floors_count')->default(1);
            $table->integer('basements_count')->default(0);
            $table->decimal('area_sqft', 10, 2)->nullable();
            $table->string('status', 40)->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Multi-Floor Levels per Building
        Schema::create('cctv_project_floors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('cctv_project_buildings')->onDelete('cascade');
            $table->string('name', 100);
            $table->integer('floor_number')->default(1);
            $table->string('floor_type', 50)->default('standard'); // basement, ground, standard, roof
            $table->string('floor_plan_image', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Zones / Areas per Floor
        Schema::create('cctv_project_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('floor_id')->constrained('cctv_project_floors')->onDelete('cascade');
            $table->string('name', 150);
            $table->string('zone_code', 50)->nullable();
            $table->string('area_type', 50)->default('general'); // reception, server_room, production, entry_gate, exit_gate, lobby, corridor, outdoor
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Project Change Requests
        Schema::create('cctv_project_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('cctv_projects')->onDelete('cascade');
            $table->string('change_number', 50)->unique();
            $table->string('title', 200);
            $table->text('description');
            $table->json('scope_changes')->nullable();
            $table->decimal('cost_impact', 12, 2)->default(0.00);
            $table->string('status', 40)->default('requested')->index(); // requested, under_review, quoted, approved, rejected, implemented, cancelled
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 7. Project Handover & Signoff
        Schema::create('cctv_project_handovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('cctv_projects')->onDelete('cascade');
            $table->date('handover_date');
            $table->integer('total_cameras_installed')->default(0);
            $table->integer('total_recorders_installed')->default(0);
            $table->json('testing_checklist_summary')->nullable();
            $table->boolean('training_completed')->default(true);
            $table->boolean('documentation_provided')->default(true);
            $table->string('customer_signoff_name', 150);
            $table->text('customer_signature')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 8. Add project_id and site_id to cctv_estimates and cctv_installed_equipment
        Schema::table('cctv_estimates', function (Blueprint $table) {
            if (!Schema::hasColumn('cctv_estimates', 'project_id')) {
                $table->foreignId('project_id')->nullable()->constrained('cctv_projects')->onDelete('set null')->after('id');
                $table->foreignId('site_id')->nullable()->constrained('cctv_project_sites')->onDelete('set null')->after('project_id');
            }
        });

        Schema::table('cctv_quotes', function (Blueprint $table) {
            if (!Schema::hasColumn('cctv_quotes', 'project_id')) {
                $table->foreignId('project_id')->nullable()->constrained('cctv_projects')->onDelete('set null')->after('id');
            }
        });

        Schema::table('cctv_installed_equipment', function (Blueprint $table) {
            if (!Schema::hasColumn('cctv_installed_equipment', 'project_id')) {
                $table->foreignId('project_id')->nullable()->constrained('cctv_projects')->onDelete('set null')->after('id');
                $table->foreignId('site_id')->nullable()->constrained('cctv_project_sites')->onDelete('set null')->after('project_id');
                $table->foreignId('building_id')->nullable()->constrained('cctv_project_buildings')->onDelete('set null')->after('site_id');
                $table->foreignId('floor_id')->nullable()->constrained('cctv_project_floors')->onDelete('set null')->after('building_id');
                $table->foreignId('zone_id')->nullable()->constrained('cctv_project_zones')->onDelete('set null')->after('floor_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cctv_installed_equipment', function (Blueprint $table) {
            if (Schema::hasColumn('cctv_installed_equipment', 'project_id')) {
                $table->dropConstrainedForeignId('zone_id');
                $table->dropConstrainedForeignId('floor_id');
                $table->dropConstrainedForeignId('building_id');
                $table->dropConstrainedForeignId('site_id');
                $table->dropConstrainedForeignId('project_id');
            }
        });

        Schema::table('cctv_quotes', function (Blueprint $table) {
            if (Schema::hasColumn('cctv_quotes', 'project_id')) {
                $table->dropConstrainedForeignId('project_id');
            }
        });

        Schema::table('cctv_estimates', function (Blueprint $table) {
            if (Schema::hasColumn('cctv_estimates', 'project_id')) {
                $table->dropConstrainedForeignId('site_id');
                $table->dropConstrainedForeignId('project_id');
            }
        });

        Schema::dropIfExists('cctv_project_handovers');
        Schema::dropIfExists('cctv_project_change_requests');
        Schema::dropIfExists('cctv_project_zones');
        Schema::dropIfExists('cctv_project_floors');
        Schema::dropIfExists('cctv_project_buildings');
        Schema::dropIfExists('cctv_project_sites');
        Schema::dropIfExists('cctv_projects');
    }
};
