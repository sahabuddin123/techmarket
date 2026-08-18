<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Navigation;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class NavigationController extends Controller
{
    private function authorizeAdmin()
    {
        $user = auth()->user();
        if (!$user || ($user->role !== 'admin' && !$user->hasPermission('homepage.manage') && !$user->hasPermission('settings.manage'))) {
            abort(403, 'Unauthorized access to navigation management.');
        }
    }

    /**
     * Display navigation management overview.
     */
    public function index()
    {
        $this->authorizeAdmin();

        $categories = Category::with(['children.children'])
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        $navigations = Navigation::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/Navigation/Index', [
            'categories' => $categories,
            'navigations' => $navigations,
        ]);
    }

    /**
     * Display the visual Mega Menu Builder workspace for a specific category.
     */
    public function megaMenu(Category $category)
    {
        $this->authorizeAdmin();

        $category->load(['children.children']);
        $allCategories = Category::whereNull('parent_id')->orderBy('name')->get();
        $sampleProducts = Product::select('id', 'title', 'price', 'image')->take(10)->get();

        return Inertia::render('Admin/Navigation/MegaMenuBuilder', [
            'category' => $category,
            'allCategories' => $allCategories,
            'sampleProducts' => $sampleProducts,
        ]);
    }

    /**
     * Update mega menu configuration for a category.
     */
    public function updateMegaMenu(Request $request, Category $category)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'mega_menu_enabled' => 'boolean',
            'mega_menu_type' => 'required|in:auto,manual,simple_dropdown,direct_link',
            'mega_menu_layout' => 'required|in:2_columns,3_columns,4_columns,auto',
            'mega_menu_config' => 'nullable|array',
            'is_nav_visible' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $category->update($validated);
        Cache::forget('navigation.categories');

        return back()->with('success', "Mega menu configuration for '{$category->name}' saved successfully!");
    }

    /**
     * Reorder top-level categories.
     */
    public function reorderCategories(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['categories'] as $item) {
            Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        Cache::forget('navigation.categories');

        return back()->with('success', 'Navigation category order updated!');
    }

    /**
     * Toggle navigation visibility for a category.
     */
    public function toggleCategoryVisibility(Category $category)
    {
        $this->authorizeAdmin();

        $category->update(['is_nav_visible' => !$category->is_nav_visible]);
        Cache::forget('navigation.categories');

        return back()->with('success', "Category '{$category->name}' visibility toggled.");
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:500',
            'location' => 'required|in:header,footer,mega_menu',
            'parent_id' => 'nullable|exists:navigations,id',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        Navigation::create($validated);
        Cache::forget('navigation.categories');

        return back()->with('success', 'Navigation menu item created!');
    }

    public function destroy(Navigation $navigation)
    {
        $this->authorizeAdmin();

        $navigation->delete();
        Cache::forget('navigation.categories');

        return back()->with('success', 'Navigation menu item deleted.');
    }
}
