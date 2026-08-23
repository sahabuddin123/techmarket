<?php

namespace App\Models\Cctv;

use App\Models\User;
use App\Models\Order;
use App\Enums\Cctv\CctvQuoteStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvQuote extends Model
{
    protected $table = 'cctv_quotes';

    protected $fillable = [
        'quote_number',
        'share_token',
        'estimate_id',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'company_name',
        'valid_until',
        'status',
        'approved_at',
        'approval_ip',
        'approval_user_agent',
        'revision_number',
        'parent_quote_id',
        'subtotal',
        'discount_amount',
        'installation_amount',
        'tax_amount',
        'shipping_amount',
        'grand_total',
        'terms_and_conditions',
        'notes',
        'converted_order_id',
    ];

    protected $casts = [
        'status' => CctvQuoteStatus::class,
        'valid_until' => 'datetime',
        'approved_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'installation_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($quote) {
            if (empty($quote->share_token)) {
                $quote->share_token = \Illuminate\Support\Str::random(32);
            }
        });
    }

    public function estimate(): BelongsTo
    {
        return $this->belongsTo(CctvEstimate::class, 'estimate_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function convertedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'converted_order_id');
    }

    public function parentQuote(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_quote_id');
    }

    public function isExpired(): bool
    {
        return $this->valid_until->isPast();
    }
}
