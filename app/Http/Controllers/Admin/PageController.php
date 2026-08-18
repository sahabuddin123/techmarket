<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Display all CMS & Policy pages in Admin Workspace.
     */
    public function index(Request $request)
    {
        $query = CmsPage::query();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $pages = $query->latest('updated_at')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show form for creating a new CMS page.
     */
    public function create()
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => null,
        ]);
    }

    /**
     * Store a newly created CMS page.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:cms_pages,slug',
            'content' => 'nullable|string',
            'sections' => 'nullable|array',
            'sections.*.badge' => 'nullable|string|max:255',
            'sections.*.paragraphs' => 'nullable|array',
            'sections.*.paragraphs.*' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_published' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }
        $validated['content'] = $validated['content'] ?? '';

        $page = CmsPage::create($validated);
        AuditLogger::log('page.created', $page, null, ['title' => $page->title, 'slug' => $page->slug]);

        return redirect()->route('admin.pages.index')->with('success', "Page '{$page->title}' created successfully!");
    }

    /**
     * Edit an existing CMS page.
     */
    public function edit(CmsPage $page)
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => $page,
        ]);
    }

    /**
     * Update an existing CMS page.
     */
    public function update(Request $request, CmsPage $page)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:cms_pages,slug,' . $page->id,
            'content' => 'nullable|string',
            'sections' => 'nullable|array',
            'sections.*.badge' => 'nullable|string|max:255',
            'sections.*.paragraphs' => 'nullable|array',
            'sections.*.paragraphs.*' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_published' => 'boolean',
        ]);

        $validated['content'] = $validated['content'] ?? '';

        $old = $page->toArray();
        $page->update($validated);
        AuditLogger::log('page.updated', $page, $old, $validated);

        return redirect()->route('admin.pages.index')->with('success', "Page '{$page->title}' updated successfully!");
    }

    /**
     * Toggle published state of a page.
     */
    public function toggle(CmsPage $page)
    {
        $page->update(['is_published' => !$page->is_published]);
        AuditLogger::log('page.toggled', $page, null, ['is_published' => $page->is_published]);

        return back()->with('success', "Status for '{$page->title}' updated.");
    }

    /**
     * Delete a CMS page.
     */
    public function destroy(CmsPage $page)
    {
        $systemSlugs = ['about-us', 'privacy-policy', 'warranty-policy', 'terms-and-conditions', 'delivery-policy', 'refund-and-return-policy'];
        if (in_array($page->slug, $systemSlugs)) {
            return back()->with('error', "System essential page '{$page->title}' cannot be deleted. You may edit its content or unpublish it.");
        }

        $title = $page->title;
        $page->delete();
        AuditLogger::log('page.deleted', $page, null, ['title' => $title]);

        return redirect()->route('admin.pages.index')->with('success', "Page '{$title}' deleted.");
    }

    /**
     * Display the About Us CMS page editor.
     */
    public function aboutUs()
    {
        $page = CmsPage::firstOrCreate(['slug' => 'about-us'], [
            'title' => 'About TechMarket BD',
            'content' => 'TechMarket BD is the leading computer and hardware retailer in Bangladesh.',
            'is_published' => true,
        ]);

        return Inertia::render('Admin/Pages/AboutUs', [
            'page' => $page,
        ]);
    }

    /**
     * Update the About Us page and structured content sections.
     */
    public function updateAboutUs(Request $request)
    {
        $page = CmsPage::where('slug', 'about-us')->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'sections' => 'nullable|array',
        ]);

        $page->update($validated);

        return back()->with('success', 'About Us page content updated successfully!');
    }
}
