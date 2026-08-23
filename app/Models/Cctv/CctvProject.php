<?php

namespace App\Models\Cctv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class CctvProject extends Model
{
    protected $table = 'cctv_projects';

    protected $fillable = [
        'project_number',
        'name',
        'user_id',
        'organization_name',
        'project_type',
        'industry',
        'status',
        'priority',
        'start_date',
        'expected_completion_date',
        'actual_completion_date',
        'project_manager_id',
        'sales_owner_id',
        'technical_owner_id',
        'budget',
        'currency',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'expected_completion_date' => 'date',
        'actual_completion_date' => 'date',
        'budget' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->project_number)) {
                $project->project_number = 'PRJ-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function sites(): HasMany
    {
        return $this->hasMany(CctvProjectSite::class, 'project_id');
    }

    public function estimates(): HasMany
    {
        return $this->hasMany(CctvEstimate::class, 'project_id');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(CctvQuote::class, 'project_id');
    }

    public function installedEquipment(): HasMany
    {
        return $this->hasMany(CctvInstalledEquipment::class, 'project_id');
    }

    public function changeRequests(): HasMany
    {
        return $this->hasMany(CctvProjectChangeRequest::class, 'project_id');
    }

    public function handover(): HasOne
    {
        return $this->hasOne(CctvProjectHandover::class, 'project_id');
    }

    /**
     * Compute authoritative aggregated project metrics across all sites.
     */
    public function getAggregatedMetricsAttribute(): array
    {
        $estimates = $this->estimates()->with('items')->get();
        $totalCameras = 0;
        $totalProjectValue = 0.0;
        $totalStorageTb = 0.0;
        $totalCableMeters = 0.0;

        foreach ($estimates as $estimate) {
            $totalProjectValue += (float) $estimate->grand_total;
            $totalStorageTb += (float) ($estimate->storage_required_tb ?? 0);
            $totalCableMeters += (float) ($estimate->cable_length_meters ?? 0);
            foreach ($estimate->items as $item) {
                $type = is_object($item->item_type) ? $item->item_type->value : (string) $item->item_type;
                if ($type === 'selected_camera' || $type === 'camera') {
                    $totalCameras += (int) $item->quantity;
                }
            }
        }

        return [
            'sites_count' => $this->sites()->count(),
            'estimates_count' => $estimates->count(),
            'total_cameras' => $totalCameras,
            'total_storage_tb' => round($totalStorageTb, 1),
            'total_cable_meters' => round($totalCableMeters, 0),
            'total_project_value' => $totalProjectValue,
            'budget_variance' => (float) $this->budget - $totalProjectValue,
        ];
    }
}
