<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('sort_order', 'asc')->get();
        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Banners/Form', [
            'banner' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge' => 'nullable|string|max:255',
            'image' => 'required|string',
            'mobile_image' => 'nullable|string',
            'placement' => 'required|string|in:hero_slider,side_banner_top,side_banner_bottom,promo_banner',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
        ]);

        Banner::create($validated);

        return redirect()->route('admin.banners')->with('success', 'Banner created successfully!');
    }

    public function edit(Banner $banner)
    {
        return Inertia::render('Admin/Banners/Form', [
            'banner' => $banner,
        ]);
    }

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge' => 'nullable|string|max:255',
            'image' => 'required|string',
            'mobile_image' => 'nullable|string',
            'placement' => 'required|string|in:hero_slider,side_banner_top,side_banner_bottom,promo_banner',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
        ]);

        $banner->update($validated);

        return redirect()->route('admin.banners')->with('success', 'Banner updated successfully!');
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();
        return redirect()->route('admin.banners')->with('success', 'Banner deleted.');
    }
}
