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

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_sales' => $analytics['kpis']['gross_revenue']['current'],
                'total_orders' => $analytics['kpis']['total_orders']['current'],
                'total_products' => $analytics['catalog']['total_products'],
                'out_of_stock' => $analytics['catalog']['out_of_stock'],
            ],
            'analytics' => $analytics,
            'recentOrders' => $analytics['recent_orders'],
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
            'items.product',
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

            return back()->with('success', 'Order status updated to ' . $newStatus);
        });
    }
}
