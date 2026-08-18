<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailUnsubscribe extends Model
{
    protected $table = 'email_unsubscribes';

    protected $fillable = [
        'email',
        'category',
        'reason',
        'token',
        'unsubscribed_at',
    ];

    protected $casts = [
        'unsubscribed_at' => 'datetime',
    ];
}
