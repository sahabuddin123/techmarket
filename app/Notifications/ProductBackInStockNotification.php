<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProductBackInStockNotification extends Notification
{
    use Queueable;

    public Product $product;

    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'back_in_stock',
            'product_id' => $this->product->id,
            'product_title' => $this->product->title,
            'message' => "'{$this->product->title}' is back in stock now! Grab yours while supplies last.",
        ];
    }
}
