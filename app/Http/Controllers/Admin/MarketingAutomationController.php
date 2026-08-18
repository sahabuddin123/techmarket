<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarketingAutomation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketingAutomationController extends Controller
{
    public function index()
    {
        $automations = MarketingAutomation::latest()->paginate(15);

        return Inertia::render('Admin/MarketingAutomations/Index', [
            'automations' => $automations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_event' => 'required|string|max:100',
            'channel' => 'required|in:database,email',
            'template' => 'required|string',
            'is_active' => 'boolean',
        ]);

        MarketingAutomation::create($validated);
        return back()->with('success', 'Marketing automation campaign created!');
    }

    public function toggle(MarketingAutomation $marketingAutomation)
    {
        $marketingAutomation->update(['is_active' => !$marketingAutomation->is_active]);
        return back()->with('success', 'Automation status toggled.');
    }
}
