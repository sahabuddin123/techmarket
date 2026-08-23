<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'district',
        'payment_method',
        'payment_status',
        'transaction_id',
        'sender_number',
        'payment_data',
        'shipping_cost',
        'subtotal',
        'discount',
        'total',
        'status',
        'courier_provider',
        'courier_status',
        'courier_tracking_code',
        'notes',
        'fraud_score',
        'fraud_risk_level',
        'fraud_status',
        'fraud_check_id',
        'landing_page_id',
        'source_type',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'fbclid',
        'gclid',
        'campaign_id',
        'adset_id',
        'cctv_quote_id',
        'cctv_configuration_snapshot',
    ];

    protected $casts = [
        'fraud_score' => 'integer',
        'subtotal' => 'float',
        'shipping_cost' => 'float',
        'discount' => 'float',
        'total' => 'float',
        'cctv_configuration_snapshot' => 'array',
    ];

    protected $appends = [
        'payment_method_label',
    ];

    public static function formatPaymentMethodName(?string $method): string
    {
        return match (strtolower($method ?? '')) {
            'cod' => 'Cash on Delivery',
            'bkash' => 'bKash',
            'nagad' => 'Nagad',
            default => $method ?? 'Cash on Delivery',
        };
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return self::formatPaymentMethodName($this->payment_method);
    }

    public function landingPage()
    {
        return $this->belongsTo(LandingPage::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function histories()
    {
        return $this->hasMany(OrderHistory::class)->latest();
    }

    public function shipments()
    {
        return $this->hasMany(Shipment::class)->latest();
    }

    public function latestShipment()
    {
        return $this->hasOne(Shipment::class)->latestOfMany();
    }

    public function fraudCheck()
    {
        return $this->belongsTo(FraudCheck::class, 'fraud_check_id');
    }
}
