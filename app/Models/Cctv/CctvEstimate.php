<?php

namespace App\Models\Cctv;

use App\Models\User;
use App\Enums\Cctv\CctvEstimateStatus;
use App\Enums\Cctv\CctvProjectType;
use App\Enums\Cctv\CctvSystemType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CctvEstimate extends Model
{
    protected $table = 'cctv_estimates';

    protected $fillable = [
        'project_id',
        'site_id',
        'estimate_number',
        'user_id',
        'guest_session_id',
        'project_name',
        'project_type',
        'location_district',
        'location_address',
        'floors_count',
        'areas_count',
        'system_type',
        'status',
        'version',
        'requirements_payload',
        'calculation_metrics',
        'validation_results',
        'subtotal_amount',
        'accessory_amount',
        'installation_amount',
        'discount_amount',
        'grand_total',
        'currency',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'project_type' => CctvProjectType::class,
        'system_type' => CctvSystemType::class,
        'status' => CctvEstimateStatus::class,
        'version' => 'integer',
        'floors_count' => 'integer',
        'areas_count' => 'integer',
        'requirements_payload' => 'array',
        'calculation_metrics' => 'array',
        'validation_results' => 'array',
        'subtotal_amount' => 'decimal:2',
        'accessory_amount' => 'decimal:2',
        'installation_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CctvEstimateItem::class, 'estimate_id');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(CctvQuote::class, 'estimate_id');
    }

    public function latestQuote(): HasOne
    {
        return $this->hasOne(CctvQuote::class, 'estimate_id')->latestOfMany();
    }
}
