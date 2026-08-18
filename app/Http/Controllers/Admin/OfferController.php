<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Product;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OfferController extends Controller
{
    private function authorizeAdmin()
    {
        $user = auth()->user();
        if (!$user || ($user->role !== 'admin' && !$user->hasPermission('homepage.manage') && !$user->hasPermission('settings.manage') && !$user->hasPermission('offers.manage'))) {
            abort(403, 'Unauthorized access to offer management.');
        }
    }

    /**
     * Display a listing of offers in the Admin Panel.
     */
    public function index(Request $request)
    {
        $this->authorizeAdmin();

        $query = Offer::query()->withCount('products');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('headline', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('is_active') && $request->input('is_active') !== 'all') {
            $query->where('is_active', $request->input('is_active') === '1');
        }

        $offers = $query->orderBy('display_order', 'asc')->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Offers/Index', [
            'offers' => $offers,
            'filters' => $request->only(['search', 'status', 'is_active']),
        ]);
    }

    /**
     * Show the form for creating a new offer.
     */
    public function create()
    {
        $this->authorizeAdmin();

        $products = Product::select('id', 'title', 'price', 'image', 'sku', 'stock')->orderBy('title')->get();

        return Inertia::render('Admin/Offers/Form', [
            'offer' => null,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created offer in storage.
     */
    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:offers,slug',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string|max:1000',
            'mobile_banner_image' => 'nullable|string|max:1000',
            'thumbnail_image' => 'nullable|string|max:1000',
            'banner_file' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:5120',
            'mobile_banner_file' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:5120',
            'thumbnail_file' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:5120',
            'badge_text' => 'nullable|string|max:255',
            'headline' => 'nullable|string|max:255',
            'offer_validity_text' => 'nullable|string|max:255',
            'cta_button_text' => 'nullable|string|max:255',
            'cta_button_url' => 'nullable|string|max:500',
            'terms_and_conditions' => 'nullable|string',
            'perks' => 'nullable|array',
            'features' => 'nullable|array',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'status' => 'required|in:draft,scheduled,active,expired,disabled',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'display_order' => 'integer',
            'show_countdown' => 'boolean',
            'show_date_range' => 'boolean',
            'show_product_count' => 'boolean',
            'card_layout_style' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'product_badges' => 'nullable|array',
        ]);

        // Auto-generate slug if blank
        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $validated['slug'] = $slug;
        $validated['created_by'] = auth()->id();

        // Handle File Uploads via MediaService
        if ($request->hasFile('banner_file')) {
            $validated['banner_image'] = MediaService::uploadImage($request->file('banner_file'), 'offers');
        }
        if ($request->hasFile('mobile_banner_file')) {
            $validated['mobile_banner_image'] = MediaService::uploadImage($request->file('mobile_banner_file'), 'offers');
        }
        if ($request->hasFile('thumbnail_file')) {
            $validated['thumbnail_image'] = MediaService::uploadImage($request->file('thumbnail_file'), 'offers');
        }

        $offer = Offer::create($validated);

        // Attach selected products with optional order and badges
        if (!empty($validated['product_ids'])) {
            $syncData = [];
            foreach ($validated['product_ids'] as $idx => $prodId) {
                $badge = $validated['product_badges'][$prodId] ?? null;
                $syncData[$prodId] = [
                    'display_order' => $idx + 1,
                    'badge' => $badge,
                ];
            }
            $offer->products()->sync($syncData);
        }

        return redirect()->route('admin.offers.index')->with('success', "Offer campaign '{$offer->title}' created successfully!");
    }

    /**
     * Show the form for editing an offer.
     */
    public function edit(Offer $offer)
    {
        $this->authorizeAdmin();

        $offer->load(['products' => function ($q) {
            $q->select('products.id', 'products.title', 'products.price', 'products.image', 'products.sku', 'products.stock');
        }]);

        $products = Product::select('id', 'title', 'price', 'image', 'sku', 'stock')->orderBy('title')->get();

        return Inertia::render('Admin/Offers/Form', [
            'offer' => $offer,
            'products' => $products,
        ]);
    }

    /**
     * Update the specified offer in storage.
     */
    public function update(Request $request, Offer $offer)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => "required|string|max:255|unique:offers,slug,{$offer->id}",
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string|max:1000',
            'mobile_banner_image' => 'nullable|string|max:1000',
            'thumbnail_image' => 'nullable|string|max:1000',
            'banner_file' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:5120',
            'mobile_banner_file' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:5120',
            'thumbnail_file' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:5120',
            'badge_text' => 'nullable|string|max:255',
            'headline' => 'nullable|string|max:255',
            'offer_validity_text' => 'nullable|string|max:255',
            'cta_button_text' => 'nullable|string|max:255',
            'cta_button_url' => 'nullable|string|max:500',
            'terms_and_conditions' => 'nullable|string',
            'perks' => 'nullable|array',
            'features' => 'nullable|array',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'status' => 'required|in:draft,scheduled,active,expired,disabled',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'display_order' => 'integer',
            'show_countdown' => 'boolean',
            'show_date_range' => 'boolean',
            'show_product_count' => 'boolean',
            'card_layout_style' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'product_badges' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        // Handle File Uploads via MediaService
        if ($request->hasFile('banner_file')) {
            $validated['banner_image'] = MediaService::uploadImage($request->file('banner_file'), 'offers');
        }
        if ($request->hasFile('mobile_banner_file')) {
            $validated['mobile_banner_image'] = MediaService::uploadImage($request->file('mobile_banner_file'), 'offers');
        }
        if ($request->hasFile('thumbnail_file')) {
            $validated['thumbnail_image'] = MediaService::uploadImage($request->file('thumbnail_file'), 'offers');
        }

        $offer->update($validated);

        // Sync attached products with order & custom badges
        if (isset($validated['product_ids'])) {
            $syncData = [];
            foreach ($validated['product_ids'] as $idx => $prodId) {
                $badge = $validated['product_badges'][$prodId] ?? null;
                $syncData[$prodId] = [
                    'display_order' => $idx + 1,
                    'badge' => $badge,
                ];
            }
            $offer->products()->sync($syncData);
        }

        return redirect()->route('admin.offers.index')->with('success', "Offer campaign '{$offer->title}' updated successfully!");
    }

    /**
     * Remove the specified offer from storage.
     */
    public function destroy(Offer $offer)
    {
        $this->authorizeAdmin();

        $title = $offer->title;
        $offer->delete();

        return redirect()->route('admin.offers.index')->with('success', "Offer '{$title}' has been deleted.");
    }

    /**
     * Duplicate an existing offer campaign.
     */
    public function duplicate(Offer $offer)
    {
        $this->authorizeAdmin();

        $newOffer = $offer->replicate();
        $newOffer->title = $offer->title . ' (Copy)';
        $newOffer->slug = Str::slug($offer->title . '-copy-' . time());
        $newOffer->status = 'draft';
        $newOffer->is_active = false;
        $newOffer->created_by = auth()->id();
        $newOffer->save();

        // Copy attached products
        foreach ($offer->products as $p) {
            $newOffer->products()->attach($p->id, [
                'display_order' => $p->pivot->display_order,
                'is_featured' => $p->pivot->is_featured,
                'badge' => $p->pivot->badge,
            ]);
        }

        return redirect()->route('admin.offers.index')->with('success', "Offer campaign '{$offer->title}' duplicated as draft!");
    }

    /**
     * Toggle active state for an offer.
     */
    public function toggle(Offer $offer)
    {
        $this->authorizeAdmin();

        $offer->update(['is_active' => !$offer->is_active]);

        return back()->with('success', "Offer '{$offer->title}' active status toggled.");
    }
}
