<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\Payment;
use App\Models\AbandonedCart;
use App\Models\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SystemHealthController extends Controller
{
    public function index()
    {
        $lowStockCount = Product::where('stock', '>', 0)->where('stock', '<=', 5)->count();
        $outOfStockCount = Product::where('stock', '<=', 0)->count();
        $pendingOrdersCount = Order::where('status', 'Pending')->count();
        $awaitingPaymentsCount = Payment::where('status', 'awaiting_verification')->count();
        $abandonedCartsCount = AbandonedCart::where('status', 'abandoned')->count();

        $failedJobsCount = DB::table('failed_jobs')->count();
        $unreadNotificationsCount = DB::table('notifications')->whereNull('read_at')->count();

        return Inertia::render('Admin/SystemHealth/Index', [
            'metrics' => [
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
                'pending_orders' => $pendingOrdersCount,
                'awaiting_payments' => $awaitingPaymentsCount,
                'abandoned_carts' => $abandonedCartsCount,
                'failed_jobs' => $failedJobsCount,
                'unread_notifications' => $unreadNotificationsCount,
                'app_env' => config('app.env'),
                'debug_mode' => (bool)config('app.debug'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
            ]
        ]);
    }
}
