<?php

namespace App\Services\Contracts\Cctv;

use App\DTOs\Cctv\QuoteGenerationDTO;
use App\Models\Cctv\CctvQuote;

interface CctvQuoteServiceInterface
{
    public function generateQuote(QuoteGenerationDTO $dto): CctvQuote;

    public function acceptQuote(string $quoteNumber): bool;

    public function convertQuoteToCart(string $quoteNumber, string $sessionId): array;
}
