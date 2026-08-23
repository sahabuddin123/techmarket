<?php

namespace App\Models\Cctv;

use App\Models\Product;
use App\Enums\Cctv\CctvEstimateItemType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvEstimateItem extends Model
{
    protected $table = 'cctv_estimate_items';

    protected $fillable = [
        'estimate_id',
        'product_id',
        'item_type',
        'product_sku_snapshot',
        'product_name_snapshot',
        'product_type',
        'system_type',
        'unit_price_snapshot',
        'quantity',
        'unit',
        'subtotal_price',
        'is_required',
        'is_recommended',
        'recommendation_reason',
        'compatibility_status',
        'metadata',
    ];

    protected $casts = [
        'item_type' => CctvEstimateItemType::class,
        'unit_price_snapshot' => 'decimal:2',
        'quantity' => 'decimal:2',
        'subtotal_price' => 'decimal:2',
        'is_required' => 'boolean',
        'is_recommended' => 'boolean',
        'metadata' => 'array',
    ];

    public function estimate(): BelongsTo
    {
        return $this->belongsTo(CctvEstimate::class, 'estimate_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
