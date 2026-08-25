<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketingAutomation extends Model
{
    use HasFactory;

    protected $table = 'marketing_automations';

    protected $fillable = [
        'trigger_event',
        'name',
        'channel',
        'is_active',
        'template',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
