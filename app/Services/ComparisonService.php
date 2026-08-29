<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use App\Models\SpecificationGroup;
use Illuminate\Database\Eloquent\Collection;

class ComparisonService
{
    public const DEFAULT_MAX_ITEMS = 4;

    /**
     * Get the maximum allowed products in comparison.
     */
    public static function getMaxItems(): int
    {
        $settingVal = Setting::where('key', 'max_compare_items')->value('value');
        return $settingVal ? max(2, min(6, (int)$settingVal)) : self::DEFAULT_MAX_ITEMS;
    }

    /**
     * Get active comparison product IDs from session.
     */
    public static function getSessionIds(): array
    {
        $ids = session()->get('compare_items', []);
        return is_array($ids) ? array_values(array_unique(array_filter(array_map('intval', $ids)))) : [];
    }

    /**
     * Set active comparison product IDs in session.
     */
    public static function setSessionIds(array $ids): void
    {
        $max = self::getMaxItems();
        $clean = array_slice(array_values(array_unique(array_filter(array_map('intval', $ids)))), 0, $max);
        session()->put('compare_items', $clean);
        session()->save();
    }

    /**
     * Retrieve live compared products with relationships.
     */
    public static function getComparedProducts(?array $explicitIds = null): Collection
    {
        $ids = $explicitIds !== null ? $explicitIds : self::getSessionIds();
        if (empty($ids)) {
            return new Collection();
        }

        $max = self::getMaxItems();
        $cleanIds = array_slice($ids, 0, $max);

        $products = Product::with(['category.parent', 'brand', 'specificationValues.attribute.group'])
            ->whereIn('id', $cleanIds)
            ->get();

        // Maintain the order of IDs as selected
        $sorted = $products->sortBy(function ($p) use ($cleanIds) {
            return array_search($p->id, $cleanIds);
        })->values();

        // Update session to prune any deleted/inactive products
        $validIds = $sorted->pluck('id')->all();
        if ($explicitIds === null && count($validIds) !== count($ids)) {
            session()->put('compare_items', $validIds);
        }

        return $sorted;
    }

    /**
     * Validate if a new product can be added to the current comparison list.
     */
    public static function validateAdd(Product $product, array $currentIds): array
    {
        $max = self::getMaxItems();

        if (count($currentIds) >= $max && !in_array($product->id, $currentIds)) {
            return [
                'allowed' => false,
                'message' => "You can compare a maximum of {$max} products at a time.",
            ];
        }

        if (in_array($product->id, $currentIds)) {
            return [
                'allowed' => false,
                'message' => "Product '{$product->title}' is already in your comparison list.",
            ];
        }

        if (!empty($currentIds)) {
            $existingProducts = Product::with(['category.parent'])->whereIn('id', $currentIds)->get();
            if ($existingProducts->isNotEmpty()) {
                $firstExisting = $existingProducts->first();
                
                $compatible = self::areCategoriesCompatible($product, $firstExisting);
                if (!$compatible) {
                    $existingCatName = $firstExisting->category?->name ?: 'General';
                    $newCatName = $product->category?->name ?: 'General';
                    return [
                        'allowed' => false,
                        'message' => "Cannot compare '{$product->title}' ({$newCatName}) with {$existingCatName} products. You can only compare items of the same product type.",
                    ];
                }
            }
        }

        return [
            'allowed' => true,
            'message' => "Product added to comparison.",
        ];
    }

    /**
     * Check if two products belong to compatible categories.
     */
    public static function areCategoriesCompatible(Product $p1, Product $p2): bool
    {
        // Allow flexible cross-category comparison for all electronics and hardware
        return true;
    }

