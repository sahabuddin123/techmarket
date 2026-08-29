<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicOfferController extends Controller
{
    /**
     * Display the public /offers directory page.
     */
    public function index(Request $request)
    {
        $query = Offer::query()->where('is_active', true)->where('status', '!=', 'draft');

        // Search by offer title or description
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('headline', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Status Filter
        $status = $request->input('status', 'active');
        $now = now();

        if ($status === 'active') {
            $query->where(function ($q) use ($now) {
                $q->where('status', 'active')
                  ->where(function ($sq) use ($now) {
                      $sq->whereNull('start_at')->orWhere('start_at', '<=', $now);
                  })
                  ->where(function ($sq) use ($now) {
                      $sq->whereNull('end_at')->orWhere('end_at', '>=', $now);
                  });
            });
        } elseif ($status === 'upcoming' || $status === 'scheduled') {
            $query->where(function ($q) use ($now) {
                $q->where('status', 'scheduled')
                  ->orWhere(function ($sq) use ($now) {
                      $sq->whereNotNull('start_at')->where('start_at', '>', $now);
                  });
            });
        } elseif ($status === 'expired') {
            $query->where(function ($q) use ($now) {
                $q->where('status', 'expired')
                  ->orWhere(function ($sq) use ($now) {
                      $sq->whereNotNull('end_at')->where('end_at', '<', $now);
                  });
            });
        }

        // Sort options
        $sort = $request->input('sort', 'default');
        if ($sort === 'ending_soon') {
            $query->whereNotNull('end_at')->orderBy('end_at', 'asc');
        } elseif ($sort === 'newest') {
            $query->latest();
        } elseif ($sort === 'oldest') {
            $query->oldest();
        } else {
            $query->orderBy('display_order', 'asc')->latest();
        }

        $perPage = (int)$request->input('per_page', 12);
        $offers = $query->withCount('products')->paginate($perPage)->withQueryString();

        // Total active offers count for stats
        $totalActiveCount = Offer::where('is_active', true)->where('status', 'active')->count();
        $totalOffersCount = Offer::where('is_active', true)->count();

        return Inertia::render('Offers/Index', [
            'offers' => $offers,
            'filters' => [
                'search' => (string) ($request->input('search') ?? ''),
                'status' => (string) ($request->input('status') ?? 'active'),
                'sort' => (string) ($request->input('sort') ?? 'default'),
                'per_page' => (int) ($request->input('per_page') ?? 12),
            ],
            'totalActiveCount' => (int) $totalActiveCount,
            'totalOffersCount' => (int) $totalOffersCount,
        ]);
    }

    /**
     * Display a single public campaign detail page.
     */
    public function show(Request $request, $slug)
    {
        $offer = Offer::where('slug', $slug)
            ->where('is_active', true)
            ->where('status', '!=', 'draft')
            ->first();

        if (!$offer) {
            return redirect()->route('offers.index');
        }

        // Load associated campaign products with categories, brands, and pivot badges
        $productsQuery = $offer->products()->with(['category', 'brand']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $productsQuery->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $catSlug = $request->input('category');
            $productsQuery->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        $products = $productsQuery->paginate(12)->withQueryString();

        // Authoritative server-side pricing resolution
        $products->getCollection()->transform(function ($product) {
            $product->effective_price = $product->price;
            $product->discount_amount = max(0, ($product->regular_price ?: $product->price) - $product->price);
            return $product;
        });

        // Other active offers for sidebar / footer recommendations
        $relatedOffers = Offer::where('id', '!=', $offer->id)
            ->where('is_active', true)
            ->where('status', 'active')
            ->orderBy('display_order', 'asc')
            ->take(3)
            ->get();

        return Inertia::render('Offers/Show', [
            'offer' => $offer,
            'products' => $products,
            'relatedOffers' => $relatedOffers,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Display an offer-specific product detail page.
     */
    public function showProduct(Request $request, $offerSlug, $productSlug)
    {
        return redirect()->to('/product/' . $productSlug, 301);
    }
}
