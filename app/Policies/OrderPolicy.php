<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('orders.view') || $user->isAdmin();
    }

    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin() || $user->hasPermission('orders.view') || $user->id === $order->user_id;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.update') || $user->isAdmin();
    }

    public function cancel(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.cancel') || $user->isAdmin() || ($user->id === $order->user_id && $order->status === 'Pending');
    }
}
