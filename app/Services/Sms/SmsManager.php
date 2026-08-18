<?php

namespace App\Services\Sms;

use App\Models\SmsGateway;
use App\Services\Sms\Providers\BulkSmsBdProvider;
use App\Services\Sms\Providers\GenericHttpSmsProvider;
use App\Services\Sms\Providers\GreenWebProvider;
use App\Services\Sms\Providers\MimsmsProvider;
use InvalidArgumentException;

class SmsManager
{
    protected array $drivers = [];

    /**
     * Get an instance of the gateway driver.
     */
    public function driver(?string $slug = null): SmsGatewayInterface
    {
        $gateway = null;

        if ($slug) {
            $gateway = SmsGateway::where('slug', $slug)->first();
        } else {
            // Find default active gateway or first active gateway
            $gateway = SmsGateway::where('is_active', true)->where('is_default', true)->first()
                ?: SmsGateway::where('is_active', true)->first();
        }

        if (!$gateway) {
            // If no gateway is configured in database, return a default GenericHttpSmsProvider that gracefully reports unconfigured
            return new GenericHttpSmsProvider([], []);
        }

        return $this->createDriver($gateway);
    }

    /**
     * Create driver instance from SmsGateway model.
     */
    public function createDriver(SmsGateway $gateway): SmsGatewayInterface
    {
        $credentials = $gateway->getDecryptedCredentials();
        $settings = $gateway->settings ?? [];

        return match ($gateway->driver) {
            'bulksmsbd' => new BulkSmsBdProvider($credentials, $settings),
            'mimsms' => new MimsmsProvider($credentials, $settings),
            'greenweb' => new GreenWebProvider($credentials, $settings),
            'generic_http' => new GenericHttpSmsProvider($credentials, $settings),
            default => throw new InvalidArgumentException("Unsupported SMS driver [{$gateway->driver}]."),
        };
    }

    /**
     * Seed initial supported gateways if not present.
     */
    public static function seedDefaultGateways(): void
    {
        $gateways = [
            [
                'name' => 'BulkSMS BD',
                'slug' => 'bulksmsbd',
                'driver' => 'bulksmsbd',
                'is_active' => false,
                'is_default' => false,
                'settings' => [
                    'base_url' => 'http://bulksmsbd.net/api/smsapi',
                    'sender_id' => '',
                ],
                'status_notes' => 'Official BulkSMS BD API integration for Bangladesh.',
            ],
            [
                'name' => 'MIM SMS',
                'slug' => 'mimsms',
                'driver' => 'mimsms',
                'is_active' => false,
                'is_default' => false,
                'settings' => [
                    'base_url' => 'https://api.mimsms.com/api/SmsSending/SMS',
                    'sender_id' => '',
                ],
                'status_notes' => 'MIM SMS REST API with transaction type P/T support.',
            ],
            [
                'name' => 'Greenweb SMS',
                'slug' => 'greenweb',
                'driver' => 'greenweb',
                'is_active' => false,
                'is_default' => false,
                'settings' => [
                    'base_url' => 'http://api.greenweb.com.bd/api.php',
                ],
                'status_notes' => 'Greenweb Bangladesh SMS Gateway with token auth.',
            ],
            [
                'name' => 'Generic HTTP Gateway',
                'slug' => 'generic_http',
                'driver' => 'generic_http',
                'is_active' => false,
                'is_default' => false,
                'settings' => [
                    'api_url' => '',
                    'http_method' => 'POST',
                    'phone_field' => 'to',
                    'message_field' => 'message',
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                ],
                'status_notes' => 'Custom HTTP/JSON/REST API Gateway for any SMS vendor.',
            ],
        ];

        foreach ($gateways as $gw) {
            SmsGateway::firstOrCreate(['slug' => $gw['slug']], $gw);
        }
    }
}
