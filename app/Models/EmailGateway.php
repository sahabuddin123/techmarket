<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class EmailGateway extends Model
{
    protected $table = 'email_gateways';

    protected $fillable = [
        'name',
        'driver',
        'is_active',
        'is_default',
        'is_fallback',
        'config',
        'from_name',
        'from_email',
        'reply_to_email',
        'verified_at',
        'last_tested_at',
        'last_error',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'is_fallback' => 'boolean',
        'verified_at' => 'datetime',
        'last_tested_at' => 'datetime',
    ];

    /**
     * Get decrypted configuration array.
     */
    public function getConfigAttribute($value): array
    {
        if (empty($value)) {
            return [];
        }
        try {
            $decrypted = Crypt::decryptString($value);
            return json_decode($decrypted, true) ?? [];
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Set and encrypt configuration array.
     */
    public function setConfigAttribute($value): void
    {
        if (is_array($value)) {
            // If updating, preserve existing secret fields if received as masked or empty
            $existing = $this->config ?? [];
            foreach (['password', 'api_key', 'secret_key'] as $secretKey) {
                if (isset($value[$secretKey]) && ($value[$secretKey] === '••••••••' || empty($value[$secretKey]))) {
                    $value[$secretKey] = $existing[$secretKey] ?? '';
                }
            }
            $json = json_encode($value);
            $this->attributes['config'] = Crypt::encryptString($json);
        } elseif (is_string($value) && !empty($value)) {
            $this->attributes['config'] = Crypt::encryptString($value);
        } else {
            $this->attributes['config'] = null;
        }
    }

    /**
     * Get masked configuration for safe frontend display.
     */
    public function getMaskedConfigAttribute(): array
    {
        $cfg = $this->config;
        foreach (['password', 'api_key', 'secret_key'] as $secretKey) {
            if (!empty($cfg[$secretKey])) {
                $cfg[$secretKey] = '••••••••';
            }
        }
        return $cfg;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeFallback($query)
    {
        return $query->where('is_fallback', true);
    }
}
