<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationRule;
use App\Models\Role;
use App\Services\AuditLogger;
use App\Services\Notification\NotificationPreferenceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationSettingController extends Controller
{
    protected NotificationPreferenceService $prefService;

    public function __construct(NotificationPreferenceService $prefService)
    {
        $this->prefService = $prefService;
    }

    /**
     * Display Notification Preferences Matrix.
     */
    public function settings(Request $request): Response
    {
        $user = $request->user();
        $preferences = $this->prefService->getUserPreferences($user->id);

        return Inertia::render('Admin/Settings/NotificationSettings', [
            'preferences' => $preferences,
        ]);
    }

    /**
     * Save Notification Preferences.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*.in_app_enabled' => 'boolean',
            'preferences.*.browser_enabled' => 'boolean',
            'preferences.*.sms_enabled' => 'boolean',
            'preferences.*.email_enabled' => 'boolean',
        ]);

        $this->prefService->saveUserPreferences($request->user()->id, $validated['preferences']);

        AuditLogger::log(action: 'notification.preferences_updated', entity: $request->user(), newValues: [
            'user' => $request->user()->email,
        ]);

        return back()->with('success', 'Notification preferences saved successfully.');
    }

    /**
     * Display Notification Rules Management.
     */
    public function rules(Request $request): Response
    {
        $rules = NotificationRule::orderBy('category')->orderBy('event_key')->get();
        $roles = Role::pluck('name');

        return Inertia::render('Admin/Settings/NotificationRules', [
            'rules' => $rules,
            'availableRoles' => $roles,
            'availableCategories' => ['ORDER', 'PAYMENT', 'COURIER', 'FRAUD', 'INVENTORY', 'SMS', 'SYSTEM', 'CUSTOMER', 'SECURITY', 'MARKETING'],
            'availablePriorities' => ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'],
        ]);
    }

    /**
     * Store or Update a Notification Rule.
     */
    public function storeRule(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:notification_rules,id',
            'event_key' => 'required|string|max:64',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:32',
            'default_priority' => 'required|in:LOW,NORMAL,HIGH,URGENT,CRITICAL',
            'enabled' => 'boolean',
            'notify_roles' => 'nullable|array',
            'channels' => 'required|array|min:1',
            'template_title' => 'required|string|max:255',
            'template_message' => 'required|string',
            'action_url_template' => 'nullable|string|max:255',
        ]);

        $rule = NotificationRule::updateOrCreate(
            ['id' => $validated['id'] ?? null],
            $validated
        );

        AuditLogger::log(action: 'notification.rule_saved', entity: $rule, newValues: [
            'event_key' => $rule->event_key,
            'name' => $rule->name,
        ]);

        return back()->with('success', 'Notification rule saved successfully.');
    }

    /**
     * Toggle Rule active status.
     */
    public function toggleRule(Request $request, NotificationRule $rule)
    {
        $rule->update(['enabled' => !$rule->enabled]);

        AuditLogger::log(action: 'notification.rule_toggled', entity: $rule, newValues: [
            'event_key' => $rule->event_key,
            'enabled' => $rule->enabled,
        ]);

        return back()->with('success', 'Rule status updated.');
    }
}
