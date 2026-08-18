<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Navigation;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HeaderFooterController extends Controller
{
    private function authorizeAdmin()
    {
        $user = auth()->user();
        if (!$user || ($user->role !== 'admin' && !$user->hasPermission('homepage.manage') && !$user->hasPermission('settings.manage'))) {
            abort(403, 'Unauthorized access to header and footer builder.');
        }
    }

    /**
     * Display the dynamic Header & Footer Builder workspace.
     */
    public function index()
    {
        $this->authorizeAdmin();

        $settings = Setting::all()->pluck('value', 'key')->all();

        $headerLinks = Navigation::where('location', 'header')
            ->orderBy('sort_order')
            ->get();

        $footerInfoLinks = Navigation::where('location', 'footer_info')
            ->orderBy('sort_order')
            ->get();

        $footerPolicyLinks = Navigation::where('location', 'footer_policies')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/HeaderFooter/Index', [
            'settings' => $settings,
            'headerLinks' => $headerLinks,
            'footerInfoLinks' => $footerInfoLinks,
            'footerPolicyLinks' => $footerPolicyLinks,
        ]);
    }

    /**
     * Update header & footer branding, announcement, social, and layout settings.
     */
    public function updateSettings(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => (string)$value]);
        }

        Cache::forget('settings.global');
        Cache::forget('navigation.global');

        return back()->with('success', 'Header and Footer configuration saved successfully!');
    }

    /**
     * Create a new header or footer navigation link.
     */
    public function storeLink(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:500',
            'location' => 'required|in:header,footer_info,footer_policies,footer',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
            'open_new_tab' => 'boolean',
        ]);

        Navigation::create($validated);

        return back()->with('success', "Navigation link '{$validated['title']}' added successfully!");
    }

    /**
     * Update an existing navigation link.
     */
    public function updateLink(Request $request, Navigation $navigation)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:500',
            'location' => 'required|in:header,footer_info,footer_policies,footer',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
            'open_new_tab' => 'boolean',
        ]);

        $navigation->update($validated);

        return back()->with('success', "Navigation link '{$navigation->title}' updated!");
    }

    /**
     * Delete a navigation link.
     */
    public function deleteLink(Navigation $navigation)
    {
        $this->authorizeAdmin();

        $title = $navigation->title;
        $navigation->delete();

        return back()->with('success', "Navigation link '{$title}' removed.");
    }

    /**
     * Reorder links in a specific section.
     */
    public function reorderLinks(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'links' => 'required|array',
            'links.*.id' => 'required|exists:navigations,id',
            'links.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['links'] as $item) {
            Navigation::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Navigation order updated successfully!');
    }
}
