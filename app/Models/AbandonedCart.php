<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbandonedCart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'items',
        'total_value',
        'status',
        'last_activity_at',
        'recovered_order_id',
    ];

    protected $casts = [
        'items' => 'array',
        'last_activity_at' => 'datetime',
        'total_value' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recoveredOrder()
    {
        return $this->belongsTo(Order::class, 'recovered_order_id');
    }
}
