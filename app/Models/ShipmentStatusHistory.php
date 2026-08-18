<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShipmentStatusHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'shipment_id',
        'courier_status',
        'internal_status',
        'notes',
        'raw_response',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'raw_response' => 'array',
        'created_at' => 'datetime',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
