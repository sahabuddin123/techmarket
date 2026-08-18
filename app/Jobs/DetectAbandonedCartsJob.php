<?php

namespace App\Jobs;

use App\Models\AbandonedCart;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DetectAbandonedCartsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $thresholdMinutes = (int)(Setting::where('key', 'abandoned_cart_threshold_minutes')->value('value') ?: 30);
        $cutoff = Carbon::now()->subMinutes($thresholdMinutes);

        AbandonedCart::where('status', 'active')
            ->where('last_activity_at', '<=', $cutoff)
            ->update(['status' => 'abandoned']);
    }
}
