<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\SpecificationAttribute;
use App\Models\SpecificationGroup;
use App\Models\CategoryContentSection;
use App\Models\CategoryFaq;
use App\Models\CategoryPriceTable;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $categories = Category::with(['parent', 'children'])
            ->withCount(['products', 'contentSections', 'faqs', 'priceTables'])
            ->orderBy('sort_order')
            ->latest()
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $categories = Category::whereNull('parent_id')->get();
        $specGroups = SpecificationGroup::with('attributes')->get();
        $products = Product::select('id', 'title', 'slug', 'price')->orderBy('title')->get();

        return Inertia::render('Admin/Categories/Form', [
            'categories' => $categories,
            'category' => null,
            'specGroups' => $specGroups,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'page_title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'seo_intro' => 'nullable|string',
            'sidebar_visible' => 'boolean',
            'default_sort' => 'string',
            'filter_config' => 'nullable|array',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_featured' => 'boolean',
            'is_nav_visible' => 'boolean',
            'sort_order' => 'integer',
            'content_sections' => 'nullable|array',
            'price_tables' => 'nullable|array',
            'faqs' => 'nullable|array',
        ]);

        $validated['slug'] = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);
        
        $category = Category::create($validated);

        $this->syncRelatedContent($category, $request);

        return redirect()->route('admin.categories')->with('success', 'Category created successfully with SEO & content!');
    }

    public function edit(Category $category)
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $category->load([
            'contentSections',
            'faqs',
            'priceTables.product',
            'specificationAttributes',
        ]);

        $categories = Category::whereNull('parent_id')->where('id', '!=', $category->id)->get();
        $specGroups = SpecificationGroup::with('attributes')->get();
        $products = Product::select('id', 'title', 'slug', 'price')->orderBy('title')->get();

        return Inertia::render('Admin/Categories/Form', [
            'categories' => $categories,
            'category' => $category,
            'specGroups' => $specGroups,
            'products' => $products,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'page_title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'seo_intro' => 'nullable|string',
            'sidebar_visible' => 'boolean',
            'default_sort' => 'string',
            'filter_config' => 'nullable|array',
            'icon' => 'nullable|string',
            'image' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_featured' => 'boolean',
            'is_nav_visible' => 'boolean',
            'sort_order' => 'integer',
            'content_sections' => 'nullable|array',
            'price_tables' => 'nullable|array',
            'faqs' => 'nullable|array',
        ]);

        $validated['slug'] = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);
        
        $category->update($validated);

        $this->syncRelatedContent($category, $request);

        return redirect()->route('admin.categories')->with('success', 'Category updated successfully!');
    }

    public function destroy(Category $category)
    {
        abort_if(!auth()->check() || auth()->user()->role !== 'admin', 403);
        $category->delete();
        return redirect()->route('admin.categories')->with('success', 'Category deleted.');
    }

    /**
     * Sync child SEO content sections, price tables, and FAQs
     */
    protected function syncRelatedContent(Category $category, Request $request)
    {
        // 1. Sync Content Sections
        if ($request->has('content_sections')) {
            $category->contentSections()->delete();
            $sections = $request->input('content_sections', []);
            foreach ($sections as $idx => $sec) {
                if (empty($sec['heading']) && empty($sec['content'])) continue;
                $category->contentSections()->create([
                    'heading' => $sec['heading'] ?? '',
                    'section_type' => $sec['section_type'] ?? 'rich_text',
                    'content' => $sec['content'] ?? '',
                    'data' => $sec['data'] ?? null,
                    'sort_order' => $sec['sort_order'] ?? $idx,
                    'is_active' => isset($sec['is_active']) ? (bool)$sec['is_active'] : true,
                ]);
            }
        }

        // 2. Sync Price Tables
        if ($request->has('price_tables')) {
            $category->priceTables()->delete();
            $tables = $request->input('price_tables', []);
            foreach ($tables as $idx => $row) {
                if (empty($row['product_name']) && empty($row['product_id'])) continue;
                
                $price = $row['price'] ?? '0';
                if (!empty($row['product_id']) && empty($row['price'])) {
                    $prod = Product::find($row['product_id']);
                    if ($prod) $price = (string)$prod->price;
                }

                $category->priceTables()->create([
                    'product_id' => !empty($row['product_id']) ? $row['product_id'] : null,
                    'product_name' => $row['product_name'] ?? 'Product',
                    'price' => (string)$price,
                    'specs' => $row['specs'] ?? null,
                    'custom_link' => $row['custom_link'] ?? null,
                    'sort_order' => $row['sort_order'] ?? $idx,
                    'is_active' => isset($row['is_active']) ? (bool)$row['is_active'] : true,
                ]);
            }
        }

        // 3. Sync FAQs
        if ($request->has('faqs')) {
            $category->faqs()->delete();
            $faqs = $request->input('faqs', []);
            foreach ($faqs as $idx => $faq) {
                if (empty($faq['question']) || empty($faq['answer'])) continue;
                $category->faqs()->create([
                    'question' => $faq['question'],
                    'answer' => $faq['answer'],
                    'sort_order' => $faq['sort_order'] ?? $idx,
                    'is_active' => isset($faq['is_active']) ? (bool)$faq['is_active'] : true,
                ]);
            }
        }
    }
}
