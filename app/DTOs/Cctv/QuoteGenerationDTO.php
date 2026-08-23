<?php

namespace App\DTOs\Cctv;

use DateTimeInterface;

readonly class QuoteGenerationDTO
{
    public function __construct(
        public int $estimateId,
        public ?int $userId,
        public string $customerName,
        public string $customerPhone,
        public ?string $customerEmail = null,
        public ?string $companyName = null,
        public ?DateTimeInterface $validUntil = null,
        public float $discountAmount = 0.0,
        public float $customInstallationAmount = 0.0,
        public float $taxAmount = 0.0,
        public float $shippingAmount = 0.0,
        public ?string $termsAndConditions = null,
        public ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            estimateId: (int) $data['estimate_id'],
            userId: isset($data['user_id']) ? (int) $data['user_id'] : null,
            customerName: $data['customer_name'] ?? 'Valued Client',
            customerPhone: $data['customer_phone'] ?? '',
            customerEmail: $data['customer_email'] ?? null,
            companyName: $data['company_name'] ?? null,
            validUntil: isset($data['valid_until']) ? new \DateTime($data['valid_until']) : (new \DateTime())->modify('+15 days'),
            discountAmount: (float) ($data['discount_amount'] ?? 0.0),
            customInstallationAmount: (float) ($data['custom_installation_amount'] ?? 0.0),
            taxAmount: (float) ($data['tax_amount'] ?? 0.0),
            shippingAmount: (float) ($data['shipping_amount'] ?? 0.0),
            termsAndConditions: $data['terms_and_conditions'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }
}
