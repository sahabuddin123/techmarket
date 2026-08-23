<?php

namespace App\Models\Cctv;

use App\Models\User;
use App\Enums\Cctv\CctvRuleType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvRule extends Model
{
    protected $table = 'cctv_rules';

    protected $fillable = [
        'rule_type',
        'name',
        'code',
        'description',
        'system_type_scope',
        'product_type_scope',
        'priority',
        'conditions',
        'actions',
        'parameters',
        'is_active',
        'effective_from',
        'effective_to',
        'created_by',
    ];

    protected $casts = [
        'rule_type' => CctvRuleType::class,
        'priority' => 'integer',
        'conditions' => 'array',
        'actions' => 'array',
        'parameters' => 'array',
        'is_active' => 'boolean',
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
