<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_spend',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'value' => 'float',
        'min_spend' => 'float',
    ];

    public function isValidFor($subtotal): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->min_spend && $subtotal < $this->min_spend) return false;
        return true;
    }

    public function calculateDiscount($subtotal): float
    {
        if (!$this->isValidFor($subtotal)) return 0.0;
        if ($this->type === 'percent') {
            return round(($subtotal * $this->value) / 100, 2);
        }
        return min((float)$this->value, $subtotal);
    }
}
