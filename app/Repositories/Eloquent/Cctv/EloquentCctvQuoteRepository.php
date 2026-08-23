<?php

namespace App\Repositories\Eloquent\Cctv;

use App\Enums\Cctv\CctvQuoteStatus;
use App\Models\Cctv\CctvQuote;
use App\Repositories\Contracts\Cctv\CctvQuoteRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EloquentCctvQuoteRepository implements CctvQuoteRepositoryInterface
{
    public function findById(int $id): ?CctvQuote
    {
        return CctvQuote::with(['estimate.items.product', 'user', 'convertedOrder'])->find($id);
    }

    public function findByQuoteNumber(string $quoteNumber): ?CctvQuote
    {
        return CctvQuote::with(['estimate.items.product', 'user', 'convertedOrder'])
            ->where('quote_number', $quoteNumber)
            ->first();
    }

    public function getUserQuotes(int $userId): Collection
    {
        return CctvQuote::with(['estimate', 'convertedOrder'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function createQuote(array $attributes): CctvQuote
    {
        return DB::transaction(function () use ($attributes) {
            if (empty($attributes['quote_number'])) {
                $attributes['quote_number'] = 'QTE-CCTV-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(4)));
            }

            return CctvQuote::create($attributes);
        });
    }

    public function updateStatus(CctvQuote $quote, CctvQuoteStatus $status): bool
    {
        return $quote->update(['status' => $status->value]);
    }

    public function linkConvertedOrder(CctvQuote $quote, int $orderId): bool
    {
        return $quote->update([
            'status' => CctvQuoteStatus::CONVERTED_TO_ORDER->value,
            'converted_order_id' => $orderId,
        ]);
    }
}
