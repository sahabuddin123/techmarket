<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailTemplate extends Model
{
    protected $table = 'email_templates';

    protected $fillable = [
        'name',
        'slug',
        'category',
        'subject',
        'preheader',
        'html_content',
        'plain_text_content',
        'editor_schema',
        'variables',
        'thumbnail',
        'is_active',
    ];

    protected $casts = [
        'editor_schema' => 'array',
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(EmailLog::class, 'template_id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(EmailCampaign::class, 'template_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
