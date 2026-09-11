<?php

use App\Models\SmsGateway;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove default status from existing gateways so M-RAM becomes primary
        SmsGateway::where('is_default', true)->update(['is_default' => false]);

        $gateway = SmsGateway::firstOrNew(['slug' => 'mram']);
        $gateway->name = 'M-RAM Technologies';
        $gateway->driver = 'mram';
        $gateway->is_active = true;
        $gateway->is_default = true;
        $gateway->status_notes = 'Official M-RAM Technologies SMS API (msg.mram.com.bd) with masking 8809601017199.';
        $gateway->settings = [
            'base_url' => 'https://msg.mram.com.bd/smsapi',
            'sender_id' => '8809601017199',
        ];

        // Encrypt credentials securely with AES-256
        $gateway->setEncryptedCredentials([
            'api_key' => 'C40002956aa1a646106c41.09766335',
            'sender_id' => '8809601017199',
        ]);

        $gateway->save();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        SmsGateway::where('slug', 'mram')->delete();
    }
};
