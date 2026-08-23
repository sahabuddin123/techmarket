<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Cctv\CctvDiagnosticQuestion;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Cctv\CctvServiceType;
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
                'description' => 'Professional IP & Analog surveillance cameras, recorders, storage, and accessories.',
                'is_active' => true,
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
                    'is_active' => true,
                ]
            );
        }

        // 4. Seed Products with attached CctvProductProfile
        $products = [
            // Cameras
            [
                'name' => 'Hikvision DS-2CD1043G0-I 4MP IP PoE Bullet Camera',
                'sku' => 'HIK-IP-4MP-BULLET',
                'brand' => 'Hikvision',
                'cat' => 'ip-cameras',
                'price' => 4800,
                'sale_price' => 4500,
                'profile' => [
                    'device_type' => 'camera',
                    'system_type' => 'ip_poe',
                    'resolution' => '4mp_2k',
                    'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                    'channels_supported' => null,
                    'sata_bays' => null,
                    'max_tb_per_bay' => null,
                    'power_draw_watts' => 6.5,
                    'is_outdoor_rated' => true,
                    'ir_distance_meters' => 30,
                    'audio_support' => true,
                    'motorized_varifocal' => false,
                ],
            ],
            [
                'name' => 'Dahua DH-IPC-HDW1230T1-S5 2MP IP Eyeball Dome Camera',
                'sku' => 'DAH-IP-2MP-DOME',
                'brand' => 'Dahua',
                'cat' => 'ip-cameras',
                'price' => 3200,
                'sale_price' => 2950,
                'profile' => [
                    'device_type' => 'camera',
                    'system_type' => 'ip_poe',
                    'resolution' => '2mp_1080p',
                    'supported_codecs' => ['h264', 'h265'],
                    'channels_supported' => null,
                    'sata_bays' => null,
                    'max_tb_per_bay' => null,
                    'power_draw_watts' => 5.0,
                    'is_outdoor_rated' => false,
                    'ir_distance_meters' => 30,
                    'audio_support' => false,
                    'motorized_varifocal' => false,
                ],
            ],
            [
                'name' => 'Hikvision DS-2CD2T87G2-L 8MP 4K ColorVu IP Bullet Camera',
                'sku' => 'HIK-IP-8MP-COLORVU',
                'brand' => 'Hikvision',
                'cat' => 'ip-cameras',
                'price' => 14500,
                'sale_price' => 13800,
                'profile' => [
                    'device_type' => 'camera',
                    'system_type' => 'ip_poe',
                    'resolution' => '8mp_4k',
                    'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                    'channels_supported' => null,
                    'sata_bays' => null,
                    'max_tb_per_bay' => null,
                    'power_draw_watts' => 9.5,
                    'is_outdoor_rated' => true,
                    'ir_distance_meters' => 60,
                    'audio_support' => true,
                    'motorized_varifocal' => true,
                ],
            ],
            // Recorders
            [
                'name' => 'Hikvision DS-7608NI-Q1/8P 8-Channel 4K PoE NVR',
                'sku' => 'HIK-NVR-8CH-POE',
                'brand' => 'Hikvision',
                'cat' => 'nvr-recorders',
                'price' => 11500,
                'sale_price' => 10900,
                'profile' => [
                    'device_type' => 'recorder',
                    'system_type' => 'ip_poe',
                    'resolution' => '8mp_4k',
                    'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                    'channels_supported' => 8,
                    'sata_bays' => 1,
                    'max_tb_per_bay' => 8,
                    'poe_ports' => 8,
                    'poe_budget_watts' => 80.0,
                    'power_draw_watts' => 15.0,
                ],
            ],
            [
                'name' => 'Dahua DHI-NVR4216-16P-4KS2/L 16-Channel 4K NVR with 16 PoE Ports',
                'sku' => 'DAH-NVR-16CH-POE',
                'brand' => 'Dahua',
                'cat' => 'nvr-recorders',
                'price' => 24500,
                'sale_price' => 23000,
                'profile' => [
                    'device_type' => 'recorder',
                    'system_type' => 'ip_poe',
                    'resolution' => '8mp_4k',
                    'supported_codecs' => ['h264', 'h265', 'h265_plus'],
                    'channels_supported' => 16,
                    'sata_bays' => 2,
                    'max_tb_per_bay' => 10,
                    'poe_ports' => 16,
                    'poe_budget_watts' => 130.0,
                    'power_draw_watts' => 25.0,
                ],
            ],
            // Storage
            [
                'name' => 'Western Digital Purple 2TB Surveillance Hard Disk Drive',
                'sku' => 'WD-PURPLE-2TB',
                'brand' => 'Western Digital',
                'cat' => 'surveillance-storage',
                'price' => 6800,
                'sale_price' => 6500,
                'profile' => [
                    'device_type' => 'storage',
                    'storage_capacity_tb' => 2,
                    'power_draw_watts' => 4.4,
                ],
            ],
            [
                'name' => 'Western Digital Purple 4TB Surveillance Hard Disk Drive',
                'sku' => 'WD-PURPLE-4TB',
                'brand' => 'Western Digital',
                'cat' => 'surveillance-storage',
                'price' => 11500,
                'sale_price' => 10800,
                'profile' => [
                    'device_type' => 'storage',
                    'storage_capacity_tb' => 4,
                    'power_draw_watts' => 5.1,
                ],
            ],
            [
                'name' => 'Seagate SkyHawk 8TB 256MB Surveillance Internal HDD',
                'sku' => 'SEA-SKYHAWK-8TB',
                'brand' => 'Seagate',
                'cat' => 'surveillance-storage',
                'price' => 24500,
                'sale_price' => 23500,
                'profile' => [
                    'device_type' => 'storage',
                    'storage_capacity_tb' => 8,
                    'power_draw_watts' => 7.2,
                ],
            ],
            // Cables
            [
                'name' => 'D-Link Cat6 UTP Solid Copper Network Cable Box (305 Meters)',
                'sku' => 'DLINK-CAT6-305M',
                'brand' => 'D-Link',
                'cat' => 'cctv-cables',
                'price' => 9500,
                'sale_price' => 8900,
                'profile' => [
                    'device_type' => 'cable',
                    'cable_type' => 'cat6_utp',
                    'roll_length_meters' => 305,
                ],
            ],
        ];

        foreach ($products as $p) {
            $brandId = $brandModels[$p['brand']]->id ?? null;
            $catId = $subCatModels[$p['cat']]->id ?? null;

            $prod = Product::updateOrCreate(
                ['sku' => $p['sku']],
                [
                    'name' => $p['name'],
                    'slug' => Str::slug($p['name']),
                    'brand_id' => $brandId,
                    'category_id' => $catId,
                    'price' => $p['price'],
                    'sale_price' => $p['sale_price'],
                    'stock' => 50,
                    'is_active' => true,
                    'description' => $p['name'] . ' with official manufacturer warranty and enterprise reliability.',
                ]
            );

            if (isset($p['profile'])) {
                CctvProductProfile::updateOrCreate(
                    ['product_id' => $prod->id],
                    $p['profile']
                );
            }
        }

        // 5. CCTV Service Types & Dynamic Rates
        $services = [
            [
                'name' => 'Standard CCTV Installation & Cabling',
                'code' => 'srv_standard_install',
                'category' => 'installation',
                'billing_unit' => 'per_camera',
                'base_rate' => 600.00,
                'description' => 'Complete camera mounting, cable termination, RJ45 crimping, and angle adjustment.',
                'is_active' => true,
            ],
            [
                'name' => 'NVR/DVR System Setup & Mobile App Configuration',
                'code' => 'srv_nvr_setup',
                'category' => 'configuration',
                'billing_unit' => 'fixed',
                'base_rate' => 1500.00,
                'description' => 'Hard drive mounting, network port forwarding, Hik-Connect/DMSS mobile app setup, and motion recording schedule.',
                'is_active' => true,
            ],
            [
                'name' => 'Professional CCTV Site Survey & Engineering Assessment',
                'code' => 'srv_site_survey',
                'category' => 'survey',
                'billing_unit' => 'fixed',
                'base_rate' => 1000.00,
                'description' => 'On-site technical evaluation, FOV measurement, conduit routing, and floor plan mapping.',
                'is_active' => true,
            ],
            [
                'name' => 'Emergency Technical Repair & Troubleshooting Visit',
                'code' => 'srv_troubleshooting',
                'category' => 'maintenance',
                'billing_unit' => 'per_visit',
                'base_rate' => 1200.00,
                'description' => 'Diagnosis and resolution of video signal loss, offline channels, and hard disk recording failures.',
                'is_active' => true,
            ],
        ];

        foreach ($services as $srv) {
            CctvServiceType::updateOrCreate(['code' => $srv['code']], $srv);
        }

        // 6. Diagnostic Questions for Service Center
        $questions = [
            ['question' => 'Is the recorder (NVR/DVR) power LED turned ON?', 'category' => 'power', 'order' => 1],
            ['question' => 'Is there any continuous beep sound coming from the recorder (HDD failure alert)?', 'category' => 'storage', 'order' => 2],
            ['question' => 'Is the issue with all cameras or only one specific camera?', 'category' => 'camera', 'order' => 3],
            ['question' => 'Is the live view visible on the monitor connected via HDMI/VGA?', 'category' => 'display', 'order' => 4],
            ['question' => 'Is the mobile viewing application (Hik-Connect / DMSS) showing "Offline"?', 'category' => 'network', 'order' => 5],
        ];

        foreach ($questions as $q) {
            CctvDiagnosticQuestion::updateOrCreate(
                ['question' => $q['question']],
                [
                    'category' => $q['category'],
                    'order' => $q['order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
