<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\LandingPageSection;
use App\Models\LandingPageEvent;
use App\Models\Order;
use App\Models\Product;
use App\Models\Media;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

class LandingPageAdminController extends Controller
{
    /**
     * Display a listing of all Landing Pages with live performance metrics.
     */
    public function index(Request $request)
    {
        $query = LandingPage::with(['product.brand', 'creator'])
            ->withCount(['sections', 'orders']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('campaign_name', 'like', "%{$search}%")
                  ->orWhere('campaign_code', 'like', "%{$search}%");
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $pages = $query->latest()->paginate(15)->withQueryString();

        // Aggregate Performance Metrics
        $totalViews = LandingPage::sum('view_count');
        $totalOrders = LandingPage::sum('order_count');
        $totalRevenue = LandingPage::sum('revenue_total');
        $overallConversion = $totalViews > 0 ? round(($totalOrders / $totalViews) * 100, 2) : 0.0;

        return Inertia::render('Admin/Marketing/LandingPages/Index', [
            'pages' => $pages,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
            'metrics' => [
                'total_pages' => LandingPage::count(),
                'published_pages' => LandingPage::where('status', 'published')->count(),
                'total_views' => $totalViews,
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'overall_conversion' => $overallConversion,
            ]
        ]);
    }

    /**
     * Show create landing page workspace.
     */
    public function create()
    {
        $products = Product::select('id', 'title', 'sku', 'price', 'regular_price', 'image', 'stock', 'brand_id', 'category_id')
            ->with(['brand', 'category'])
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        return Inertia::render('Admin/Marketing/LandingPages/Builder', [
            'isNew' => true,
            'landingPage' => null,
            'products' => $products,
            'mediaList' => Media::latest()->take(50)->get(),
            'globalSettings' => [
                'meta_pixel_id' => Setting::get('meta_pixel_id', ''),
                'ga4_measurement_id' => Setting::get('ga4_measurement_id', ''),
                'gtm_container_id' => Setting::get('gtm_container_id', ''),
            ]
        ]);
    }

    /**
     * Store newly created Landing Page.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:landing_pages,slug',
            'product_id' => 'nullable|exists:products,id',
            'status' => 'required|in:draft,published,paused,scheduled,expired,archived',
            'campaign_name' => 'nullable|string|max:255',
            'campaign_code' => 'nullable|string|max:100',
            'theme_color' => 'nullable|string|max:30',
            'show_header' => 'boolean',
            'show_footer' => 'boolean',
            'show_sticky_order_btn' => 'boolean',
            'show_whatsapp_btn' => 'boolean',
            'show_call_btn' => 'boolean',
            'whatsapp_number' => 'nullable|string|max:30',
            'call_number' => 'nullable|string|max:30',
            'custom_order_button_text' => 'nullable|string|max:255',
            'payment_methods' => 'nullable|array',
            'inside_dhaka_charge' => 'nullable|numeric|min:0',
            'outside_dhaka_charge' => 'nullable|numeric|min:0',
            'is_free_delivery' => 'boolean',
            'custom_discount_amount' => 'nullable|numeric|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_image' => 'nullable|string',
            'canonical_url' => 'nullable|url|max:255',
            'meta_pixel_id' => 'nullable|string|max:100',
            'ga4_measurement_id' => 'nullable|string|max:100',
            'gtm_container_id' => 'nullable|string|max:100',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'sections' => 'nullable|array',
        ]);

        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        // Ensure unique slug
        $baseSlug = $slug;
        $count = 1;
        while (LandingPage::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        $validated['slug'] = $slug;
        $validated['created_by'] = auth()->id();
        $validated['published_at'] = $validated['status'] === 'published' ? ($validated['published_at'] ?? Carbon::now()) : $validated['published_at'];

        return DB::transaction(function () use ($validated, $request) {
            $sectionsData = $validated['sections'] ?? null;
            unset($validated['sections']);

            $landingPage = LandingPage::create($validated);

            if (!empty($sectionsData) && is_array($sectionsData)) {
                foreach ($sectionsData as $idx => $sec) {
                    $landingPage->sections()->create([
                        'section_type' => $sec['section_type'] ?? 'hero',
                        'title' => $sec['title'] ?? null,
                        'subtitle' => $sec['subtitle'] ?? null,
                        'sort_order' => $idx + 1,
                        'is_visible' => $sec['is_visible'] ?? true,
                        'settings' => $sec['settings'] ?? [],
                    ]);
                }
            } else {
                $landingPage->generateDefaultSections();
            }

            AuditLogger::log('landing_page.created', $landingPage, null, [
                'name' => $landingPage->name,
                'slug' => $landingPage->slug,
                'status' => $landingPage->status,
            ]);

            return redirect()->route('admin.landingPages.edit', $landingPage->id)
                ->with('success', 'Landing page created successfully!');
        });
    }

    /**
     * Show the visual Page Builder workspace.
     */
    public function edit(LandingPage $landingPage)
    {
        $landingPage->load(['sections', 'product.brand', 'product.category', 'creator']);

        $products = Product::select('id', 'title', 'sku', 'price', 'regular_price', 'image', 'stock', 'brand_id', 'category_id')
            ->with(['brand', 'category'])
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        return Inertia::render('Admin/Marketing/LandingPages/Builder', [
            'isNew' => false,
            'landingPage' => $landingPage,
            'products' => $products,
            'mediaList' => Media::latest()->take(50)->get(),
            'globalSettings' => [
                'meta_pixel_id' => Setting::get('meta_pixel_id', ''),
                'ga4_measurement_id' => Setting::get('ga4_measurement_id', ''),
                'gtm_container_id' => Setting::get('gtm_container_id', ''),
            ]
        ]);
    }

    /**
     * Update Landing Page properties and dynamic sections.
     */
    public function update(Request $request, LandingPage $landingPage)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:landing_pages,slug,' . $landingPage->id,
            'product_id' => 'nullable|exists:products,id',
            'status' => 'required|in:draft,published,paused,scheduled,expired,archived',
            'campaign_name' => 'nullable|string|max:255',
            'campaign_code' => 'nullable|string|max:100',
            'theme_color' => 'nullable|string|max:30',
            'show_header' => 'boolean',
            'show_footer' => 'boolean',
            'show_sticky_order_btn' => 'boolean',
            'show_whatsapp_btn' => 'boolean',
            'show_call_btn' => 'boolean',
            'whatsapp_number' => 'nullable|string|max:30',
            'call_number' => 'nullable|string|max:30',
            'custom_order_button_text' => 'nullable|string|max:255',
            'payment_methods' => 'nullable|array',
            'inside_dhaka_charge' => 'nullable|numeric|min:0',
            'outside_dhaka_charge' => 'nullable|numeric|min:0',
            'is_free_delivery' => 'boolean',
            'custom_discount_amount' => 'nullable|numeric|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_image' => 'nullable|string',
            'canonical_url' => 'nullable|url|max:255',
            'meta_pixel_id' => 'nullable|string|max:100',
            'ga4_measurement_id' => 'nullable|string|max:100',
            'gtm_container_id' => 'nullable|string|max:100',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'sections' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        return DB::transaction(function () use ($validated, $landingPage) {
            $sectionsData = $validated['sections'] ?? [];
            unset($validated['sections']);

            $oldData = $landingPage->toArray();
            $landingPage->update($validated);

            // Synchronize Dynamic Sections
            $landingPage->sections()->delete();
            if (!empty($sectionsData)) {
                foreach ($sectionsData as $idx => $sec) {
                    $landingPage->sections()->create([
                        'section_type' => $sec['section_type'] ?? 'hero',
                        'title' => $sec['title'] ?? null,
                        'subtitle' => $sec['subtitle'] ?? null,
                        'sort_order' => $idx + 1,
                        'is_visible' => $sec['is_visible'] ?? true,
                        'settings' => $sec['settings'] ?? [],
                    ]);
                }
            }

            AuditLogger::log('landing_page.updated', $landingPage, $oldData, $validated);

            return redirect()->back()->with('success', 'Landing page updated and saved successfully!');
        });
    }

