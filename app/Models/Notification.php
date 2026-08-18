<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    use HasUuids;

    protected $table = 'notifications';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'type',
        'notifiable_type',
        'notifiable_id',
        'user_id',
        'recipient_type',
        'recipient_id',
        'category',
        'priority',
        'title',
        'message',
        'icon',
        'image',
        'action_url',
        'action_label',
        'data',
        'read_at',
        'seen_at',
        'expires_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'seen_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Priority Constants
    public const PRIORITY_LOW = 'LOW';
    public const PRIORITY_NORMAL = 'NORMAL';
    public const PRIORITY_HIGH = 'HIGH';
    public const PRIORITY_URGENT = 'URGENT';
    public const PRIORITY_CRITICAL = 'CRITICAL';

    // Category Constants
    public const CATEGORY_ORDER = 'ORDER';
    public const CATEGORY_PAYMENT = 'PAYMENT';
    public const CATEGORY_COURIER = 'COURIER';
    public const CATEGORY_FRAUD = 'FRAUD';
    public const CATEGORY_INVENTORY = 'INVENTORY';
    public const CATEGORY_CUSTOMER = 'CUSTOMER';
    public const CATEGORY_PRODUCT = 'PRODUCT';
    public const CATEGORY_SYSTEM = 'SYSTEM';
    public const CATEGORY_SMS = 'SMS';
    public const CATEGORY_PROMOTION = 'PROMOTION';
    public const CATEGORY_SECURITY = 'SECURITY';
    public const CATEGORY_SUPPORT = 'SUPPORT';
    public const CATEGORY_ADMIN = 'ADMIN';

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsSeen(): void
    {
        if (is_null($this->seen_at)) {
            $this->update(['seen_at' => now()]);
        }
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopePriority($query, string $priority)
    {
        return $query->where('priority', strtoupper($priority));
    }

    public function scopeCategory($query, string $category)
    {
        return $query->where('category', strtoupper($category));
    }

    public function scopeForRecipient($query, $userId, ?string $role = null)
    {
        return $query->where(function ($q) use ($userId, $role) {
            $q->where('user_id', $userId)
              ->orWhere(function ($q2) use ($userId) {
                  $q2->where('notifiable_type', User::class)
                     ->where('notifiable_id', $userId);
              });

            if ($role) {
                $q->orWhere(function ($q3) use ($role) {
                    $q3->where('recipient_type', 'role')
                       ->where('recipient_id', $role);
                });
            }
        });
    }
}
