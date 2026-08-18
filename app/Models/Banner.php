<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'badge',
        'image',
        'mobile_image',
        'placement',
        'button_text',
        'button_url',
        'is_active',
        'sort_order',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];
}
