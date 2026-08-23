<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CctvServiceRequest extends Model
{
    protected $table = 'cctv_service_requests';

    protected $fillable = [
        'ticket_number',
        'user_id',
        'installed_equipment_id',
        'warranty_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'service_type_code',
        'problem_category',
        'problem_description',
        'priority',
        'status',
        'assigned_technician_id',
        'preferred_visit_date',
        'preferred_time',
        'diagnostic_answers',
        'internal_notes',
        'photos',
        'total_service_cost',
        'warranty_covered_amount',
        'customer_payable_amount',
    ];

    protected $casts = [
        'preferred_visit_date' => 'date',
        'diagnostic_answers' => 'array',
        'photos' => 'array',
        'total_service_cost' => 'decimal:2',
        'warranty_covered_amount' => 'decimal:2',
        'customer_payable_amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = 'SRV-TCK-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(CctvInstalledEquipment::class, 'installed_equipment_id');
    }

    public function warranty(): BelongsTo
    {
        return $this->belongsTo(CctvWarranty::class, 'warranty_id');
    }

    public function visits(): HasMany
    {
        return $this->hasMany(CctvServiceVisit::class, 'service_request_id');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(CctvServicePart::class, 'service_request_id');
    }

    public function replacements(): HasMany
    {
        return $this->hasMany(CctvEquipmentReplacement::class, 'service_request_id');
    }
}
