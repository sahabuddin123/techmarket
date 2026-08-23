<?php

namespace App\Services\Cctv;

use App\DTOs\Cctv\QuoteGenerationDTO;
use App\Enums\Cctv\CctvEstimateStatus;
use App\Enums\Cctv\CctvQuoteStatus;
use App\Models\Cctv\CctvQuote;
use App\Repositories\Contracts\Cctv\CctvEstimateRepositoryInterface;
use App\Repositories\Contracts\Cctv\CctvQuoteRepositoryInterface;
use App\Services\Contracts\Cctv\CctvQuoteServiceInterface;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CctvQuoteService implements CctvQuoteServiceInterface
{
    public function __construct(
        private readonly CctvQuoteRepositoryInterface $quoteRepo,
        private readonly CctvEstimateRepositoryInterface $estimateRepo,
    ) {}

    public function generateQuote(QuoteGenerationDTO $dto): CctvQuote
    {
        return DB::transaction(function () use ($dto) {
            $estimate = $this->estimateRepo->findById($dto->estimateId);
            if (!$estimate) {
                throw new InvalidArgumentException("Estimate ID {$dto->estimateId} not found.");
            }

            $subtotal = (float) $estimate->subtotal_amount + (float) $estimate->accessory_amount;
            $installation = $dto->customInstallationAmount > 0
                ? $dto->customInstallationAmount
                : (float) $estimate->installation_amount;
            $discount = $dto->discountAmount;
            $tax = $dto->taxAmount;
            $shipping = $dto->shippingAmount;

            $grandTotal = $subtotal + $installation + $tax + $shipping - $discount;

            $quote = $this->quoteRepo->createQuote([
                'estimate_id' => $estimate->id,
                'user_id' => $dto->userId ?? $estimate->user_id,
                'customer_name' => $dto->customerName,
                'customer_phone' => $dto->customerPhone,
                'customer_email' => $dto->customerEmail,
                'company_name' => $dto->companyName,
                'valid_until' => $dto->validUntil ?? now()->addDays(15),
                'status' => CctvQuoteStatus::ISSUED->value,
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discount, 2),
                'installation_amount' => round($installation, 2),
                'tax_amount' => round($tax, 2),
                'shipping_amount' => round($shipping, 2),
                'grand_total' => round($grandTotal, 2),
                'terms_and_conditions' => $dto->termsAndConditions ?? "1. Standard 1 Year Warranty on Active Components.\n2. Payment terms: 50% advance, 50% upon installation completion.\n3. Quote valid for 15 days.",
                'notes' => $dto->notes,
            ]);

            $this->estimateRepo->updateStatus($estimate, CctvEstimateStatus::QUOTED);

            return $quote;
        });
    }

    public function acceptQuote(string $quoteNumber): bool
    {
        $quote = $this->quoteRepo->findByQuoteNumber($quoteNumber);
        if (!$quote) {
            return false;
        }

        return $this->quoteRepo->updateStatus($quote, CctvQuoteStatus::ACCEPTED);
    }

    public function convertQuoteToCart(string $quoteNumber, string $sessionId): array
    {
        $quote = $this->quoteRepo->findByQuoteNumber($quoteNumber);
        if (!$quote || !$quote->estimate) {
            throw new InvalidArgumentException("Quote not found or has no attached estimate items.");
        }

        $cart = session()->get('cart', []);

        foreach ($quote->estimate->items as $item) {
            if (!$item->product_id) continue;

            $productId = $item->product_id;
            $qty = (int) ceil($item->quantity);
            $price = (float) $item->unit_price_snapshot;

            if (isset($cart[$productId])) {
                $cart[$productId]['quantity'] += $qty;
                $cart[$productId]['total'] = $cart[$productId]['quantity'] * $cart[$productId]['price'];
            } else {
                $cart[$productId] = [
                    'id' => $productId,
                    'title' => $item->product_name_snapshot,
                    'sku' => $item->product_sku_snapshot,
                    'price' => $price,
                    'quantity' => $qty,
                    'total' => $price * $qty,
                    'image' => $item->product?->image,
                    'is_cctv_item' => true,
                    'estimate_number' => $quote->estimate->estimate_number,
                ];
            }
        }

        session()->put('cart', $cart);

        return [
            'cart_count' => array_reduce($cart, fn($carry, $item) => $carry + $item['quantity'], 0),
            'cart_total' => array_reduce($cart, fn($carry, $item) => $carry + $item['total'], 0),
        ];
    }
}
