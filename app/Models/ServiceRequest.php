<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_code',
        'customer_name',
        'customer_phone',
        'customer_email',
        'device_type',
        'brand_name',
        'issue_description',
        'preferred_date',
        'service_branch',
        'address',
        'status',
        'assigned_technician',
        'admin_notes',
        'user_id',
    ];

    protected $casts = [
        'preferred_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
