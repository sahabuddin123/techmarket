<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Cctv\CctvCableProfile;
use App\Models\Cctv\CctvDeviceProfile;
use App\Models\Cctv\CctvDiagnosticQuestion;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Cctv\CctvServiceType;
use App\Models\Cctv\CctvStorageProfile;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CctvEnterpriseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CCTV Calculation Engine Defaults
        $cctvSettings = [
            'cctv_h264_bitrate_2mp' => '4096',
            'cctv_h264_bitrate_4mp' => '6144',
            'cctv_h264_bitrate_8mp' => '8192',
            'cctv_h265_gain' => '40',
            'cctv_h265_plus_gain' => '70',
            'cctv_cable_waste_pct' => '10',
            'cctv_riser_height_m' => '4.5',
            'cctv_poe_safety_margin_pct' => '20',
            'cctv_quote_validity_days' => '7',
            'cctv_warranty_standard_months' => '12',
        ];

        foreach ($cctvSettings as $key => $val) {
            Setting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 2. CCTV Brands
        $brands = [
            'Hikvision' => 'World-leading surveillance and security camera manufacturer.',
            'Dahua' => 'Leading video surveillance solution provider with AI technology.',
            'Uniview' => 'Pioneer and leader of IP video surveillance.',
            'Western Digital' => 'High-durability Purple surveillance storage drives.',
            'Seagate' => 'SkyHawk 24/7 video surveillance hard drives.',
            'D-Link' => 'Enterprise PoE switches and network cabling infrastructure.',
        ];

        $brandModels = [];
        foreach ($brands as $name => $desc) {
            $brandModels[$name] = Brand::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $desc,
                    'is_active' => true,
                ]
            );
        }

        // 3. CCTV Categories
        $parentCat = Category::updateOrCreate(
            ['slug' => 'cctv-surveillance'],
            [
                'name' => 'CCTV & Surveillance',
                'is_nav_visible' => true,
                'sidebar_visible' => true,
                'sort_order' => 10,
            ]
        );

        $subCatsData = [
            ['name' => 'IP Network Cameras', 'slug' => 'ip-cameras'],
            ['name' => 'HD Analog Cameras', 'slug' => 'hd-analog-cameras'],
            ['name' => 'NVR Recorders', 'slug' => 'nvr-recorders'],
            ['name' => 'DVR Recorders', 'slug' => 'dvr-recorders'],
            ['name' => 'Surveillance Hard Drives', 'slug' => 'surveillance-storage'],
            ['name' => 'CCTV Cables & Sockets', 'slug' => 'cctv-cables'],
            ['name' => 'PoE Switches & Power Supplies', 'slug' => 'poe-switches-psu'],
        ];

        $subCatModels = [];
        foreach ($subCatsData as $sc) {
            $subCatModels[$sc['slug']] = Category::updateOrCreate(
                ['slug' => $sc['slug']],
                [
                    'name' => $sc['name'],
                    'parent_id' => $parentCat->id,
                    'is_nav_visible' => true,
                    'sidebar_visible' => true,
                ]
            );
        }

        // 4. Products & Technical Profiles
        // Camera 1
        $cam1 = Product::updateOrCreate(
            ['sku' => 'HIK-IP-4MP-BULLET'],
            [
                'title' => 'Hikvision DS-2CD1043G0-I 4MP IP PoE Bullet Camera',
                'slug' => 'hikvision-ds-2cd1043g0-i-4mp-ip-poe-bullet-camera',
                'brand_id' => $brandModels['Hikvision']->id,
                'category_id' => $subCatModels['ip-cameras']->id,
                'price' => 4500,
                'regular_price' => 4800,
                'stock' => 50,
                'is_active' => true,
                'description' => '4MP Outdoor IP Camera with H.265+ compression, PoE support and 30m IR range.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $cam1->id],
            [
                'product_type' => 'camera',
                'system_type' => 'ip',
                'camera_form_factor' => 'bullet',
                'resolution_mp' => 4.0,
                'resolution_label' => '4MP (2K)',
                'lens_mm' => 2.8,
                'ir_distance_meters' => 30,
                'environment' => 'outdoor',
                'power_source' => 'poe',
                'power_consumption_watts' => 6.5,
                'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                'is_active' => true,
            ]
        );

        // Camera 2
        $cam2 = Product::updateOrCreate(
            ['sku' => 'DAH-IP-2MP-DOME'],
            [
                'title' => 'Dahua DH-IPC-HDW1230T1-S5 2MP IP Eyeball Dome Camera',
                'slug' => 'dahua-dh-ipc-hdw1230t1-s5-2mp-ip-eyeball-dome-camera',
                'brand_id' => $brandModels['Dahua']->id,
                'category_id' => $subCatModels['ip-cameras']->id,
                'price' => 2950,
                'regular_price' => 3200,
                'stock' => 50,
                'is_active' => true,
                'description' => '2MP Eyeball Dome Camera with H.265 compression and 30m IR night vision.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $cam2->id],
            [
                'product_type' => 'camera',
                'system_type' => 'ip',
                'camera_form_factor' => 'dome',
                'resolution_mp' => 2.0,
                'resolution_label' => '2MP (1080p)',
                'lens_mm' => 2.8,
                'ir_distance_meters' => 30,
                'environment' => 'indoor',
                'power_source' => 'poe',
                'power_consumption_watts' => 5.0,
                'supported_codecs' => ['h264', 'h265'],
                'is_active' => true,
            ]
        );

        // Camera 3 (4K ColorVu)
        $cam3 = Product::updateOrCreate(
            ['sku' => 'HIK-IP-8MP-COLORVU'],
            [
                'title' => 'Hikvision DS-2CD2T87G2-L 8MP 4K ColorVu IP Bullet Camera',
                'slug' => 'hikvision-ds-2cd2t87g2-l-8mp-4k-colorvu-ip-bullet-camera',
                'brand_id' => $brandModels['Hikvision']->id,
                'category_id' => $subCatModels['ip-cameras']->id,
                'price' => 13800,
                'regular_price' => 14500,
                'stock' => 30,
                'is_active' => true,
                'description' => '8MP 4K ColorVu bullet camera with 24/7 full-color night vision and 60m warm light.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $cam3->id],
            [
                'product_type' => 'camera',
                'system_type' => 'ip',
                'camera_form_factor' => 'bullet',
                'resolution_mp' => 8.0,
                'resolution_label' => '8MP (4K)',
                'lens_mm' => 4.0,
                'ir_distance_meters' => 60,
                'environment' => 'outdoor',
                'power_source' => 'poe',
                'power_consumption_watts' => 9.5,
                'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                'is_active' => true,
            ]
        );

        // NVR 1 (8 Channel)
        $nvr1 = Product::updateOrCreate(
            ['sku' => 'HIK-NVR-8CH-POE'],
            [
                'title' => 'Hikvision DS-7608NI-Q1/8P 8-Channel 4K PoE NVR',
                'slug' => 'hikvision-ds-7608ni-q1-8p-8-channel-4k-poe-nvr',
                'brand_id' => $brandModels['Hikvision']->id,
                'category_id' => $subCatModels['nvr-recorders']->id,
                'price' => 10900,
                'regular_price' => 11500,
                'stock' => 20,
                'is_active' => true,
                'description' => '8-Channel 4K PoE NVR with 1 SATA bay (up to 8TB) and 80W PoE budget.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $nvr1->id],
            [
                'product_type' => 'nvr',
                'system_type' => 'ip',
                'power_consumption_watts' => 15.0,
                'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                'is_active' => true,
            ]
        );
        CctvDeviceProfile::updateOrCreate(
            ['product_id' => $nvr1->id],
            [
                'device_type' => 'nvr',
                'channel_count' => 8,
                'ip_channels_max' => 8,
                'max_camera_resolution_mp' => 8.0,
                'hdd_bay_count' => 1,
                'max_hdd_capacity_tb_per_bay' => 8.0,
                'poe_port_count' => 8,
                'poe_budget_watts' => 80.0,
            ]
        );

        // NVR 2 (16 Channel)
        $nvr2 = Product::updateOrCreate(
            ['sku' => 'DAH-NVR-16CH-POE'],
            [
                'title' => 'Dahua DHI-NVR4216-16P-4KS2/L 16-Channel 4K NVR with 16 PoE Ports',
                'slug' => 'dahua-dhi-nvr4216-16p-4ks2-l-16-channel-4k-nvr-with-16-poe-ports',
                'brand_id' => $brandModels['Dahua']->id,
                'category_id' => $subCatModels['nvr-recorders']->id,
                'price' => 23000,
                'regular_price' => 24500,
                'stock' => 15,
                'is_active' => true,
                'description' => '16-Channel 4K NVR with 2 SATA bays (up to 10TB per bay) and 130W PoE power budget.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $nvr2->id],
            [
                'product_type' => 'nvr',
                'system_type' => 'ip',
                'power_consumption_watts' => 25.0,
                'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                'is_active' => true,
            ]
        );
        CctvDeviceProfile::updateOrCreate(
            ['product_id' => $nvr2->id],
            [
                'device_type' => 'nvr',
                'channel_count' => 16,
                'ip_channels_max' => 16,
                'max_camera_resolution_mp' => 8.0,
                'hdd_bay_count' => 2,
                'max_hdd_capacity_tb_per_bay' => 10.0,
                'poe_port_count' => 16,
                'poe_budget_watts' => 130.0,
            ]
        );

        // Storage 1 (2TB Purple)
        $hdd1 = Product::updateOrCreate(
            ['sku' => 'WD-PURPLE-2TB'],
            [
                'title' => 'Western Digital Purple 2TB Surveillance Hard Disk Drive',
                'slug' => 'western-digital-purple-2tb-surveillance-hard-disk-drive',
                'brand_id' => $brandModels['Western Digital']->id,
                'category_id' => $subCatModels['surveillance-storage']->id,
                'price' => 6500,
                'regular_price' => 6800,
                'stock' => 40,
                'is_active' => true,
                'description' => '2TB AllFrame surveillance storage designed for 24/7 security recording.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $hdd1->id],
            [
                'product_type' => 'storage',
                'system_type' => 'all',
                'power_consumption_watts' => 4.4,
                'is_active' => true,
            ]
        );
        CctvStorageProfile::updateOrCreate(
            ['product_id' => $hdd1->id],
            [
                'capacity_tb' => 2.0,
                'is_surveillance_optimized' => true,
            ]
        );

        // Storage 2 (4TB Purple)
        $hdd2 = Product::updateOrCreate(
            ['sku' => 'WD-PURPLE-4TB'],
            [
                'title' => 'Western Digital Purple 4TB Surveillance Hard Disk Drive',
                'slug' => 'western-digital-purple-4tb-surveillance-hard-disk-drive',
                'brand_id' => $brandModels['Western Digital']->id,
                'category_id' => $subCatModels['surveillance-storage']->id,
                'price' => 10800,
                'regular_price' => 11500,
                'stock' => 30,
                'is_active' => true,
                'description' => '4TB 24/7 surveillance hard disk with AllFrame AI technology.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $hdd2->id],
            [
                'product_type' => 'storage',
                'system_type' => 'all',
                'power_consumption_watts' => 5.1,
                'is_active' => true,
            ]
        );
        CctvStorageProfile::updateOrCreate(
            ['product_id' => $hdd2->id],
            [
                'capacity_tb' => 4.0,
                'is_surveillance_optimized' => true,
            ]
        );

        // Cable (Cat6 305m)
        $cable = Product::updateOrCreate(
            ['sku' => 'DLINK-CAT6-305M'],
            [
                'title' => 'D-Link Cat6 UTP Solid Copper Network Cable Box (305 Meters)',
                'slug' => 'd-link-cat6-utp-solid-copper-network-cable-box-305-meters',
                'brand_id' => $brandModels['D-Link']->id,
                'category_id' => $subCatModels['cctv-cables']->id,
                'price' => 8900,
                'regular_price' => 9500,
                'stock' => 25,
                'is_active' => true,
                'description' => '305-Meter 23 AWG Solid Copper Cat6 UTP cable for long-distance PoE transmission.',
            ]
        );
        CctvProductProfile::updateOrCreate(
            ['product_id' => $cable->id],
            [
                'product_type' => 'cable',
                'system_type' => 'all',
                'is_active' => true,
            ]
        );
        CctvCableProfile::updateOrCreate(
            ['product_id' => $cable->id],
            [
                'cable_type' => 'cat6',
                'meters_per_unit' => 305.0,
                'gauge_awg' => 23,
                'is_outdoor_rated' => true,
            ]
        );

        // 5. CCTV Service Types & Rates
        $services = [
            [
                'name' => 'Standard CCTV Installation & Cabling',
                'code' => 'srv_standard_install',
                'pricing_type' => 'per_camera',
                'base_rate' => 0.00,
                'unit_rate' => 600.00,
                'description' => 'Complete camera mounting, cable termination, RJ45 crimping, and angle adjustment.',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'NVR/DVR System Setup & Mobile App Configuration',
                'code' => 'srv_nvr_setup',
                'pricing_type' => 'fixed',
                'base_rate' => 1500.00,
                'unit_rate' => 0.00,
                'description' => 'Hard drive mounting, network port forwarding, Hik-Connect/DMSS mobile app setup, and motion recording schedule.',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Professional CCTV Site Survey & Engineering Assessment',
                'code' => 'srv_site_survey',
                'pricing_type' => 'fixed',
                'base_rate' => 1000.00,
                'unit_rate' => 0.00,
                'description' => 'On-site technical evaluation, FOV measurement, conduit routing, and floor plan mapping.',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Emergency Technical Repair & Troubleshooting Visit',
                'code' => 'srv_troubleshooting',
                'pricing_type' => 'fixed',
                'base_rate' => 1200.00,
                'unit_rate' => 0.00,
                'description' => 'Diagnosis and resolution of video signal loss, offline channels, and hard disk recording failures.',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($services as $srv) {
            CctvServiceType::updateOrCreate(['code' => $srv['code']], $srv);
        }

        // 6. Diagnostic Questions for Service Center
        $questions = [
            [
                'device_type' => 'recorder',
                'issue_category' => 'power',
                'question' => 'Is the recorder (NVR/DVR) power LED turned ON?',
                'options' => ['Yes, normal LED', 'No power / dead', 'Flashing red/amber'],
                'resolution_hint' => 'Check the 12V/48V power adapter connection and wall socket switch.',
                'sort_order' => 1,
            ],
            [
                'device_type' => 'recorder',
                'issue_category' => 'storage',
                'question' => 'Is there any continuous beep sound coming from the recorder (HDD failure alert)?',
                'options' => ['Yes, continuous beep', 'No beep sound', 'Random clicks'],
                'resolution_hint' => 'Check HDD SATA cable or run HDD SMART test in NVR storage menu.',
                'sort_order' => 2,
            ],
            [
                'device_type' => 'camera',
                'issue_category' => 'video_loss',
                'question' => 'Is the issue with all cameras or only one specific camera?',
                'options' => ['Only 1 camera', 'Multiple cameras', 'All cameras black screen'],
                'resolution_hint' => 'If single camera, check RJ45 PoE connector and port activity light on switch.',
                'sort_order' => 3,
            ],
            [
                'device_type' => 'recorder',
                'issue_category' => 'display',
                'question' => 'Is the live view visible on the monitor connected via HDMI/VGA?',
                'options' => ['Yes visible on TV/Monitor', 'No signal on monitor', 'Flickering'],
                'resolution_hint' => 'Verify HDMI/VGA cable and change monitor display output resolution.',
                'sort_order' => 4,
            ],
            [
                'device_type' => 'recorder',
                'issue_category' => 'network',
                'question' => 'Is the mobile viewing application (Hik-Connect / DMSS) showing "Offline"?',
                'options' => ['Showing Offline', 'Connecting timeout', 'Online but slow'],
                'resolution_hint' => 'Check NVR LAN cable connected to Wi-Fi router and verify DHCP gateway IP.',
                'sort_order' => 5,
            ],
        ];

        foreach ($questions as $q) {
            CctvDiagnosticQuestion::updateOrCreate(
                ['question' => $q['question']],
                array_merge($q, ['is_active' => true])
            );
        }
    }
}
