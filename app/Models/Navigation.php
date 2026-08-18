<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Navigation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'url',
        'location',
        'parent_id',
        'sort_order',
        'is_visible',
        'open_new_tab',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'open_new_tab' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted()
    {
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('navigation.footer_info');
            \Illuminate\Support\Facades\Cache::forget('navigation.footer_policies');
            \Illuminate\Support\Facades\Cache::forget('navigation.header_links');
            \Illuminate\Support\Facades\Cache::forget('navigation.global');
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::forget('navigation.footer_info');
            \Illuminate\Support\Facades\Cache::forget('navigation.footer_policies');
            \Illuminate\Support\Facades\Cache::forget('navigation.header_links');
            \Illuminate\Support\Facades\Cache::forget('navigation.global');
        });
    }

    public function parent()
    {
        return $this->belongsTo(Navigation::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Navigation::class, 'parent_id')->orderBy('sort_order');
    }
}
