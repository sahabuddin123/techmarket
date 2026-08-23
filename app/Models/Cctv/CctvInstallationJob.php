<?php

namespace App\Models\Cctv;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CctvInstallationJob extends Model
{
    protected $table = 'cctv_installation_jobs';

    protected $fillable = [
        'job_number',
        'order_id',
        'quote_id',
        'estimate_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'assigned_technician_id',
        'scheduled_date',
        'scheduled_time',
        'status',
        'actual_start_at',
        'actual_end_at',
        'camera_count',
        'installed_camera_count',
        'equipment_checklist',
        'testing_checklist',
        'technician_notes',
        'completion_photos',
        'customer_signature',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'actual_start_at' => 'datetime',
        'actual_end_at' => 'datetime',
        'camera_count' => 'integer',
        'installed_camera_count' => 'integer',
        'equipment_checklist' => 'array',
        'testing_checklist' => 'array',
        'completion_photos' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($job) {
            if (empty($job->job_number)) {
                $job->job_number = 'INST-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(CctvQuote::class);
    }

    public function estimate(): BelongsTo
    {
        return $this->belongsTo(CctvEstimate::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }
}
