<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicBrandController extends Controller
{
    /**
     * Display the comprehensive brands directory with search and alphabetical navigation.
     */
    public function index(Request $request)
    {
        $query = Brand::withCount('products')
            ->where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('letter') && $request->input('letter') !== 'all') {
            $letter = $request->input('letter');
            $query->where('name', 'like', "{$letter}%");
        }

        $brands = $query->orderBy('name')->get();
        $featuredBrands = Brand::where('is_featured', true)->where('is_active', true)->take(8)->get();

        return Inertia::render('Brands/Index', [
            'brands' => $brands,
            'featuredBrands' => $featuredBrands,
            'filters' => $request->only(['search', 'letter']),
        ]);
    }

    /**
     * Display individual brand showroom page with products and filters.
     */
    public function show(Request $request, $slug)
    {
        $brand = Brand::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $productQuery = Product::with(['category', 'brand'])
            ->where('brand_id', $brand->id);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $productQuery->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $catSlug = $request->input('category');
            $productQuery->whereHas('category', fn($q) => $q->where('slug', $catSlug));
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        if ($sort === 'price_asc') {
            $productQuery->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $productQuery->orderBy('price', 'desc');
        } else {
            $productQuery->latest();
        }

        $products = $productQuery->paginate(16)->withQueryString();
        $filterCategories = Category::whereNull('parent_id')->orderBy('name')->get();

        return Inertia::render('Brands/Show', [
            'brand' => $brand,
            'products' => $products,
            'filterCategories' => $filterCategories,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', ''),
                'sort' => $request->input('sort', 'latest'),
            ],
        ]);
    }
}
