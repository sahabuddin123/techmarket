<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for CCTV Estimator Domain Architecture.
     */
    public function up(): void
    {
        // 1. CCTV Product Profiles (Technical CCTV metadata attached 1-to-1 to existing commerce Products)
        if (!Schema::hasTable('cctv_product_profiles')) {
            Schema::create('cctv_product_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->unique()->constrained('products')->onDelete('cascade');
                $table->string('product_type', 50)->index(); // camera, dvr, nvr, xvr, storage, poe_switch, network_switch, cable, power_supply, connector, bracket, junction_box, rack, accessories, service, other
                $table->string('system_type', 50)->default('ip')->index(); // analog, ip, hybrid, wifi, all
                $table->string('camera_form_factor', 50)->nullable()->index(); // bullet, dome, turret, ptz, cube, eyeball, panoramic
                $table->decimal('resolution_mp', 5, 2)->nullable()->index(); // 2.00, 4.00, 5.00, 8.00, 12.00
                $table->string('resolution_label', 100)->nullable(); // e.g. "1080P Full HD", "2K 4MP Super HD", "4K 8MP Ultra HD"
                $table->decimal('lens_mm', 5, 2)->nullable(); // 2.80, 3.60, 6.00, 12.00
                $table->string('lens_type', 50)->nullable(); // fixed, motorized_varifocal, manual_varifocal, optical_zoom
                $table->unsignedInteger('ir_distance_meters')->nullable(); // 20, 30, 50, 80
                $table->string('low_light_tech', 100)->nullable(); // ColorVu, Full-Color, DarkFighter, Starlight, Standard IR
                $table->string('audio_type', 50)->default('none'); // none, built_in_mic, two_way_audio, audio_in_out
                $table->json('ai_features')->nullable(); // ["motion_detection", "human_detection", "vehicle_detection", "face_detection", "line_crossing", "perimeter_protection"]
                $table->string('ip_rating', 30)->nullable(); // IP66, IP67, IP68, IK10, Indoor Only
                $table->string('environment', 30)->default('both'); // indoor, outdoor, both
                $table->string('power_source', 50)->default('poe'); // poe, dc_12v, ac_24v, solar_battery, dual_poe_dc
                $table->decimal('power_consumption_watts', 6, 2)->nullable();
                $table->string('poe_standard', 50)->nullable(); // 802.3af, 802.3at PoE+, Passive 24V
                $table->json('supported_codecs')->nullable(); // ["H.265+", "H.265", "H.264+", "H.264"]
                $table->json('specifications')->nullable(); // Vendor parameter dictionary
                $table->boolean('is_active')->default(true)->index();
                $table->timestamps();
            });
        }

        // 2. CCTV Recording Device Profiles (DVR / NVR / XVR hardware specifications)
        if (!Schema::hasTable('cctv_device_profiles')) {
            Schema::create('cctv_device_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->unique()->constrained('products')->onDelete('cascade');
                $table->string('device_type', 30)->index(); // dvr, nvr, xvr
                $table->unsignedInteger('channel_count')->default(4)->index(); // 4, 8, 16, 32, 64, 128
                $table->unsignedInteger('ip_channels_max')->default(0);
                $table->unsignedInteger('analog_channels_max')->default(0);
                $table->decimal('max_camera_resolution_mp', 5, 2)->default(8.00);
                $table->unsignedInteger('max_incoming_bandwidth_mbps')->nullable(); // 80, 160, 256, 384
                $table->json('supported_codecs')->nullable(); // ["H.265+", "H.265", "H.264"]
                $table->unsignedInteger('hdd_bay_count')->default(1); // 1, 2, 4, 8, 16
                $table->decimal('max_hdd_capacity_tb_per_bay', 6, 2)->default(10.00); // TB
                $table->unsignedInteger('poe_port_count')->default(0); // 0, 4, 8, 16, 24
                $table->decimal('poe_budget_watts', 8, 2)->default(0.00);
                $table->unsignedInteger('network_ports_count')->default(1);
                $table->unsignedInteger('alarm_in_count')->default(0);
                $table->unsignedInteger('alarm_out_count')->default(0);
                $table->unsignedInteger('audio_in_count')->default(0);
                $table->unsignedInteger('audio_out_count')->default(0);
                $table->json('raid_supported')->nullable(); // ["RAID0", "RAID1", "RAID5"]
                $table->boolean('two_way_audio_support')->default(false);
                $table->json('ai_by_device_features')->nullable();
                $table->json('specifications')->nullable();
                $table->timestamps();
            });
        }

        // 3. CCTV Storage Profiles (Surveillance-grade HDDs & storage metadata)
        if (!Schema::hasTable('cctv_storage_profiles')) {
            Schema::create('cctv_storage_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->unique()->constrained('products')->onDelete('cascade');
                $table->decimal('capacity_tb', 6, 2)->index(); // 1.00, 2.00, 4.00, 6.00, 8.00, 10.00, 12.00, 16.00, 18.00
                $table->string('form_factor', 30)->default('3.5 inch');
                $table->string('interface_type', 50)->default('SATA 6Gb/s');
                $table->unsignedInteger('rpm')->default(5400); // 5400, 5900, 7200
                $table->unsignedInteger('cache_mb')->default(64); // 64, 128, 256, 512
                $table->unsignedInteger('workload_rating_tb_yr')->default(180); // 180, 300, 550
                $table->boolean('is_surveillance_optimized')->default(true)->index();
                $table->unsignedInteger('max_drive_bays_supported')->default(8);
                $table->unsignedInteger('recommended_cameras_max')->default(64);
                $table->timestamps();
            });
        }

        // 4. CCTV Cable Profiles (Ethernet, Coaxial, Siamese, Fiber cable rolls & boxes)
        if (!Schema::hasTable('cctv_cable_profiles')) {
            Schema::create('cctv_cable_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->unique()->constrained('products')->onDelete('cascade');
                $table->string('cable_type', 50)->index(); // cat5e, cat6, cat6a, coaxial_rg59, coaxial_siamese_3c2v, coaxial_siamese_rg6, outdoor_shielded_cat6, fiber_optic
                $table->string('core_material', 50)->default('100_percent_bare_copper_ofc'); // pure_copper_cca, 100_percent_bare_copper_ofc, cca
                $table->string('shielding', 30)->default('utp'); // utp, stp, ftp, sftp
                $table->boolean('is_outdoor_rated')->default(false)->index();
                $table->unsignedInteger('max_recommended_distance_meters')->default(100);
                $table->string('unit_of_measure', 30)->default('roll_305m'); // meter, roll_100m, roll_305m, roll_500m
                $table->decimal('meters_per_unit', 8, 2)->default(305.00);
                $table->unsignedInteger('gauge_awg')->default(23);
                $table->timestamps();
            });
        }

        // 5. CCTV Rules Engine (Extensible rule-driven compatibility, recommendation, and calculations)
        if (!Schema::hasTable('cctv_rules')) {
            Schema::create('cctv_rules', function (Blueprint $table) {
                $table->id();
                $table->string('rule_type', 50)->index(); // compatibility, recommendation, storage_calculation, cable_calculation, accessory_requirement, pricing_adjustment
                $table->string('name', 150);
                $table->string('code', 100)->unique();
                $table->text('description')->nullable();
                $table->string('system_type_scope', 50)->default('all')->index(); // all, analog, ip, hybrid, wifi
                $table->string('product_type_scope', 50)->nullable()->index(); // camera, dvr, nvr, storage, cable, etc.
                $table->integer('priority')->default(100)->index();
                $table->json('conditions')->nullable(); // Rule predicates and operators
                $table->json('actions')->nullable(); // Actions, recommendation targets, and formulas
                $table->json('parameters')->nullable(); // Configurable multipliers, waste percentages, constants
                $table->boolean('is_active')->default(true)->index();
                $table->dateTime('effective_from')->nullable();
                $table->dateTime('effective_to')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        // 6. CCTV Project Estimates (Complete customer system configurations)
        if (!Schema::hasTable('cctv_estimates')) {
            Schema::create('cctv_estimates', function (Blueprint $table) {
                $table->id();
                $table->string('estimate_number', 50)->unique(); // EST-CCTV-2026-0001
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('guest_session_id', 100)->nullable()->index();
                $table->string('project_name', 150)->default('My CCTV Surveillance System');
                $table->string('project_type', 50)->default('commercial_office')->index(); // residential_home, apartment_building, commercial_office, retail_shop, warehouse_factory, hospital_clinic, school_college, outdoor_farm, custom
                $table->string('location_district', 80)->nullable();
                $table->text('location_address')->nullable();
                $table->unsignedInteger('floors_count')->default(1);
                $table->unsignedInteger('areas_count')->default(1);
                $table->string('system_type', 50)->default('ip')->index(); // analog, ip, hybrid, wifi
                $table->string('status', 30)->default('draft')->index(); // draft, calculated, saved, quoted, ordered, archived
                $table->unsignedInteger('version')->default(1);
                $table->json('requirements_payload')->nullable(); // Full customer requirements JSON snapshot
                $table->json('calculation_metrics')->nullable(); // Storage, bandwidth, cable metrics snapshot
                $table->json('validation_results')->nullable(); // Compatibility validation & warnings snapshot
                $table->decimal('subtotal_amount', 12, 2)->default(0.00);
                $table->decimal('accessory_amount', 12, 2)->default(0.00);
                $table->decimal('installation_amount', 12, 2)->default(0.00);
                $table->decimal('discount_amount', 12, 2)->default(0.00);
                $table->decimal('grand_total', 12, 2)->default(0.00);
                $table->string('currency', 10)->default('BDT');
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        // 7. CCTV Estimate Items (Bill of Materials line items with frozen price snapshot)
        if (!Schema::hasTable('cctv_estimate_items')) {
            Schema::create('cctv_estimate_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('estimate_id')->constrained('cctv_estimates')->onDelete('cascade');
                $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
                $table->string('item_type', 50)->index(); // selected_camera, recording_device, storage_hdd, cable_roll, network_poe, power_supply, required_accessory, optional_accessory, installation_service, custom_line_item
                $table->string('product_sku_snapshot', 100);
                $table->string('product_name_snapshot', 255);
                $table->string('product_type', 50)->default('camera');
                $table->string('system_type', 50)->default('ip');
                $table->decimal('unit_price_snapshot', 12, 2)->default(0.00);
                $table->decimal('quantity', 10, 2)->default(1.00);
                $table->string('unit', 30)->default('piece'); // piece, roll, meter, box, set
                $table->decimal('subtotal_price', 12, 2)->default(0.00);
                $table->boolean('is_required')->default(true);
                $table->boolean('is_recommended')->default(false);
                $table->string('recommendation_reason', 255)->nullable();
                $table->string('compatibility_status', 50)->default('compatible'); // compatible, warning, forced_override
                $table->json('metadata')->nullable(); // Technical snapshot of the item
                $table->timestamps();
            });
        }

        // 8. CCTV Quotes (Formal customer quotes with validity, terms, and conversion to orders)
        if (!Schema::hasTable('cctv_quotes')) {
            Schema::create('cctv_quotes', function (Blueprint $table) {
                $table->id();
                $table->string('quote_number', 50)->unique(); // QTE-CCTV-2026-0001
                $table->foreignId('estimate_id')->constrained('cctv_estimates')->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('customer_name', 150);
                $table->string('customer_phone', 50);
                $table->string('customer_email', 150)->nullable();
                $table->string('company_name', 150)->nullable();
                $table->dateTime('valid_until');
                $table->string('status', 30)->default('draft')->index(); // draft, issued, accepted, declined, converted_to_order, expired
                $table->decimal('subtotal', 12, 2)->default(0.00);
                $table->decimal('discount_amount', 12, 2)->default(0.00);
                $table->decimal('installation_amount', 12, 2)->default(0.00);
                $table->decimal('tax_amount', 12, 2)->default(0.00);
                $table->decimal('shipping_amount', 12, 2)->default(0.00);
                $table->decimal('grand_total', 12, 2)->default(0.00);
                $table->text('terms_and_conditions')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('converted_order_id')->nullable()->constrained('orders')->onDelete('set null');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cctv_quotes');
        Schema::dropIfExists('cctv_estimate_items');
        Schema::dropIfExists('cctv_estimates');
        Schema::dropIfExists('cctv_rules');
        Schema::dropIfExists('cctv_cable_profiles');
        Schema::dropIfExists('cctv_storage_profiles');
        Schema::dropIfExists('cctv_device_profiles');
        Schema::dropIfExists('cctv_product_profiles');
    }
};
