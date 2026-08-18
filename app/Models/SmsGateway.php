<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class SmsGateway extends Model
{
    use HasFactory;

    protected $table = 'sms_gateways';

    protected $fillable = [
        'name',
        'slug',
        'driver',
        'is_active',
        'is_default',
        'credentials',
        'settings',
        'status_notes',
        'last_tested_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'settings' => 'array',
        'last_tested_at' => 'datetime',
    ];

    /**
     * Get decrypted credentials array.
     */
    public function getDecryptedCredentials(): array
    {
        if (empty($this->credentials)) {
            return [];
        }

        try {
            $decrypted = Crypt::decryptString($this->credentials);
            return json_decode($decrypted, true) ?: [];
        } catch (\Throwable $e) {
            Log::error("Failed to decrypt credentials for SMS Gateway [{$this->slug}]: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Set encrypted credentials array.
     */
    public function setEncryptedCredentials(array $credentials): void
    {
        $this->credentials = Crypt::encryptString(json_encode($credentials));
    }

    /**
     * Check if a specific credential key is configured.
     */
    public function hasCredential(string $key): bool
    {
        $creds = $this->getDecryptedCredentials();
        return !empty($creds[$key]);
    }
}
