<?php

namespace Database\Seeders;

use App\Models\EmailGateway;
use Illuminate\Database\Seeder;

class EmailGatewaySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Primary SMTP Provider
        EmailGateway::firstOrCreate(
            ['name' => 'Primary SMTP Server'],
            [
                'driver' => 'smtp',
                'is_active' => true,
                'is_default' => true,
                'is_fallback' => false,
                'config' => [
                    'host' => env('MAIL_HOST', '127.0.0.1'),
                    'port' => (int) env('MAIL_PORT', 2525),
                    'username' => env('MAIL_USERNAME', 'techmarket_smtp'),
                    'password' => env('MAIL_PASSWORD', 'secret_smtp_pass'),
                    'encryption' => env('MAIL_ENCRYPTION', 'tls'),
                ],
                'from_name' => 'TechMarket BD',
                'from_email' => env('MAIL_FROM_ADDRESS', 'noreply@techmarketbd.com'),
                'reply_to_email' => 'support@techmarketbd.com',
                'verified_at' => now(),
            ]
        );

        // 2. Fallback Brevo / Sendinblue Provider
        EmailGateway::firstOrCreate(
            ['name' => 'Brevo Fallback Relay'],
            [
                'driver' => 'brevo',
                'is_active' => true,
                'is_default' => false,
                'is_fallback' => true,
                'config' => [
                    'api_key' => 'xkeysib-demo-fallback-api-key-sample',
                ],
                'from_name' => 'TechMarket BD Backup',
                'from_email' => 'alerts@techmarketbd.com',
                'reply_to_email' => 'support@techmarketbd.com',
                'verified_at' => now(),
            ]
        );

        // 3. SendGrid Cloud Provider (Ready for activation)
        EmailGateway::firstOrCreate(
            ['name' => 'SendGrid Cloud Gateway'],
            [
                'driver' => 'sendgrid',
                'is_active' => false,
                'is_default' => false,
                'is_fallback' => false,
                'config' => [
                    'api_key' => '',
                ],
                'from_name' => 'TechMarket BD',
                'from_email' => 'noreply@techmarketbd.com',
                'reply_to_email' => 'support@techmarketbd.com',
            ]
        );
    }
}
