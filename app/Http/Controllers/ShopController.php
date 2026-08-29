<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\EmiPartner;
use App\Models\FlashSale;
use App\Models\FlashSaleItem;
use App\Services\HomepageService;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function home()
    {
        $data = HomepageService::getHomepageData();

        $siteName = \App\Models\Setting::get('site_name', config('app.name', 'TechMarket BD'));
        $siteDescription = \App\Models\Setting::get('site_description', 'Best Computer, Laptop, Gaming PC & CCTV surveillance shop in Bangladesh. Buy authentic tech accessories at official price.');
        $siteLogo = \App\Models\Setting::get('site_logo', url('/storage/logo.png'));
        
        $data['seo'] = [
            'title' => "{$siteName} | Leading Computer, Laptop & Tech Shop in Bangladesh",
            'description' => $siteDescription,
            'canonical_url' => url('/'),
            'og' => [
                'title' => "{$siteName} | Leading Computer & Tech Shop in Bangladesh",
                'description' => $siteDescription,
                'image' => $siteLogo,
                'url' => url('/'),
                'type' => 'website',
            ],
            'twitter' => [
                'card' => 'summary_large_image',
                'title' => "{$siteName} | Best Tech Shop in Bangladesh",
                'description' => $siteDescription,
                'image' => $siteLogo,
            ],
            'json_ld' => [
                \App\Services\SeoService::getOrganizationSchema(),
                \App\Services\SeoService::getWebSiteSchema(),
            ],
        ];

        return Inertia::render('Home', $data);
    }

    public function category($slug, Request $request)
    {
        $category = Category::where('slug', $slug)->first();
        if (!$category) {
            $recommendedProducts = Product::where(function ($q) {
                $q->where('is_active', true)->orWhereNull('is_active');
            })
            ->where('is_featured', true)
            ->latest()
            ->take(8)
            ->get();

            if ($recommendedProducts->count() < 4) {
                $recommendedProducts = Product::where(function ($q) {
                    $q->where('is_active', true)->orWhereNull('is_active');
                })
                ->latest()
                ->take(8)
                ->get();
            }

            $topCategories = Category::whereNull('parent_id')
                ->where('is_nav_visible', true)
                ->orderBy('sort_order')
                ->take(8)
                ->get();

            return Inertia::render('Errors/NotFound', [
                'status' => 404,
                'requestedPath' => $request->path(),
                'recommendedProducts' => $recommendedProducts,
                'topCategories' => $topCategories,
                'seo' => [
                    'title' => '404 - Category Not Found | TechMarket BD',
                    'description' => 'Sorry, the category you are looking for does not exist. Explore our hardware catalog.',
                    'meta_robots' => 'noindex, nofollow',
                ],
            ]);
        }
        return $this->renderShopPage($request, $category);
    }

    /**
     * Global catalog listing endpoint: /catalog
     */
    public function catalog(Request $request)
    {
        $category = null;
        if ($request->filled('category')) {
            $category = Category::where('slug', $request->input('category'))->first();
        }

        return $this->renderShopPage($request, $category);
    }

    /**
     * Shared logic for Category & Catalog listing page
     */
    protected function renderShopPage(Request $request, ?Category $category = null)
    {
        // 1. Determine Category Scope & Special Campaigns (e.g. Flash Sales)
        $categoryIds = [];
        if ($category) {
            $categoryIds = $category->getAllChildrenIds();
        }

        $isFlashSale = $request->boolean('flash_sale') 
            || $request->input('flash_sale') === 'true' 
            || $request->input('flash_sale') === '1'
            || $request->input('filter') === 'flash_sale';

        $activeFlashSale = null;
        $flashProductIds = [];
        if ($isFlashSale) {
            $now = Carbon::now();
            $activeFlashSale = FlashSale::with('items')
                ->where('is_active', true)
                ->where('start_time', '<=', $now)
                ->where('end_time', '>=', $now)
                ->first();

            if ($activeFlashSale) {
                $flashProductIds = $activeFlashSale->items->pluck('product_id')->toArray();
            }
        }

        // Base products query for current category & flash sale scope
        $baseQuery = Product::query();
        if (!empty($categoryIds)) {
            $baseQuery->whereIn('category_id', $categoryIds);
        }
        if ($isFlashSale) {
            if (!empty($flashProductIds)) {
                $baseQuery->whereIn('id', $flashProductIds);
            } else {
                $baseQuery->where('is_deal_of_day', true);
            }
        }

        // Price bounds for range slider
        $minPriceBound = (float) ((clone $baseQuery)->min('price') ?: 0);
        $maxPriceBound = (float) ((clone $baseQuery)->max('price') ?: 500000);
        if (!empty($categoryIds)) {
            $catMin = Product::whereIn('category_id', $categoryIds)->min('price');
            $catMax = Product::whereIn('category_id', $categoryIds)->max('price');
            if ($catMin !== null) $minPriceBound = (float)$catMin;
            if ($catMax !== null) $maxPriceBound = (float)$catMax;
        }

        // 2. Aggregate Filter Options (Brands, Availability, Specs)
        // Brands in scope
        $brandIdsInScope = (clone $baseQuery)->whereNotNull('brand_id')->pluck('brand_id')->unique();
        $brands = Brand::whereIn('id', $brandIdsInScope)->orderBy('name')->get()->map(function ($b) use ($baseQuery) {
            $count = (clone $baseQuery)->where('brand_id', $b->id)->count();
            return [
                'id' => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'count' => $count,
            ];
        })->filter(fn ($b) => $b['count'] > 0)->values();

        // Availability Counts
        $availabilityCounts = [
            'in_stock' => (clone $baseQuery)->where('stock', '>', 0)->count(),
            'pre_order' => (clone $baseQuery)->where('stock', '<=', 0)->where('is_deal_of_day', true)->count(),
            'upcoming' => (clone $baseQuery)->where('stock', '<=', 0)->where('is_featured', true)->count(),
            'all' => (clone $baseQuery)->count(),
        ];

        // Subcategories / Siblings
        $allCategories = Category::with('children')->whereNull('parent_id')->orderBy('sort_order')->get();
        $subcategories = [];
        if ($category) {
            $subcategories = $category->children()->withCount('products')->get()->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'count' => $c->products_count,
                ];
            });
        }

        // Dynamic Specification Filter Groups
        $filterGroups = [];

        if (!empty($categoryIds)) {
            $productIdsInScope = (clone $baseQuery)->pluck('id');
            
            $specValues = \App\Models\ProductSpecificationValue::with('attribute.group')
                ->whereIn('product_id', $productIdsInScope)
                ->get();

            $groupedSpecs = $specValues->groupBy('specification_attribute_id');

            foreach ($groupedSpecs as $attrId => $values) {
                $attr = $values->first()->attribute;
                if (!$attr) continue;

                $valCounts = $values->groupBy('value')->map(function ($items, $val) {
                    return [
                        'label' => (string)$val,
                        'value' => (string)$val,
                        'count' => $items->pluck('product_id')->unique()->count(),
                    ];
                })->values();

                if ($valCounts->count() > 0) {
                    $filterGroups[] = [
                        'id' => 'spec_' . $attr->id,
                        'attr_id' => $attr->id,
                        'name' => $attr->name . ($attr->unit ? " ({$attr->unit})" : ''),
                        'options' => $valCounts,
                    ];
                }
            }
        }

        // 3. Build Filtered Products Query
        $productsQuery = (clone $baseQuery)->with(['category', 'brand']);

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $productsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Brand filter
        if ($request->filled('brand')) {
            $rawBrand = $request->input('brand');
            $brandInputs = is_array($rawBrand) ? $rawBrand : explode(',', $rawBrand);
            $productsQuery->whereHas('brand', function ($q) use ($brandInputs) {
                $q->whereIn('slug', $brandInputs)->orWhereIn('name', $brandInputs);
            });
        }

        // Availability filter
        if ($request->filled('availability')) {
            $rawAvail = $request->input('availability');
            $avail = is_array($rawAvail) ? $rawAvail : explode(',', $rawAvail);
            $productsQuery->where(function ($q) use ($avail) {
                if (in_array('in_stock', $avail)) {
                    $q->orWhere('stock', '>', 0);
                }
                if (in_array('pre_order', $avail)) {
                    $q->orWhere(function ($sq) {
                        $sq->where('stock', '<=', 0)->where('is_deal_of_day', true);
                    });
                }
                if (in_array('upcoming', $avail)) {
                    $q->orWhere(function ($sq) {
                        $sq->where('stock', '<=', 0)->where('is_featured', true);
                    });
                }
            });
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $productsQuery->where('price', '>=', (float)$request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $productsQuery->where('price', '<=', (float)$request->input('max_price'));
        }

        // Dynamic Spec Filters
        if ($request->has('specs') && is_array($request->input('specs'))) {
            foreach ($request->input('specs') as $specKey => $specVal) {
                if (empty($specVal)) continue;
                $attrId = str_replace('spec_', '', $specKey);
                $values = is_array($specVal) ? $specVal : explode(',', $specVal);
                
                $productsQuery->whereHas('specificationValues', function ($sq) use ($attrId, $values) {
                    $sq->where('specification_attribute_id', $attrId)
                       ->whereIn('value', $values);
                });
            }
        }

        // Sorting
        $sort = $request->input('sort', $category ? ($category->default_sort ?: 'default') : 'default');
        if ($sort === 'price_asc') {
            $productsQuery->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $productsQuery->orderBy('price', 'desc');
        } elseif ($sort === 'latest' || $sort === 'newest') {
            $productsQuery->latest();
        } elseif ($sort === 'bestseller') {
            $productsQuery->orderBy('is_featured', 'desc')->latest();
        } elseif ($sort === 'title_asc' || $sort === 'name_asc') {
            $productsQuery->orderBy('title', 'asc');
        } elseif ($sort === 'title_desc' || $sort === 'name_desc') {
            $productsQuery->orderBy('title', 'desc');
        } elseif ($sort === 'discount') {
            $productsQuery->orderByRaw('(regular_price - price) DESC');
        } else {
            $productsQuery->orderBy('is_featured', 'desc')->latest();
        }

        // Pagination
        $perPage = (int)$request->input('per_page', 16);
        if ($perPage <= 0) $perPage = 16;
        $products = $productsQuery->paginate($perPage)->withQueryString();

        // Attach live flash pricing if products are in Flash Sale
        $products->getCollection()->transform(function ($p) {
            $pricing = PricingService::resolveProductPrice($p);
            if ($pricing['discount_source'] === 'flash_sale') {
                $p->flash_price = $pricing['final_price'];
                $p->is_flash_sale = true;
            }
            return $p;
        });

        // 4. Breadcrumbs
        $breadcrumbs = [
            ['label' => 'Home', 'url' => '/'],
        ];

        if ($isFlashSale) {
            $breadcrumbs[] = [
                'label' => $activeFlashSale ? $activeFlashSale->title : 'Flash Sale Deals',
                'url' => '/catalog?flash_sale=true',
            ];
        } elseif ($category) {
            $ancestors = [];
            $curr = $category->parent;
            while ($curr) {
                $ancestors[] = [
                    'label' => $curr->name,
                    'url' => "/category/{$curr->slug}",
                ];
                $curr = $curr->parent;
            }
            $breadcrumbs = array_merge($breadcrumbs, array_reverse($ancestors));
            $breadcrumbs[] = [
                'label' => $category->name,
                'url' => "/category/{$category->slug}",
            ];
        } else {
            $breadcrumbs[] = [
                'label' => 'Shop',
                'url' => '/shop',
            ];
        }

        // 5. Dynamic SEO Content, Price Tables, and FAQs
        $contentSections = [];
        $faqs = [];
        $priceTables = [];

        if ($category) {
            $contentSections = $category->contentSections()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();

            $faqs = $category->faqs()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();

            $priceTables = $category->priceTables()
                ->where('is_active', true)
                ->with('product')
                ->orderBy('sort_order')
                ->get()
                ->map(function ($row) {
                    $livePrice = $row->price;
                    $url = $row->custom_link;
                    $name = $row->product_name;
                    if ($row->product) {
                        if (empty($row->price) || $row->price === '0') {
                            $livePrice = (string)$row->product->price;
                        }
                        if (empty($url)) {
                            $url = "/product/{$row->product->slug}";
                        }
                        if (empty($name)) {
                            $name = $row->product->title;
                        }
                    }
                    return [
                        'id' => $row->id,
                        'product_name' => $name,
                        'price' => $livePrice,
                        'specs' => $row->specs,
                        'url' => $url,
                    ];
                });
        }

        $siteName = \App\Models\Setting::get('site_name', 'TechMarket BD');
        $catalogTitle = $category ? "{$category->name} Price in Bangladesh | {$siteName}" : "Buy Electronics, Laptop & Gaming PC at Best Price in BD | {$siteName}";
        $catalogDesc = $category && !empty($category->meta_description)
            ? $category->meta_description
            : ($category ? "Buy {$category->name} at the best price in Bangladesh from {$siteName}. Browse latest models, official warranty and fast home delivery." : "Explore wide range of Computers, Laptops, Components, CCTV and Accessories at unbeatable prices in Bangladesh from {$siteName}.");
        $canonicalUrl = $category ? url("/category/{$category->slug}") : url('/catalog');

        $seo = [
            'title' => $catalogTitle,
            'description' => $catalogDesc,
            'canonical_url' => $canonicalUrl,
            'og' => [
                'title' => $catalogTitle,
                'description' => $catalogDesc,
                'image' => $category && $category->image ? url($category->image) : url('/storage/logo.png'),
                'url' => $canonicalUrl,
                'type' => 'website',
            ],
            'twitter' => [
                'card' => 'summary_large_image',
                'title' => $catalogTitle,
                'description' => $catalogDesc,
                'image' => $category && $category->image ? url($category->image) : url('/storage/logo.png'),
            ],
        ];

        return Inertia::render('Catalog', [
            'seo' => $seo,
            'category' => $category,
            'breadcrumbs' => $breadcrumbs,
            'products' => $products,
            'categories' => $allCategories,
            'subcategories' => $subcategories,
            'brands' => $brands,
            'availabilityCounts' => $availabilityCounts,
            'filterGroups' => $filterGroups,
            'priceBounds' => [
                'min' => (int)floor($minPriceBound),
                'max' => (int)ceil($maxPriceBound),
            ],
            'contentSections' => $contentSections,
            'priceTables' => $priceTables,
            'faqs' => $faqs,
            'isFlashSale' => $isFlashSale,
            'flashSaleTitle' => $activeFlashSale ? $activeFlashSale->title : 'Flash Sale Deals',
            'flashSaleEndTime' => $activeFlashSale && $activeFlashSale->end_time ? $activeFlashSale->end_time->toIso8601String() : null,
            'filters' => [
                'search' => (string)($request->input('search') ?? ''),
                'category' => (string)($category ? $category->slug : ($request->input('category') ?? '')),
                'brand' => $request->input('brand') ?? [],
                'availability' => $request->input('availability') ?? [],
                'min_price' => $request->input('min_price') ?? '',
                'max_price' => $request->input('max_price') ?? '',
                'sort' => (string)($request->input('sort') ?? ($category ? ($category->default_sort ?: 'default') : 'default')),
                'per_page' => $perPage,
                'specs' => $request->input('specs') ?? [],
                'flash_sale' => $isFlashSale,
            ],
        ]);
    }

    public function product($slug)
    {
        // 0. Check for 301 Moved Permanently Slug Redirects
        $redirect = \App\Models\ProductSlugRedirect::where('old_slug', $slug)->first();
        if ($redirect) {
            return redirect()->to("/product/{$redirect->new_slug}", 301);
        }

        $product = Product::with([
            'category.parent',
            'brand',
            'specificationValues.attribute.group',
            'reviews',
        ])
        ->where('slug', $slug)
        ->first();

        if (!$product) {
            $recommendedProducts = Product::where(function ($q) {
                $q->where('is_active', true)->orWhereNull('is_active');
            })
            ->where('is_featured', true)
            ->latest()
            ->take(8)
            ->get();

            if ($recommendedProducts->count() < 4) {
                $recommendedProducts = Product::where(function ($q) {
                    $q->where('is_active', true)->orWhereNull('is_active');
                })
                ->latest()
                ->take(8)
                ->get();
            }

            $topCategories = Category::whereNull('parent_id')
                ->where('is_nav_visible', true)
                ->orderBy('sort_order')
                ->take(8)
                ->get();

            return Inertia::render('Errors/NotFound', [
                'status' => 404,
                'requestedPath' => request()->path(),
                'recommendedProducts' => $recommendedProducts,
                'topCategories' => $topCategories,
                'seo' => [
                    'title' => '404 - Product Not Found | TechMarket BD',
                    'description' => 'Sorry, this product is no longer available or the URL is broken. Explore our latest tech hardware.',
                    'meta_robots' => 'noindex, nofollow',
                ],
            ]);
        }

        $seo = \App\Services\ProductSeoService::resolveProductSeo($product);

        // 1. Related Products (Sidebar list: 6-8 items)
        $relatedProducts = Product::with(['category', 'brand'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(8)
            ->get();

        if ($relatedProducts->count() < 4) {
            $fallback = Product::with(['category', 'brand'])
                ->where('id', '!=', $product->id)
                ->latest()
                ->take(8 - $relatedProducts->count())
                ->get();
            $relatedProducts = $relatedProducts->concat($fallback);
        }

        // 2. Build Structured Specifications
        // Group specifications by SpecificationGroup
        $specificationsByGroup = [];
        
        // A. From structured specificationValues relationship
        if ($product->specificationValues && $product->specificationValues->count() > 0) {
            $grouped = $product->specificationValues->groupBy(function ($specVal) {
                return $specVal->attribute && $specVal->attribute->group
                    ? $specVal->attribute->group->name
                    : 'Basic Information';
            });

            foreach ($grouped as $groupName => $values) {
                $attrs = [];
                foreach ($values as $v) {
                    if (!$v->attribute) continue;
                    $name = $v->attribute->name . ($v->attribute->unit ? " ({$v->attribute->unit})" : '');
                    $attrs[] = [
                        'name' => $name,
                        'value' => (string)$v->value,
                    ];
                }
                if (!empty($attrs)) {
                    $specificationsByGroup[] = [
                        'group' => $groupName,
                        'attributes' => $attrs,
                    ];
                }
            }
        }

        // B. If specificationValues is empty, fallback to full_specs JSON if present
        if (empty($specificationsByGroup) && !empty($product->full_specs)) {
            if (is_array($product->full_specs)) {
                foreach ($product->full_specs as $gKey => $gItem) {
                    if (is_array($gItem) && isset($gItem['group'])) {
                        // Standard structured format: ['group' => 'Main Features', 'attributes' => [...]]
                        $groupTitle = (string)$gItem['group'];
                        $rawAttrs = $gItem['attributes'] ?? [];
                        $attrs = [];
                        if (is_array($rawAttrs)) {
                            foreach ($rawAttrs as $aItem) {
                                if (is_array($aItem) && isset($aItem['name'])) {
                                    $val = $aItem['value'] ?? '';
                                    if ($val !== null && trim((string)$val) !== '') {
                                        $attrs[] = [
                                            'name' => (string)$aItem['name'],
                                            'value' => (string)$val,
                                        ];
                                    }
                                } elseif (is_string($aItem)) {
                                    $parts = explode(':', $aItem, 2);
                                    $attrs[] = [
                                        'name' => count($parts) === 2 ? trim($parts[0]) : 'Feature',
                                        'value' => count($parts) === 2 ? trim($parts[1]) : trim($aItem),
                                    ];
                                }
                            }
                        }
                        if (!empty($attrs)) {
                            $specificationsByGroup[] = [
                                'group' => $groupTitle,
                                'attributes' => $attrs,
                            ];
                        }
                    } elseif (is_array($gItem)) {
                        // Associative format: ['Main Features' => ['Model' => 'F310']]
                        $attrs = [];
                        foreach ($gItem as $aKey => $aVal) {
                            if ($aVal !== null && trim((string)$aVal) !== '') {
                                $attrs[] = [
                                    'name' => is_string($aKey) ? $aKey : 'Feature',
                                    'value' => is_string($aVal) ? $aVal : json_encode($aVal),
                                ];
                            }
                        }
                        if (!empty($attrs)) {
                            $specificationsByGroup[] = [
                                'group' => is_string($gKey) ? $gKey : 'General Specifications',
                                'attributes' => $attrs,
                            ];
                        }
                    }
                }
            }
        }

        // C. If still empty, fallback to key_specs array formatted as a group
        if (empty($specificationsByGroup) && !empty($product->key_specs)) {
            $attrs = [];
            if (is_array($product->key_specs)) {
                foreach ($product->key_specs as $k => $v) {
                    if (is_string($k)) {
                        $attrs[] = ['name' => $k, 'value' => (string)$v];
                    } elseif (is_string($v)) {
                        $parts = explode(':', $v, 2);
                        if (count($parts) === 2) {
                            $attrs[] = ['name' => trim($parts[0]), 'value' => trim($parts[1])];
                        } else {
                            $attrs[] = ['name' => 'Feature', 'value' => $v];
                        }
                    }
                }
            }
            if (!empty($attrs)) {
                $specificationsByGroup[] = [
                    'group' => 'Basic Information',
                    'attributes' => $attrs,
                ];
            }
        }

        // 3. Breadcrumbs
        $breadcrumbs = [
            ['label' => 'Home', 'url' => '/'],
        ];

        if ($product->category) {
            $ancestors = [];
            $curr = $product->category;
            while ($curr) {
                $ancestors[] = [
                    'label' => $curr->name,
                    'url' => "/category/{$curr->slug}",
                ];
                $curr = $curr->parent;
            }
            $breadcrumbs = array_merge($breadcrumbs, array_reverse($ancestors));
        }
        $breadcrumbs[] = [
            'label' => $product->title,
            'url' => "/product/{$product->slug}",
        ];

        // 4. Product Reviews (Approved or Latest)
        $reviews = \App\Models\ProductReview::with('user')
            ->where('product_id', $product->id)
            ->latest()
            ->get();

        $ratingSummary = [
            'average' => $reviews->count() > 0 ? round($reviews->avg('rating'), 1) : 5.0,
            'count' => $reviews->count(),
            'counts' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ],
        ];

        // 5. Product Questions / FAQs
        $questions = \App\Models\ProductQuestion::with('user')
            ->where('product_id', $product->id)
            ->latest()
            ->get();

        // Also fetch category FAQs if available as fallbacks
        $categoryFaqs = [];
        if ($product->category) {
            $categoryFaqs = $product->category->faqs()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();
        }

        return Inertia::render('ProductDetail', [
            'product' => $product,
            'seo' => $seo,
            'relatedProducts' => $relatedProducts,
            'specifications' => $specificationsByGroup,
            'breadcrumbs' => $breadcrumbs,
            'reviews' => $reviews,
            'ratingSummary' => $ratingSummary,
            'questions' => $questions,
            'categoryFaqs' => $categoryFaqs,
            'emiPartners' => EmiPartner::where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function pcBuilder()
    {
        $components = Product::with(['category', 'brand'])
            ->whereNotNull('component_type')
            ->get()
            ->groupBy('component_type');

        return Inertia::render('PcBuilder', [
            'components' => $components,
        ]);
    }
}
