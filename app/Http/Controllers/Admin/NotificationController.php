<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Notification\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Display the Enterprise Notification Center.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = [
            'category' => $request->query('category', 'ALL'),
            'priority' => $request->query('priority', 'ALL'),
            'status' => $request->query('status', 'all'),
            'search' => $request->query('search', ''),
            'per_page' => $request->query('per_page', 20),
        ];

        $notifications = $this->notificationService->getNotificationCenterList($user, $filters);
        $stats = $this->notificationService->getStats($user);

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
            'filters' => $filters,
            'categories' => [
                'ALL' => 'All Categories',
                'ORDER' => 'Orders & Payments',
                'COURIER' => 'Courier & Dispatch',
                'FRAUD' => 'Fraud Alerts',
                'INVENTORY' => 'Stock & Inventory',
                'SMS' => 'SMS Gateway',
                'SYSTEM' => 'System & Telemetry',
                'CUSTOMER' => 'Customer Inquiries',
                'SECURITY' => 'Security & Auth',
            ],
            'priorities' => ['ALL', 'LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'],
        ]);
    }

    /**
     * Real-time Topbar feed API endpoint.
     */
    public function feed(Request $request): JsonResponse
    {
        $user = $request->user();
        $category = $request->query('category', 'ALL');

        $data = $this->notificationService->getTopbarFeed($user, $category);

        return response()->json($data);
    }

    /**
     * Unread count API endpoint for fast badge updates.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount($request->user());

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id)
    {
        $this->notificationService->markAsRead($id, $request->user());

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $category = $request->input('category');
        $this->notificationService->markAllAsRead($request->user(), $category);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a single notification.
     */
    public function destroy(Request $request, string $id)
    {
        $this->notificationService->delete($id, $request->user());

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Notification removed.');
    }

    /**
     * Perform bulk action (mark_read, delete).
     */
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|string',
            'action' => 'required|in:mark_read,delete',
        ]);

        $count = $this->notificationService->bulkAction($validated['ids'], $validated['action'], $request->user());

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'count' => $count]);
        }

        return back()->with('success', "Updated {$count} notifications.");
    }
}
