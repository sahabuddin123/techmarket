<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderHistory;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Models\Payment;
use App\Models\Refund;
use App\Services\InventoryService;
use App\Services\AuditLogger;
use App\Services\AnalyticsService;
use App\Services\AnalyticsCacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $period = $request->input('period', 'last_30_days');
        $analytics = AnalyticsService::getDashboardMetrics($period);

        // Order Status Distribution for Donut Chart
        $orderStatusCounts = Order::select('status', DB::raw('COUNT(id) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($row) {
                $statusColors = [
                    'Delivered' => '#10b981',
                    'Processing' => '#f59e0b',
                    'Pending' => '#3b82f6',
                    'Cancelled' => '#ef4444',
                    'Shipped' => '#6366f1',
                    'Packed' => '#8b5cf6',
                    'Confirmed' => '#06b6d4',
                ];

                return [
                    'label' => $row->status ?: 'Pending',
                    'value' => (int) $row->count,
                    'color' => $statusColors[$row->status] ?? '#94a3b8',
                ];
            });

        // Top Selling Hardware Products
        $topSelling = OrderItem::select(
            'order_items.product_id',
            'order_items.product_name',
            DB::raw('SUM(order_items.quantity) as sold'),
            DB::raw('SUM(order_items.total) as revenue')
        )
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->where('orders.status', '!=', 'Cancelled')
        ->groupBy('order_items.product_id', 'order_items.product_name')
        ->orderByDesc('sold')
        ->take(4)
        ->get();

        $productIds = $topSelling->pluck('product_id')->filter()->unique();
        $catalogProducts = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $topSellingFormatted = $topSelling->map(function ($item) use ($catalogProducts) {
            $p = $item->product_id ? $catalogProducts->get($item->product_id) : null;
            return [
                'id' => $item->product_id,
                'title' => $p ? $p->title : $item->product_name,
                'sku' => $p ? $p->sku : 'N/A',
                'sold' => (int) $item->sold,
                'revenue' => (float) $item->revenue,
                'image' => $p ? $p->image : null,
            ];
        });

        // Low Stock Alert Queue
        $lowStockItems = Product::where('stock', '<=', 10)
            ->where('stock', '>', 0)
            ->orderBy('stock', 'asc')
            ->take(4)
            ->get(['id', 'title', 'sku', 'stock', 'price', 'image']);

        // CCTV Solutions Overview
        $cctvOverview = [
            'total_projects' => class_exists(\App\Models\Cctv\CctvProject::class) ? \App\Models\Cctv\CctvProject::count() : 0,
            'active_projects' => class_exists(\App\Models\Cctv\CctvProject::class) ? \App\Models\Cctv\CctvProject::whereIn('status', ['in_progress', 'scheduled', 'planning', 'active'])->count() : 0,
            'completed_projects' => class_exists(\App\Models\Cctv\CctvProject::class) ? \App\Models\Cctv\CctvProject::where('status', 'completed')->count() : 0,
            'total_cameras_installed' => class_exists(\App\Models\Cctv\CctvInstalledEquipment::class) ? \App\Models\Cctv\CctvInstalledEquipment::where('device_type', 'camera')->count() : 0,
            'total_sites' => class_exists(\App\Models\Cctv\CctvProjectSite::class) ? \App\Models\Cctv\CctvProjectSite::count() : 0,
        ];

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_sales' => $analytics['kpis']['gross_revenue']['current'],
                'total_orders' => $analytics['kpis']['total_orders']['current'],
                'total_products' => $analytics['catalog']['total_products'],
                'out_of_stock' => $analytics['catalog']['out_of_stock'],
                'total_customers' => $analytics['catalog']['total_customers'],
            ],
            'analytics' => $analytics,
            'recentOrders' => $analytics['recent_orders'],
            'orderStatusDistribution' => $orderStatusCounts,
            'topSellingProducts' => $topSellingFormatted,
            'lowStockItems' => $lowStockItems,
            'cctvOverview' => $cctvOverview,
        ]);
    }

    public function products(Request $request)
    {
        $query = Product::with(['category', 'brand']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('seo_title', 'like', "%{$search}%")
                  ->orWhere('focus_keyword', 'like', "%{$search}%");
            });
        }

        if ($request->filled('seo_health')) {
            $health = $request->input('seo_health');
            if ($health === 'good') {
                $query->where('seo_score', '>=', 80);
            } elseif ($health === 'needs_attention') {
                $query->where('seo_score', '>=', 50)->where('seo_score', '<', 80);
            } elseif ($health === 'poor') {
                $query->where('seo_score', '<', 50)->whereNotNull('seo_title');
            } elseif ($health === 'missing') {
                $query->whereNull('seo_title')->whereNull('meta_title');
            }
        }

        $products = $query->latest()->paginate(12)->withQueryString();
        $categories = Category::all();
        $brands = Brand::all();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => $request->only(['search', 'seo_health']),
        ]);
    }

    public function createProduct()
    {
        return Inertia::render('Admin/Products/Form', [
            'categories' => Category::orderBy('name')->get(),
            'brands' => Brand::orderBy('name')->get(),
            'specGroups' => \App\Models\SpecificationGroup::with('attributes')->orderBy('sort_order')->get(),
            'componentTypes' => [
                'processor' => 'Processor / CPU',
                'motherboard' => 'Motherboard',
                'ram' => 'RAM (Memory)',
                'storage' => 'Storage (SSD / HDD)',
                'graphics-card' => 'Graphics Card (GPU)',
                'power-supply' => 'Power Supply (PSU)',
                'cpu-cooler' => 'CPU Cooler',
                'casing' => 'Casing (Chassis)',
                'monitor' => 'Monitor Display',
                'case-fan' => 'Casing Fan / Cooling',
                'ups' => 'UPS / Power Backup',
                'software' => 'Operating System / Software',
                'mouse' => 'Gaming Mouse',
                'keyboard' => 'Mechanical Keyboard',
                'headphone' => 'Headphone / Audio',
            ],
            'product' => null,
        ]);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'regular_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_deal_of_day' => 'boolean',
            'is_active' => 'boolean',
            'component_type' => 'nullable|string',
            'key_specs' => 'nullable',
            'full_specs' => 'nullable',
            'pc_builder_specs' => 'nullable|array',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'warranty' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'focus_keyword' => 'nullable|string|max:100',
            'canonical_url' => 'nullable|url|max:255',
            'meta_robots' => 'nullable|string|max:50',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string|max:500',
            'og_image' => 'nullable|string',
            'twitter_title' => 'nullable|string|max:255',
            'twitter_description' => 'nullable|string|max:500',
            'twitter_image' => 'nullable|string',
            'is_indexable' => 'boolean',
            'specification_values' => 'nullable|array',
        ]);

        // Normalize warranty: trim string, or set to null if empty
        $warrantyInput = isset($validated['warranty']) ? trim((string)$validated['warranty']) : '';
        $validated['warranty'] = $warrantyInput !== '' ? $warrantyInput : null;

        // Clean SEO-friendly collision-safe slug
        $validated['slug'] = \App\Services\ProductSeoService::generateUniqueSlug(
            $validated['title'],
            null,
            $request->input('seo_slug')
        );

        if (empty($validated['image'])) {
            $validated['image'] = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop';
        }

        $specValues = $request->input('specification_values', []);
        unset($validated['specification_values']);

        $initialStock = $validated['stock'];
        $validated['stock'] = 0; // Will be set via InventoryService

        $product = new Product($validated);
        $seoCheck = \App\Services\ProductSeoService::calculateSeoScore($product);
        $product->seo_score = $seoCheck['score'];
        $product->seo_last_updated_at = now();
        $product->save();

        // Save relational specifications
        if (is_array($specValues)) {
            foreach ($specValues as $attrId => $val) {
                if (trim((string)$val) !== '') {
                    \App\Models\ProductSpecificationValue::updateOrCreate(
                        ['product_id' => $product->id, 'specification_attribute_id' => $attrId],
                        ['value' => trim((string)$val)]
                    );
                }
            }
        }

        if ($initialStock > 0) {
            InventoryService::adjustStock(
                productId: $product->id,
                quantityChange: $initialStock,
                type: 'purchase',
                userId: auth()->id(),
                notes: 'Initial inventory stock upon product creation.'
            );
        }

        AuditLogger::log('product.created', $product, null, $validated);
        AnalyticsCacheService::invalidateProducts();
        AnalyticsCacheService::invalidateInventory();

        return redirect()->route('admin.products')->with('success', 'Product created with complete SEO foundation!');
    }

    public function showProduct(Product $product)
    {
        $product->load([
            'category', 
            'brand', 
            'specificationValues.attribute.group', 
            'reviews.user',
            'questions.user',
        ]);

        $inventoryLedger = \App\Models\InventoryTransaction::where('product_id', $product->id)
            ->latest()
            ->take(15)
            ->get();

        $salesSummary = [
            'total_units_sold' => (int) OrderItem::where('product_id', $product->id)->sum('quantity'),
            'total_revenue' => (float) OrderItem::where('product_id', $product->id)->sum('total'),
            'orders_count' => OrderItem::where('product_id', $product->id)->distinct('order_id')->count('order_id'),
        ];

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
            'inventoryLedger' => $inventoryLedger,
            'salesSummary' => $salesSummary,
        ]);
    }

    public function editProduct(Product $product)
    {
        $product->load(['category', 'brand', 'specificationValues.attribute', 'slugRedirects']);

        return Inertia::render('Admin/Products/Form', [
            'categories' => Category::orderBy('name')->get(),
            'brands' => Brand::orderBy('name')->get(),
            'specGroups' => \App\Models\SpecificationGroup::with('attributes')->orderBy('sort_order')->get(),
            'componentTypes' => [
                'processor' => 'Processor / CPU',
                'motherboard' => 'Motherboard',
                'ram' => 'RAM (Memory)',
                'storage' => 'Storage (SSD / HDD)',
                'graphics-card' => 'Graphics Card (GPU)',
                'power-supply' => 'Power Supply (PSU)',
                'cpu-cooler' => 'CPU Cooler',
                'casing' => 'Casing (Chassis)',
                'monitor' => 'Monitor Display',
                'case-fan' => 'Casing Fan / Cooling',
                'ups' => 'UPS / Power Backup',
                'software' => 'Operating System / Software',
                'mouse' => 'Gaming Mouse',
                'keyboard' => 'Mechanical Keyboard',
                'headphone' => 'Headphone / Audio',
            ],
            'product' => $product,
        ]);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'regular_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_deal_of_day' => 'boolean',
            'is_active' => 'boolean',
            'component_type' => 'nullable|string',
            'key_specs' => 'nullable',
            'full_specs' => 'nullable',
            'pc_builder_specs' => 'nullable|array',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'warranty' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'focus_keyword' => 'nullable|string|max:100',
            'canonical_url' => 'nullable|url|max:255',
            'meta_robots' => 'nullable|string|max:50',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string|max:500',
            'og_image' => 'nullable|string',
            'twitter_title' => 'nullable|string|max:255',
            'twitter_description' => 'nullable|string|max:500',
            'twitter_image' => 'nullable|string',
            'is_indexable' => 'boolean',
            'specification_values' => 'nullable|array',
        ]);

        $oldValues = $product->toArray();

        // Normalize warranty: trim string, or set to null if empty
        $warrantyInput = isset($validated['warranty']) ? trim((string)$validated['warranty']) : '';
        $validated['warranty'] = $warrantyInput !== '' ? $warrantyInput : null;

        // Check for slug changes and maintain 301 redirect map
        $targetSlug = $request->input('seo_slug') ?: $validated['title'];
        $newSlug = \App\Services\ProductSeoService::generateUniqueSlug(
            $validated['title'],
            $product->id,
            $request->input('seo_slug')
        );

        if ($product->slug !== $newSlug) {
            \App\Services\ProductSeoService::handleSlugChange($product, $newSlug);
            $validated['slug'] = $newSlug;
        }

        $targetStock = $validated['stock'];
        unset($validated['stock']); // Manage stock adjustment via InventoryService

        $specValues = $request->input('specification_values', []);
        unset($validated['specification_values']);

        $product->fill($validated);
        $seoCheck = \App\Services\ProductSeoService::calculateSeoScore($product);
        $product->seo_score = $seoCheck['score'];
        $product->seo_last_updated_at = now();
        $product->save();

        // Update relational specifications
        if (is_array($specValues)) {
            foreach ($specValues as $attrId => $val) {
                if (trim((string)$val) !== '') {
                    \App\Models\ProductSpecificationValue::updateOrCreate(
                        ['product_id' => $product->id, 'specification_attribute_id' => $attrId],
                        ['value' => trim((string)$val)]
                    );
                } else {
                    \App\Models\ProductSpecificationValue::where('product_id', $product->id)
                        ->where('specification_attribute_id', $attrId)
                        ->delete();
                }
            }
        }

        $stockDiff = $targetStock - $product->stock;
        if ($stockDiff !== 0) {
            InventoryService::adjustStock(
                productId: $product->id,
                quantityChange: $stockDiff,
                type: 'adjustment',
                userId: auth()->id(),
                notes: 'Manual inventory adjustment via Admin Panel.'
            );
        }

        AuditLogger::log('product.updated', $product, $oldValues, $product->fresh()->toArray());
        AnalyticsCacheService::invalidateProducts();
        AnalyticsCacheService::invalidateInventory();

        return redirect()->route('admin.products')->with('success', 'Product updated successfully!');
    }

    public function bulkSeoActions(Request $request)
    {
        $action = $request->input('action');
        $productIds = $request->input('product_ids', []);

        $query = Product::with(['brand', 'category']);
        if (!empty($productIds)) {
            $query->whereIn('id', $productIds);
        }
        $products = $query->get();

        $count = 0;
        foreach ($products as $prod) {
            if ($action === 'generate_missing_meta') {
                if (empty($prod->seo_title) && empty($prod->meta_title)) {
                    $auto = \App\Services\ProductSeoService::autoGenerateSeoMetadata(
                        $prod->title,
                        $prod->brand?->name,
                        $prod->category?->name,
                        is_array($prod->key_specs) ? $prod->key_specs : []
                    );
                    $prod->seo_title = $auto['seo_title'];
                    $prod->meta_description = $auto['meta_description'];
                    $prod->focus_keyword = $auto['focus_keyword'];
                    $seoCheck = \App\Services\ProductSeoService::calculateSeoScore($prod);
                    $prod->seo_score = $seoCheck['score'];
                    $prod->seo_last_updated_at = now();
                    $prod->save();
                    $count++;
                }
            } elseif ($action === 'regenerate_slugs') {
                $newSlug = \App\Services\ProductSeoService::generateUniqueSlug($prod->title, $prod->id);
                if ($prod->slug !== $newSlug) {
                    \App\Services\ProductSeoService::handleSlugChange($prod, $newSlug);
                    $prod->slug = $newSlug;
                    $prod->save();
                    $count++;
                }
            } elseif ($action === 'set_indexable') {
                $prod->is_indexable = true;
                $prod->meta_robots = 'index, follow';
                $prod->save();
                $count++;
            } elseif ($action === 'set_noindex') {
                $prod->is_indexable = false;
                $prod->meta_robots = 'noindex, nofollow';
                $prod->save();
                $count++;
            }
        }

        AnalyticsCacheService::invalidateProducts();

        return back()->with('success', "Bulk SEO operation ({$action}) executed for {$count} products.");
    }

    public function bulkPriceUpdate(Request $request)
    {
        $user = $request->user();
        if (!$user || (!$user->hasRole('Super Admin') && !$user->hasRole('Admin') && !$user->hasPermission('products.update'))) {
            return response()->json(['message' => 'Unauthorized to perform bulk price updates.'], 403);
        }

        $rawUpdates = $request->input('updates', $request->all());
        if (!is_array($rawUpdates) || empty($rawUpdates)) {
            return response()->json(['message' => 'No price updates provided.'], 422);
        }

        $validator = \Illuminate\Support\Facades\Validator::make(['updates' => $rawUpdates], [
            'updates' => 'required|array|min:1',
            'updates.*.product_id' => 'required|integer|exists:products,id',
            'updates.*.regular_price' => 'nullable|numeric|min:0',
            'updates.*.selling_price' => 'required|numeric|min:0',
        ], [
            'updates.*.product_id.exists' => 'The selected product does not exist.',
            'updates.*.selling_price.required' => 'Selling price is required.',
            'updates.*.selling_price.min' => 'Selling price cannot be negative.',
            'updates.*.regular_price.min' => 'Regular price cannot be negative.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated()['updates'];

        // Business Rule validation: selling_price <= regular_price (when regular_price > 0)
        $productIds = array_column($validated, 'product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $errors = [];
        foreach ($validated as $index => $item) {
            $product = $products->get($item['product_id']);
            if (!$product) continue;

            $regularPrice = isset($item['regular_price']) && $item['regular_price'] !== '' && $item['regular_price'] !== null 
                ? (float)$item['regular_price'] 
                : (float)($product->regular_price ?? 0);
            $sellingPrice = (float)$item['selling_price'];

            if ($regularPrice > 0 && $sellingPrice > $regularPrice) {
                $errors["updates.{$index}.selling_price"] = [
                    "Selling price (৳{$sellingPrice}) cannot exceed regular price (৳{$regularPrice}) for product: {$product->title}"
                ];
            }
        }

        if (!empty($errors)) {
            return response()->json([
                'message' => reset($errors)[0],
                'errors' => $errors,
            ], 422);
        }

        $updatedProducts = [];
        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $products, &$updatedProducts) {
            foreach ($validated as $item) {
                $product = $products->get($item['product_id']);
                if (!$product) continue;

                $oldPrices = [
                    'price' => (float)$product->price,
                    'regular_price' => (float)($product->regular_price ?? $product->price),
                ];

                $product->price = (float)$item['selling_price'];
                if (array_key_exists('regular_price', $item) && $item['regular_price'] !== null && $item['regular_price'] !== '') {
                    $product->regular_price = (float)$item['regular_price'];
                }
                $product->save();

                AuditLogger::log('products.bulk_price_updated', $product, $oldPrices, [
                    'price' => (float)$product->price,
                    'regular_price' => (float)$product->regular_price,
                ]);

                $updatedProducts[] = [
                    'id' => $product->id,
                    'price' => (float)$product->price,
                    'regular_price' => (float)$product->regular_price,
                    'title' => $product->title,
                    'sku' => $product->sku,
                ];
            }
        });

        AnalyticsCacheService::invalidateProducts();

        return response()->json([
            'success' => true,
            'message' => count($updatedProducts) . ' product ' . (count($updatedProducts) === 1 ? 'price' : 'prices') . ' updated successfully.',
            'updated_count' => count($updatedProducts),
            'updated_products' => $updatedProducts,
        ]);
    }

    public function deleteProduct(Product $product)
    {
        AuditLogger::log('product.deleted', $product, $product->toArray(), null);
        $product->delete();
        AnalyticsCacheService::invalidateProducts();
        AnalyticsCacheService::invalidateInventory();
        return redirect()->route('admin.products')->with('success', 'Product deleted.');
    }

    public function orders(Request $request)
    {
        $query = Order::with(['items', 'histories']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function showOrder(Order $order)
    {
        // Automatically perform / refresh fraud check if missing
        if (!$order->fraud_check_id && !$order->fraudCheck) {
            \App\Services\Fraud\FraudDetectionService::analyzeOrder($order);
            $order->refresh();
        }

        $order->load([
            'items.product.brand',
            'items.product.category',
            'histories.user',
            'user',
            'shipments.statusHistories.user',
            'fraudCheck.signals',
            'fraudCheck.logs.user',
            'fraudCheck.reviewer',
        ]);

        $payments = Payment::where('order_id', $order->id)->get();
        $refunds = Refund::where('order_id', $order->id)->get();

        $courierManager = app(\App\Services\Courier\CourierManager::class);
        $availableCouriers = $courierManager->getAvailableProviders();

        $pathaoStores = $courierManager->driver('pathao')->getStores();
        $pathaoCities = $courierManager->driver('pathao')->getCities();

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'histories' => $order->histories,
            'payments' => $payments,
            'refunds' => $refunds,
            'shipments' => $order->shipments,
            'fraudCheck' => $order->fraudCheck,
            'availableCouriers' => $availableCouriers,
            'pathaoStores' => $pathaoStores,
            'pathaoCities' => $pathaoCities,
        ]);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Confirmed,Processing,Packed,Shipped,Delivered,Cancelled',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return back();
        }

        $notes = $request->input('notes') ?: "Order status updated from {$oldStatus} to {$newStatus} by Admin.";

        return DB::transaction(function () use ($order, $oldStatus, $newStatus, $notes) {
            $order->update(['status' => $newStatus]);

            // Create Order History Timeline Note
            OrderHistory::create([
                'order_id' => $order->id,
                'status' => $newStatus,
                'notes' => $notes,
                'created_by' => auth()->id(),
            ]);

            // If order cancelled, release reserved inventory
            if ($newStatus === 'Cancelled' && $oldStatus !== 'Cancelled') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        InventoryService::releaseStock($item->product_id, $item->quantity, $order->id);
                    }
                }
            }

            AuditLogger::log('order.status_updated', $order, ['status' => $oldStatus], ['status' => $newStatus]);
            AnalyticsCacheService::invalidateSales();
            AnalyticsCacheService::invalidateOperations();

            // Dispatch event SMS on status transition
            $smsEventMap = [
                'Confirmed' => 'order.confirmed',
                'Processing' => 'order.processing',
                'Shipped' => 'order.shipped',
                'Delivered' => 'order.delivered',
                'Cancelled' => 'order.cancelled',
            ];

            if (isset($smsEventMap[$newStatus])) {
                \App\Services\Sms\SmsNotificationService::sendEvent(
                    $smsEventMap[$newStatus],
                    [],
                    $order->customer_phone,
                    $order->id,
                    $order->user_id
                );
            }

            if ($newStatus === 'Cancelled') {
                try {
                    app(\App\Services\Notification\NotificationManager::class)->dispatch('order.cancelled', ['order' => $order]);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to dispatch order cancelled notification: ' . $e->getMessage());
                }
            }

            return back()->with('success', 'Order status updated to ' . $newStatus);
        });
    }
}
