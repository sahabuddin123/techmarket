<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CctvWarrantyClaim extends Model
{
    protected $table = 'cctv_warranty_claims';

    protected $fillable = [
        'claim_number',
        'warranty_id',
        'user_id',
        'service_request_id',
        'installed_equipment_id',
        'claim_date',
        'issue_description',
        'status',
        'resolution_notes',
    ];

    protected $casts = [
        'claim_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($claim) {
            if (empty($claim->claim_number)) {
                $claim->claim_number = 'CLM-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    public function warranty(): BelongsTo
    {
        return $this->belongsTo(CctvWarranty::class, 'warranty_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(CctvServiceRequest::class, 'service_request_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(CctvInstalledEquipment::class, 'installed_equipment_id');
    }
}
