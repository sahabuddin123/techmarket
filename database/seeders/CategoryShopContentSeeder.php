<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\CategoryContentSection;
use App\Models\CategoryFaq;
use App\Models\CategoryPriceTable;
use App\Models\SpecificationGroup;
use App\Models\SpecificationAttribute;
use App\Models\ProductSpecificationValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoryShopContentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Brands exist
        $brands = [
            'Gree' => Brand::firstOrCreate(['slug' => 'gree'], ['name' => 'Gree']),
            'General' => Brand::firstOrCreate(['slug' => 'general'], ['name' => 'General']),
            'Haier' => Brand::firstOrCreate(['slug' => 'haier'], ['name' => 'Haier']),
            'Midea' => Brand::firstOrCreate(['slug' => 'midea'], ['name' => 'Midea']),
            'Panasonic' => Brand::firstOrCreate(['slug' => 'panasonic'], ['name' => 'Panasonic']),
            'Singer' => Brand::firstOrCreate(['slug' => 'singer'], ['name' => 'Singer']),
            'Walton' => Brand::firstOrCreate(['slug' => 'walton'], ['name' => 'Walton']),
        ];

        // 2. Ensure Parent Category "Home Appliance"
        $parentCat = Category::firstOrCreate(['slug' => 'home-appliance'], [
            'name' => 'Home Appliance',
            'icon' => 'Home',
            'is_nav_visible' => true,
            'is_featured' => true,
            'sort_order' => 5,
        ]);

        // 3. Create or update "Air Conditioner" Category
        $acCategory = Category::updateOrCreate(
            ['slug' => 'air-conditioner'],
            [
                'name' => 'Air Conditioner',
                'parent_id' => $parentCat->id,
                'page_title' => 'Air Conditioner Price in Bangladesh 2026',
                'subtitle' => 'Explore the latest Air Conditioner prices in Bangladesh from top brands like Gree, General, Haier, Midea, and Panasonic. Get official warranty and energy-saving inverter ACs at TechMarket BD.',
                'seo_title' => 'Air Conditioner Price in Bangladesh 2026 | TechMarket BD',
                'meta_description' => 'Looking for Air Conditioner Price in Bangladesh? Check out 1 Ton, 1.5 Ton, 2 Ton Inverter & Non-Inverter Split, Cassette & Ceiling AC from Gree, General, Haier at best prices in BD.',
                'meta_keywords' => 'Air conditioner price in bangladesh, Gree AC price BD, General AC Bangladesh, Inverter AC price, 1.5 Ton AC price',
                'seo_intro' => '<p>Air Conditioners (AC) have become an essential electronic appliance for homes, offices, and commercial establishments across Bangladesh. With soaring summer temperatures, investing in an energy-efficient Inverter Air Conditioner guarantees optimal cooling while significantly reducing electricity bills. At TechMarket BD, we bring you genuine 1.0 Ton, 1.5 Ton, 2.0 Ton, and 2.5 Ton AC models from global leaders including Gree, General (Fujitsu), Haier, Midea, Panasonic, and Singer with official compressor warranty and nationwide installation support.</p>',
                'sidebar_visible' => true,
                'default_sort' => 'bestseller',
                'icon' => 'Wind',
                'is_featured' => true,
                'is_nav_visible' => true,
                'sort_order' => 1,
            ]
        );

        // 4. Subcategories for Air Conditioner
        $subcategories = [
            'Split AC' => 'split-ac',
            'Inverter AC' => 'inverter-ac',
            'Non-Inverter AC' => 'non-inverter-ac',
            'Cassette AC' => 'cassette-ac',
            'Ceiling AC' => 'ceiling-ac',
            'Portable AC' => 'portable-ac',
        ];

        foreach ($subcategories as $name => $slug) {
            Category::firstOrCreate(['slug' => $slug], [
                'name' => $name,
                'parent_id' => $acCategory->id,
                'is_nav_visible' => true,
                'sort_order' => 1,
            ]);
        }

        // 5. Specification Attributes for AC
        $group = SpecificationGroup::firstOrCreate(['name' => 'Air Conditioner Specs'], ['sort_order' => 1]);
        $attrCapacity = SpecificationAttribute::firstOrCreate(
            ['name' => 'Capacity (Ton)', 'specification_group_id' => $group->id],
            ['unit' => 'Ton', 'sort_order' => 1]
        );
        $attrTech = SpecificationAttribute::firstOrCreate(
            ['name' => 'Technology', 'specification_group_id' => $group->id],
            ['unit' => null, 'sort_order' => 2]
        );
        $attrEnergy = SpecificationAttribute::firstOrCreate(
            ['name' => 'Energy Saving Rating', 'specification_group_id' => $group->id],
            ['unit' => 'Star', 'sort_order' => 3]
        );

        // 6. Seed AC Products
        $acProducts = [
            [
                'title' => 'Gree GS-18XPUV32 1.5 Ton Pular Split Inverter Air Conditioner',
                'slug' => 'gree-gs-18xpuv32-1-5-ton-inverter-ac',
                'brand' => 'Gree',
                'price' => 64500,
                'regular_price' => 69000,
                'stock' => 15,
                'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 1.5 Ton (18000 BTU)',
                    'Technology: Inverter Fast Cooling',
                    'Energy Efficiency: 60% Power Saving',
                    'Compressor: 10 Years Warranty',
                ],
                'specs' => [
                    $attrCapacity->id => '1.5 Ton',
                    $attrTech->id => 'Inverter',
                    $attrEnergy->id => '5 Star',
                ]
            ],
            [
                'title' => 'General ASGG18CPTA-V 1.5 Ton Hyper Tropical Split Inverter AC',
                'slug' => 'general-asgg18cpta-v-1-5-ton-inverter-ac',
                'brand' => 'General',
                'price' => 88500,
                'regular_price' => 95000,
                'stock' => 8,
                'image' => 'https://images.unsplash.com/photo-1614633833026-062061b36952?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 1.5 Ton Hyper Tropical',
                    'Cooling: Extreme Heat Operation up to 55°C',
                    'Japanese Compressor Technology',
                    'Eco-Friendly R32 Refrigerant',
                ],
                'specs' => [
                    $attrCapacity->id => '1.5 Ton',
                    $attrTech->id => 'Inverter',
                    $attrEnergy->id => '5 Star',
                ]
            ],
            [
                'title' => 'Haier HSU-18CleanCool 1.5 Ton Triple Inverter Air Conditioner',
                'slug' => 'haier-hsu-18cleancool-1-5-ton-inverter-ac',
                'brand' => 'Haier',
                'price' => 56500,
                'regular_price' => 61000,
                'stock' => 20,
                'image' => 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 1.5 Ton Triple Inverter',
                    'Self-Clean Cold Expansion Technology',
                    '65% Energy Saving Rating',
                    'Warranty: 10 Years Compressor',
                ],
                'specs' => [
                    $attrCapacity->id => '1.5 Ton',
                    $attrTech->id => 'Inverter',
                    $attrEnergy->id => '4 Star',
                ]
            ],
            [
                'title' => 'Midea MSAF-12CRN1 1.0 Ton Non-Inverter Split AC',
                'slug' => 'midea-msaf-12crn1-1-0-ton-non-inverter-ac',
                'brand' => 'Midea',
                'price' => 38500,
                'regular_price' => 42000,
                'stock' => 12,
                'image' => 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 1.0 Ton (12000 BTU)',
                    'Type: Non-Inverter Turbo Cool',
                    'HD Filter & Dual Filtration',
                    'Coverage: 80 - 120 Sqft',
                ],
                'specs' => [
                    $attrCapacity->id => '1.0 Ton',
                    $attrTech->id => 'Non-Inverter',
                    $attrEnergy->id => '3 Star',
                ]
            ],
            [
                'title' => 'Gree GS-24XPUV32 2.0 Ton Pular Split Inverter Air Conditioner',
                'slug' => 'gree-gs-24xpuv32-2-0-ton-inverter-ac',
                'brand' => 'Gree',
                'price' => 78500,
                'regular_price' => 84000,
                'stock' => 6,
                'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 2.0 Ton (24000 BTU)',
                    'Smart Inverter Ultra Quiet Operation',
                    'Coverage: 180 - 240 Sqft',
                    'Warranty: 10 Years Official Warranty',
                ],
                'specs' => [
                    $attrCapacity->id => '2.0 Ton',
                    $attrTech->id => 'Inverter',
                    $attrEnergy->id => '5 Star',
                ]
            ],
            [
                'title' => 'Panasonic CS/CU-XU18XKZ 1.5 Ton Aero Inverter NanoeX AC',
                'slug' => 'panasonic-cs-cu-xu18xkz-1-5-ton-inverter-ac',
                'brand' => 'Panasonic',
                'price' => 92000,
                'regular_price' => 99000,
                'stock' => 5,
                'image' => 'https://images.unsplash.com/photo-1614633833026-062061b36952?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 1.5 Ton Premium Aero Series',
                    'NanoeX Air Purification Technology',
                    'Built-in Wi-Fi & Smart Mobile App Control',
                    'Warranty: 10 Years Compressor',
                ],
                'specs' => [
                    $attrCapacity->id => '1.5 Ton',
                    $attrTech->id => 'Inverter',
                    $attrEnergy->id => '5 Star',
                ]
            ],
            [
                'title' => 'Singer SAS18L70INV 1.5 Ton Green Inverter Air Conditioner',
                'slug' => 'singer-sas18l70inv-1-5-ton-inverter-ac',
                'brand' => 'Singer',
                'price' => 54500,
                'regular_price' => 59000,
                'stock' => 10,
                'image' => 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 1.5 Ton (18000 BTU)',
                    'Green Inverter Rapid Cooling Technology',
                    'Golden Fin Corrosion Protection',
                    'Warranty: 5 Years Compressor Warranty',
                ],
                'specs' => [
                    $attrCapacity->id => '1.5 Ton',
                    $attrTech->id => 'Inverter',
                    $attrEnergy->id => '4 Star',
                ]
            ],
            [
                'title' => 'Walton WSI-KRYSTAL-18F 1.5 Ton Inverter Air Conditioner',
                'slug' => 'walton-wsi-krystal-18f-1-5-ton-inverter-ac',
                'brand' => 'Walton',
                'price' => 49500,
                'regular_price' => 54000,
                'stock' => 14,
                'image' => 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&auto=format&fit=crop',
                'key_specs' => [
                    'Capacity: 1.5 Ton Inverter',
                    'Dual Defender Air Ionizer & Filter',
                    'Frost Clean Technology',
                    'Warranty: 10 Years Compressor',
                ],
                'specs' => [
                    $attrCapacity->id => '1.5 Ton',
                    $attrTech->id => 'Inverter',
                    $attrEnergy->id => '4 Star',
                ]
            ]
        ];

        $createdProducts = [];
        foreach ($acProducts as $pData) {
            $brand = $brands[$pData['brand']] ?? null;
            $product = Product::updateOrCreate(
                ['slug' => $pData['slug']],
                [
                    'title' => $pData['title'],
                    'sku' => 'AC-' . strtoupper(Str::random(6)),
                    'category_id' => $acCategory->id,
                    'brand_id' => $brand ? $brand->id : null,
                    'price' => $pData['price'],
                    'regular_price' => $pData['regular_price'],
                    'cost_price' => $pData['price'] * 0.85,
                    'stock' => $pData['stock'],
                    'is_featured' => true,
                    'is_deal_of_day' => false,
                    'key_specs' => $pData['key_specs'],
                    'full_specs' => ['Type' => 'Split Air Conditioner', 'Warranty' => 'Official 10 Years Compressor Warranty'],
                    'image' => $pData['image'],
                    'description' => $pData['title'] . ' with official manufacturer warranty and free home delivery support in Dhaka.',
                ]
            );

            // Attach Specification Values
            foreach ($pData['specs'] as $specAttrId => $specVal) {
                ProductSpecificationValue::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'specification_attribute_id' => $specAttrId,
                    ],
                    [
                        'value' => $specVal,
                    ]
                );
            }

            $createdProducts[] = $product;
        }

        // 7. Seed Dynamic SEO Content Sections
        $acCategory->contentSections()->delete();

        $acCategory->contentSections()->createMany([
            [
                'heading' => 'Air Conditioner Price in Bangladesh 2026',
                'section_type' => 'rich_text',
                'content' => '<p>Air conditioner prices in Bangladesh range from <strong>৳35,000 to ৳1,50,000</strong> depending on cooling capacity, inverter technology, compressor brand, and energy star ratings. Inverter air conditioners have gained immense popularity for their high energy efficiency and whisper-quiet cooling performance. Whether you need a 1.0 Ton AC for a master bedroom, a 1.5 Ton AC for an average living room, or a heavy-duty 2.0 Ton to 4.0 Ton Cassette AC for corporate spaces, TechMarket BD provides the most competitive deals with authorized distributor warranty.</p>',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'heading' => 'Lowest Price Air Conditioners in Bangladesh',
                'section_type' => 'rich_text',
                'content' => '<p>If you are looking for budget-friendly cooling solutions, non-inverter 1.0 Ton models from Midea, Singer, and Walton start around <strong>৳36,500 to ৳42,000</strong>. These models offer high-speed turbo cooling, multi-stage air filtration, and durable condenser fins suited for tropical climates.</p>',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'heading' => 'Popular Air Conditioner Brands in BD',
                'section_type' => 'rich_text',
                'content' => '<p>Top air conditioner brands preferred by Bangladeshi customers include:</p><ul><li><strong>Gree:</strong> Market leader in Bangladesh known for robust build quality, Pular and Fairy inverter series, and low power consumption.</li><li><strong>General (Fujitsu):</strong> Heavy-duty Japanese cooling performance engineered to handle extreme temperatures up to 55°C.</li><li><strong>Haier:</strong> Smart Triple Inverter series with self-cleaning cold expansion features.</li><li><strong>Panasonic:</strong> Premium Aero series with Nanoe-X air purification technology for allergen-free indoor air.</li><li><strong>Midea:</strong> Value-for-money cooling with golden fin anti-corrosion protection.</li></ul>',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'heading' => 'How to Choose the Right AC Ton Capacity for Your Room',
                'section_type' => 'rich_text',
                'content' => '<p>Selecting the correct cooling capacity ensures fast cooling and prevents electricity wastage:</p><ul><li><strong>1.0 Ton (12,000 BTU):</strong> Ideal for room sizes between 80 to 120 sq. ft.</li><li><strong>1.5 Ton (18,000 BTU):</strong> Perfect for room sizes between 130 to 180 sq. ft.</li><li><strong>2.0 Ton (24,000 BTU):</strong> Recommended for spacious drawing rooms and offices of 190 to 250 sq. ft.</li><li><strong>2.5 Ton to 4.0 Ton:</strong> Best suited for commercial halls, restaurants, and duplex spaces.</li></ul>',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ]);

        // 8. Seed Dynamic Category Price Table
        $acCategory->priceTables()->delete();

        foreach ($createdProducts as $idx => $prod) {
            $acCategory->priceTables()->create([
                'product_id' => $prod->id,
                'product_name' => $prod->title,
                'price' => (string)$prod->price,
                'specs' => implode(', ', array_slice($prod->key_specs ?? [], 0, 2)),
                'custom_link' => "/product/{$prod->slug}",
                'sort_order' => $idx + 1,
                'is_active' => true,
            ]);
        }

        // 9. Seed Dynamic FAQs
        $acCategory->faqs()->delete();

        $acCategory->faqs()->createMany([
            [
                'question' => 'Which brand of Air Conditioner is best in Bangladesh?',
                'answer' => 'Gree, General (Fujitsu), Haier, and Panasonic are widely recognized as the best AC brands in Bangladesh due to their long compressor life, energy-efficient inverter motors, and widespread customer service networks.',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'question' => 'What is the main benefit of an Inverter AC over a Non-Inverter AC?',
                'answer' => 'An Inverter AC regulates compressor speed continuously according to room temperature instead of constantly switching on and off. This delivers up to 60-65% electricity savings, faster cooling, and significantly lower operating noise.',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'question' => 'How much electricity does a 1.5 Ton Inverter AC consume per month?',
                'answer' => 'On average usage of 8 to 10 hours daily, a 1.5 Ton 5-Star Inverter AC consumes approximately 120 to 160 units (kWh) per month depending on room insulation and thermostat settings.',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'question' => 'Do Air Conditioners bought from TechMarket BD come with official warranty?',
                'answer' => 'Yes, 100% of our air conditioners come with original manufacturer warranty cards providing up to 10 Years compressor warranty and 1 to 2 years free home service.',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ]);
    }
}
