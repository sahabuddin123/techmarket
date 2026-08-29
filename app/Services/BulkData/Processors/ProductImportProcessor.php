<?php

namespace App\Services\BulkData\Processors;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Services\BulkData\Contracts\ImportProcessorInterface;
use App\Services\InventoryService;
use App\Services\ProductSeoService;
use Illuminate\Support\Str;

class ProductImportProcessor implements ImportProcessorInterface
{
    protected ?array $categoryCache = null;
    protected ?array $brandCache = null;
    protected ?array $unitCache = null;

    public function getEntityType(): string
    {
        return 'products';
    }

    public function getEntityLabel(): string
    {
        return 'Hardware Products';
    }

    public function getUniqueKeyField(): string
    {
        return 'sku';
    }

    public function getTemplateColumns(): array
    {
        return [
            ['key' => 'sku', 'label' => 'SKU', 'required' => true, 'description' => 'Unique Stock Keeping Unit barcode/identifier', 'example' => 'GPU-ASUS-4090-OC'],
            ['key' => 'title', 'label' => 'Product Title', 'required' => true, 'description' => 'Full product name including brand & model', 'example' => 'ASUS ROG Strix GeForce RTX 4090 OC 24GB'],
            ['key' => 'category', 'label' => 'Category', 'required' => true, 'description' => 'Category Name or Slug from database', 'example' => 'Graphics Card'],
            ['key' => 'brand', 'label' => 'Brand', 'required' => false, 'description' => 'Brand / Manufacturer Name or Slug', 'example' => 'ASUS'],
            ['key' => 'unit', 'label' => 'Unit', 'required' => false, 'description' => 'Unit code (pcs, box, pack, etc.)', 'example' => 'pcs'],
            ['key' => 'price', 'label' => 'Selling Price', 'required' => true, 'description' => 'Special/Cash Selling Price in BDT (Numeric)', 'example' => '245000'],
            ['key' => 'regular_price', 'label' => 'Regular Price', 'required' => false, 'description' => 'MSRP / Strike-through Regular Price in BDT', 'example' => '260000'],
            ['key' => 'cost_price', 'label' => 'Cost Price', 'required' => false, 'description' => 'Wholesale Purchase / Inventory Cost', 'example' => '220000'],
            ['key' => 'stock', 'label' => 'Stock Quantity', 'required' => true, 'description' => 'Available physical stock count (Integer)', 'example' => '15'],
            ['key' => 'low_stock_threshold', 'label' => 'Low Stock Alert', 'required' => false, 'description' => 'Threshold to trigger low stock warning', 'example' => '3'],
            ['key' => 'status', 'label' => 'Status', 'required' => false, 'description' => 'Active (1, true, active) or Draft (0, false, draft)', 'example' => 'Active'],
            ['key' => 'is_featured', 'label' => 'Featured', 'required' => false, 'description' => '1 for Featured on Homepage, 0 otherwise', 'example' => '1'],
            ['key' => 'is_deal_of_day', 'label' => 'Deal of Day', 'required' => false, 'description' => '1 for Flash Deal, 0 otherwise', 'example' => '0'],
            ['key' => 'component_type', 'label' => 'PC Builder Type', 'required' => false, 'description' => 'processor, motherboard, ram, storage, graphics-card, power-supply, casing, monitor', 'example' => 'graphics-card'],
            ['key' => 'warranty', 'label' => 'Warranty Policy', 'required' => false, 'description' => 'Manufacturer warranty duration', 'example' => '3 Years Official Warranty'],
            ['key' => 'short_description', 'label' => 'Short Summary', 'required' => false, 'description' => 'Brief 1-2 sentence overview', 'example' => 'Flagship Ada Lovelace architecture GPU with 24GB GDDR6X memory.'],
            ['key' => 'description', 'label' => 'Full Description HTML', 'required' => false, 'description' => 'Comprehensive HTML product overview', 'example' => '<p>High-end 4K gaming graphics card.</p>'],
            ['key' => 'image', 'label' => 'Primary Image URL', 'required' => false, 'description' => 'URL to product cover photo', 'example' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45'],
            ['key' => 'meta_title', 'label' => 'SEO Title Tag', 'required' => false, 'description' => 'Custom Google Search title tag', 'example' => 'ASUS ROG Strix RTX 4090 OC Price in BD | TechMarket'],
            ['key' => 'meta_description', 'label' => 'SEO Meta Description', 'required' => false, 'description' => '150-160 character search snippet', 'example' => 'Buy ASUS ROG Strix GeForce RTX 4090 OC 24GB at best price in Bangladesh with 3 years warranty.'],
            ['key' => 'focus_keyword', 'label' => 'SEO Focus Keyword', 'required' => false, 'description' => 'Primary ranking keyword', 'example' => 'rtx 4090 price in bd'],
        ];
    }

    public function getInstructions(): array
    {
        return [
            'SKU must be unique for each product. When using "Create + Update" or "Update Only" mode, existing products will be matched by SKU.',
            'Categories, Brands, and Units must match existing records in your store. Enter either the Name or Slug.',
            'Price and Stock columns must be numeric numbers without currency symbols (e.g. 245000, not ৳245,000).',
            'Status accepts: "Active", "Published", "1", "true" for live products, and "Draft", "Hidden", "0", "false" for unlisted drafts.',
            'If Image URL is provided, it must be a valid public HTTP/HTTPS image link.',
        ];
    }

    public function getAllowedValues(): array
    {
        return [
            'Categories' => Category::orderBy('name')->pluck('name')->toArray(),
            'Brands' => Brand::orderBy('name')->pluck('name')->toArray(),
            'Units' => Unit::orderBy('name')->pluck('short_code')->toArray(),
            'Status' => ['Active', 'Draft', '1', '0'],
            'PC Builder Component Types' => [
                'processor', 'motherboard', 'ram', 'storage', 'graphics-card', 
                'power-supply', 'cpu-cooler', 'casing', 'monitor', 'case-fan', 'ups', 'software', 'mouse', 'keyboard', 'headphone'
            ],
        ];
    }

    protected function resolveCategory(string $categoryInput): ?Category
    {
        if ($this->categoryCache === null) {
            $this->categoryCache = [];
            foreach (Category::all() as $c) {
                $this->categoryCache[mb_strtolower(trim($c->name))] = $c;
                $this->categoryCache[mb_strtolower(trim($c->slug))] = $c;
            }
        }
        $key = mb_strtolower(trim($categoryInput));
        return $this->categoryCache[$key] ?? null;
    }

    protected function resolveBrand(?string $brandInput): ?Brand
    {
        if (empty($brandInput)) return null;
        if ($this->brandCache === null) {
            $this->brandCache = [];
            foreach (Brand::all() as $b) {
                $this->brandCache[mb_strtolower(trim($b->name))] = $b;
                $this->brandCache[mb_strtolower(trim($b->slug))] = $b;
            }
        }
        $key = mb_strtolower(trim($brandInput));
        return $this->brandCache[$key] ?? null;
    }

    protected function resolveUnit(?string $unitInput): ?Unit
    {
        if (empty($unitInput)) return null;
        if ($this->unitCache === null) {
            $this->unitCache = [];
            foreach (Unit::all() as $u) {
                $this->unitCache[mb_strtolower(trim($u->short_code))] = $u;
                $this->unitCache[mb_strtolower(trim($u->name))] = $u;
                if ($u->symbol) {
                    $this->unitCache[mb_strtolower(trim($u->symbol))] = $u;
                }
            }
        }
        $key = mb_strtolower(trim($unitInput));
        return $this->unitCache[$key] ?? null;
    }

    public function validateRow(array $row, int $rowNumber, array $options = []): array
    {
        $errors = [];
        $warnings = [];
        $normalized = [];

        // 1. SKU validation
        $sku = trim((string)($row['sku'] ?? $row['SKU'] ?? ''));
        if (empty($sku)) {
            $errors[] = "Row {$rowNumber}: SKU is required.";
        } else {
            $normalized['sku'] = $sku;
        }

        // 2. Title validation
        $title = trim((string)($row['title'] ?? $row['Product Title'] ?? $row['Product Name'] ?? $row['name'] ?? ''));
        if (empty($title)) {
            $errors[] = "Row {$rowNumber}: Product Title is required.";
        } else {
            $normalized['title'] = $title;
        }

        // 3. Category resolution
        $catInput = trim((string)($row['category'] ?? $row['Category'] ?? ''));
        if (empty($catInput)) {
            $errors[] = "Row {$rowNumber}: Category is required.";
        } else {
            $cat = $this->resolveCategory($catInput);
            if (!$cat) {
                $errors[] = "Row {$rowNumber}: Category '{$catInput}' does not exist in database.";
            } else {
                $normalized['category_id'] = $cat->id;
            }
        }

        // 4. Brand resolution
        $brandInput = trim((string)($row['brand'] ?? $row['Brand'] ?? ''));
        if (!empty($brandInput)) {
            $brand = $this->resolveBrand($brandInput);
            if (!$brand) {
                $warnings[] = "Row {$rowNumber}: Brand '{$brandInput}' not found; left unassigned.";
                $normalized['brand_id'] = null;
            } else {
                $normalized['brand_id'] = $brand->id;
            }
        } else {
            $normalized['brand_id'] = null;
        }

        // 5. Unit resolution
        $unitInput = trim((string)($row['unit'] ?? $row['Unit'] ?? ''));
        if (!empty($unitInput)) {
            $unit = $this->resolveUnit($unitInput);
            if (!$unit) {
                $warnings[] = "Row {$rowNumber}: Unit '{$unitInput}' not found; using default unit.";
                $normalized['unit_id'] = null;
            } else {
                $normalized['unit_id'] = $unit->id;
            }
        } else {
            $normalized['unit_id'] = null;
        }

        // 6. Price validation
        $priceRaw = str_replace([',', '৳', '$'], '', trim((string)($row['price'] ?? $row['Selling Price'] ?? '')));
        if (!is_numeric($priceRaw) || (float)$priceRaw < 0) {
            $errors[] = "Row {$rowNumber}: Selling Price must be a valid positive number.";
        } else {
            $normalized['price'] = (float)$priceRaw;
        }

        // Optional regular price & cost price
        $regPriceRaw = str_replace([',', '৳', '$'], '', trim((string)($row['regular_price'] ?? $row['Regular Price'] ?? '')));
        $normalized['regular_price'] = (is_numeric($regPriceRaw) && (float)$regPriceRaw > 0) ? (float)$regPriceRaw : null;

        $costPriceRaw = str_replace([',', '৳', '$'], '', trim((string)($row['cost_price'] ?? $row['Cost Price'] ?? '')));
        $normalized['cost_price'] = (is_numeric($costPriceRaw) && (float)$costPriceRaw >= 0) ? (float)$costPriceRaw : null;

        // 7. Stock quantity
        $stockRaw = trim((string)($row['stock'] ?? $row['Stock Quantity'] ?? $row['Stock'] ?? '0'));
        if (!is_numeric($stockRaw) || (int)$stockRaw < 0) {
            $errors[] = "Row {$rowNumber}: Stock Quantity must be a valid non-negative integer.";
        } else {
            $normalized['stock'] = (int)$stockRaw;
        }

        $lowStockRaw = trim((string)($row['low_stock_threshold'] ?? $row['Low Stock Alert'] ?? '3'));
        $normalized['low_stock_threshold'] = is_numeric($lowStockRaw) ? (int)$lowStockRaw : 3;

        // 8. Status boolean
        $statusInput = mb_strtolower(trim((string)($row['status'] ?? $row['Status'] ?? 'active')));
        $normalized['is_active'] = in_array($statusInput, ['1', 'true', 'active', 'published', 'yes', 'y'], true);

        // 9. Flags
        $featInput = mb_strtolower(trim((string)($row['is_featured'] ?? $row['Featured'] ?? '0')));
        $normalized['is_featured'] = in_array($featInput, ['1', 'true', 'yes', 'featured'], true);

        $dealInput = mb_strtolower(trim((string)($row['is_deal_of_day'] ?? $row['Deal of Day'] ?? '0')));
        $normalized['is_deal_of_day'] = in_array($dealInput, ['1', 'true', 'yes', 'deal'], true);

        // 10. Component type
        $compInput = mb_strtolower(trim((string)($row['component_type'] ?? $row['PC Builder Type'] ?? '')));
        $allowedComponents = array_keys(array_change_key_case(array_flip([
            'processor', 'motherboard', 'ram', 'storage', 'graphics-card', 'power-supply', 'cpu-cooler', 'casing', 'monitor', 'case-fan', 'ups', 'software', 'mouse', 'keyboard', 'headphone'
        ])));
        $normalized['component_type'] = in_array($compInput, $allowedComponents, true) ? $compInput : null;

        // 11. Text fields
        $warrantyRaw = trim((string)($row['warranty'] ?? $row['Warranty Policy'] ?? ''));
        $normalized['warranty'] = $warrantyRaw !== '' ? $warrantyRaw : '1 Year Warranty';
        $normalized['short_description'] = trim((string)($row['short_description'] ?? $row['Short Summary'] ?? ''));
        $normalized['description'] = trim((string)($row['description'] ?? $row['Full Description HTML'] ?? ''));
        $normalized['image'] = trim((string)($row['image'] ?? $row['Primary Image URL'] ?? ''));
        $normalized['meta_title'] = trim((string)($row['meta_title'] ?? $row['SEO Title Tag'] ?? ''));
        $normalized['meta_description'] = trim((string)($row['meta_description'] ?? $row['SEO Meta Description'] ?? ''));
        $normalized['focus_keyword'] = trim((string)($row['focus_keyword'] ?? $row['SEO Focus Keyword'] ?? ''));

        return [
            'is_valid' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
            'normalized_data' => $normalized,
        ];
    }

    public function processRow(array $normalizedData, string $mode, array $options = []): array
    {
        $sku = $normalizedData['sku'];
        $existing = Product::where('sku', $sku)->first();

        if ($existing) {
            if ($mode === 'create_only') {
                return ['action' => 'skipped', 'entity_id' => $existing->id, 'error' => null];
            }

            // Update existing product
            $targetStock = $normalizedData['stock'];
            $stockChange = $targetStock - $existing->stock;

            // Remove stock from direct fill so InventoryService manages the ledger and quantity
            unset($normalizedData['stock']);
            $existing->update($normalizedData);

            if ($stockChange !== 0) {
                InventoryService::adjustStock(
                    productId: $existing->id,
                    quantityChange: $stockChange,
                    type: $stockChange > 0 ? 'purchase' : 'adjustment',
                    userId: auth()->id() ?? 1,
                    notes: "Bulk Import Stock Adjustment (SKU: {$sku})"
                );
            }

            return ['action' => 'updated', 'entity_id' => $existing->id, 'error' => null];
        }

        // Product does not exist
        if ($mode === 'update_only') {
            return ['action' => 'skipped', 'entity_id' => null, 'error' => null];
        }

        // Create new product
        $stock = $normalizedData['stock'];
        $normalizedData['stock'] = 0; // will be adjusted via InventoryService
        $normalizedData['slug'] = ProductSeoService::generateUniqueSlug($normalizedData['title']);

        if (empty($normalizedData['image'])) {
            $normalizedData['image'] = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop';
        }

        $product = Product::create($normalizedData);

        if ($stock > 0) {
            InventoryService::adjustStock(
                productId: $product->id,
                quantityChange: $stock,
                type: 'purchase',
                userId: auth()->id() ?? 1,
                notes: "Initial inventory stock via Bulk Import (SKU: {$sku})"
            );
        }

        return ['action' => 'created', 'entity_id' => $product->id, 'error' => null];
    }
}
