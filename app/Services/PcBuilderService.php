<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\ProductSpecificationValue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class PcBuilderService
{
    /**
     * Complete definition of all 15 component slots across 3 groups.
     */
    public static function getSlots(): array
    {
        return [
            // Group 1: Core Components
            'processor' => [
                'key' => 'processor',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'Processor',
                'required' => true,
                'depends_on' => null,
                'icon' => 'Cpu',
                'category_slugs' => ['processor', 'intel-processor', 'amd-processor'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'processor_model' => 'Processor Model',
                    'threads' => 'Number of Thread',
                    'cores' => 'Number of Cores',
                    'socket' => 'Socket',
                    'generation' => 'Generation / Series',
                    'clock_speed' => 'Clock Speed',
                ],
            ],
            'motherboard' => [
                'key' => 'motherboard',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'Motherboard',
                'required' => true,
                'depends_on' => 'Processor',
                'icon' => 'CircuitBoard',
                'category_slugs' => ['motherboard', 'intel-motherboard', 'amd-motherboard'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'socket' => 'Socket',
                    'chipset' => 'Chipset',
                    'form_factor' => 'Form Factor',
                    'ram_type' => 'Memory Type (DDR4 / DDR5)',
                ],
            ],
            'ram' => [
                'key' => 'ram',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'RAM',
                'required' => true,
                'depends_on' => 'Processor',
                'icon' => 'MemoryStick',
                'category_slugs' => ['ram', 'desktop-ddr5-ram', 'desktop-ddr4-ram', 'laptop-ram'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'capacity' => 'Capacity',
                    'ram_type' => 'RAM Type',
                    'bus_speed' => 'Bus Speed',
                    'rgb' => 'RGB Lighting',
                ],
            ],
            'storage' => [
                'key' => 'storage',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'Storage',
                'required' => true,
                'depends_on' => null,
                'icon' => 'HardDrive',
                'category_slugs' => ['ssd', 'nvme-ssd', 'sata-ssd', 'internal-hdd', 'storage'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'type' => 'Storage Type',
                    'capacity' => 'Capacity',
                    'interface' => 'Interface',
                ],
            ],
            'graphics-card' => [
                'key' => 'graphics-card',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'Graphics Card',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Tv',
                'category_slugs' => ['graphics-card', 'nvidia-geforce', 'amd-radeon', 'intel-arc'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'gpu_series' => 'GPU Series',
                    'vram' => 'VRAM Capacity',
                    'interface' => 'Interface',
                ],
            ],
            'power-supply' => [
                'key' => 'power-supply',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'Power Supply',
                'required' => true,
                'depends_on' => null,
                'icon' => 'Zap',
                'category_slugs' => ['power-supply', 'modular-psu', 'power-cooling', 'power'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'wattage' => 'Wattage',
                    'efficiency_rating' => 'Efficiency Rating',
                    'modular' => 'Modular Type',
                ],
            ],
            'cpu-cooler' => [
                'key' => 'cpu-cooler',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'CPU Cooler',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Fan',
                'category_slugs' => ['cpu-cooler', 'liquid-cooler', 'cpu-air-cooler'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'cooler_type' => 'Cooler Type',
                    'socket_support' => 'Socket Support',
                    'radiator_size' => 'Radiator Size',
                ],
            ],
            'casing' => [
                'key' => 'casing',
                'group' => 'core',
                'group_title' => 'Core Components',
                'title' => 'Casing',
                'required' => true,
                'depends_on' => null,
                'icon' => 'Box',
                'category_slugs' => ['casing', 'gaming-casing', 'desktop-casing', 'case', 'desktop'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'form_factor_support' => 'Motherboard Support',
                    'side_panel' => 'Side Panel Type',
                ],
            ],

            // Group 2: Peripherals & Others
            'monitor' => [
                'key' => 'monitor',
                'group' => 'peripherals',
                'group_title' => 'Peripherals & Others',
                'title' => 'Monitor',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Monitor',
                'category_slugs' => ['monitor', 'gaming-monitors', '4k-monitors', '2k-monitors', 'fhd-monitors', 'studio-monitors'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'screen_size' => 'Screen Size',
                    'resolution' => 'Resolution',
                    'refresh_rate' => 'Refresh Rate',
                    'panel_type' => 'Panel Type',
                ],
            ],
            'case-fan' => [
                'key' => 'case-fan',
                'group' => 'peripherals',
                'group_title' => 'Peripherals & Others',
                'title' => 'Case Fan',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Fan',
                'category_slugs' => ['casing-fans', 'case-fan', 'fans'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'fan_size' => 'Fan Size',
                    'rgb' => 'RGB Lighting',
                ],
            ],
            'ups' => [
                'key' => 'ups',
                'group' => 'peripherals',
                'group_title' => 'Peripherals & Others',
                'title' => 'UPS',
                'required' => false,
                'depends_on' => null,
                'icon' => 'BatteryCharging',
                'category_slugs' => ['ups', 'online-ups', 'offline-ups'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'capacity_va' => 'VA Capacity',
                    'type' => 'Topology Type',
                ],
            ],
            'software' => [
                'key' => 'software',
                'group' => 'peripherals',
                'group_title' => 'Peripherals & Others',
                'title' => 'Software',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Package',
                'category_slugs' => ['software', 'os-security', 'windows-11-pro', 'office-365', 'antivirus-security'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'license_type' => 'License Type',
                ],
            ],

            // Group 3: Accessories
            'mouse' => [
                'key' => 'mouse',
                'group' => 'accessories',
                'group_title' => 'Accessories',
                'title' => 'Mouse',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Mouse',
                'category_slugs' => ['mouse', 'wireless-mice', 'gaming-mouse', 'input-devices'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'connectivity' => 'Connectivity',
                    'sensor_dpi' => 'Sensor DPI',
                    'rgb' => 'RGB',
                ],
            ],
            'keyboard' => [
                'key' => 'keyboard',
                'group' => 'accessories',
                'group_title' => 'Accessories',
                'title' => 'Keyboard',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Keyboard',
                'category_slugs' => ['keyboard', 'mechanical-keyboards', 'gaming-keyboard'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'switch_type' => 'Switch Type',
                    'connectivity' => 'Connectivity',
                    'layout' => 'Keyboard Layout',
                ],
            ],
            'headphone' => [
                'key' => 'headphone',
                'group' => 'accessories',
                'group_title' => 'Accessories',
                'title' => 'Headphone',
                'required' => false,
                'depends_on' => null,
                'icon' => 'Headphones',
                'category_slugs' => ['headphone', 'studio-headsets', 'gaming-headphone', 'audio-streaming', 'accessories'],
                'attribute_labels' => [
                    'brand' => 'Brands',
                    'connectivity' => 'Connectivity',
                    'microphone' => 'Microphone',
                ],
            ],
        ];
    }

    /**
     * Get specific slot configuration.
     */
    public static function getSlot(string $key): ?array
    {
        $slots = self::getSlots();
        return $slots[$key] ?? null;
    }

    /**
     * Resolve Category IDs for a component slot.
     */
    public static function getCategoryIdsForSlot(string $slotKey): array
    {
        $slot = self::getSlot($slotKey);
        if (!$slot) {
            return [];
        }

        $slugs = $slot['category_slugs'];
        $categories = Category::whereIn('slug', $slugs)->get();
        $ids = $categories->pluck('id')->toArray();

        // Also fetch all subchildren of these categories
        foreach ($categories as $cat) {
            $childIds = Category::where('parent_id', $cat->id)->pluck('id')->toArray();
            $ids = array_merge($ids, $childIds);
        }

        return array_unique($ids);
    }

    /**
     * Query valid products for a component slot with search, filters, and sorting.
     */
    public static function getProductsForSlot(
        string $slotKey,
        array $filters = [],
        string $sort = 'default',
        ?string $search = null,
        ?array $currentBuild = null
    ): array {
        $categoryIds = self::getCategoryIdsForSlot($slotKey);
        $slot = self::getSlot($slotKey);

        $query = Product::query()
            ->with(['brand', 'category', 'specificationValues.attribute'])
            ->where(function ($q) use ($categoryIds, $slotKey) {
                if (!empty($categoryIds)) {
                    $q->whereIn('category_id', $categoryIds);
                } else {
                    $q->where('title', 'like', "%{$slotKey}%");
                }
            });

        // Search by product name or SKU
        if (!empty($search)) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('sku', 'like', "%{$term}%");
            });
        }

        // Availability Filter
        if (!empty($filters['availability'])) {
            $avail = is_array($filters['availability']) ? $filters['availability'] : explode(',', $filters['availability']);
            $query->where(function ($q) use ($avail) {
                if (in_array('in_stock', $avail)) {
                    $q->orWhere('stock', '>', 0);
                }
                if (in_array('pre_order', $avail)) {
                    $q->orWhere('stock', '<=', 0);
                }
            });
        }

        // Price Range Filter
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $query->where('price', '>=', (float)$filters['min_price']);
        }
        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $query->where('price', '<=', (float)$filters['max_price']);
        }

        // Brands Filter
        if (!empty($filters['brands'])) {
            $brandSlugs = is_array($filters['brands']) ? $filters['brands'] : explode(',', $filters['brands']);
            $query->whereHas('brand', function ($q) use ($brandSlugs) {
                $q->whereIn('slug', $brandSlugs)->orWhereIn('name', $brandSlugs);
            });
        }

        // Apply Sorting
        switch ($sort) {
            case 'price_low_high':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high_low':
                $query->orderBy('price', 'desc');
                break;
            case 'name_a_z':
                $query->orderBy('title', 'asc');
                break;
            case 'name_z_a':
                $query->orderBy('title', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'default':
            default:
                $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc');
                break;
        }

        $products = $query->paginate(24)->withQueryString();

        // Extract available brands for sidebar filter
        $availableBrands = Brand::whereHas('products', function ($q) use ($categoryIds, $slotKey) {
            if (!empty($categoryIds)) {
                $q->whereIn('category_id', $categoryIds);
            } else {
                $q->where('title', 'like', "%{$slotKey}%");
            }
        })->select('id', 'name', 'slug')->get();

        // Calculate min and max price across this category
        $priceStats = Product::where(function ($q) use ($categoryIds, $slotKey) {
            if (!empty($categoryIds)) {
                $q->whereIn('category_id', $categoryIds);
            } else {
                $q->where('title', 'like', "%{$slotKey}%");
            }
        })->selectRaw('MIN(price) as min_price, MAX(price) as max_price')->first();

        // Format each product with savings & key specifications
        $formattedProducts = $products->through(function ($p) {
            $regularPrice = (float)($p->regular_price ?: $p->price);
            $effectivePrice = (float)$p->price;
            $savings = max(0, $regularPrice - $effectivePrice);

            return [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'sku' => $p->sku,
                'image' => $p->image ?: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&auto=format&fit=crop',
                'price' => $effectivePrice,
                'regular_price' => $regularPrice,
                'savings' => $savings,
                'stock' => (int)$p->stock,
                'in_stock' => $p->stock > 0,
                'brand' => $p->brand ? ['name' => $p->brand->name, 'slug' => $p->brand->slug] : null,
                'key_specs' => self::extractKeySpecs($p),
            ];
        });

        return [
            'products' => $formattedProducts,
            'slot' => $slot,
            'brands' => $availableBrands,
            'price_bounds' => [
                'min' => (int)($priceStats->min_price ?? 0),
                'max' => (int)($priceStats->max_price ?? 100000),
            ],
            'filters' => $filters,
            'sort' => $sort,
            'search' => $search,
        ];
    }

    /**
     * Extract structured bullet point specifications from product model/specs.
     */
    public static function extractKeySpecs(Product $product): array
    {
        $specs = [];

        // 1. From database specification values
        if ($product->relationLoaded('specificationValues') && $product->specificationValues->isNotEmpty()) {
            foreach ($product->specificationValues->take(4) as $sv) {
                if ($sv->attribute) {
                    $specs[] = "{$sv->attribute->name} - {$sv->value}";
                }
            }
        }

        // 2. Fallback: Parse features/title heuristics if specs table is sparse
        if (empty($specs)) {
            $title = $product->title;
            // Cores / Threads heuristic
            if (preg_match('/(\d+[\s-]?Cores?)/i', $title, $m)) $specs[] = "Cores - " . $m[1];
            if (preg_match('/(\d+[\s-]?Threads?)/i', $title, $m)) $specs[] = "Threads - " . $m[1];
            // Socket heuristic
            if (preg_match('/(AM[45]|LGA\s?\d{4})/i', $title, $m)) $specs[] = "Socket - " . strtoupper($m[1]);
            // RAM speed / capacity heuristic
            if (preg_match('/(DDR[45])\s*(\d{4}MHz)?/i', $title, $m)) $specs[] = "Memory - " . strtoupper($m[0]);
            if (preg_match('/(\d+GB)/i', $title, $m)) $specs[] = "Capacity - " . $m[1];
            // Frequency
            if (preg_match('/(\d+(\.\d+)?\s*GHz)/i', $title, $m)) $specs[] = "Frequency - " . $m[1];
        }

        // Ensure at least some descriptive points
        if (empty($specs)) {
            $specs = [
                'Authentic Official Product with Warranty',
                'High Performance Genuine Component',
            ];
        }

        return array_slice($specs, 0, 4);
    }

    /**
     * Check hardware compatibility across currently selected build items.
     */
    public static function checkCompatibility(array $buildProductIds): array
    {
        $warnings = [];
        $errors = [];
        $selectedProducts = [];

        foreach ($buildProductIds as $slotKey => $productId) {
            if ($productId) {
                $p = Product::with('specificationValues.attribute')->find($productId);
                if ($p) {
                    $selectedProducts[$slotKey] = $p;
                }
            }
        }

        $cpu = $selectedProducts['processor'] ?? null;
        $mb = $selectedProducts['motherboard'] ?? null;
        $ram = $selectedProducts['ram'] ?? null;
        $psu = $selectedProducts['power-supply'] ?? null;
        $gpu = $selectedProducts['graphics-card'] ?? null;

        // 1. Processor <-> Motherboard Socket Match
        if ($cpu && $mb) {
            $cpuSocket = self::detectSocket($cpu);
            $mbSocket = self::detectSocket($mb);

            if ($cpuSocket && $mbSocket && strcasecmp($cpuSocket, $mbSocket) !== 0) {
                $errors[] = "Socket Mismatch: Selected Processor ({$cpu->title}) uses {$cpuSocket} socket, but Motherboard ({$mb->title}) is {$mbSocket}.";
            }
        }

        // 2. Motherboard <-> RAM Generation Match (DDR4 vs DDR5)
        if ($mb && $ram) {
            $mbRam = self::detectRamType($mb);
            $ramType = self::detectRamType($ram);

            if ($mbRam && $ramType && strcasecmp($mbRam, $ramType) !== 0) {
                $errors[] = "Memory Type Mismatch: Motherboard ({$mb->title}) requires {$mbRam}, but selected RAM ({$ram->title}) is {$ramType}.";
            }
        }

        // 3. Power Supply Capacity Validation
        $estWattage = self::calculateWattage($selectedProducts);
        if ($psu) {
            $psuWattage = self::detectWattage($psu);
            if ($psuWattage && $psuWattage < $estWattage) {
                $warnings[] = "Power Alert: Estimated total draw is ~{$estWattage}W. Selected {$psuWattage}W Power Supply may be under-powered during peak gaming / render load.";
            }
        }

        return [
            'is_compatible' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'estimated_wattage' => $estWattage,
        ];
    }

    /**
     * Calculate estimated system power requirements.
     */
    public static function calculateWattage(array $selectedProducts): int
    {
        $wattage = 100; // Motherboard + Storage + Fans + Chipset baseline

        if (!empty($selectedProducts['processor'])) {
            $cpuTitle = $selectedProducts['processor']->title;
            if (stripos($cpuTitle, 'Ryzen 9') !== false || stripos($cpuTitle, 'Core i9') !== false || stripos($cpuTitle, 'Ultra 9') !== false) {
                $wattage += 170;
            } elseif (stripos($cpuTitle, 'Ryzen 7') !== false || stripos($cpuTitle, 'Core i7') !== false || stripos($cpuTitle, 'Ultra 7') !== false) {
                $wattage += 125;
            } else {
                $wattage += 65;
            }
        }

        if (!empty($selectedProducts['graphics-card'])) {
            $gpuTitle = $selectedProducts['graphics-card']->title;
            if (stripos($gpuTitle, '4090') !== false || stripos($gpuTitle, '7900') !== false) {
                $wattage += 450;
            } elseif (stripos($gpuTitle, '4080') !== false || stripos($gpuTitle, '4070 Ti') !== false) {
                $wattage += 285;
            } elseif (stripos($gpuTitle, '4070') !== false || stripos($gpuTitle, '7800') !== false) {
                $wattage += 200;
            } elseif (stripos($gpuTitle, '4060') !== false || stripos($gpuTitle, '7600') !== false) {
                $wattage += 115;
            } else {
                $wattage += 150;
            }
        }

        if (!empty($selectedProducts['ram'])) $wattage += 15;
        if (!empty($selectedProducts['storage'])) $wattage += 10;
        if (!empty($selectedProducts['cpu-cooler'])) $wattage += 15;

        return $wattage;
    }

    /**
     * Heuristically extract socket from product title or specs.
     */
    protected static function detectSocket(Product $product): ?string
    {
        $title = $product->title;
        if (preg_match('/\b(AM5|AM4|LGA1700|LGA1851|LGA1200|LGA1151|sTR5)\b/i', $title, $matches)) {
            return strtoupper(str_replace(' ', '', $matches[1]));
        }
        if (stripos($title, 'B650') !== false || stripos($title, 'X670') !== false || stripos($title, 'Ryzen 7000') !== false || stripos($title, 'Ryzen 9000') !== false) {
            return 'AM5';
        }
        if (stripos($title, 'B550') !== false || stripos($title, 'B450') !== false || stripos($title, 'X570') !== false || stripos($title, 'Ryzen 5000') !== false) {
            return 'AM4';
        }
        if (stripos($title, 'Z790') !== false || stripos($title, 'B760') !== false || stripos($title, '13th Gen') !== false || stripos($title, '14th Gen') !== false) {
            return 'LGA1700';
        }
        return null;
    }

    /**
     * Detect RAM Type (DDR4 vs DDR5).
     */
    protected static function detectRamType(Product $product): ?string
    {
        $title = $product->title;
        if (preg_match('/\b(DDR5|DDR4|DDR3)\b/i', $title, $matches)) {
            return strtoupper($matches[1]);
        }
        return null;
    }

    /**
     * Detect PSU wattage.
     */
    protected static function detectWattage(Product $product): ?int
    {
        if (preg_match('/(\d{3,4})\s*W/i', $product->title, $matches)) {
            return (int)$matches[1];
        }
        return null;
    }
}
