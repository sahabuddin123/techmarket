<?php

namespace App\Services\Sms;

interface SmsGatewayInterface
{
    /**
     * Send an SMS message via provider API.
     */
    public function send(SmsMessage $message): SmsResponse;

    /**
     * Test connection / credentials with provider API.
     */
    public function testConnection(): array;

    /**
     * Get account balance or remaining credits if supported.
     */
    public function getBalance(): ?float;

    /**
     * Driver identifier name.
     */
    public function getDriverName(): string;
}
