<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'sku_snapshot',
        'image_snapshot',
        'specs_snapshot',
        'price',
        'quantity',
        'total',
    ];

    protected $casts = [
        'specs_snapshot' => 'array',
        'price' => 'float',
        'total' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
