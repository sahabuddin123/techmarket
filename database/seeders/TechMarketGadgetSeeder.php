<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TechMarketGadgetSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure site_name is TechMarket BD and storefront_version is v3
        Setting::updateOrCreate(['key' => 'site_name'], ['value' => 'TechMarket BD']);
        Setting::updateOrCreate(['key' => 'storefront_version'], ['value' => 'v3']);
        Setting::updateOrCreate(['key' => 'contact_email'], ['value' => 'info@techmarketbd.com']);
        Setting::updateOrCreate(['key' => 'contact_phone'], ['value' => '+880 1700-000000']);
        Setting::updateOrCreate(['key' => 'tagline'], ['value' => 'Your Trusted Gadget Hub in Bangladesh']);

        // 2. Set Hero Banners in database (clean graphic images)
        // Deactivate old computer banners
        Banner::query()->update(['is_active' => false]);

        Banner::updateOrCreate(
            ['title' => '2 IN 1 FLASHLIGHT & AMBIENT LIGHT'],
            [
                'subtitle' => 'Laser LED Torch & Warm Ambient Camping Lantern',
                'badge' => 'LIMITED TIME OFFER',
                'image' => '/images/storefront/v3/banner_flashlight.jpg',
                'button_text' => 'Shop Now',
                'button_url' => '/catalog',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        Banner::updateOrCreate(
            ['title' => 'Your Trusted Gadget Hub'],
            [
                'subtitle' => 'Discover the latest in premium electronics & lifestyle gadgets',
                'badge' => 'NEW COLLECTION',
                'image' => '/images/storefront/v3/banner_gadgets.jpg',
                'button_text' => 'Explore All',
                'button_url' => '/catalog',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // 3. Seed 18 Brands
        $brandsData = [
            'Xiaomi', 'WEIDASI', 'UNIKYY', 'Transcend', 'SOLOVE', 'SKE', 
            'SITECOM', 'SATECHI', 'SAMSUNG', 'RAZER', 'QCY', 'PROMATE', 
            'msi', 'Microsoft', 'Lenovo', 'JYSUPER', 'Hollyland', 'Awei'
        ];

        $brandModels = [];
        foreach ($brandsData as $bName) {
            $brandModels[$bName] = Brand::updateOrCreate(
                ['slug' => Str::slug($bName)],
                ['name' => $bName, 'is_featured' => true]
            );
        }

        // 4. Seed 16 Categories
        $categoriesData = [
            ['name' => 'Rechargeable Lights & Fans', 'image' => '/images/storefront/v3/prod_solove_fan.jpg'],
            ['name' => 'Powerbanks', 'image' => '/images/storefront/v3/prod_awei_powerbank.jpg'],
            ['name' => 'Charger & Cables', 'image' => '/images/storefront/v3/prod_qcy_powerbank.jpg'],
            ['name' => 'TWS & Headphones', 'image' => '/images/storefront/v3/prod_hollyland_mic.jpg'],
            ['name' => 'Smartwatches', 'image' => '/images/storefront/v3/prod_jysuper_pink.jpg'],
            ['name' => 'Neckbands', 'image' => '/images/storefront/v3/prod_hollyland_mic.jpg'],
            ['name' => 'Mini DC UPS', 'image' => '/images/storefront/v3/prod_ske_ups.jpg'],
            ['name' => "Creator's Zone", 'image' => '/images/storefront/v3/prod_hollyland_mic.jpg'],
            ['name' => 'Summer Items', 'image' => '/images/storefront/v3/prod_unikyy_fan.jpg'],
            ['name' => 'Winter Items', 'image' => '/images/storefront/v3/prod_x10_flashlight.jpg'],
            ['name' => 'Phone Accessories', 'image' => '/images/storefront/v3/prod_awei_powerbank.jpg'],
            ['name' => 'Lighting', 'image' => '/images/storefront/v3/prod_x10_flashlight.jpg'],
            ['name' => 'TV & Home Entertainment', 'image' => null],
            ['name' => 'Kids Zone', 'image' => null],
            ['name' => 'Gaming', 'image' => null],
            ['name' => 'Tools & Tech Accessories', 'image' => null],
        ];

        $categoryModels = [];
        foreach ($categoriesData as $idx => $cat) {
            $categoryModels[$cat['name']] = Category::updateOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'image' => $cat['image'],
                    'is_featured' => true,
                    'sort_order' => $idx + 1,
                ]
            );
        }

        // 5. Seed 11 Real Products with exact images, prices, brands, categories
        $products = [
            [
                'title' => 'Original X10 laser Flashlight & Ambient Lantern',
                'slug' => 'original-x10-laser-flashlight',
                'sku' => 'X10-FL-001',
                'category' => 'Rechargeable Lights & Fans',
                'brand' => 'SOLOVE',
                'price' => 850,
                'regular_price' => 1250,
                'stock' => 50,
                'image' => '/images/storefront/v3/prod_x10_flashlight.jpg',
                'is_featured' => true,
                'is_deal_of_day' => true,
                'description' => 'Original X10 high powered rechargeable laser LED flashlight and warm 360-degree ambient camping light with Type-C fast charging and 2600mAh battery.',
                'warranty' => '6 Months Warranty',
            ],
            [
                'title' => 'SKE POE-36E-LFP 20,000mAh Mini DC UPS',
                'slug' => 'ske-poe-36e-lfp-20000mah',
                'sku' => 'SKE-POE-36E',
                'category' => 'Mini DC UPS',
                'brand' => 'SKE',
                'price' => 3750,
                'regular_price' => 4250,
                'stock' => 35,
                'image' => '/images/storefront/v3/prod_ske_ups.jpg',
                'is_featured' => true,
                'is_deal_of_day' => true,
                'description' => 'High capacity LiFePO4 battery mini DC UPS for WiFi routers, ONU, and CCTV cameras. Up to 8-12 hours uninterrupted power backup.',
                'warranty' => '1 Year Official Warranty',
            ],
            [
                'title' => 'JYSUPER JY-2219 Rechargeable Stand Fan',
                'slug' => 'jysuper-jy-2219-rechargeable',
                'sku' => 'JY-2219-SF',
                'category' => 'Rechargeable Lights & Fans',
                'brand' => 'JYSUPER',
                'price' => 3790,
                'regular_price' => 4190,
                'stock' => 25,
                'image' => '/images/storefront/v3/prod_jysuper_stand.jpg',
                'is_featured' => true,
                'is_deal_of_day' => true,
                'description' => 'Telescopic height adjustable rechargeable stand fan with powerful airflow, gold finish, and built-in lithium battery.',
                'warranty' => '6 Months Warranty',
            ],
            [
                'title' => 'Weidasi WD-959 Original Rechargeable Mosquito Swatter',
                'slug' => 'weidasi-wd-959-original',
                'sku' => 'WD-959-MR',
                'category' => 'Rechargeable Lights & Fans',
                'brand' => 'WEIDASI',
                'price' => 750,
                'regular_price' => 1150,
                'stock' => 60,
                'image' => '/images/storefront/v3/prod_weidasi_racket.jpg',
                'is_featured' => true,
                'is_deal_of_day' => true,
                'description' => 'Electric mosquito racket with standing dock, USB fast charge, safety triple layer mesh, and LED attractant light.',
                'warranty' => '3 Months Warranty',
            ],
            [
                'title' => 'Xiaomi Solove F5 Pro Max Rechargeable Table Fan',
                'slug' => 'xiaomi-solove-f5-pro-max',
                'sku' => 'SLV-F5-PRO',
                'category' => 'Rechargeable Lights & Fans',
                'brand' => 'SOLOVE',
                'price' => 3450,
                'regular_price' => 3850,
                'stock' => 40,
                'image' => '/images/storefront/v3/prod_solove_fan.jpg',
                'is_featured' => true,
                'is_deal_of_day' => false,
                'description' => '60-degree automatic oscillation, 4000mAh battery with up to 12 hours run time, Type-C charging, ultra quiet brushless motor.',
                'warranty' => '1 Year Warranty',
            ],
            [
                'title' => 'Awei PA-92 20000mAh 22.5W Fast Charging Power Bank',
                'slug' => 'awei-pa-92-20000mah',
                'sku' => 'AWEI-PA92-20K',
                'category' => 'Powerbanks',
                'brand' => 'Awei',
                'price' => 1550,
                'regular_price' => 1850,
                'stock' => 45,
                'image' => '/images/storefront/v3/prod_awei_powerbank.jpg',
                'is_featured' => true,
                'is_deal_of_day' => false,
                'description' => 'PD + QC 3.0 22.5W super fast charge powerbank with LCD digital percentage display, multi-port simultaneous output.',
                'warranty' => '6 Months Warranty',
            ],
            [
                'title' => 'Unikyy Blade Pro Portable Turbo Handheld Fan',
                'slug' => 'unikyy-blade-pro-portable',
                'sku' => 'UNIK-BP-FAN',
                'category' => 'Rechargeable Lights & Fans',
                'brand' => 'UNIKYY',
                'price' => 1250,
                'regular_price' => 1550,
                'stock' => 30,
                'image' => '/images/storefront/v3/prod_unikyy_fan.jpg',
                'is_featured' => true,
                'is_deal_of_day' => false,
                'description' => 'Folding compact high-speed turbo jet fan with stepless speed regulation, digital LED speed display, and 100-level airflow.',
                'warranty' => '6 Months Warranty',
            ],
            [
                'title' => 'JYSUPER JY-2218 Rechargeable Compact Table Fan',
                'slug' => 'jysuper-jy-2218',
                'sku' => 'JY-2218-TF',
                'category' => 'Rechargeable Lights & Fans',
                'brand' => 'JYSUPER',
                'price' => 1190,
                'regular_price' => 1590,
                'stock' => 35,
                'image' => '/images/storefront/v3/prod_jysuper_white_fan.jpg',
                'is_featured' => true,
                'is_deal_of_day' => false,
                'description' => 'Whisper quiet desk fan with 3-speed adjustment, 180-degree tilting head, USB-C input, and compact space saving base.',
                'warranty' => '3 Months Warranty',
            ],
            [
                'title' => 'JYSUPER JY-2570 Rechargeable Fan with Night Light',
                'slug' => 'jysuper-jy-2570',
                'sku' => 'JY-2570-NL',
                'category' => 'Rechargeable Lights & Fans',
                'brand' => 'JYSUPER',
                'price' => 2090,
                'regular_price' => 2790,
                'stock' => 28,
                'image' => '/images/storefront/v3/prod_jysuper_pink.jpg',
                'is_featured' => true,
                'is_deal_of_day' => false,
                'description' => 'Dual purpose cooling desk fan with glowing circular warm ambient night light ring, copper metallic accents, and long battery life.',
                'warranty' => '6 Months Warranty',
            ],
            [
                'title' => 'Hollyland Lark M2S Wireless Lavalier Microphone',
                'slug' => 'hollyland-lark-m2s-wireless',
                'sku' => 'HL-LARK-M2S',
                'category' => 'Creator\'s Zone',
                'brand' => 'Hollyland',
                'price' => 10500,
                'regular_price' => 12500,
                'stock' => 15,
                'image' => '/images/storefront/v3/prod_hollyland_mic.jpg',
                'is_featured' => true,
                'is_deal_of_day' => false,
                'description' => 'Ultra-lightweight wireless microphone system with environmental noise cancellation (ENC), 48kHz/24bit audio, and 30h battery charging case.',
                'warranty' => '1 Year Official Warranty',
            ],
            [
                'title' => 'QCY PB20A 45W PD QC 20000mAh Power Bank',
                'slug' => 'qcy-pb20a-45w-pd-qc',
                'sku' => 'QCY-PB20A-45W',
                'category' => 'Powerbanks',
                'brand' => 'QCY',
                'price' => 3190,
                'regular_price' => 3750,
                'stock' => 22,
                'image' => '/images/storefront/v3/prod_qcy_powerbank.jpg',
                'is_featured' => true,
                'is_deal_of_day' => false,
                'description' => '45W high power output suitable for MacBook, laptops, tablets, and smartphones. 3-port fast charging with smart power distribution.',
                'warranty' => '1 Year Warranty',
            ],
        ];

        foreach ($products as $pData) {
            $catId = $categoryModels[$pData['category']]->id ?? 1;
            $brandId = $brandModels[$pData['brand']]->id ?? null;

            Product::updateOrCreate(
                ['slug' => $pData['slug']],
                [
                    'title' => $pData['title'],
                    'sku' => $pData['sku'],
                    'category_id' => $catId,
                    'brand_id' => $brandId,
                    'price' => $pData['price'],
                    'regular_price' => $pData['regular_price'],
                    'stock' => $pData['stock'],
                    'image' => $pData['image'],
                    'is_featured' => $pData['is_featured'],
                    'is_deal_of_day' => $pData['is_deal_of_day'],
                    'description' => $pData['description'],
                    'warranty' => $pData['warranty'],
                ]
            );
        }
    }
}
