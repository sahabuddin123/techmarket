<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('products.view') || $user->isAdmin();
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasPermission('products.view') || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('products.create') || $user->isAdmin();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermission('products.update') || $user->isAdmin();
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermission('products.delete') || $user->isAdmin();
    }
}
