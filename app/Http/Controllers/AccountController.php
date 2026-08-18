<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Customer Profile & Dashboard overview.
     */
    public function profile(Request $request): Response
    {
        $user = $request->user();
        $unreadCount = $user->unreadNotifications()->count();
        $addresses = Address::where('user_id', $user->id)->latest()->get();
        $recentOrders = Order::with('items')
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Account/Profile', [
            'user' => $user,
            'addresses' => $addresses,
            'recentOrders' => $recentOrders,
            'unreadCount' => $unreadCount,
            'points' => $user->reward_points ?? 0,
            'status' => session('status'),
            'success' => session('success'),
        ]);
    }

    /**
     * Customer Notification Center.
     */
    public function notifications(Request $request): Response
    {
        $user = $request->user();
        $notifications = $user->notifications()->paginate(15);
        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('Account/Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Customer Order History.
     */
    public function orderHistory(Request $request): Response
    {
        $user = $request->user();
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');

        $allowedSorts = ['id', 'order_number', 'created_at', 'total', 'status', 'payment_method'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }

        $orders = Order::with('items')
            ->where('user_id', $user->id)
            ->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc')
            ->paginate(15)
            ->withQueryString();

        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('Account/OrderHistory', [
            'orders' => $orders,
            'unreadCount' => $unreadCount,
            'currentSort' => $sort,
            'currentDirection' => $direction,
        ]);
    }

    /**
     * Customer Change Password View.
     */
    public function changePassword(Request $request): Response
    {
        $user = $request->user();
        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('Account/ChangePassword', [
            'unreadCount' => $unreadCount,
            'status' => session('status'),
        ]);
    }

    /**
     * Customer Reward Points View.
     */
    public function rewardPoints(Request $request): Response
    {
        $user = $request->user();
        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('Account/RewardPoints', [
            'user' => $user,
            'points' => $user->reward_points ?? 0,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Customer Saved PC Builds.
     */
    public function savedPcBuilds(Request $request): Response
    {
        $user = $request->user();
        $unreadCount = $user->unreadNotifications()->count();
        $builds = \App\Models\SavedPcBuild::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'name' => $b->name,
                    'total_price' => (float)$b->total_price,
                    'estimated_wattage' => $b->estimated_wattage,
                    'component_count' => count(array_filter($b->components ?? [])),
                    'created_at' => $b->created_at->format('d M Y, h:i A'),
                ];
            });

        return Inertia::render('Account/SavedPcBuilds', [
            'user' => $user,
            'builds' => $builds,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Customer Service Requests.
     */
    public function serviceRequests(Request $request): Response
    {
        $user = $request->user();
        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('Account/ServiceRequests', [
            'user' => $user,
            'unreadCount' => $unreadCount,
        ]);
    }
}
