<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmiPartner extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_name',
        'logo',
        'min_amount',
        'available_tenures',
        'interest_rate_note',
        'terms',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'available_tenures' => 'array',
        'min_amount' => 'decimal:2',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
