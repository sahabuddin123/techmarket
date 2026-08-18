<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use App\Models\QuickAction;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomepageController extends Controller
{
    public function index()
    {
        $sections = HomepageSection::orderBy('sort_order')->get();
        $quickActions = QuickAction::orderBy('sort_order')->get();
        $heroBanners = Banner::where('placement', 'hero_slider')->orderBy('sort_order')->get();
        $sideBanners = Banner::whereIn('placement', ['side_banner_top', 'side_banner_bottom'])->orderBy('sort_order')->get();
        $featuredCategories = Category::where('is_featured', true)->orderBy('sort_order')->get();
        $settings = Setting::all()->pluck('value', 'key')->all();

        return Inertia::render('Admin/Homepage/Index', [
            'sections' => $sections,
            'quickActions' => $quickActions,
            'heroBanners' => $heroBanners,
            'sideBanners' => $sideBanners,
            'featuredCategories' => $featuredCategories,
            'settings' => $settings,
        ]);
    }

    public function updateSection(Request $request, HomepageSection $section)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'sort_order' => 'required|integer',
            'is_enabled' => 'required|boolean',
            'config' => 'nullable|array',
        ]);

        $section->update($validated);

        return back()->with('success', "Homepage section '{$section->title}' updated successfully!");
    }

    public function reorderSections(Request $request)
    {
        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:homepage_sections,id',
            'sections.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['sections'] as $item) {
            HomepageSection::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Homepage sections reordered successfully!');
    }

    public function storeQuickAction(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'icon' => 'required|string|max:100',
            'url' => 'required|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        QuickAction::create($validated);

        return back()->with('success', 'Quick action card created successfully!');
    }

    public function updateQuickAction(Request $request, QuickAction $quickAction)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'icon' => 'required|string|max:100',
            'url' => 'required|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $quickAction->update($validated);

        return back()->with('success', 'Quick action card updated successfully!');
    }

    public function destroyQuickAction(QuickAction $quickAction)
    {
        $quickAction->delete();

        return back()->with('success', 'Quick action card deleted.');
    }
}
