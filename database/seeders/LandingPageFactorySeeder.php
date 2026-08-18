<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LandingPage;
use App\Models\LandingPageSection;
use App\Models\Product;

class LandingPageFactorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Product specs and short descriptions are enriched for the 6 target products
        $productsData = [
            20 => [
                'short_description' => '43 ইঞ্চি 4K UHD বেজেল-লেস গুগল স্মার্ট টিভি। ডলবি অডিও ও অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি সহ।',
                'key_specs' => [
                    'স্ক্রিন সাইজ: 43 ইঞ্চি 4K Ultra HD (3840 × 2160)',
                    'অপারেটিং সিস্টেম: Google TV উইথ প্লে-স্টোর',
                    'সাউন্ড সিস্টেম: 24W Stereo Dolby Audio',
                    'প্রসেসর: 64-Bit Quad Core High Speed Engine',
                    'কানেক্টিভিটি: Dual Band Wi-Fi, Bluetooth 5.1, 3x HDMI, 2x USB',
                    'ওয়ারেন্টি: 4 বছরের প্যানেল ও 1 বছর ফুল পার্টস ওয়ারেন্টি'
                ]
            ],
            16 => [
                'short_description' => '1.5 টন স্প্লিট ইকো-ইনভার্টার এয়ার কন্ডিশনার। 60% বিদ্যুৎ সাশ্রয়ী ও দ্রুততম কুলিং প্রযুক্তি।',
                'key_specs' => [
                    'ক্যাপাসিটি: 1.5 টন (18,000 BTU/hr)',
                    'রুম সাইজ উপযোগী: 120 - 180 স্কয়ার ফিট',
                    'ইনভার্টার টেকনোলজি: 60% পর্যন্ত বিদ্যুৎ সাশ্রয়ী Eco-Inverter',
                    'কনডেন্সার: 100% কপার গোল্ডেন ফিন টিউব',
                    'রেফ্রিজারেন্ট: পরিবেশবান্ধব R32 গ্যাস',
                    'ওয়ারেন্টি: 10 বছর কম্প্রেসার ও 1 বছর ফ্রি সার্ভিসিং'
                ]
            ],
            18 => [
                'short_description' => '1.5 টন অল ইনভার্টার ডুয়াল ক্লাইমেট স্মার্ট এসি। টার্বো কুলিং ও এয়ার পিউরিফায়ার ফিল্টার সহ।',
                'key_specs' => [
                    'কুলিং ক্ষমতা: 1.5 টন অল ইনভার্টার ডুয়াল সিস্টেম',
                    'বিদ্যুৎ সাশ্রয়: 65% পর্যন্ত বিদ্যুৎ সাশ্রয়ী A+++ রেটিং',
                    'এয়ারফ্লো: 15 মিটার লং ডিসটেন্স 3D এয়ার থ্রো',
                    'ফিল্ট্রেশন: সেলফ-ক্লিন ও অ্যান্টি-ব্যাকটেরিয়াল ফিল্টার',
                    'স্মার্ট কন্ট্রোল: স্মার্টফোন ওয়াই-ফাই অ্যাপ সাপোর্ট',
                    'ওয়ারেন্টি: 10 বছর কম্প্রেসার ওয়ারেন্টি ও ফ্রি ইনস্টলেশন'
                ]
            ],
            15 => [
                'short_description' => '7.2 লিটার ডিজিটাল স্মার্ট এয়ারফ্রায়ার। 90% কম তেলে স্বাস্থ্যকর ও ক্রিস্পি রান্নার সেরা সমাধান।',
                'key_specs' => [
                    'ক্যাপাসিটি: 7.2 লিটার XXL (একসাথে আস্ত মুরগি ফ্রাই)',
                    'প্রযুক্তি: Rapid Air Technology (90% কম তেল)',
                    'ফাংশন: 16-in-1 প্রি-সেট ডিজিটাল টাচ কুকিং মোড',
                    'স্মার্ট কানেকশন: NutriU Wi-Fi অ্যাপ রেসিপি কন্ট্রোল',
                    'ক্লিনিং: নন-স্টিক QuickClean ডিশওয়াশার সেফ বাস্কেট',
                    'ওয়ারেন্টি: 2 বছরের অফিশিয়াল ইন্টারন্যাশনাল ওয়ারেন্টি'
                ]
            ],
            14 => [
                'short_description' => '1.43 ইঞ্চি AMOLED ডিসপ্লে ও ডুয়াল ব্যান্ড জিপিএস কলিং মিলিটারি গ্রেড স্মার্টওয়াচ।',
                'key_specs' => [
                    'ডিসপ্লে: 1.43" Ultra AMOLED (1000 Nits পিক ব্রাইটনেস)',
                    'বডি বিল্ড: MIL-STD-810H ইউএস মিলিটারি সার্টিফায়েড মেটাল বডি',
                    'নেভিগেশন: 6 স্যাটেলাইট ডুয়াল ব্যান্ড জিপিএস পজিশনিং',
                    'কলিং ও হেলথ: ব্লুটুথ ওয়ান-ট্যাপ কলিং ও 24/7 হার্ট রেট/SpO2 ট্র্যাকিং',
                    'ব্যাটারি লাইফ: 500mAh ব্যাটারি (সাধারণ ব্যবহারে 15-20 দিন)',
                    'ওয়াটার রেজিস্ট্যান্স: 5ATM ও IP69K ওয়াটারপ্রুফ'
                ]
            ],
            5 => [
                'short_description' => '16 ইঞ্চি 3.2K 120Hz Lumina OLED ল্যাপটপ উইথ AMD Ryzen AI 7 8845HS প্রসেসর ও 16GB DDR5।',
                'key_specs' => [
                    'প্রসেসর: AMD Ryzen AI 7 8845HS (8 Cores / 16 Threads, Up to 5.1GHz)',
                    'ডিসপ্লে: 16.0" 3.2K (3200x2000) 120Hz 0.2ms 100% DCI-P3 OLED',
                    'মেমরি ও স্টোরেজ: 16GB LPDDR5X 7500MHz RAM + 1TB PCIe 4.0 NVMe SSD',
                    'গ্রাফিক্স: AMD Radeon 780M High-Performance Graphics',
                    'কিবোর্ড ও অডিও: RGB ErgoSense কীবোর্ড ও Harman Kardon Dolby Atmos',
                    'ব্যাটারি ও ওয়ারেন্টি: 75Wh অল-ডে ব্যাটারি + 2 বছরের অফিসিয়াল ওয়ারেন্টি'
                ]
            ]
        ];

        foreach ($productsData as $prodId => $data) {
            $p = Product::find($prodId);
            if ($p) {
                $p->update([
                    'short_description' => $data['short_description'],
                    'key_specs' => $data['key_specs'],
                    'is_active' => true
                ]);
            }
        }

        // 2. Define 6 Unique Landing Pages
        $campaignPages = [
            // PAGE 1: Electronics / TV Style
            [
                'product_id' => 20,
                'name' => 'Haier 43" 4K স্মার্ট গুগল টিভি অফার',
                'slug' => 'haier-43-inch-4k-google-smart-tv',
                'status' => 'published',
                'campaign_name' => 'Meta TV Campaign 2026',
                'campaign_code' => 'FB_TV_4K',
                'theme_color' => '#f59e0b',
                'custom_discount_amount' => 0,
                'inside_dhaka_charge' => 0,
                'outside_dhaka_charge' => 0,
                'is_free_delivery' => true,
                'whatsapp_number' => '01712345678',
                'call_number' => '09678-123456',
                'custom_order_button_text' => 'অর্ডার নিশ্চিত করুন (Confirm Order)',
                'payment_methods' => ['cod', 'bkash', 'nagad'],
                'meta_title' => 'Haier 43 Inch 4K UHD Bezel-Less Google Smart TV — TechMarket BD',
                'meta_description' => 'হায়ার ৪৩ ইঞ্চি ৪কে গুগল স্মার্ট টিভিতে বিশেষ ছাড়! ডলবি অডিও, ফ্রি হোম ডেলিভারি ও অফিসিয়াল ওয়ারেন্টি সহ অর্ডার করুন।',
            ],

            // PAGE 2: Air Conditioner Style (BTU & Energy Saver)
            [
                'product_id' => 16,
                'name' => 'Gree 1.5 Ton Eco-Inverter AC স্পেশাল অফার',
                'slug' => 'gree-1-5-ton-eco-inverter-ac',
                'status' => 'published',
                'campaign_name' => 'Summer Cooling Sale',
                'campaign_code' => 'FB_AC_GREE',
                'theme_color' => '#0ea5e9',
                'custom_discount_amount' => 0,
                'inside_dhaka_charge' => 0,
                'outside_dhaka_charge' => 200,
                'is_free_delivery' => false,
                'whatsapp_number' => '01712345678',
                'call_number' => '09678-123456',
                'custom_order_button_text' => 'এসি অর্ডার কনফার্ম করুন',
                'payment_methods' => ['cod', 'bkash', 'nagad'],
                'meta_title' => 'Gree 1.5 Ton Split Eco-Inverter AC — TechMarket BD',
                'meta_description' => 'গ্রী ১.৫ টন ইকো-ইনভার্টার এসিতে ৬০% বিদ্যুৎ সাশ্রয়! ১০ বছর কম্প্রেসার ওয়ারেন্টি ও ফ্রি ইনস্টলেশন সুবিধা সহ অর্ডার করুন।',
            ],

            // PAGE 3: Refrigerator / Dual Climate Style
            [
                'product_id' => 18,
                'name' => 'Haier Gravity 1.5 Ton All Inverter Smart Climate',
                'slug' => 'haier-gravity-dual-inverter-smart-climate',
                'status' => 'published',
                'campaign_name' => 'Family Appliance Fest',
                'campaign_code' => 'FB_HAIER_CLIMATE',
                'theme_color' => '#38bdf8',
                'custom_discount_amount' => 0,
                'inside_dhaka_charge' => 0,
                'outside_dhaka_charge' => 150,
                'is_free_delivery' => false,
                'whatsapp_number' => '01712345678',
                'call_number' => '09678-123456',
                'custom_order_button_text' => 'অর্ডার নিশ্চিত করুন',
                'payment_methods' => ['cod', 'bkash', 'nagad'],
                'meta_title' => 'Haier Gravity 1.5 Ton All Inverter Smart — TechMarket BD',
                'meta_description' => 'হায়ার গ্র্যাভিটি অল-ইনভার্টার স্মার্ট ডিভাইস। লং ডিস্ট্যান্স এয়ার থ্রো, এনার্জি সেভিং ও ১০ বছরের কম্প্রেসার গ্যারান্টি।',
            ],

            // PAGE 4: Home Appliance Style (Airfryer)
            [
                'product_id' => 15,
                'name' => 'Philips 7.2L XXL Digital Smart Airfryer',
                'slug' => 'philips-7-2l-digital-smart-airfryer',
                'status' => 'published',
                'campaign_name' => 'Healthy Cooking Promo',
                'campaign_code' => 'FB_AIRFRYER_PHILIPS',
                'theme_color' => '#f59e0b',
                'custom_discount_amount' => 0,
                'inside_dhaka_charge' => 60,
                'outside_dhaka_charge' => 120,
                'is_free_delivery' => false,
                'whatsapp_number' => '01712345678',
                'call_number' => '09678-123456',
                'custom_order_button_text' => 'এখনই এয়ারফ্রায়ার অর্ডার করুন',
                'payment_methods' => ['cod', 'bkash', 'nagad'],
                'meta_title' => 'Philips 5000 Series 7.2L Digital Airfryer — TechMarket BD',
                'meta_description' => '৯০% কম তেলে স্বাস্থ্যকর রান্নার ফিলিপস ৭.২ লিটার ডিজিটাল এয়ারফ্রায়ার। ২ বছরের অফিশিয়াল ওয়ারেন্টি সহ অর্ডার করুন।',
            ],

            // PAGE 5: Gadget / Fast Impulse Buy Style (Smartwatch)
            [
                'product_id' => 14,
                'name' => 'Kospet Tank T3 Ultra মিলিটারি স্মার্টওয়াচ',
                'slug' => 'kospet-tank-t3-ultra-military-smartwatch',
                'status' => 'published',
                'campaign_name' => 'Gadget Flash Sale',
                'campaign_code' => 'FB_KOSPET_TANK',
                'theme_color' => '#f59e0b',
                'custom_discount_amount' => 0,
                'inside_dhaka_charge' => 60,
                'outside_dhaka_charge' => 120,
                'is_free_delivery' => false,
                'whatsapp_number' => '01712345678',
                'call_number' => '09678-123456',
                'custom_order_button_text' => '১-ক্লিকে স্মার্টওয়াচ অর্ডার করুন',
                'payment_methods' => ['cod', 'bkash', 'nagad'],
                'meta_title' => 'Kospet Tank T3 Ultra AMOLED GPS Calling Smartwatch — TechMarket BD',
                'meta_description' => 'মিলিটারি গ্রেড মেটাল বডি, ১.৪৩ ইঞ্চি এমোলেড ডিসপ্লে ও ডুয়াল জিপিএস সহ কসপেট স্মার্টওয়াচে বিশেষ ছাড়!',
            ],

            // PAGE 6: High Value / Computer & OLED Laptop Style
            [
                'product_id' => 5,
                'name' => 'Asus Vivobook S 16 Ryzen AI 7 3.2K OLED ল্যাপটপ',
                'slug' => 'asus-vivobook-s16-ryzen-ai-oled-laptop',
                'status' => 'published',
                'campaign_name' => 'Premium Creator Laptops',
                'campaign_code' => 'FB_ASUS_OLED',
                'theme_color' => '#f59e0b',
                'custom_discount_amount' => 0,
                'inside_dhaka_charge' => 0,
                'outside_dhaka_charge' => 0,
                'is_free_delivery' => true,
                'whatsapp_number' => '01712345678',
                'call_number' => '09678-123456',
                'custom_order_button_text' => 'ল্যাপটপ অর্ডার কনফার্ম করুন',
                'payment_methods' => ['cod', 'bkash', 'nagad'],
                'meta_title' => 'Asus Vivobook S 16 M5606UA Ryzen AI 7 OLED Laptop — TechMarket BD',
                'meta_description' => 'আসুস ভিভোবুক এস ১৬ উইথ ৩.২কে ১২০হার্টজ ওলেড ডিসপ্লে ও রাইজেন এআই ৭ প্রসেসর। ২ বছরের অফিশিয়াল ওয়ারেন্টি সহ অর্ডার করুন।',
            ]
        ];

        foreach ($campaignPages as $pageData) {
            $landingPage = LandingPage::updateOrCreate(
                ['slug' => $pageData['slug']],
                $pageData
            );

            // Generate default section structure if empty
            if ($landingPage->sections()->count() === 0) {
                $landingPage->generateDefaultSections();
            }
        }
    }
}
