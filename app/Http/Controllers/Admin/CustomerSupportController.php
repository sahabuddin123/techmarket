<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Services\LoyaltyService;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerSupportController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $customerData = null;

        if ($search) {
            $user = User::where('email', $search)
                ->orWhere('phone', $search)
                ->orWhere('name', 'like', "%{$search}%")
                ->orWhereHas('orders', function ($q) use ($search) {
                    $q->where('order_number', $search);
                })
                ->first();

            if ($user) {
                $orders = Order::with('items')->where('user_id', $user->id)->latest()->get();
                $totalSpend = Order::where('user_id', $user->id)->where('status', '!=', 'Cancelled')->sum('total');
                $loyaltyBalance = LoyaltyService::getUserBalance($user);
                $referralCode = ReferralService::getOrCreateReferralCode($user);

                $customerData = [
                    'user' => $user,
                    'orders' => $orders,
                    'total_spend' => (float)$totalSpend,
                    'loyalty_balance' => $loyaltyBalance,
                    'referral_code' => $referralCode,
                ];
            }
        }

        return Inertia::render('Admin/Support/Index', [
            'customerData' => $customerData,
            'filters' => $request->only('search'),
        ]);
    }
}
