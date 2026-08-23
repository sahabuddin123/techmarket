<?php

namespace App\Repositories\Contracts\Cctv;

use App\Models\Cctv\CctvQuote;
use App\Enums\Cctv\CctvQuoteStatus;
use Illuminate\Database\Eloquent\Collection;

interface CctvQuoteRepositoryInterface
{
    public function findById(int $id): ?CctvQuote;

    public function findByQuoteNumber(string $quoteNumber): ?CctvQuote;

    public function getUserQuotes(int $userId): Collection;

    public function createQuote(array $attributes): CctvQuote;

    public function updateStatus(CctvQuote $quote, CctvQuoteStatus $status): bool;

    public function linkConvertedOrder(CctvQuote $quote, int $orderId): bool;
}
