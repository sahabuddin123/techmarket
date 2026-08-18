<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpecificationGroup;
use App\Models\SpecificationAttribute;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecificationController extends Controller
{
    public function index()
    {
        $groups = SpecificationGroup::with('attributes')->orderBy('sort_order', 'asc')->get();

        return Inertia::render('Admin/Specifications/Index', [
            'groups' => $groups,
        ]);
    }

    public function storeGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sort_order' => 'integer|min:0',
        ]);

        $group = SpecificationGroup::create($validated);
        AuditLogger::log('spec_group.created', $group, null, $validated);

        return back()->with('success', 'Specification Group created.');
    }

    public function storeAttribute(Request $request)
    {
        $validated = $request->validate([
            'specification_group_id' => 'required|exists:specification_groups,id',
            'name' => 'required|string|max:255',
            'unit' => 'nullable|string|max:50',
            'sort_order' => 'integer|min:0',
        ]);

        $attribute = SpecificationAttribute::create($validated);
        AuditLogger::log('spec_attribute.created', $attribute, null, $validated);

        return back()->with('success', 'Specification Attribute created.');
    }

    public function deleteGroup(SpecificationGroup $group)
    {
        AuditLogger::log('spec_group.deleted', $group, $group->toArray(), null);
        $group->delete();
        return back()->with('success', 'Group deleted.');
    }

    public function deleteAttribute(SpecificationAttribute $attribute)
    {
        AuditLogger::log('spec_attribute.deleted', $attribute, $attribute->toArray(), null);
        $attribute->delete();
        return back()->with('success', 'Attribute deleted.');
    }
}
