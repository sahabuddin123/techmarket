<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\SavedPcBuild;
use App\Services\PcBuilderService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PcBuilderController extends Controller
{
    /**
     * Display the main PC Builder interactive dashboard.
     */
    public function index(Request $request)
    {
        $sessionBuild = session()->get('pc_build', []);
        $allSlots = PcBuilderService::getSlots();

        $selectedBuild = [];
        $totalPrice = 0.00;
        $totalRegularPrice = 0.00;
        $configuredCount = 0;

        foreach ($allSlots as $key => $slot) {
            $productId = $sessionBuild[$key] ?? null;
            $productData = null;

            if ($productId) {
                $p = Product::with(['brand', 'category', 'specificationValues.attribute'])->find($productId);
                if ($p) {
                    $regPrice = (float)($p->regular_price ?: $p->price);
                    $effPrice = (float)$p->price;
                    $totalPrice += $effPrice;
                    $totalRegularPrice += $regPrice;
                    $configuredCount++;

                    $productData = [
                        'id' => $p->id,
                        'title' => $p->title,
                        'slug' => $p->slug,
                        'sku' => $p->sku,
                        'image' => $p->image ?: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&auto=format&fit=crop',
                        'price' => $effPrice,
                        'regular_price' => $regPrice,
                        'stock' => (int)$p->stock,
                        'in_stock' => $p->stock > 0,
                        'brand' => $p->brand ? ['name' => $p->brand->name, 'slug' => $p->brand->slug] : null,
                        'key_specs' => PcBuilderService::extractKeySpecs($p),
                    ];
                } else {
                    // Stale product in session, clear it
                    unset($sessionBuild[$key]);
                    session()->put('pc_build', $sessionBuild);
                }
            }

            $selectedBuild[$key] = $productData;
        }

        $compatibility = PcBuilderService::checkCompatibility($sessionBuild);

        // Required slots check
        $requiredSlots = ['processor', 'motherboard', 'ram', 'storage', 'power-supply', 'casing'];
        $missingRequired = [];
        foreach ($requiredSlots as $req) {
            if (empty($sessionBuild[$req])) {
                $missingRequired[] = $allSlots[$req]['title'] ?? ucfirst($req);
            }
        }

        return Inertia::render('PcBuilder', [
            'slots' => array_values($allSlots),
            'selectedBuild' => $selectedBuild,
            'summary' => [
                'configured_count' => $configuredCount,
                'total_slots' => count($allSlots),
                'total_price' => $totalPrice,
                'regular_price' => $totalRegularPrice,
                'savings' => max(0, $totalRegularPrice - $totalPrice),
                'estimated_wattage' => $compatibility['estimated_wattage'],
                'is_complete' => empty($missingRequired),
                'missing_required' => $missingRequired,
            ],
            'compatibility' => $compatibility,
        ]);
    }

    /**
     * Choose or change a component product for a specific slot.
     */
    public function choose(Request $request, string $component)
    {
        $slot = PcBuilderService::getSlot($component);
        if (!$slot) {
            return redirect()->route('pcBuilder.index')->with('error', "Invalid PC component slot: {$component}");
        }

        $filters = [
            'availability' => $request->input('availability'),
            'min_price' => $request->input('min_price'),
            'max_price' => $request->input('max_price'),
            'brands' => $request->input('brands'),
        ];

        $sort = $request->input('sort', 'default');
        $search = $request->input('search');
        $sessionBuild = session()->get('pc_build', []);

        $result = PcBuilderService::getProductsForSlot(
            $component,
            $filters,
            $sort,
            $search,
            $sessionBuild
        );

        $selectedProductId = $sessionBuild[$component] ?? null;
        $currentSelected = $selectedProductId ? Product::find($selectedProductId) : null;

        return Inertia::render('PcBuilder/ComponentChoose', [
            'slot' => $result['slot'],
            'products' => $result['products'],
            'availableBrands' => $result['brands'],
            'priceBounds' => $result['price_bounds'],
            'filters' => $result['filters'],
            'sort' => $result['sort'],
            'search' => $result['search'],
            'currentSelected' => $currentSelected ? [
                'id' => $currentSelected->id,
                'title' => $currentSelected->title,
                'price' => (float)$currentSelected->price,
            ] : null,
        ]);
    }

    /**
     * Add a chosen component to the PC builder session.
     */
    public function add(Request $request, string $component, Product $product)
    {
        $slot = PcBuilderService::getSlot($component);
        if (!$slot) {
            return redirect()->route('pcBuilder.index')->with('error', 'Invalid component category.');
        }

        // Validate product category compatibility with slot
        $allowedCategoryIds = PcBuilderService::getCategoryIdsForSlot($component);
        if (!empty($allowedCategoryIds) && !in_array($product->category_id, $allowedCategoryIds)) {
            // Also check parent category
            if (!$product->category || !in_array($product->category->parent_id, $allowedCategoryIds)) {
                return redirect()->back()->with('error', "Product '{$product->title}' is not a valid {$slot['title']} component.");
            }
        }

        session()->put("pc_build.{$component}", $product->id);

        return redirect()->route('pcBuilder.index')->with('success', "{$product->title} added to {$slot['title']} slot.");
    }

    /**
     * Remove a component from the builder.
     */
    public function remove(Request $request, string $component)
    {
        $slot = PcBuilderService::getSlot($component);
        session()->forget("pc_build.{$component}");

        return redirect()->route('pcBuilder.index')->with('success', ($slot['title'] ?? 'Component') . ' removed from build.');
    }

    /**
     * Clear all selected components from the builder.
     */
    public function clear(Request $request)
    {
        session()->forget('pc_build');

        return redirect()->route('pcBuilder.index')->with('success', 'Custom PC build reset successfully.');
    }

    /**
     * Transfer all build components directly into the customer's Shopping Cart.
     */
    public function addToCart(Request $request)
    {
        $sessionBuild = session()->get('pc_build', []);

        if (empty($sessionBuild)) {
            return redirect()->route('pcBuilder.index')->with('error', 'Your PC build is empty. Please select components first.');
        }

        $cart = session()->get('cart', []);
        $addedCount = 0;

        foreach ($sessionBuild as $slotKey => $productId) {
            if (!$productId) continue;

            $product = Product::find($productId);
            if (!$product || $product->stock <= 0) {
                continue;
            }

            if (isset($cart[$product->id])) {
                $cart[$product->id]['quantity'] += 1;
                $cart[$product->id]['total'] = $cart[$product->id]['quantity'] * (float)$product->price;
            } else {
                $cart[$product->id] = [
                    'id' => $product->id,
                    'title' => $product->title,
                    'price' => (float)$product->price,
                    'regular_price' => (float)($product->regular_price ?: $product->price),
                    'quantity' => 1,
                    'total' => (float)$product->price,
                    'image' => $product->image,
                    'sku' => $product->sku,
                    'slug' => $product->slug,
                    'brand_name' => $product->brand ? $product->brand->name : null,
                    'stock' => $product->stock,
                    'pc_builder_slot' => $slotKey,
                ];
            }
            $addedCount++;
        }

        session()->put('cart', $cart);

        return redirect()->route('cart.index')->with('success', "Custom PC Build ({$addedCount} components) transferred to cart successfully!");
    }

    /**
     * Save current PC build configuration for authenticated user.
     */
    public function saveBuild(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'Please log in to save your PC build configurations.');
        }

        $sessionBuild = session()->get('pc_build', []);
        if (empty($sessionBuild)) {
            return redirect()->route('pcBuilder.index')->with('error', 'Cannot save an empty PC build.');
        }

        $totalPrice = 0.00;
        $selectedProducts = [];

        foreach ($sessionBuild as $slot => $productId) {
            if ($productId) {
                $p = Product::find($productId);
                if ($p) {
                    $totalPrice += (float)$p->price;
                    $selectedProducts[$slot] = $p;
                }
            }
        }

        $wattage = PcBuilderService::calculateWattage($selectedProducts);

        $saved = SavedPcBuild::create([
            'user_id' => auth()->id(),
            'name' => $request->input('name'),
            'components' => $sessionBuild,
            'total_price' => $totalPrice,
            'estimated_wattage' => $wattage,
        ]);

        AuditLogger::log('pc_builder.build_saved', $saved, null, ['name' => $saved->name, 'total' => $totalPrice]);

        return redirect()->back()->with('success', "PC Build '{$saved->name}' saved to your account!");
    }

    /**
     * Load a saved build into the current PC builder session.
     */
    public function loadBuild(Request $request, SavedPcBuild $savedBuild)
    {
        if ($savedBuild->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to saved build.');
        }

        session()->put('pc_build', $savedBuild->components);

        return redirect()->route('pcBuilder.index')->with('success', "PC Build '{$savedBuild->name}' loaded successfully!");
    }

    /**
     * Delete a saved PC build.
     */
    public function deleteBuild(Request $request, SavedPcBuild $savedBuild)
    {
        if ($savedBuild->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $name = $savedBuild->name;
        $savedBuild->delete();

        return redirect()->back()->with('success', "PC Build '{$name}' deleted.");
    }

    /**
     * View user's saved PC builds in Account area.
     */
    public function savedBuilds(Request $request)
    {
        $builds = SavedPcBuild::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedBuilds = $builds->map(function ($b) {
            $componentCount = count(array_filter($b->components ?? []));
            return [
                'id' => $b->id,
                'name' => $b->name,
                'total_price' => (float)$b->total_price,
                'estimated_wattage' => $b->estimated_wattage,
                'component_count' => $componentCount,
                'created_at' => $b->created_at->format('d M Y, h:i A'),
            ];
        });

        return Inertia::render('Account/SavedPcBuilds', [
            'builds' => $formattedBuilds,
        ]);
    }
}
