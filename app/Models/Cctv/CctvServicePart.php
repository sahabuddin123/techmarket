<?php

namespace App\Models\Cctv;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CctvServicePart extends Model
{
    protected $table = 'cctv_service_parts';

    protected $fillable = [
        'service_request_id',
        'service_visit_id',
        'product_id',
        'quantity_used',
        'unit_price',
        'is_warranty_covered',
        'technician_id',
    ];

    protected $casts = [
        'quantity_used' => 'integer',
        'unit_price' => 'decimal:2',
        'is_warranty_covered' => 'boolean',
    ];

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(CctvServiceRequest::class, 'service_request_id');
    }

    public function serviceVisit(): BelongsTo
    {
        return $this->belongsTo(CctvServiceVisit::class, 'service_visit_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
