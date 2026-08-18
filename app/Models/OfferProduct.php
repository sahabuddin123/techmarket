<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class OfferProduct extends Pivot
{
    use HasFactory;

    protected $table = 'offer_products';

    protected $fillable = [
        'offer_id',
        'product_id',
        'display_order',
        'is_featured',
        'badge',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'display_order' => 'integer',
    ];

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
