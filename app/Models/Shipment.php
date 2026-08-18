<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'courier_provider',
        'consignment_id',
        'tracking_code',
        'invoice_id',
        'recipient_name',
        'recipient_phone',
        'recipient_address',
        'recipient_city',
        'recipient_zone',
        'recipient_area',
        'parcel_weight',
        'cod_amount',
        'delivery_charge',
        'courier_status',
        'internal_status',
        'store_id',
        'item_type',
        'special_instructions',
        'request_payload',
        'response_payload',
        'booked_at',
        'delivered_at',
        'cancelled_at',
        'created_by',
    ];

    protected $casts = [
        'parcel_weight' => 'float',
        'cod_amount' => 'float',
        'delivery_charge' => 'float',
        'request_payload' => 'array',
        'response_payload' => 'array',
        'booked_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function statusHistories()
    {
        return $this->hasMany(ShipmentStatusHistory::class)->latest();
    }
}
