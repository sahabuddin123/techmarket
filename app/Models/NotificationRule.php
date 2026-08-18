<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationRule extends Model
{
    protected $table = 'notification_rules';

    protected $fillable = [
        'event_key',
        'name',
        'description',
        'category',
        'default_priority',
        'enabled',
        'notify_roles',
        'notify_users',
        'channels',
        'template_title',
        'template_message',
        'action_url_template',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'notify_roles' => 'array',
        'notify_users' => 'array',
        'channels' => 'array',
    ];

    public function scopeActive($query)
    {
        return $query->where('enabled', true);
    }
}
