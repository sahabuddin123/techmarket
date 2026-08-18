<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Coupon;
use App\Models\CmsPage;
use App\Models\BlogPost;

class AdminSearchService
{
    public static function search(string $query, ?User $user = null): array
    {
        $query = trim($query);

        if (mb_strlen($query) < 2) {
            return [
                'query' => $query,
                'total_results' => 0,
                'results' => [],
            ];
        }

        $results = [];
        $totalCount = 0;
        $term = "%{$query}%";

        // 1. Orders
        if (!$user || $user->hasPermission('orders.view') || $user->hasRole('Super Admin') || $user->role === 'admin') {
            $orders = Order::where(function ($q) use ($term) {
                $q->where('order_number', 'like', $term)
                  ->orWhere('customer_name', 'like', $term)
                  ->orWhere('customer_phone', 'like', $term)
                  ->orWhere('customer_email', 'like', $term)
                  ->orWhere('transaction_id', 'like', $term);
            })
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($o) => [
                'id' => $o->id,
                'title' => "Order #{$o->order_number}",
                'subtitle' => "{$o->customer_name} • ৳" . number_format($o->total) . " • {$o->status}",
                'url' => "/admin/orders/{$o->id}",
                'badge' => $o->status,
            ]);

            if ($orders->isNotEmpty()) {
                $results['orders'] = $orders;
                $totalCount += $orders->count();
            }
        }

        // 2. Products
        if (!$user || $user->hasPermission('products.view') || $user->hasRole('Super Admin') || $user->role === 'admin') {
            $products = Product::where('title', 'like', $term)
                ->orWhere('sku', 'like', $term)
                ->take(5)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'subtitle' => "SKU: {$p->sku} • ৳" . number_format($p->price) . " • Stock: {$p->stock}",
                    'url' => "/admin/products/{$p->id}/edit",
                    'badge' => $p->stock > 0 ? 'In Stock' : 'Out of Stock',
                ]);

            if ($products->isNotEmpty()) {
                $results['products'] = $products;
                $totalCount += $products->count();
            }
        }

        // 3. Customers
        if (!$user || $user->hasPermission('reports.customers') || $user->hasPermission('reports.view') || $user->hasRole('Super Admin') || $user->role === 'admin') {
            $customers = User::where('role', '!=', 'admin')
                ->where(function ($q) use ($term) {
                    $q->where('name', 'like', $term)
                      ->orWhere('email', 'like', $term)
                      ->orWhere('phone', 'like', $term);
                })
                ->take(5)
                ->get()
                ->map(fn($c) => [
                    'id' => $c->id,
                    'title' => $c->name,
                    'subtitle' => "{$c->email} • {$c->phone}",
                    'url' => "/admin/customers?search=" . urlencode($c->email),
                    'badge' => 'Customer',
                ]);

            if ($customers->isNotEmpty()) {
                $results['customers'] = $customers;
                $totalCount += $customers->count();
            }
        }

        // 4. Categories
        if (!$user || $user->hasPermission('products.view') || $user->hasRole('Super Admin') || $user->role === 'admin') {
            $categories = Category::where('name', 'like', $term)
                ->orWhere('slug', 'like', $term)
                ->take(5)
                ->get()
                ->map(fn($cat) => [
                    'id' => $cat->id,
                    'title' => $cat->name,
                    'subtitle' => "Slug: {$cat->slug}",
                    'url' => "/admin/categories/{$cat->id}/edit",
                    'badge' => 'Category',
                ]);

            if ($categories->isNotEmpty()) {
                $results['categories'] = $categories;
                $totalCount += $categories->count();
            }
        }

        // 5. Brands
        if (!$user || $user->hasPermission('products.view') || $user->hasRole('Super Admin') || $user->role === 'admin') {
            $brands = Brand::where('name', 'like', $term)
                ->orWhere('slug', 'like', $term)
                ->take(5)
                ->get()
                ->map(fn($b) => [
                    'id' => $b->id,
                    'title' => $b->name,
                    'subtitle' => "Slug: {$b->slug}",
                    'url' => "/admin/brands/{$b->id}/edit",
                    'badge' => 'Brand',
                ]);

            if ($brands->isNotEmpty()) {
                $results['brands'] = $brands;
                $totalCount += $brands->count();
            }
        }

        // 6. Coupons
        if (!$user || $user->hasPermission('settings.manage') || $user->hasRole('Super Admin') || $user->role === 'admin') {
            $coupons = Coupon::where('code', 'like', $term)
                ->orWhere('description', 'like', $term)
                ->take(5)
                ->get()
                ->map(fn($cp) => [
                    'id' => $cp->id,
                    'title' => $cp->code,
                    'subtitle' => "{$cp->type} - {$cp->value} discount",
                    'url' => "/admin/coupons/{$cp->id}/edit",
                    'badge' => $cp->is_active ? 'Active' : 'Inactive',
                ]);

            if ($coupons->isNotEmpty()) {
                $results['coupons'] = $coupons;
                $totalCount += $coupons->count();
            }
        }

        // 7. CMS Pages & Blog Posts
        if (!$user || $user->hasRole('Super Admin') || $user->role === 'admin') {
            $contentItems = collect();

            $pages = CmsPage::where('title', 'like', $term)->orWhere('slug', 'like', $term)->take(3)->get()->map(fn($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'subtitle' => "/page/{$p->slug}",
                'url' => "/page/{$p->slug}",
                'badge' => 'CMS Page',
            ]);

            $posts = BlogPost::where('title', 'like', $term)->orWhere('slug', 'like', $term)->take(3)->get()->map(fn($b) => [
                'id' => $b->id,
                'title' => $b->title,
                'subtitle' => "Blog: {$b->category}",
                'url' => "/blog/{$b->slug}",
                'badge' => 'Blog Post',
            ]);

            $content = $contentItems->concat($pages)->concat($posts);
            if ($content->isNotEmpty()) {
                $results['content'] = $content->take(5)->values();
                $totalCount += $results['content']->count();
            }
        }

        return [
            'query' => $query,
            'total_results' => $totalCount,
            'results' => $results,
        ];
    }
}
