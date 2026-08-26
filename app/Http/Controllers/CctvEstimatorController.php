<?php

namespace App\Http\Controllers;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\QuoteGenerationDTO;
use App\Enums\Cctv\CctvEstimateItemType;
use App\Enums\Cctv\CctvProductType;
use App\Enums\Cctv\CctvSystemType;
use App\Models\Cctv\CctvProductProfile;
use App\Models\Cctv\CctvRule;
use App\Models\Product;
use App\Models\Setting;
use App\Repositories\Contracts\Cctv\CctvEstimateRepositoryInterface;
use App\Repositories\Contracts\Cctv\CctvProductProfileRepositoryInterface;
use App\Services\Contracts\Cctv\CctvCompatibilityEngineInterface;
use App\Services\Contracts\Cctv\CctvEstimatorServiceInterface;
use App\Services\Contracts\Cctv\CctvQuoteServiceInterface;
use App\Services\Contracts\Cctv\CctvRecommendationEngineInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CctvEstimatorController extends Controller
{
    public function __construct(
        private readonly CctvEstimatorServiceInterface $estimatorService,
        private readonly CctvRecommendationEngineInterface $recommendationService,
        private readonly CctvCompatibilityEngineInterface $compatibilityService,
        private readonly CctvQuoteServiceInterface $quoteService,
        private readonly CctvEstimateRepositoryInterface $estimateRepo,
        private readonly CctvProductProfileRepositoryInterface $productProfileRepo,
    ) {}

    /**
     * Customer-facing CCTV Estimator Landing & Wizard.
     */
    public function index(Request $request): Response
    {
        $activeVersion = \App\Models\StorefrontVersion::getActiveVersion();
        $versionKey = $activeVersion ? $activeVersion->key : Setting::get('storefront_version', 'v1');

        // Pre-fetch available CCTV hardware catalog items from real database
        $cameras = CctvProductProfile::with(['product.brand', 'product.category'])
            ->where('product_type', CctvProductType::CAMERA->value)
            ->where('is_active', true)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->product_id,
                    'title' => $profile->product->title,
                    'sku' => $profile->product->sku,
                    'price' => (float) $profile->product->price,
                    'stock' => (int) $profile->product->stock,
                    'image' => $profile->product->image,
                    'brand' => $profile->product->brand?->name,
                    'system_type' => $profile->system_type->value,
                    'resolution_mp' => (float) $profile->resolution_mp,
                    'camera_form_factor' => $profile->camera_form_factor,
                    'lens_mm' => (float) $profile->lens_mm,
                    'ir_distance_meters' => $profile->ir_distance_meters,
                    'low_light_tech' => $profile->low_light_tech,
                    'audio_type' => $profile->audio_type,
                    'environment' => $profile->environment,
                    'power_consumption_watts' => (float) $profile->power_consumption_watts,
                ];
            });

        $recorders = CctvProductProfile::with(['product.brand', 'deviceProfile'])
            ->whereIn('product_type', [CctvProductType::DVR->value, CctvProductType::NVR->value, CctvProductType::XVR->value])
            ->where('is_active', true)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->product_id,
                    'title' => $profile->product->title,
                    'sku' => $profile->product->sku,
                    'price' => (float) $profile->product->price,
                    'stock' => (int) $profile->product->stock,
                    'image' => $profile->product->image,
                    'brand' => $profile->product->brand?->name,
                    'product_type' => $profile->product_type->value,
                    'system_type' => $profile->system_type->value,
                    'channel_count' => (int) ($profile->deviceProfile?->channel_count ?? 4),
                    'max_camera_resolution_mp' => (float) ($profile->deviceProfile?->max_camera_resolution_mp ?? 8.0),
                    'hdd_bay_count' => (int) ($profile->deviceProfile?->hdd_bay_count ?? 1),
                    'poe_port_count' => (int) ($profile->deviceProfile?->poe_port_count ?? 0),
                ];
            });

        $storageHdds = CctvProductProfile::with(['product.brand', 'storageProfile'])
            ->where('product_type', CctvProductType::STORAGE->value)
            ->where('is_active', true)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->product_id,
                    'title' => $profile->product->title,
                    'sku' => $profile->product->sku,
                    'price' => (float) $profile->product->price,
                    'stock' => (int) $profile->product->stock,
                    'image' => $profile->product->image,
                    'brand' => $profile->product->brand?->name,
                    'capacity_tb' => (float) ($profile->storageProfile?->capacity_tb ?? 1.0),
                    'rpm' => $profile->storageProfile?->rpm ?? 5400,
                    'is_surveillance_optimized' => (bool) ($profile->storageProfile?->is_surveillance_optimized ?? true),
                ];
            });

        $cables = CctvProductProfile::with(['product.brand', 'cableProfile'])
            ->where('product_type', CctvProductType::CABLE->value)
            ->where('is_active', true)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->product_id,
                    'title' => $profile->product->title,
                    'sku' => $profile->product->sku,
                    'price' => (float) $profile->product->price,
                    'stock' => (int) $profile->product->stock,
                    'image' => $profile->product->image,
                    'brand' => $profile->product->brand?->name,
                    'cable_type' => $profile->cableProfile?->cable_type ?? 'cat6',
                    'meters_per_unit' => (float) ($profile->cableProfile?->meters_per_unit ?? 305.0),
                ];
            });

        $accessories = CctvProductProfile::with(['product.brand'])
            ->whereIn('product_type', [
                CctvProductType::POE_SWITCH->value,
                CctvProductType::POWER_SUPPLY->value,
                CctvProductType::JUNCTION_BOX->value,
                CctvProductType::CONNECTOR->value,
                CctvProductType::BRACKET->value,
                CctvProductType::SERVICE->value,
            ])
            ->where('is_active', true)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->product_id,
                    'title' => $profile->product->title,
                    'sku' => $profile->product->sku,
                    'price' => (float) $profile->product->price,
                    'stock' => (int) $profile->product->stock,
                    'image' => $profile->product->image,
                    'product_type' => $profile->product_type->value,
                ];
            });

        $engineSettings = [
            'default_recording_days' => (int) Setting::get('cctv_default_recording_days', 15),
            'default_recording_hours' => (int) Setting::get('cctv_default_recording_hours', 24),
            'storage_overhead_percent' => (float) Setting::get('cctv_storage_overhead_percent', 10),
            'cable_waste_percent' => (float) Setting::get('cctv_cable_waste_percent', 15),
            'cable_safety_margin_meters' => (float) Setting::get('cctv_cable_safety_margin_meters', 20),
            'installation_base_charge' => (float) Setting::get('cctv_installation_base_charge', 1500),
            'installation_per_camera_charge' => (float) Setting::get('cctv_installation_per_camera_charge', 500),
        ];

        return Inertia::render('CctvEstimator', [
            'storefront_version' => $versionKey,
            'catalogCameras' => $cameras,
            'catalogRecorders' => $recorders,
            'catalogStorage' => $storageHdds,
            'catalogCables' => $cables,
            'catalogAccessories' => $accessories,
            'engineSettings' => $engineSettings,
        ]);
    }

    /**
     * Add Complete CCTV System to Cart with Live Stock and Price Revalidation.
     */
    public function addToCart(Request $request): JsonResponse
    {
        $items = $request->input('items', []);
        if (empty($items)) {
            return response()->json([
                'status' => 'error',
                'message' => 'No items provided in system configuration to add to cart.',
            ], 422);
        }

        $cart = session()->get('cart', []);
        $priceChanges = [];
        $outOfStockItems = [];
        $addedCount = 0;

        foreach ($items as $item) {
            $productId = $item['product_id'] ?? null;
            if (!$productId) continue;

            $product = Product::find($productId);
            if (!$product || !$product->is_active) {
                $outOfStockItems[] = $item['name'] ?? "Product #{$productId}";
                continue;
            }

            if ($product->stock <= 0) {
                $outOfStockItems[] = "{$product->title} (Out of stock)";
                continue;
            }

            $currentPrice = (float) $product->price;
            $submittedPrice = (float) ($item['unit_price'] ?? $currentPrice);

            if (abs($currentPrice - $submittedPrice) > 0.01) {
                $priceChanges[] = [
                    'product' => $product->title,
                    'old_price' => $submittedPrice,
                    'current_price' => $currentPrice,
                ];
            }

            $qty = max(1, (int) ceil($item['quantity'] ?? 1));

            // Merge into session cart
            if (isset($cart[$productId])) {
                $cart[$productId]['quantity'] += $qty;
                $cart[$productId]['total'] = $cart[$productId]['quantity'] * $currentPrice;
            } else {
                $cart[$productId] = [
                    'id' => $productId,
                    'title' => $product->title,
                    'sku' => $product->sku,
                    'price' => $currentPrice,
                    'quantity' => $qty,
                    'total' => $currentPrice * $qty,
                    'image' => $product->image,
                    'is_cctv_item' => true,
                ];
            }

            $addedCount += $qty;
        }

        if (!empty($outOfStockItems)) {
            return response()->json([
                'status' => 'warning',
                'message' => 'Some products in your configuration are currently unavailable.',
                'unavailable_items' => $outOfStockItems,
            ], 422);
        }

        session()->put('cart', $cart);

        $cartCount = array_reduce($cart, fn($carry, $item) => $carry + $item['quantity'], 0);
        $cartTotal = array_reduce($cart, fn($carry, $item) => $carry + $item['total'], 0);

        return response()->json([
            'status' => 'success',
            'message' => 'Complete CCTV System configuration successfully added to cart.',
            'data' => [
                'cart_count' => $cartCount,
                'cart_total' => $cartTotal,
                'price_changes' => $priceChanges,
            ],
        ]);
    }
}