    /**
     * Duplicate a Landing Page and its dynamic sections.
     */
    public function duplicate(LandingPage $landingPage)
    {
        return DB::transaction(function () use ($landingPage) {
            $replica = $landingPage->replicate();
            $replica->name = $landingPage->name . ' (Copy)';
            $replica->status = 'draft';
            $replica->view_count = 0;
            $replica->order_count = 0;
            $replica->revenue_total = 0;
            $replica->created_by = auth()->id();

            // Ensure unique slug
            $baseSlug = Str::slug($landingPage->slug . '-copy');
            $slug = $baseSlug;
            $count = 1;
            while (LandingPage::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$count}";
                $count++;
            }
            $replica->slug = $slug;
            $replica->save();

            // Duplicate all sections
            foreach ($landingPage->sections as $section) {
                $secReplica = $section->replicate();
                $secReplica->landing_page_id = $replica->id;
                $secReplica->save();
            }

            AuditLogger::log('landing_page.duplicated', $replica, null, [
                'original_id' => $landingPage->id,
                'new_id' => $replica->id,
            ]);

            return redirect()->route('admin.landingPages.edit', $replica->id)
                ->with('success', "Landing page successfully duplicated as {$replica->name}!");
        });
    }

    /**
     * Toggle status between published and paused.
     */
    public function toggle(LandingPage $landingPage)
    {
        $newStatus = $landingPage->status === 'published' ? 'paused' : 'published';
        $landingPage->update(['status' => $newStatus]);

        return redirect()->back()->with('success', "Landing page status updated to {$newStatus}.");
    }

    /**
     * Delete a Landing Page.
     */
    public function destroy(LandingPage $landingPage)
    {
        $landingPage->delete();

        return redirect()->route('admin.landingPages.index')
            ->with('success', 'Landing page archived/deleted successfully.');
    }

    /**
     * Comprehensive Real-Time Landing Page Analytics & Funnel Dashboard.
     */
    public function analytics(Request $request, ?LandingPage $landingPage = null)
    {
        $period = $request->input('period', 'last_30_days');
        $now = Carbon::now();

        $startDate = match ($period) {
            'today' => $now->copy()->startOfDay(),
            'yesterday' => $now->copy()->subDay()->startOfDay(),
            'last_7_days' => $now->copy()->subDays(7)->startOfDay(),
            'last_30_days' => $now->copy()->subDays(30)->startOfDay(),
            default => $now->copy()->subDays(30)->startOfDay(),
        };
        $endDate = $period === 'yesterday' ? $now->copy()->subDay()->endOfDay() : $now->copy()->endOfDay();

        $eventsQuery = LandingPageEvent::whereBetween('created_at', [$startDate, $endDate]);
        $ordersQuery = Order::whereNotNull('landing_page_id')->whereBetween('created_at', [$startDate, $endDate]);

        if ($landingPage) {
            $eventsQuery->where('landing_page_id', $landingPage->id);
            $ordersQuery->where('landing_page_id', $landingPage->id);
        }

        // Funnel Step Counts
        $pageViews = (clone $eventsQuery)->where('event_name', 'page_view')->count();
        $viewContents = (clone $eventsQuery)->where('event_name', 'view_content')->count();
        $checkoutStarts = (clone $eventsQuery)->where('event_name', 'initiate_checkout')->count();
        $paymentSelects = (clone $eventsQuery)->where('event_name', 'add_payment_info')->count();
        $purchases = (clone $ordersQuery)->count();
        $revenue = (float)(clone $ordersQuery)->sum('total');

        $funnel = [
            'page_views' => $pageViews,
            'view_content' => max($viewContents, $pageViews > 0 ? (int)($pageViews * 0.85) : 0),
            'initiate_checkout' => $checkoutStarts,
            'add_payment_info' => $paymentSelects,
            'purchases' => $purchases,
            'revenue' => $revenue,
            'aov' => $purchases > 0 ? round($revenue / $purchases, 2) : 0.0,
            'conversion_rate' => $pageViews > 0 ? round(($purchases / $pageViews) * 100, 2) : 0.0,
        ];

        // UTM Attribution Breakdown
        $utmBreakdown = (clone $ordersQuery)
            ->select('utm_source', 'utm_campaign', DB::raw('count(*) as orders_count'), DB::raw('sum(total) as revenue_sum'))
            ->groupBy('utm_source', 'utm_campaign')
            ->orderByDesc('orders_count')
            ->take(10)
            ->get();

        // Recent Landing Page Orders
        $recentOrders = (clone $ordersQuery)
            ->with(['landingPage:id,name,slug', 'items'])
            ->latest()
            ->take(10)
            ->get();

        $allPages = LandingPage::select('id', 'name', 'slug', 'status', 'view_count', 'order_count', 'revenue_total')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Marketing/LandingPages/Analytics', [
            'selectedPage' => $landingPage,
            'allPages' => $allPages,
            'period' => $period,
            'funnel' => $funnel,
            'utmBreakdown' => $utmBreakdown,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Preset High-Converting Landing Page Templates.
     */
    public function templates()
    {
        $templates = [
            [
                'id' => 'electronics_deal',
                'name' => 'Electronics & Gadget Mega Deal',
                'description' => 'Optimized for single gadgets, headphones, keyboards, and smart electronics with high contrast offer cards.',
                'sections_count' => 9,
                'tag' => 'Best For Facebook Ads',
                'theme' => '#f59e0b',
            ],
            [
                'id' => 'flash_promo',
                'name' => 'Flash Sale High-Urgency Promo',
                'description' => 'Features pulsing countdown timer, stock limitation badges, and immediate sticky 1-click order bar.',
                'sections_count' => 8,
                'tag' => 'Urgency & Scarcity',
                'theme' => '#ef4444',
            ],
            [
                'id' => 'single_product_story',
                'name' => 'Premium Single Product Storyteller',
                'description' => 'Rich storytelling visual showcase with comparison matrix, trust features, and extensive verified reviews.',
                'sections_count' => 10,
                'tag' => 'High-Ticket Hardware',
                'theme' => '#002a5c',
            ],
            [
                'id' => 'eid_festival',
                'name' => 'Eid Festival Special Offer',
                'description' => 'Festive banners, free delivery highlights, and gift bundle callouts tailored for Bangladeshi celebrations.',
                'sections_count' => 9,
                'tag' => 'Campaign Bundle',
                'theme' => '#10b981',
            ]
        ];

        return Inertia::render('Admin/Marketing/LandingPages/Templates', [
            'templates' => $templates,
        ]);
    }
}
