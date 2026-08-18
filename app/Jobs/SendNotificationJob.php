<?php

namespace App\Jobs;

use App\Services\Notification\NotificationManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $eventKey;
    public array $context;
    public array $overrides;

    public function __construct(string $eventKey, array $context = [], array $overrides = [])
    {
        $this->eventKey = $eventKey;
        $this->context = $context;
        $this->overrides = $overrides;
    }

    public function handle(NotificationManager $manager): void
    {
        $manager->dispatch($this->eventKey, $this->context, $this->overrides);
    }
}
