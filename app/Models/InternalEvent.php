<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_name',
        'event_id',
        'content_id',
        'product_id',
        'category_id',
        'user_id',
        'session_id',
        'value',
        'currency',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'value' => 'float',
        'metadata' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
