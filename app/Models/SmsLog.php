<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    use HasFactory;

    protected $table = 'sms_logs';

    protected $fillable = [
        'user_id',
        'order_id',
        'phone',
        'message',
        'event_key',
        'gateway_slug',
        'provider_message_id',
        'status',
        'parts',
        'encoding',
        'character_count',
        'idempotency_key',
        'request_payload',
        'response_payload',
        'error_message',
        'retry_count',
        'sent_at',
        'delivered_at',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'response_payload' => 'array',
        'parts' => 'integer',
        'character_count' => 'integer',
        'retry_count' => 'integer',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
