<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AbandonedCart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AbandonedCartController extends Controller
{
    public function index()
    {
        $carts = AbandonedCart::with(['user', 'recoveredOrder'])->latest('last_activity_at')->paginate(15);

        return Inertia::render('Admin/AbandonedCarts/Index', [
            'carts' => $carts,
        ]);
    }
}
