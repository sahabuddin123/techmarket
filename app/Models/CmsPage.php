<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CmsPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'banner',
        'content',
        'sections',
        'meta_title',
        'meta_description',
        'is_published',
    ];

    protected $casts = [
        'sections' => 'array',
        'is_published' => 'boolean',
    ];
}
