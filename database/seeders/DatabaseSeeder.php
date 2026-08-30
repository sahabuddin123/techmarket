<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Banner;
use App\Models\Coupon;
use App\Models\Setting;
use App\Models\Role;
use App\Models\Permission;
use App\Models\SpecificationGroup;
use App\Models\SpecificationAttribute;
use App\Models\ShippingRate;
use App\Models\PaymentMethod;
use App\Models\CmsPage;
use App\Models\BlogPost;
use App\Models\QuickAction;
use App\Models\HomepageSection;
use App\Models\FlashSale;
use App\Models\FlashSaleItem;
use App\Models\EmiPartner;
use App\Models\ServiceRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed RBAC Permissions & Roles
        $permissions = [
            ['name' => 'products.view', 'group' => 'products', 'display_name' => 'View Products'],
            ['name' => 'products.create', 'group' => 'products', 'display_name' => 'Create Products'],
            ['name' => 'products.update', 'group' => 'products', 'display_name' => 'Update Products'],
            ['name' => 'products.delete', 'group' => 'products', 'display_name' => 'Delete Products'],
            ['name' => 'orders.view', 'group' => 'orders', 'display_name' => 'View Orders'],
            ['name' => 'orders.update', 'group' => 'orders', 'display_name' => 'Update Orders'],
            ['name' => 'inventory.manage', 'group' => 'inventory', 'display_name' => 'Manage Inventory'],
            ['name' => 'settings.manage', 'group' => 'settings', 'display_name' => 'Manage Settings'],
            ['name' => 'homepage.manage', 'group' => 'homepage', 'display_name' => 'Manage Homepage & Layout'],
            ['name' => 'reports.view', 'group' => 'reports', 'display_name' => 'View Reports'],
            ['name' => 'reports.sales', 'group' => 'reports', 'display_name' => 'View Sales Reports'],
            ['name' => 'reports.products', 'group' => 'reports', 'display_name' => 'View Product Reports'],
            ['name' => 'reports.inventory', 'group' => 'reports', 'display_name' => 'View Inventory Reports'],
            ['name' => 'reports.customers', 'group' => 'reports', 'display_name' => 'View Customer Reports'],
            ['name' => 'reports.operations', 'group' => 'reports', 'display_name' => 'View Operational Reports'],
            ['name' => 'reports.export', 'group' => 'reports', 'display_name' => 'Export Reports Data'],
            ['name' => 'admin.search', 'group' => 'search', 'display_name' => 'Use Admin Global Search'],
            ['name' => 'offers.manage', 'group' => 'offers', 'display_name' => 'Manage Offers & Campaigns'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p['name']], $p);
        }

        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin'], ['display_name' => 'Super Administrator']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Administrator']);
        $allPermissions = Permission::all();
        $superAdminRole->permissions()->sync($allPermissions->pluck('id'));
        $adminRole->permissions()->sync($allPermissions->pluck('id'));

        // 2. Seed Users
        $admin = User::firstOrCreate([
            'email' => 'admin@techmarketbd.com',
        ], [
            'name' => 'Super Administrator',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '01324294323',
        ]);
        $admin->roles()->sync([$superAdminRole->id]);

        $customer = User::firstOrCreate([
            'email' => 'customer@gmail.com',
        ], [
            'name' => 'Rahim Ahmed',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'phone' => '01711223344',
        ]);

        // 3. Seed Hierarchical Categories with Mega Menu settings
        $topCategories = [
            [
                'name' => 'Laptop',
                'slug' => 'laptop',
                'icon' => 'Laptop',
                'sort_order' => 1,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '4_columns',
                'mega_menu_config' => [
                    'promo_enabled' => true,
                    'promo_image' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop',
                    'promo_title' => 'AI Copilot+ Laptops',
                    'promo_subtitle' => 'Next-Gen Neural Processing & 24h Battery',
                    'promo_btn_text' => 'Explore AI Laptops',
                    'promo_btn_url' => '/category/ai-laptop',
                ],
                'children' => [
                    [
                        'name' => 'Gaming Laptop',
                        'slug' => 'gaming-laptop',
                        'children' => [
                            ['name' => 'ASUS ROG & TUF', 'slug' => 'asus-rog-tuf'],
                            ['name' => 'MSI Gaming', 'slug' => 'msi-gaming-laptop'],
                            ['name' => 'Lenovo Legion', 'slug' => 'lenovo-legion'],
                            ['name' => 'Acer Predator', 'slug' => 'acer-predator'],
                        ]
                    ],
                    [
                        'name' => 'Business Laptop',
                        'slug' => 'business-laptop',
                        'children' => [
                            ['name' => 'Lenovo ThinkPad', 'slug' => 'lenovo-thinkpad'],
                            ['name' => 'HP ProBook & EliteBook', 'slug' => 'hp-probook'],
                            ['name' => 'Dell Latitude', 'slug' => 'dell-latitude'],
                        ]
                    ],
                    [
                        'name' => 'Ultrabook & Slim',
                        'slug' => 'ultrabook-slim',
                        'children' => [
                            ['name' => 'ASUS Zenbook', 'slug' => 'asus-zenbook'],
                            ['name' => 'HP Envy & Spectre', 'slug' => 'hp-envy'],
                            ['name' => 'Dell XPS', 'slug' => 'dell-xps'],
                        ]
                    ],
                    [
                        'name' => 'Apple MacBook',
                        'slug' => 'apple-macbook',
                        'children' => [
                            ['name' => 'MacBook Air M3', 'slug' => 'macbook-air-m3'],
                            ['name' => 'MacBook Pro M3 Max', 'slug' => 'macbook-pro-m3'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Components',
                'slug' => 'components',
                'icon' => 'Layers',
                'sort_order' => 2,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '4_columns',
                'mega_menu_config' => [
                    'promo_enabled' => true,
                    'promo_image' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop',
                    'promo_title' => 'GeForce RTX 40-Series',
                    'promo_subtitle' => 'Unleash DLSS 3.5 & Full Ray Tracing',
                    'promo_btn_text' => 'View GPUs',
                    'promo_btn_url' => '/category/graphics-card',
                ],
                'children' => [
                    [
                        'name' => 'Processor',
                        'slug' => 'processor',
                        'children' => [
                            ['name' => 'Intel Processor', 'slug' => 'intel-processor'],
                            ['name' => 'AMD Ryzen Processor', 'slug' => 'amd-processor'],
                        ]
                    ],
                    [
                        'name' => 'Motherboard',
                        'slug' => 'motherboard',
                        'children' => [
                            ['name' => 'Intel Motherboard', 'slug' => 'intel-motherboard'],
                            ['name' => 'AMD Motherboard', 'slug' => 'amd-motherboard'],
                        ]
                    ],
                    [
                        'name' => 'Graphics Card',
                        'slug' => 'graphics-card',
                        'children' => [
                            ['name' => 'NVIDIA GeForce', 'slug' => 'nvidia-geforce'],
                            ['name' => 'AMD Radeon', 'slug' => 'amd-radeon'],
                            ['name' => 'Intel Arc', 'slug' => 'intel-arc'],
                        ]
                    ],
                    [
                        'name' => 'Storage & SSD',
                        'slug' => 'ssd',
                        'children' => [
                            ['name' => 'PCIe Gen4 / Gen5 NVMe', 'slug' => 'nvme-ssd'],
                            ['name' => 'SATA SSD', 'slug' => 'sata-ssd'],
                            ['name' => 'Internal Desktop HDD', 'slug' => 'internal-hdd'],
                        ]
                    ],
                    [
                        'name' => 'RAM (Memory)',
                        'slug' => 'ram',
                        'children' => [
                            ['name' => 'Desktop DDR5 RAM', 'slug' => 'desktop-ddr5-ram'],
                            ['name' => 'Desktop DDR4 RAM', 'slug' => 'desktop-ddr4-ram'],
                            ['name' => 'Laptop RAM', 'slug' => 'laptop-ram'],
                        ]
                    ],
                    [
                        'name' => 'Power Supply & Cooling',
                        'slug' => 'power-cooling',
                        'children' => [
                            ['name' => '80+ Gold / Platinum PSU', 'slug' => 'modular-psu'],
                            ['name' => 'AIO Liquid Cooler', 'slug' => 'liquid-cooler'],
                            ['name' => 'CPU Air Cooler', 'slug' => 'cpu-air-cooler'],
                            ['name' => 'Casing Fans', 'slug' => 'casing-fans'],
                        ]
                    ],
                    [
                        'name' => 'Casing',
                        'slug' => 'casing',
                        'children' => [
                            ['name' => 'Gaming Desktop Casing', 'slug' => 'gaming-casing'],
                            ['name' => 'Mid Tower Casing', 'slug' => 'desktop-casing'],
                        ]
                    ],
                    [
                        'name' => 'Power Supply',
                        'slug' => 'power-supply',
                        'children' => [
                            ['name' => 'Modular Power Supply', 'slug' => 'modular-psu'],
                        ]
                    ],
                    [
                        'name' => 'CPU Cooler',
                        'slug' => 'cpu-cooler',
                        'children' => [
                            ['name' => 'Liquid CPU Cooler', 'slug' => 'liquid-cooler'],
                            ['name' => 'Air CPU Cooler', 'slug' => 'cpu-air-cooler'],
                        ]
                    ],
                    [
                        'name' => 'UPS',
                        'slug' => 'ups',
                        'children' => [
                            ['name' => 'Offline UPS', 'slug' => 'offline-ups'],
                            ['name' => 'Online UPS', 'slug' => 'online-ups'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Desktop',
                'slug' => 'desktop',
                'icon' => 'Monitor',
                'sort_order' => 3,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '3_columns',
                'mega_menu_config' => [
                    'promo_enabled' => true,
                    'promo_image' => 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop',
                    'promo_title' => 'Custom PC Builder',
                    'promo_subtitle' => 'Build and quote your custom rig in 2 minutes',
                    'promo_btn_text' => 'Build PC Now',
                    'promo_btn_url' => '/pc-builder',
                ],
                'children' => [
                    [
                        'name' => 'Brand Desktop PC',
                        'slug' => 'brand-desktop-pc',
                        'children' => [
                            ['name' => 'HP Desktop', 'slug' => 'hp-desktop'],
                            ['name' => 'Dell OptiPlex', 'slug' => 'dell-optiplex'],
                            ['name' => 'Lenovo ThinkCentre', 'slug' => 'lenovo-thinkcentre'],
                        ]
                    ],
                    [
                        'name' => 'Gaming Desktop Rig',
                        'slug' => 'gaming-desktop-rig',
                        'children' => [
                            ['name' => 'Intel RTX Gaming PC', 'slug' => 'intel-rtx-gaming-pc'],
                            ['name' => 'AMD Ryzen Gaming PC', 'slug' => 'amd-ryzen-gaming-pc'],
                        ]
                    ],
                    [
                        'name' => 'All-in-One & Mini PC',
                        'slug' => 'all-in-one-mini-pc',
                        'children' => [
                            ['name' => 'All-in-One PC', 'slug' => 'all-in-one-pc'],
                            ['name' => 'Intel NUC / Mini PC', 'slug' => 'mini-pc'],
                            ['name' => 'Apple Mac Mini & Studio', 'slug' => 'mac-mini-studio'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Monitor',
                'slug' => 'monitor',
                'icon' => 'Monitor',
                'sort_order' => 4,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '3_columns',
                'mega_menu_config' => [
                    'promo_enabled' => true,
                    'promo_image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop',
                    'promo_title' => 'OLED & High Refresh',
                    'promo_subtitle' => 'Up to 360Hz & 4K UHD Clarity',
                    'promo_btn_text' => 'Shop Monitors',
                    'promo_btn_url' => '/category/monitor',
                ],
                'children' => [
                    [
                        'name' => 'By Screen Resolution',
                        'slug' => 'monitor-resolution',
                        'children' => [
                            ['name' => '4K UHD Monitors', 'slug' => '4k-monitors'],
                            ['name' => '2K QHD 1440p Monitors', 'slug' => '2k-monitors'],
                            ['name' => 'Full HD 1080p Monitors', 'slug' => 'fhd-monitors'],
                        ]
                    ],
                    [
                        'name' => 'By Specialty Type',
                        'slug' => 'monitor-types',
                        'children' => [
                            ['name' => 'High Refresh Gaming (144Hz - 360Hz)', 'slug' => 'gaming-monitors'],
                            ['name' => 'Curved Immersion Displays', 'slug' => 'curved-monitors'],
                            ['name' => 'Color Accurate Pro Art / Studio', 'slug' => 'studio-monitors'],
                            ['name' => 'Portable USB-C Monitors', 'slug' => 'portable-monitors'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Networking',
                'slug' => 'router',
                'icon' => 'Router',
                'sort_order' => 5,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '3_columns',
                'children' => [
                    [
                        'name' => 'Wireless Routers',
                        'slug' => 'wireless-routers',
                        'children' => [
                            ['name' => 'Wi-Fi 7 & Wi-Fi 6E Routers', 'slug' => 'wifi-7-routers'],
                            ['name' => 'Dual-Band Gigabit Routers', 'slug' => 'gigabit-routers'],
                            ['name' => 'Mesh Wi-Fi Whole Home Systems', 'slug' => 'mesh-wifi'],
                        ]
                    ],
                    [
                        'name' => 'Enterprise & Accessories',
                        'slug' => 'enterprise-networking',
                        'children' => [
                            ['name' => 'Network Switches (PoE / Gigabit)', 'slug' => 'network-switches'],
                            ['name' => 'Ceiling / Outdoor Access Points', 'slug' => 'access-points'],
                            ['name' => 'Cat6 / Cat7 Patch Cables & Tools', 'slug' => 'network-cables'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Smartphone',
                'slug' => 'smartphone',
                'icon' => 'Smartphone',
                'sort_order' => 6,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '3_columns',
                'children' => [
                    [
                        'name' => 'Flagship & Premium',
                        'slug' => 'flagship-phones',
                        'children' => [
                            ['name' => 'Apple iPhone', 'slug' => 'apple-iphone'],
                            ['name' => 'Samsung Galaxy S / Z', 'slug' => 'samsung-galaxy'],
                            ['name' => 'Google Pixel', 'slug' => 'google-pixel'],
                        ]
                    ],
                    [
                        'name' => 'Budget & Mid-Range',
                        'slug' => 'budget-phones',
                        'children' => [
                            ['name' => 'Xiaomi & Redmi', 'slug' => 'xiaomi-redmi'],
                            ['name' => 'Realme Series', 'slug' => 'realme-phones'],
                            ['name' => 'Vivo & Oppo', 'slug' => 'vivo-oppo'],
                        ]
                    ],
                    [
                        'name' => 'Mobile Gear & Audio',
                        'slug' => 'mobile-gear',
                        'children' => [
                            ['name' => 'TWS Wireless Earbuds', 'slug' => 'tws-earbuds'],
                            ['name' => 'Fast Chargers & Cables', 'slug' => 'phone-chargers'],
                            ['name' => 'Power Banks 20000mAh+', 'slug' => 'power-banks'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Television',
                'slug' => 'television',
                'icon' => 'Tv',
                'sort_order' => 7,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '2_columns',
                'children' => [
                    [
                        'name' => 'By Display Technology',
                        'slug' => 'tv-tech',
                        'children' => [
                            ['name' => '4K Google TV / Smart TV', 'slug' => '4k-smart-tv'],
                            ['name' => 'OLED & QLED TV', 'slug' => 'oled-qled-tv'],
                            ['name' => 'Mini LED Television', 'slug' => 'mini-led-tv'],
                        ]
                    ],
                    [
                        'name' => 'Top TV Brands',
                        'slug' => 'tv-brands',
                        'children' => [
                            ['name' => 'Sony Bravia 4K', 'slug' => 'sony-bravia-tv'],
                            ['name' => 'Samsung Crystal UHD', 'slug' => 'samsung-smart-tv'],
                            ['name' => 'Xiaomi Smart TV', 'slug' => 'xiaomi-tv'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Printer',
                'slug' => 'printer',
                'icon' => 'Printer',
                'sort_order' => 8,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '2_columns',
                'children' => [
                    [
                        'name' => 'Printer Types',
                        'slug' => 'printer-types',
                        'children' => [
                            ['name' => 'All-in-One Ink Tank', 'slug' => 'ink-tank-printers'],
                            ['name' => 'Monochrome & Color Laser', 'slug' => 'laser-printers'],
                            ['name' => 'POS & Barcode Printers', 'slug' => 'barcode-printers'],
                        ]
                    ],
                    [
                        'name' => 'Supplies & Cartridges',
                        'slug' => 'printer-supplies',
                        'children' => [
                            ['name' => 'Original Toner Cartridges', 'slug' => 'toner-cartridges'],
                            ['name' => 'Ink Bottles & Ribbons', 'slug' => 'printer-ink'],
                            ['name' => 'Photo & Glossy Paper', 'slug' => 'printing-paper'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Air Conditioner',
                'slug' => 'air-conditioner',
                'icon' => 'Wind',
                'sort_order' => 9,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'children' => [
                    [
                        'name' => 'Inverter AC Units',
                        'slug' => 'inverter-ac',
                        'children' => [
                            ['name' => '1.0 Ton Inverter AC', 'slug' => '1-ton-ac'],
                            ['name' => '1.5 Ton Inverter AC', 'slug' => '1-5-ton-ac'],
                            ['name' => '2.0 Ton Inverter AC', 'slug' => '2-ton-ac'],
                        ]
                    ],
                    [
                        'name' => 'Popular Brands',
                        'slug' => 'ac-brands',
                        'children' => [
                            ['name' => 'Gree Air Conditioners', 'slug' => 'gree-ac'],
                            ['name' => 'General Heavy Duty', 'slug' => 'general-ac'],
                            ['name' => 'Haier Dual Inverter', 'slug' => 'haier-ac'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Air Fryer',
                'slug' => 'air-fryer',
                'icon' => 'Box',
                'sort_order' => 10,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'children' => [
                    [
                        'name' => 'Kitchen Air Fryers',
                        'slug' => 'kitchen-air-fryers',
                        'children' => [
                            ['name' => 'Digital Touch Air Fryer 4L-6L', 'slug' => 'digital-air-fryer'],
                            ['name' => 'Dual Basket Multi-Fryer', 'slug' => 'dual-basket-air-fryer'],
                            ['name' => 'Air Fryer Baking Accessories', 'slug' => 'air-fryer-accessories'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Projector',
                'slug' => 'projector',
                'icon' => 'Camera',
                'sort_order' => 11,
                'is_featured' => true,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'children' => [
                    [
                        'name' => 'Home & Cinema',
                        'slug' => 'cinema-projectors',
                        'children' => [
                            ['name' => '4K Laser Home Cinema Projectors', 'slug' => '4k-projector'],
                            ['name' => 'Portable Smart LED Mini Projectors', 'slug' => 'mini-projectors'],
                            ['name' => 'Motorized Projection Screens', 'slug' => 'projector-screens'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'icon' => 'Headphones',
                'sort_order' => 12,
                'is_featured' => false,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'mega_menu_layout' => '3_columns',
                'children' => [
                    [
                        'name' => 'Input Devices',
                        'slug' => 'input-devices',
                        'children' => [
                            ['name' => 'Mechanical Keyboards (Custom / RGB)', 'slug' => 'mechanical-keyboards'],
                            ['name' => 'Ergonomic & Wireless Mice', 'slug' => 'wireless-mice'],
                            ['name' => 'Full Desk Extended Mousepads', 'slug' => 'desk-mats'],
                        ]
                    ],
                    [
                        'name' => 'Audio & Streaming',
                        'slug' => 'audio-streaming',
                        'children' => [
                            ['name' => 'Hi-Res Studio Headsets', 'slug' => 'studio-headsets'],
                            ['name' => 'USB Condenser Microphones', 'slug' => 'streaming-mics'],
                            ['name' => 'Full HD 1080p Webcams', 'slug' => 'streaming-webcams'],
                        ]
                    ],
                    [
                        'name' => 'Cables & Hubs',
                        'slug' => 'cables-hubs',
                        'children' => [
                            ['name' => 'USB-C Multiport Hubs & Docks', 'slug' => 'usb-c-docks'],
                            ['name' => 'HDMI 2.1 & DisplayPort Cables', 'slug' => 'display-cables'],
                            ['name' => 'Surge Protectors & Extensions', 'slug' => 'surge-protectors'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Gaming',
                'slug' => 'gaming',
                'icon' => 'Gamepad2',
                'sort_order' => 13,
                'is_featured' => false,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'children' => [
                    [
                        'name' => 'Esports Gear',
                        'slug' => 'esports-gear',
                        'children' => [
                            ['name' => 'Gaming Ergonomic Chairs', 'slug' => 'gaming-chairs'],
                            ['name' => 'Wireless Gamepads & Controllers', 'slug' => 'gamepads'],
                            ['name' => 'Racing Sim Wheels & Pedals', 'slug' => 'racing-wheels'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Software',
                'slug' => 'software',
                'icon' => 'Package',
                'sort_order' => 14,
                'is_featured' => false,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'children' => [
                    [
                        'name' => 'Operating Systems & Security',
                        'slug' => 'os-security',
                        'children' => [
                            ['name' => 'Windows 11 Pro Retail License', 'slug' => 'windows-11-pro'],
                            ['name' => 'Microsoft 365 Personal & Family', 'slug' => 'office-365'],
                            ['name' => 'Kaspersky & Bitdefender Antivirus', 'slug' => 'antivirus-security'],
                        ]
                    ],
                ]
            ],
            [
                'name' => 'Servers',
                'slug' => 'servers',
                'icon' => 'Server',
                'sort_order' => 15,
                'is_featured' => false,
                'mega_menu_enabled' => true,
                'mega_menu_type' => 'auto',
                'children' => [
                    [
                        'name' => 'Enterprise Server Solutions',
                        'slug' => 'enterprise-servers',
                        'children' => [
                            ['name' => '1U / 2U Rackmount Servers', 'slug' => 'rack-servers'],
                            ['name' => 'Server ECC DDR5 Registered RAM', 'slug' => 'ecc-ram'],
                            ['name' => 'Enterprise SAS / NVMe Storage', 'slug' => 'server-storage'],
                        ]
                    ],
                ]
            ],
        ];

        $categoryMap = [];
        $seedCategoryTree = function ($items, $parentId = null) use (&$seedCategoryTree, &$categoryMap) {
            foreach ($items as $c) {
                $cat = Category::updateOrCreate(['slug' => $c['slug']], [
                    'name' => $c['name'],
                    'icon' => $c['icon'] ?? 'Layers',
                    'parent_id' => $parentId,
                    'sort_order' => $c['sort_order'] ?? 1,
                    'is_featured' => $c['is_featured'] ?? false,
                    'is_nav_visible' => true,
                    'mega_menu_enabled' => $c['mega_menu_enabled'] ?? true,
                    'mega_menu_type' => $c['mega_menu_type'] ?? 'auto',
                    'mega_menu_layout' => $c['mega_menu_layout'] ?? 'auto',
                    'mega_menu_config' => $c['mega_menu_config'] ?? null,
                ]);
                $categoryMap[$c['slug']] = $cat;

                if (!empty($c['children'])) {
                    $seedCategoryTree($c['children'], $cat->id);
                }
            }
        };

        $seedCategoryTree($topCategories);

        // 4. Seed Brands with banners and descriptions
        $brandsData = [
            ['name' => 'Asus', 'slug' => 'asus', 'website_url' => 'https://www.asus.com', 'is_featured' => true, 'description' => 'ASUS is a multinational computer hardware and electronics company known for ROG gaming laptops, motherboards, and monitors.'],
            ['name' => 'Gigabyte', 'slug' => 'gigabyte', 'website_url' => 'https://www.gigabyte.com', 'is_featured' => true, 'description' => 'Gigabyte Technology is an industry-leading manufacturer of high-end AORUS graphics cards, gaming motherboards, and PC components.'],
            ['name' => 'MSI', 'slug' => 'msi', 'website_url' => 'https://www.msi.com', 'is_featured' => true, 'description' => 'Micro-Star International is a global leader in AI PCs, gaming laptops, and high-performance hardware.'],
            ['name' => 'Intel', 'slug' => 'intel', 'website_url' => 'https://www.intel.com', 'is_featured' => true, 'description' => 'Intel Core Ultra processors and high-performance computing chipsets for desktop and server platforms.'],
            ['name' => 'AMD', 'slug' => 'amd', 'website_url' => 'https://www.amd.com', 'is_featured' => true, 'description' => 'AMD Ryzen processors and Radeon RX graphics cards powering high-performance gaming and content creation.'],
            ['name' => 'Corsair', 'slug' => 'corsair', 'website_url' => 'https://www.corsair.com', 'is_featured' => true, 'description' => 'Corsair produces enthusiast DDR5 memory, modular power supplies, liquid cooling systems, and mechanical keyboards.'],
            ['name' => 'HP', 'slug' => 'hp', 'website_url' => 'https://www.hp.com', 'is_featured' => true, 'description' => 'HP Pavilion, OMEN gaming laptops, Smart Tank printers, and business office workstations in Bangladesh.'],
            ['name' => 'Lenovo', 'slug' => 'lenovo', 'website_url' => 'https://www.lenovo.com', 'is_featured' => true, 'description' => 'Lenovo Legion gaming and ThinkPad commercial laptops offering unmatched reliability and battery efficiency.'],
            ['name' => 'Samsung', 'slug' => 'samsung', 'website_url' => 'https://www.samsung.com', 'is_featured' => false, 'description' => 'Samsung Odyssey OLED monitors, 990 PRO NVMe SSDs, and cutting-edge memory technologies.'],
            ['name' => 'Acer', 'slug' => 'acer', 'website_url' => 'https://www.acer.com', 'is_featured' => false, 'description' => 'Acer Predator and Nitro gaming laptops delivering powerful specifications at competitive pricing.'],
            ['name' => 'Apple', 'slug' => 'apple', 'website_url' => 'https://www.apple.com', 'is_featured' => false, 'description' => 'Apple MacBook Pro, MacBook Air with Apple Silicon, and studio displays.'],
            ['name' => 'Logitech', 'slug' => 'logitech', 'website_url' => 'https://www.logitech.com', 'is_featured' => false, 'description' => 'Logitech G LIGHTSPEED gaming mice, mechanical keyboards, webcams, and simulators.'],
        ];

        $brandMap = [];
        foreach ($brandsData as $b) {
            $brandMap[$b['slug']] = Brand::updateOrCreate(['slug' => $b['slug']], [
                'name' => $b['name'],
                'website_url' => $b['website_url'],
                'is_featured' => $b['is_featured'],
                'is_active' => true,
                'description' => $b['description'],
                'banner' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop',
            ]);
        }

        // 5. Seed Banners (Hero Slider + Stacked Side Banners)
        Banner::updateOrCreate(['title' => 'GIGABYTE AERO X16 AI LAPTOP EXPO'], [
            'subtitle' => 'Ryzen AI 350 + RTX 5080 Next-Gen AI Creator Laptop.',
            'badge' => 'SPECIAL OFFER',
            'image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop',
            'placement' => 'hero_slider',
            'button_text' => 'Explore Deals',
            'button_url' => '/catalog',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Banner::updateOrCreate(['title' => 'ULTIMATE CUSTOM GAMING RIG BUILD'], [
            'subtitle' => 'Experience next-gen performance with RTX 40-Series and Ryzen 9000 Processors.',
            'badge' => 'NEW ARRIVAL',
            'image' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop',
            'placement' => 'hero_slider',
            'button_text' => 'Build Now',
            'button_url' => '/pc-builder',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        Banner::updateOrCreate(['title' => '4K OLED GAMING MONITORS & ACCESSORIES'], [
            'subtitle' => 'Stunning 240Hz OLED Display & Mechanical Keyboards at best prices.',
            'badge' => 'HOT DEAL',
            'image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop',
            'placement' => 'hero_slider',
            'button_text' => 'Shop Monitors',
            'button_url' => '/category/monitor',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        Banner::updateOrCreate(['placement' => 'side_banner_top'], [
            'title' => 'Next-Level Gaming Gear',
            'subtitle' => 'Ultra-performance laptops, RTX graphics cards, and pro peripherals.',
            'badge' => 'TOP DEALS',
            'image' => '/images/storefront/v3/side_banner_gaming_laptops.jpg',
            'placement' => 'side_banner_top',
            'button_text' => 'Shop Gaming Gear',
            'button_url' => '/category/laptop',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Banner::updateOrCreate(['placement' => 'side_banner_bottom'], [
            'title' => 'Revolutionize Your Security',
            'subtitle' => 'Advanced AI-powered 4K CCTV surveillance and smart home monitoring.',
            'badge' => 'CCTV & SECURITY',
            'image' => '/images/storefront/v3/side_banner_smart_cctv.jpg',
            'placement' => 'side_banner_bottom',
            'button_text' => 'Explore CCTV',
            'button_url' => '/cctv-estimator',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        // 6. Seed Quick Action Cards (4 Cards matching reference)
        $quickActions = [
            [
                'title' => 'PC Builder',
                'subtitle' => 'Configure your ideal PC',
                'icon' => 'Cpu',
                'url' => '/pc-builder',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Book a Service',
                'subtitle' => 'Repairs and home visits',
                'icon' => 'Wrench',
                'url' => '/servicing',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Complain Box',
                'subtitle' => 'Share concerns with us',
                'icon' => 'MessageSquare',
                'url' => '/page/complain-box',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Tools',
                'subtitle' => 'Calculators and utilities',
                'icon' => 'Sliders',
                'url' => '/emi-info',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($quickActions as $qa) {
            QuickAction::updateOrCreate(['title' => $qa['title']], $qa);
        }

        // 7. Seed Products with authentic hardware specs and pricing
        $productsData = [
            // Flash sale items
            [
                'title' => 'Logitech F310 USB Wired Gamepad',
                'slug' => 'logitech-f310-gamepad',
                'sku' => 'GP-F310',
                'category_id' => $categoryMap['accessories']->id,
                'brand_id' => $brandMap['logitech']->id,
                'price' => 1899,
                'regular_price' => 3050,
                'cost_price' => 1500,
                'stock' => 12,
                'is_featured' => true,
                'is_deal_of_day' => true,
                'image' => 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'MAXSUN MS-Challenger B650M WiFi ICE AMD Motherboard',
                'slug' => 'maxsun-b650m-wifi-ice',
                'sku' => 'MB-MAX-B650',
                'category_id' => $categoryMap['motherboard']->id,
                'brand_id' => $brandMap['amd']->id,
                'price' => 16400,
                'regular_price' => 18500,
                'cost_price' => 14000,
                'stock' => 8,
                'is_featured' => true,
                'is_deal_of_day' => true,
                'image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'HP Smart Tank 580 Color Ink Multifunction All-in-One Wi-Fi Printer',
                'slug' => 'hp-smart-tank-580-printer',
                'sku' => 'PRN-HP-580',
                'category_id' => $categoryMap['printer']->id,
                'brand_id' => $brandMap['hp']->id,
                'price' => 19500,
                'regular_price' => 24700,
                'cost_price' => 17000,
                'stock' => 5,
                'is_featured' => true,
                'is_deal_of_day' => true,
                'image' => 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&auto=format&fit=crop',
            ],
            // Featured Products
            [
                'title' => 'AMD Ryzen 9 9900X 12-Core 24-Thread AM5 Gaming Processor',
                'slug' => 'amd-ryzen-9-9900x',
                'sku' => 'CPU-9900X',
                'category_id' => $categoryMap['processor']->id,
                'brand_id' => $brandMap['amd']->id,
                'price' => 51400,
                'regular_price' => 57000,
                'cost_price' => 45000,
                'stock' => 10,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Asus Vivobook S 16 M5606UA Ryzen AI 7 3.2K 120Hz OLED Laptop',
                'slug' => 'asus-vivobook-s16-oled',
                'sku' => 'LAP-ASUS-S16',
                'category_id' => $categoryMap['laptop']->id,
                'brand_id' => $brandMap['asus']->id,
                'price' => 142000,
                'regular_price' => 157000,
                'cost_price' => 125000,
                'stock' => 6,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'GIGABYTE G24F 2 23.8 Inch 180Hz Full HD IPS Gaming Monitor',
                'slug' => 'gigabyte-g24f2-gaming-monitor',
                'sku' => 'MON-G24F2',
                'category_id' => $categoryMap['monitor']->id,
                'brand_id' => $brandMap['gigabyte']->id,
                'price' => 18200,
                'regular_price' => 20000,
                'cost_price' => 16000,
                'stock' => 15,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'MSI GeForce RTX 4070 VENTUS 3X OC 12GB GDDR6X Graphics Card',
                'slug' => 'msi-rtx-4070-ventus-3x',
                'sku' => 'GPU-4070V3X',
                'category_id' => $categoryMap['graphics-card']->id,
                'brand_id' => $brandMap['msi']->id,
                'price' => 80000,
                'regular_price' => 85000,
                'cost_price' => 72000,
                'stock' => 7,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Gigabyte AORUS C500 GLASS Mid Tower Gaming Desktop Case',
                'slug' => 'gigabyte-aorus-c500-glass',
                'sku' => 'CAS-AORUS-C500',
                'category_id' => $categoryMap['desktop']->id,
                'brand_id' => $brandMap['gigabyte']->id,
                'price' => 345000,
                'regular_price' => 365000,
                'cost_price' => 310000,
                'stock' => 4,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz RAM',
                'slug' => 'corsair-vengeance-rgb-32gb-ddr5',
                'sku' => 'RAM-COR-32RGB',
                'category_id' => $categoryMap['ram']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 14500,
                'regular_price' => 16000,
                'cost_price' => 12500,
                'stock' => 20,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&auto=format&fit=crop',
            ],
            // Latest Products
            [
                'title' => '8BitDo Ultimate C 2.4G Wireless Gaming Controller',
                'slug' => '8bitdo-ultimate-c-controller',
                'sku' => 'GP-8BD-C',
                'category_id' => $categoryMap['gaming']->id,
                'brand_id' => $brandMap['logitech']->id,
                'price' => 11400,
                'regular_price' => 11900,
                'cost_price' => 9500,
                'stock' => 10,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'ASUS NUC 13 Pro Core i5 13th Gen Barebone Mini PC',
                'slug' => 'asus-nuc-13-pro-mini-pc',
                'sku' => 'PC-ASUS-NUC13',
                'category_id' => $categoryMap['desktop']->id,
                'brand_id' => $brandMap['asus']->id,
                'price' => 60990,
                'regular_price' => 65000,
                'cost_price' => 54000,
                'stock' => 5,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'JBL PartyBox 710 800W Bluetooth High Power Party Speaker',
                'slug' => 'jbl-partybox-710-speaker',
                'sku' => 'SPK-JBL-710',
                'category_id' => $categoryMap['accessories']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 98500,
                'regular_price' => 118000,
                'cost_price' => 85000,
                'stock' => 3,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'ARZOPA Z1FC 16.1 Inch 144Hz FHD IPS Portable Gaming Monitor',
                'slug' => 'arzopa-z1fc-portable-monitor',
                'sku' => 'MON-ARZ-Z1FC',
                'category_id' => $categoryMap['monitor']->id,
                'brand_id' => $brandMap['asus']->id,
                'price' => 17500,
                'regular_price' => 19000,
                'cost_price' => 14500,
                'stock' => 12,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'KOSPET TANK T3 ULTRA 1.43 Inch AMOLED GPS Calling Smartwatch',
                'slug' => 'kospet-tank-t3-ultra-smartwatch',
                'sku' => 'WAT-KOS-T3U',
                'category_id' => $categoryMap['smartphone']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 6790,
                'regular_price' => 7490,
                'cost_price' => 5500,
                'stock' => 18,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Philips 5000 Series 7.2L Digital Airfryer (HD9285/90, WiFi App)',
                'slug' => 'philips-5000-airfryer-7-2l',
                'sku' => 'APP-PHI-5000',
                'category_id' => $categoryMap['air-fryer']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 19500,
                'regular_price' => 25600,
                'cost_price' => 16500,
                'stock' => 6,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&auto=format&fit=crop',
            ],
            // Best Sellers
            [
                'title' => 'Gree GS-18XCO410 1.5 TON Split Eco-Inverter Non-Draw Air Conditioner',
                'slug' => 'gree-1-5-ton-inverter-ac',
                'sku' => 'AC-GREE-15X',
                'category_id' => $categoryMap['air-conditioner']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 65500,
                'regular_price' => 75800,
                'cost_price' => 58000,
                'stock' => 4,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Ezviz H3 3MP Indoor Pan/Tilt 2K Smart AI Home Security Camera',
                'slug' => 'ezviz-h3-3mp-security-camera',
                'sku' => 'CAM-EZV-H3',
                'category_id' => $categoryMap['projector']->id,
                'brand_id' => $brandMap['logitech']->id,
                'price' => 2975,
                'regular_price' => 3750,
                'cost_price' => 2300,
                'stock' => 25,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Haier Gravity 1.5 Ton All Inverter Smart Dual Air Conditioner',
                'slug' => 'haier-gravity-1-5-ton-ac',
                'sku' => 'AC-HAI-15G',
                'category_id' => $categoryMap['air-conditioner']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 73500,
                'regular_price' => 79800,
                'cost_price' => 64000,
                'stock' => 5,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'MARSRIVA KP3 10000mAh Smart Mini DC UPS for Wi-Fi Router & ONU',
                'slug' => 'marsriva-kp3-smart-dc-ups',
                'sku' => 'PWR-MAR-KP3',
                'category_id' => $categoryMap['router']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 2150,
                'regular_price' => 2750,
                'cost_price' => 1600,
                'stock' => 30,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'HAIER H43P751UG 43 Inch 4K UHD Bezel-Less Google Smart TV',
                'slug' => 'haier-43-inch-4k-google-tv',
                'sku' => 'TV-HAI-43P7',
                'category_id' => $categoryMap['television']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 43000,
                'regular_price' => 49900,
                'cost_price' => 37000,
                'stock' => 8,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Thermaltake Toughpower GF3 1200W 80 Plus Gold ATX 3.0 Modular PSU',
                'slug' => 'thermaltake-gf3-1200w-psu',
                'sku' => 'PSU-TT-1200',
                'category_id' => $categoryMap['power-supply']->id ?? $categoryMap['ssd']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 31000,
                'regular_price' => 35000,
                'cost_price' => 26000,
                'stock' => 7,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop',
            ],
            // Additional PC Builder Processors
            [
                'title' => 'AMD Ryzen 7 PRO 5750G 3.8GHz 8-Core 16-Thread AM4 Processor',
                'slug' => 'amd-ryzen-7-pro-5750g',
                'sku' => 'CPU-5750G',
                'category_id' => $categoryMap['processor']->id,
                'brand_id' => $brandMap['amd']->id,
                'price' => 22500,
                'regular_price' => 23500,
                'cost_price' => 19000,
                'stock' => 14,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Intel Core i5-10500 10th Gen 6-Cores 12-Threads LGA1200 Processor',
                'slug' => 'intel-core-i5-10500',
                'sku' => 'CPU-I5-10500',
                'category_id' => $categoryMap['processor']->id,
                'brand_id' => $brandMap['intel']->id,
                'price' => 13900,
                'regular_price' => 15200,
                'cost_price' => 11500,
                'stock' => 8,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Intel Core Ultra 7 270K Plus 24-Core 24-Thread LGA1851 Processor',
                'slug' => 'intel-core-ultra-7-270k',
                'sku' => 'CPU-U7-270K',
                'category_id' => $categoryMap['processor']->id,
                'brand_id' => $brandMap['intel']->id,
                'price' => 42000,
                'regular_price' => 47500,
                'cost_price' => 36000,
                'stock' => 6,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop',
            ],
            // Motherboards
            [
                'title' => 'ASUS PRIME Z790-P DDR5 LGA1700 ATX Motherboard',
                'slug' => 'asus-prime-z790-p-ddr5',
                'sku' => 'MB-ASUS-Z790P',
                'category_id' => $categoryMap['motherboard']->id,
                'brand_id' => $brandMap['asus']->id,
                'price' => 24500,
                'regular_price' => 26800,
                'cost_price' => 21000,
                'stock' => 10,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Gigabyte B760M DS3H DDR4 LGA1700 Micro-ATX Motherboard',
                'slug' => 'gigabyte-b760m-ds3h-ddr4',
                'sku' => 'MB-GIGA-B760M',
                'category_id' => $categoryMap['motherboard']->id,
                'brand_id' => $brandMap['gigabyte']->id,
                'price' => 14200,
                'regular_price' => 15500,
                'cost_price' => 12000,
                'stock' => 12,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop',
            ],
            // RAM
            [
                'title' => 'Kingston FURY Beast 16GB (1x16GB) DDR4 3200MHz Desktop RAM',
                'slug' => 'kingston-fury-beast-16gb-ddr4',
                'sku' => 'RAM-KNG-16D4',
                'category_id' => $categoryMap['ram']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 4500,
                'regular_price' => 5200,
                'cost_price' => 3800,
                'stock' => 25,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&auto=format&fit=crop',
            ],
            // Storage
            [
                'title' => 'Samsung 990 PRO 1TB PCIe 4.0 M.2 NVMe Internal SSD',
                'slug' => 'samsung-990-pro-1tb-ssd',
                'sku' => 'SSD-SAM-990P-1T',
                'category_id' => $categoryMap['ssd']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 15800,
                'regular_price' => 17500,
                'cost_price' => 13500,
                'stock' => 15,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop',
            ],
            [
                'title' => 'Western Digital WD Blue 2TB 3.5 Inch SATA 7200RPM Desktop HDD',
                'slug' => 'wd-blue-2tb-sata-hdd',
                'sku' => 'HDD-WD-2TB',
                'category_id' => $categoryMap['ssd']->id,
                'brand_id' => $brandMap['samsung']->id,
                'price' => 6900,
                'regular_price' => 7500,
                'cost_price' => 5800,
                'stock' => 18,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop',
            ],
            // Power Supply
            [
                'title' => 'Corsair RM750e 750W 80 Plus Gold Fully Modular ATX Power Supply',
                'slug' => 'corsair-rm750e-750w-gold-psu',
                'sku' => 'PSU-COR-RM750E',
                'category_id' => $categoryMap['power-supply']->id ?? $categoryMap['ssd']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 12800,
                'regular_price' => 14000,
                'cost_price' => 10500,
                'stock' => 10,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop',
            ],
            // CPU Cooler
            [
                'title' => 'DeepCool AK620 High-Performance Dual-Tower CPU Air Cooler',
                'slug' => 'deepcool-ak620-cpu-cooler',
                'sku' => 'CLR-DC-AK620',
                'category_id' => $categoryMap['cpu-cooler']->id ?? $categoryMap['ssd']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 6400,
                'regular_price' => 7200,
                'cost_price' => 5200,
                'stock' => 11,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop',
            ],
            // Casing
            [
                'title' => 'Antec NX410 Mid Tower ARGB High-Airflow Black Gaming Case',
                'slug' => 'antec-nx410-gaming-case',
                'sku' => 'CAS-ANT-NX410',
                'category_id' => $categoryMap['casing']->id ?? $categoryMap['desktop']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 5200,
                'regular_price' => 5800,
                'cost_price' => 4200,
                'stock' => 14,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop',
            ],
            // Case Fan
            [
                'title' => 'Corsair iCUE SP120 RGB Elite 120mm Triple Fan Pack with Controller',
                'slug' => 'corsair-sp120-rgb-triple-fan',
                'sku' => 'FAN-COR-SP120-3PK',
                'category_id' => $categoryMap['casing-fans']->id ?? $categoryMap['power-cooling']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 6800,
                'regular_price' => 7500,
                'cost_price' => 5500,
                'stock' => 9,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop',
            ],
            // UPS
            [
                'title' => 'MaxGreen 1200VA Offline Desktop UPS with LED Display',
                'slug' => 'maxgreen-1200va-offline-ups',
                'sku' => 'UPS-MG-1200VA',
                'category_id' => $categoryMap['ups']->id ?? $categoryMap['power-supply']->id ?? $categoryMap['ssd']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 7500,
                'regular_price' => 8400,
                'cost_price' => 6100,
                'stock' => 12,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop',
            ],
            // Software
            [
                'title' => 'Microsoft Windows 11 Pro 64-Bit Lifetime Retail License DVD/USB',
                'slug' => 'microsoft-windows-11-pro-license',
                'sku' => 'SFT-MS-WIN11PRO',
                'category_id' => $categoryMap['software']->id ?? $categoryMap['accessories']->id,
                'brand_id' => $brandMap['intel']->id,
                'price' => 16500,
                'regular_price' => 18000,
                'cost_price' => 14000,
                'stock' => 20,
                'is_featured' => false,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop',
            ],
            // Mouse
            [
                'title' => 'Logitech G502 HERO High Performance 25600 DPI Gaming Mouse',
                'slug' => 'logitech-g502-hero-gaming-mouse',
                'sku' => 'MOU-LOG-G502',
                'category_id' => $categoryMap['accessories']->id,
                'brand_id' => $brandMap['logitech']->id,
                'price' => 5200,
                'regular_price' => 6000,
                'cost_price' => 4100,
                'stock' => 20,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop',
            ],
            // Keyboard
            [
                'title' => 'Keychron V1 QMK Custom 75% Mechanical Gaming Keyboard (Hot-Swap)',
                'slug' => 'keychron-v1-custom-mechanical-keyboard',
                'sku' => 'KBD-KEY-V1',
                'category_id' => $categoryMap['accessories']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 9500,
                'regular_price' => 10800,
                'cost_price' => 7800,
                'stock' => 8,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop',
            ],
            // Headphone
            [
                'title' => 'HyperX Cloud II Pro Gaming Headset with 7.1 Virtual Surround Sound',
                'slug' => 'hyperx-cloud-ii-gaming-headset',
                'sku' => 'AUD-HPX-CLOUD2',
                'category_id' => $categoryMap['accessories']->id,
                'brand_id' => $brandMap['corsair']->id,
                'price' => 8900,
                'regular_price' => 10200,
                'cost_price' => 7200,
                'stock' => 10,
                'is_featured' => true,
                'is_deal_of_day' => false,
                'image' => 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop',
            ],
        ];

        $createdProducts = [];
        foreach ($productsData as $p) {
            $createdProducts[$p['slug']] = Product::updateOrCreate(['sku' => $p['sku']], $p);
        }

        // 8. Seed Flash Sale Campaign & Items
        $flashSale = FlashSale::firstOrCreate([
            'title' => 'August Tech Fest 2026',
        ], [
            'start_time' => now()->subDay(),
            'end_time' => now()->addDays(14)->addHours(15)->addMinutes(33),
            'is_active' => true,
        ]);

        if (isset($createdProducts['logitech-f310-gamepad'])) {
            FlashSaleItem::firstOrCreate([
                'flash_sale_id' => $flashSale->id,
                'product_id' => $createdProducts['logitech-f310-gamepad']->id,
            ], [
                'flash_price' => 1899,
                'quantity_limit' => 20,
                'sold_quantity' => 8,
            ]);
        }

        if (isset($createdProducts['maxsun-b650m-wifi-ice'])) {
            FlashSaleItem::firstOrCreate([
                'flash_sale_id' => $flashSale->id,
                'product_id' => $createdProducts['maxsun-b650m-wifi-ice']->id,
            ], [
                'flash_price' => 16400,
                'quantity_limit' => 10,
                'sold_quantity' => 3,
            ]);
        }

        if (isset($createdProducts['hp-smart-tank-580-printer'])) {
            FlashSaleItem::firstOrCreate([
                'flash_sale_id' => $flashSale->id,
                'product_id' => $createdProducts['hp-smart-tank-580-printer']->id,
            ], [
                'flash_price' => 19500,
                'quantity_limit' => 15,
                'sold_quantity' => 6,
            ]);
        }

        // 9. Seed Standard Homepage Sections Configuration
        $sections = [
            ['section_key' => 'hero_section', 'title' => 'Hero Banner & Promos', 'subtitle' => null, 'sort_order' => 1, 'is_enabled' => true],
            ['section_key' => 'quick_actions', 'title' => 'Quick Action Cards', 'subtitle' => null, 'sort_order' => 2, 'is_enabled' => true],
            ['section_key' => 'featured_categories', 'title' => 'Featured Categories', 'subtitle' => 'Explore our wide range of tech products', 'sort_order' => 3, 'is_enabled' => true],
            ['section_key' => 'flash_sale', 'title' => 'Flash Sale', 'subtitle' => 'Limited time deals', 'sort_order' => 4, 'is_enabled' => true],
            ['section_key' => 'featured_products', 'title' => 'Featured Products', 'subtitle' => 'Discover our handpicked selection of premium tech products', 'sort_order' => 5, 'is_enabled' => true],
            ['section_key' => 'latest_products', 'title' => 'Latest Products', 'subtitle' => 'Check out our newest arrivals', 'sort_order' => 6, 'is_enabled' => true],
            ['section_key' => 'best_sellers', 'title' => 'Best Sellers', 'subtitle' => 'Top-rated products loved by our customers', 'sort_order' => 7, 'is_enabled' => true],
            ['section_key' => 'seo_content', 'title' => 'TechMarket BD - Trusted Retail Computer Shop in Bangladesh', 'subtitle' => null, 'sort_order' => 8, 'is_enabled' => true],
        ];

        foreach ($sections as $sec) {
            HomepageSection::updateOrCreate(['section_key' => $sec['section_key']], $sec);
        }

        // 10. Seed Shipping Rates
        ShippingRate::firstOrCreate(['zone_name' => 'Dhaka City'], [
            'district' => 'Dhaka',
            'rate' => 60.00,
            'estimated_days' => '24-48 Hours',
            'is_active' => true,
        ]);
        ShippingRate::firstOrCreate(['zone_name' => 'Outside Dhaka (All BD)'], [
            'district' => null,
            'rate' => 120.00,
            'estimated_days' => '48-72 Hours',
            'is_active' => true,
        ]);

        // 11. Seed Payment Methods
        PaymentMethod::firstOrCreate(['code' => 'COD'], ['title' => 'Cash on Delivery', 'instructions' => 'Pay cash upon receiving products at your doorstep.', 'is_active' => true, 'sort_order' => 1]);
        PaymentMethod::firstOrCreate(['code' => 'bKash'], ['title' => 'bKash Merchant Payment', 'instructions' => 'Send payment to bKash Merchant 01324294323.', 'is_active' => true, 'sort_order' => 2]);
        PaymentMethod::firstOrCreate(['code' => 'Nagad'], ['title' => 'Nagad Payment', 'instructions' => 'Send payment to Nagad Merchant 01324294323.', 'is_active' => true, 'sort_order' => 3]);

        // 12. Seed CMS Pages
        $cmsPages = [
            ['slug' => 'about-us', 'title' => 'About Us', 'content' => 'TechMarket BD is Bangladesh’s premier retail destination for original laptops, GPUs, desktop components, and office IT solutions.'],
            ['slug' => 'privacy-policy', 'title' => 'Privacy Policy', 'content' => 'We value customer privacy and security. Your personal information is encrypted and protected.'],
            ['slug' => 'warranty-policy', 'title' => 'Warranty Policy', 'content' => 'Official manufacturer warranty applies to all eligible hardware. Visit our service centers for RMA.'],
            ['slug' => 'payment-terms', 'title' => 'Payment Terms', 'content' => 'We accept Cash on Delivery, SSLCommerz card payments, and bKash / Nagad mobile banking.'],
            ['slug' => 'delivery-policy', 'title' => 'Delivery Policy', 'content' => 'Inside Dhaka 24-48 hours delivery via Pathao & Steadfast. Outside Dhaka 48-72 hours.'],
            ['slug' => 'terms-and-conditions', 'title' => 'Terms & Conditions', 'content' => 'Standard retail ecommerce terms for hardware purchases, orders, and warranty claims in Bangladesh.'],
            ['slug' => 'refund-and-return-policy', 'title' => 'Refund and Return Policy', 'content' => '7-day replacement policy for verified manufacturing defects with original packaging.'],
            ['slug' => 'book-a-service', 'title' => 'Book a Service', 'content' => 'Professional computer repair, cleaning, component upgrading, and home visit diagnostic services.'],
            ['slug' => 'complain-box', 'title' => 'Complain Box', 'content' => 'Direct executive escalation for feedback, delivery delays, or warranty resolution.'],
            ['slug' => 'tools', 'title' => 'Tools & Utilities', 'content' => 'PC PSU Wattage Calculator, FPS Estimator, and Component Compatibility Advisor.'],
            ['slug' => 'corporate-sales', 'title' => 'Corporate Sales', 'content' => 'Custom quotations, B2B procurement, tax invoices, and bulk IT hardware discounts.'],
            ['slug' => 'service-centers', 'title' => 'Service Centers', 'content' => 'Dhaka Multiplan Center, IDB Bhaban, Chittagong GEC, and Sylhet Zindabazar branches.'],
            ['slug' => 'emi-information', 'title' => 'EMI Information', 'content' => 'Up to 36 months zero-cost EMI on 28+ leading Bangladeshi commercial credit cards.'],
        ];

        foreach ($cmsPages as $cp) {
            CmsPage::updateOrCreate(['slug' => $cp['slug']], [
                'title' => $cp['title'],
                'content' => $cp['content'],
                'is_published' => true,
            ]);
        }

        // 13. Seed Blog Posts
        $blogPosts = [
            [
                'title' => 'NVIDIA RTX 5090 Official Pricing & Availability in Bangladesh',
                'slug' => 'nvidia-rtx-5090-launch-bangladesh',
                'category' => 'GPU & Gaming',
                'excerpt' => 'NVIDIA has officially unveiled the RTX 5090 graphics card with GDDR7 memory. TechMarket BD is bringing authentic GPU stock with 3 years warranty.',
                'content' => "NVIDIA has officially announced its next-generation Blackwell architecture flagship, the GeForce RTX 5090.\n\nFeaturing 32GB of ultra-fast GDDR7 memory running on a 512-bit bus, the RTX 5090 delivers unprecedented performance for 4K and 8K ray-traced gaming, generative AI workflows, and Unreal Engine 5 content development.\n\nTechMarket BD will offer official distributor-warrantied models from ASUS ROG, MSI Suprim, and Gigabyte AORUS across all retail outlets in Bangladesh.",
                'image' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop',
                'read_time' => '4 min read',
                'is_published' => true,
                'is_featured' => true,
            ],
            [
                'title' => 'Complete Guide to Building a Budget Gaming PC in 2026 (Under 70K BDT)',
                'slug' => 'budget-gaming-pc-build-guide-2026',
                'category' => 'PC Building Tips',
                'excerpt' => 'Step-by-step part selection for maximum 1080p FPS in Valorant, CS2, and Cyberpunk without breaking your budget.',
                'content' => "Building a gaming desktop in Bangladesh under a 70,000 BDT budget requires balanced component selection.\n\nWe recommend pairing the AMD Ryzen 5 5600 with an RX 6600 8GB GPU, 16GB DDR4 3200MHz RAM, a 512GB NVMe SSD, and a reliable 550W 80-Plus Bronze power supply.\n\nThis configuration ensures smooth 120+ FPS in modern esports titles and rock-solid 60 FPS in AAA titles at 1080p high settings.",
                'image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop',
                'read_time' => '6 min read',
                'is_published' => true,
                'is_featured' => true,
            ],
            [
                'title' => 'Top 5 AI Laptops with Dedicated NPU for Programmers and Students',
                'slug' => 'top-5-ai-laptops-with-npu-bangladesh',
                'category' => 'Laptop Reviews',
                'excerpt' => 'Explore the best Copilot+ PCs powered by Snapdragon X Elite, AMD Ryzen AI 300, and Intel Core Ultra processors.',
                'content' => "Modern laptops now feature dedicated Neural Processing Units (NPUs) delivering over 45 TOPS of on-device AI performance.\n\nFrom instant code completion in VS Code to live background blur and AI audio denoising, these laptops offer unmatched battery life exceeding 16 hours of real-world productivity.",
                'image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop',
                'read_time' => '5 min read',
                'is_published' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($blogPosts as $bp) {
            BlogPost::updateOrCreate(['slug' => $bp['slug']], [
                ...$bp,
                'author_id' => $admin->id,
            ]);
        }

        // 14. Seed EMI Partner Banks
        $emiBanks = [
            ['bank_name' => 'City Bank (Amex)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '18', '24', '36'], 'interest_rate_note' => '0% Interest up to 12 months (City Bank Amex)', 'sort_order' => 1],
            ['bank_name' => 'BRAC Bank', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '24'], 'interest_rate_note' => '0% Interest on selected credit cards', 'sort_order' => 2],
            ['bank_name' => 'Eastern Bank (EBL)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '24'], 'interest_rate_note' => '0% Interest facility available (EBL ZIP)', 'sort_order' => 3],
            ['bank_name' => 'Standard Chartered Bank', 'min_amount' => 10000, 'available_tenures' => ['3', '6', '9', '12'], 'interest_rate_note' => 'SCB EasyPay 0% facility', 'sort_order' => 4],
            ['bank_name' => 'Dutch-Bangla Bank (DBBL)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '24'], 'interest_rate_note' => 'DBBL InstaPay 0% facility', 'sort_order' => 5],
            ['bank_name' => 'Mutual Trust Bank (MTB)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12'], 'interest_rate_note' => 'MTB FlexiPay facility available', 'sort_order' => 6],
        ];

        foreach ($emiBanks as $eb) {
            EmiPartner::updateOrCreate(['bank_name' => $eb['bank_name']], [
                ...$eb,
                'is_active' => true,
            ]);
        }

        // 15. Seed Sample Service Request
        ServiceRequest::firstOrCreate(['tracking_code' => 'SR-2026-DEMO01'], [
            'customer_name' => 'Tanvir Hossain',
            'customer_phone' => '01719876543',
            'customer_email' => 'tanvir@gmail.com',
            'device_type' => 'Laptop',
            'brand_name' => 'ASUS ROG Strix G16',
            'issue_description' => 'Overheating and thermal throttling during gaming, fan noise.',
            'service_branch' => 'Dhaka Multiplan Center',
            'status' => 'pending',
            'user_id' => $customer->id,
        ]);

        // 16. Seed Store Settings
        $settings = [
            'site_name' => 'TechMarket BD',
            'tagline' => 'Trusted Retail Computer & Electronics Store in Bangladesh',
            'hotline' => '(+88) 09613562601',
            'support_email' => 'info@techmarketbd.com',
            'showroom_dhaka' => 'Multiplan Center, Level-6, Shop 608-610, Elephant Road, Dhaka-1205',
            'trade_license' => 'TRAD/DNCC/012938/2024',
            'bin_number' => '004928174-0101',
            'tin_number' => '847291048291',
            'shipping_dhaka' => '60',
            'shipping_outside' => '120',
            'facebook_url' => 'https://facebook.com',
            'youtube_url' => 'https://youtube.com',
            'instagram_url' => 'https://instagram.com',
            'twitter_url' => 'https://twitter.com',
            'linkedin_url' => 'https://linkedin.com',
            'whatsapp_number' => '+8801711223344',
            'copyright_text' => 'Copyright © 2026, Tech Market BD. All Rights Reserved.',
        ];

        foreach ($settings as $key => $val) {
            Setting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 17. Seed Phase 19 Offers & Campaigns (Matching Reference Screenshots)
        $allProds = Product::all();
        $laptopProds = Product::whereHas('category', function ($q) {
            $q->where('slug', 'like', '%laptop%');
        })->get();
        if ($laptopProds->isEmpty()) $laptopProds = $allProds->take(6);

        $offersData = [
            [
                'title' => 'laptop spider-man',
                'slug' => 'laptop-spider-man',
                'short_description' => 'Couple Movie Ticket on Us With Every Laptop Purchase!',
                'description' => "TechMarket থেকে আপনার পছন্দের Laptop কিনুন, Best Price & Special Discount-এর সাথে পান Spider-Man: Brand New Day-এর Couple Movie Ticket একদম ফ্রি!\n\nদেশসেরা মূল্যে জেনুইন অফিসিয়াল ওয়ারেন্টিযুক্ত ল্যাপটপ কিনুন টেকমার্কেট বিডি থেকে।",
                'banner_image' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop',
                'badge_text' => 'LIMITED TIME LAPTOP OFFER',
                'headline' => 'LAPTOP কিনলেই SPIDER-MAN MOVIE TICKET FREE!',
                'offer_validity_text' => '13 Aug 2026 – 21 Aug 2026',
                'cta_button_text' => 'BUY LAPTOP NOW →',
                'terms_and_conditions' => '* শর্ত প্রযোজ্য। স্টক থাকা সাপেক্ষে অফারটি প্রযোজ্য।',
                'start_at' => now()->subDays(4),
                'end_at' => now()->addDays(5),
                'status' => 'active',
                'is_active' => true,
                'is_featured' => true,
                'display_order' => 1,
                'perks' => [
                    ['title' => 'Best Price', 'desc' => 'Laptop কিনুন সেরা দামে'],
                    ['title' => 'Special Discount', 'desc' => 'নির্বাচিত Laptop-এ থাকছে বিশেষ ছাড়'],
                    ['title' => 'Movie Ticket Free', 'desc' => 'Spider-Man Movie-এর Couple Ticket'],
                ],
                'features' => [
                    ['title' => 'Wide Range of Laptops', 'desc' => 'বিভিন্ন Brand ও Model থেকে আপনার প্রয়োজন অনুযায়ী Laptop বেছে নিন।'],
                    ['title' => 'Best Price & Discount', 'desc' => 'Competitive Price-এর পাশাপাশি উপভোগ করুন Exciting Discounts!'],
                    ['title' => 'Spider-Man Movie Ticket', 'desc' => 'Laptop কেনার সাথে উপহার পান Spider-Man: Brand New Day-এর Couple Movie Ticket!'],
                ],
            ],
            [
                'title' => 'Flash Sale',
                'slug' => 'flash-sale',
                'short_description' => 'Huge discounts on high performance gaming PCs and components.',
                'description' => 'Unleash extreme power with heavy price drops on processors, graphics cards, gaming monitors, and NVMe SSDs.',
                'banner_image' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
                'badge_text' => 'MEGA FLASH SALE',
                'headline' => 'FLASH SALE — UP TO 40% OFF ON GAMING GEAR',
                'offer_validity_text' => 'Ongoing Limited Stock Sale',
                'cta_button_text' => 'EXPLORE DEALS →',
                'start_at' => null,
                'end_at' => null,
                'status' => 'active',
                'is_active' => true,
                'is_featured' => true,
                'display_order' => 2,
            ],
            [
                'title' => 'TechMarket Mega TV Deal',
                'slug' => 'techmarket-mega-tv-deal',
                'short_description' => '২৫% পর্যন্ত মূল্য ছাড় + ফ্রি ডেলিভারি + ফ্রি ইন্সটলেশন',
                'description' => 'স্মার্ট 4K QLED ও OLED টিভি কিনুন বিশেষ মূল্যে এবং উপভোগ করুন সারা বাংলাদেশে ফ্রি হোম ডেলিভারি।',
                'banner_image' => 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop',
                'badge_text' => 'MEGA TV FESTIVAL 2026',
                'headline' => 'টিভি অফার — ২৫% পর্যন্ত মূল্য ছাড় ও ফ্রি ইনস্টলেশন',
                'offer_validity_text' => '9 Aug – 31 Aug 2026',
                'cta_button_text' => 'SHOP SMART TVS →',
                'start_at' => now()->subDays(8),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'title' => 'Air Fryer Offer',
                'slug' => 'air-fryer-offer',
                'short_description' => 'স্বাস্থ্যকর রান্নার স্মার্ট পছন্দ! এয়ার ফ্রায়ার কিনলেই ফ্রি ডেলিভারি।',
                'description' => 'তেল ছাড়া সুস্বাদু ও স্বাস্থ্যকর খাবার তৈরিতে প্রিমিয়াম এয়ার ফ্রায়ারে পান আকর্ষণীয় ডিসকাউন্ট।',
                'banner_image' => 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop',
                'badge_text' => 'KITCHEN APPLIANCE SALE',
                'headline' => 'এয়ার ফ্রায়ার কিনলেই ফ্রি ডেলিভারি ও বিশেষ উপহার',
                'offer_validity_text' => '7 Aug – 31 Aug 2026',
                'cta_button_text' => 'BUY AIR FRYER →',
                'start_at' => now()->subDays(10),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 4,
            ],
            [
                'title' => 'ARZOPA Monitor Fest',
                'slug' => 'arzopa-monitor-fest',
                'short_description' => 'মনিটর কিনলেই থাকছে ফ্রি টি-শার্ট ও ইনস্ট্যান্ট ডিসকাউন্ট!',
                'description' => 'পোর্টেবল ও গেমিং মনিটরে বিশেষ রিওয়ার্ড ও ফ্রি টি-শার্ট উপহার।',
                'banner_image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop',
                'badge_text' => 'MONITOR EXTRAVAGANZA',
                'headline' => 'ARZOPA মনিটর কিনলেই সাথে আকর্ষণীয় টি-শার্ট ফ্রি!',
                'offer_validity_text' => '10 Aug – 31 Aug 2026',
                'cta_button_text' => 'VIEW MONITORS →',
                'start_at' => now()->subDays(7),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 5,
            ],
            [
                'title' => 'Logitech UPGRADE YOUR WORKSPACE with MX',
                'slug' => 'logitech-upgrade-workspace-mx',
                'short_description' => 'Get exclusive rewards on Logitech MX Master & Mechanical gear.',
                'description' => 'Boost your daily productivity with master series keyboards, mice, and webcams.',
                'banner_image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop',
                'badge_text' => 'OFFICIAL LOGITECH REWARD',
                'headline' => 'UPGRADE YOUR WORKSPACE WITH LOGITECH MX',
                'offer_validity_text' => '15 Aug – 31 Aug 2026',
                'cta_button_text' => 'SHOP LOGITECH MX →',
                'start_at' => now()->subDays(2),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 6,
            ],
            [
                'title' => 'TechMarket PC Build Bonanza',
                'slug' => 'techmarket-pc-build-bonanza',
                'short_description' => 'মাদারবোর্ড কিনলেই ফ্রি গিফট + গেমিং হেডসেট!',
                'description' => 'কাস্টম পিসি তৈরিতে মাদারবোর্ড, প্রসেসর ও গ্রাফিক্স কার্ডের সাথে পান নিশ্চিত উপহার।',
                'banner_image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop',
                'badge_text' => 'CUSTOM PC BUILDER DEAL',
                'headline' => 'মাদারবোর্ড অফার — কিনলেই থাকছে আকর্ষণীয় ফ্রি গিফট',
                'offer_validity_text' => '10 Aug – 31 Aug 2026',
                'cta_button_text' => 'BUILD PC NOW →',
                'start_at' => now()->subDays(7),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 7,
            ],
            [
                'title' => 'AC Offer',
                'slug' => 'ac-offer',
                'short_description' => 'আপনার প্রতিদিন হোক ফ্রেশ আর কুল! এসি কিনলেই থাকছে ৩৫,০০০৳ পর্যন্ত মূল্য ছাড় ও ফ্রি ডেলিভারি।',
                'description' => 'Gree, Haier, General ও Media ইনভার্টার এসিতে সর্বোচ্চ বিদ্যুৎ সাশ্রয় এবং নিশ্চিত ফ্রি ইন্সটলেশন।',
                'banner_image' => 'https://images.unsplash.com/photo-1614633833026-0620ba08eb9e?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1614633833026-0620ba08eb9e?w=600&auto=format&fit=crop',
                'badge_text' => 'SUMMER COOLING FESTIVAL',
                'headline' => 'ইনভার্টার এসি অফার — ৩৫,০০০৳ পর্যন্ত মূল্য ছাড়!',
                'offer_validity_text' => '9 Aug – 31 Aug 2026',
                'cta_button_text' => 'EXPLORE AC DEALS →',
                'start_at' => now()->subDays(8),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 8,
            ],
            [
                'title' => 'ওয়াশিং মেশিন অফার — TechMarket BD',
                'slug' => 'washing-machine-offer-techmarket-bd',
                'short_description' => 'স্মার্ট লাইফের জন্য স্মার্ট এক্সচেঞ্জ — ৩০,০০০৳ পর্যন্ত মূল্য ছাড়!',
                'description' => 'টপ লোড ও ফ্রন্ট লোড প্রিমিয়াম ওয়াশিং মেশিনে দুর্দান্ত ডিসকাউন্ট ও ফ্রি হোম ডেলিভারি।',
                'banner_image' => 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop',
                'badge_text' => 'HOME SMART APPLIANCES',
                'headline' => 'ওয়াশিং মেশিন কিনুন ৩০,০০০৳ পর্যন্ত বিশেষ মূল্যে ছাড় সহ',
                'offer_validity_text' => '7 Aug – 31 Aug 2026',
                'cta_button_text' => 'BUY WASHING MACHINE →',
                'start_at' => now()->subDays(10),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 9,
            ],
            [
                'title' => 'Home Appliance',
                'slug' => 'home-appliance',
                'short_description' => 'স্মার্ট জীবন হোক আরও সহজ! ৫০,০০০৳ পর্যন্ত মূল্য ছাড় + EMI সুবিধা।',
                'description' => 'রেফ্রিজারেটর, মাইক্রোওয়েভ ওভেন, ব্লেন্ডার ও ওয়াটার পিউরিফায়ারে আকর্ষণীয় বান্ডেল ডিসকাউন্ট।',
                'banner_image' => 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop',
                'badge_text' => 'HOME APPLIANCE MEGA FEST',
                'headline' => 'হোম অ্যাপ্লায়েন্সে ৫০,০০০৳ পর্যন্ত মূল্য ছাড় ও ০% EMI',
                'offer_validity_text' => '9 Aug – 31 Aug 2026',
                'cta_button_text' => 'VIEW HOME APPLIANCES →',
                'start_at' => now()->subDays(8),
                'end_at' => now()->addDays(14),
                'status' => 'active',
                'is_active' => true,
                'display_order' => 10,
            ],
        ];

        foreach ($offersData as $off) {
            $createdOffer = \App\Models\Offer::create($off);
            
            // Attach eligible products
            if ($createdOffer->slug === 'laptop-spider-man') {
                foreach ($laptopProds as $i => $lp) {
                    $createdOffer->products()->attach($lp->id, [
                        'display_order' => $i + 1,
                        'is_featured' => $i === 0,
                        'badge' => 'FREE MOVIE TICKET',
                    ]);
                }
            } else {
                $sampleItems = $allProds->random(min(4, $allProds->count()));
                foreach ($sampleItems as $i => $sp) {
                    $createdOffer->products()->attach($sp->id, [
                        'display_order' => $i + 1,
                        'is_featured' => $i === 0,
                        'badge' => 'SPECIAL OFFER',
                    ]);
                }
            }
        }

        // 18. Seed Dynamic Header & Footer Links
        $infoLinks = [
            ['title' => 'About Us', 'url' => '/about-us', 'sort_order' => 1, 'location' => 'footer_info'],
            ['title' => 'Brands Directory', 'url' => '/brands', 'sort_order' => 2, 'location' => 'footer_info'],
            ['title' => 'Tech Blog & Articles', 'url' => '/blog', 'sort_order' => 3, 'location' => 'footer_info'],
            ['title' => 'Customer Servicing', 'url' => '/servicing', 'sort_order' => 4, 'location' => 'footer_info'],
            ['title' => '0% EMI Financing', 'url' => '/emi-info', 'sort_order' => 5, 'location' => 'footer_info'],
            ['title' => 'Exclusive Offers', 'url' => '/offers', 'sort_order' => 6, 'location' => 'footer_info'],
        ];

        foreach ($infoLinks as $link) {
            \App\Models\Navigation::create($link);
        }

        $policyLinks = [
            ['title' => 'Privacy Policy', 'url' => '/privacy-policy', 'sort_order' => 1, 'location' => 'footer_policies'],
            ['title' => 'Warranty Policy', 'url' => '/page/warranty-policy', 'sort_order' => 2, 'location' => 'footer_policies'],
            ['title' => 'Payment Terms', 'url' => '/page/payment-terms', 'sort_order' => 3, 'location' => 'footer_policies'],
            ['title' => 'Delivery & Shipping Policy', 'url' => '/page/delivery-policy', 'sort_order' => 4, 'location' => 'footer_policies'],
            ['title' => 'Terms & Conditions', 'url' => '/page/terms-and-conditions', 'sort_order' => 5, 'location' => 'footer_policies'],
            ['title' => 'Refund and Return Policy', 'url' => '/page/refund-and-return-policy', 'sort_order' => 6, 'location' => 'footer_policies'],
        ];

        foreach ($policyLinks as $link) {
            \App\Models\Navigation::create($link);
        }

        // 19. Seed SMS Gateways & Default Templates
        \App\Services\Sms\SmsManager::seedDefaultGateways();
        \App\Services\Sms\SmsNotificationService::seedDefaultTemplates();

        // 20. Seed Email Gateways, Gadget Catalog, Storefront Versions & CCTV Surveillance Ecosystem
        $this->call([
            \Database\Seeders\EmailGatewaySeeder::class,
            \Database\Seeders\EmailTemplateSeeder::class,
            \Database\Seeders\StorefrontVersionSeeder::class,
            \Database\Seeders\TechMarketGadgetSeeder::class,
            \Database\Seeders\CctvEnterpriseSeeder::class,
            \Database\Seeders\NotificationRulesSeeder::class,
            \Database\Seeders\UnitSeeder::class,
            \Database\Seeders\BulkDataPermissionSeeder::class,
        ]);
    }
}
