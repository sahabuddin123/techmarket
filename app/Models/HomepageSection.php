<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_key',
        'title',
        'subtitle',
        'sort_order',
        'is_enabled',
        'config',
    ];

    protected $casts = [
        'config' => 'array',
        'is_enabled' => 'boolean',
        'sort_order' => 'integer',
    ];
}