    /**
     * Build side-by-side specification comparison matrix from products.
     */
    public static function buildSpecificationMatrix(Collection $products): array
    {
        if ($products->isEmpty()) {
            return [];
        }

        $matrix = [];

        // Group 1: General & Identity Overview
        $generalRows = [
            'Brand' => $products->map(fn($p) => $p->brand?->name ?: 'N/A')->all(),
            'Model / SKU' => $products->map(fn($p) => $p->sku ?: 'N/A')->all(),
            'Category' => $products->map(fn($p) => $p->category?->name ?: 'N/A')->all(),
            'Warranty' => $products->map(fn($p) => $p->warranty ?: 'Official Manufacturer Warranty')->all(),
            'Availability' => $products->map(fn($p) => $p->stock > 0 ? 'In Stock' : 'Out of Stock / Pre-Order')->all(),
        ];

        $generalGroup = [
            'group_name' => 'General Overview',
            'rows' => [],
        ];

        foreach ($generalRows as $label => $values) {
            $uniqueVals = array_unique(array_map('strtolower', array_map('trim', $values)));
            $generalGroup['rows'][] = [
                'label' => $label,
                'values' => $values,
                'has_difference' => count($uniqueVals) > 1,
            ];
        }
        $matrix[] = $generalGroup;

        // Group 2: Relational DB Specification Groups & Attributes
        $dbGroups = SpecificationGroup::with(['attributes'])->orderBy('sort_order')->get();
        $processedDbAttributeIds = [];

        foreach ($dbGroups as $group) {
            $groupRows = [];

            foreach ($group->attributes as $attr) {
                $values = [];
                $hasAnyValue = false;

                foreach ($products as $product) {
                    $specVal = $product->specificationValues->firstWhere('specification_attribute_id', $attr->id);
                    $val = $specVal ? trim($specVal->value) : null;
                    if ($val && $attr->unit && !str_contains($val, $attr->unit)) {
                        $val .= ' ' . $attr->unit;
                    }
                    $values[] = $val ?: '—';
                    if ($val) {
                        $hasAnyValue = true;
                    }
                }

                if ($hasAnyValue) {
                    $processedDbAttributeIds[] = $attr->id;
                    $cleanVals = array_unique(array_map('strtolower', array_map('trim', $values)));
                    $groupRows[] = [
                        'label' => $attr->name,
                        'values' => $values,
                        'has_difference' => count($cleanVals) > 1,
                    ];
                }
            }

            if (!empty($groupRows)) {
                $matrix[] = [
                    'group_name' => $group->name,
                    'rows' => $groupRows,
                ];
            }
        }

        // Group 3: Dynamic Key Specs & Full Specs (JSON Fallback / Supplement)
        $extraSpecs = [];
        foreach ($products as $idx => $product) {
            $specsObj = [];
            if (is_array($product->full_specs)) {
                foreach ($product->full_specs as $k => $v) {
                    if (is_string($v) || is_numeric($v)) {
                        $specsObj[$k] = (string)$v;
                    } elseif (is_array($v) && isset($v['name'], $v['value'])) {
                        $specsObj[$v['name']] = (string)$v['value'];
                    } elseif (is_array($v) && isset($v['attributes']) && is_array($v['attributes'])) {
                        foreach ($v['attributes'] as $attr) {
                            if (is_array($attr) && isset($attr['name'], $attr['value']) && $attr['value'] !== null && trim((string)$attr['value']) !== '') {
                                $specsObj[$attr['name']] = (string)$attr['value'];
                            }
                        }
                    }
                }
            }
            if (is_array($product->key_specs)) {
                foreach ($product->key_specs as $k => $v) {
                    if (is_string($v) && !is_numeric($k)) {
                        $specsObj[$k] = $v;
                    } elseif (is_string($v) && str_contains($v, ':')) {
                        [$sk, $sv] = explode(':', $v, 2);
                        $specsObj[trim($sk)] = trim($sv);
                    }
                }
            }

            foreach ($specsObj as $specKey => $specValue) {
                $normKey = trim($specKey);
                if (!isset($extraSpecs[$normKey])) {
                    $extraSpecs[$normKey] = array_fill(0, count($products), '—');
                }
                $extraSpecs[$normKey][$idx] = $specValue;
            }
        }

        if (!empty($extraSpecs)) {
            $extraRows = [];
            foreach ($extraSpecs as $specKey => $values) {
                // Ignore if already covered in general overview
                if (in_array(strtolower($specKey), ['brand', 'model', 'warranty', 'sku', 'price'])) {
                    continue;
                }

                $cleanVals = array_unique(array_map('strtolower', array_map('trim', $values)));
                $extraRows[] = [
                    'label' => $specKey,
                    'values' => $values,
                    'has_difference' => count($cleanVals) > 1,
                ];
            }

            if (!empty($extraRows)) {
                $matrix[] = [
                    'group_name' => 'Detailed Technical Specifications',
                    'rows' => $extraRows,
                ];
            }
        }

        return $matrix;
    }
}
