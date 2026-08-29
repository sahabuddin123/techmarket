<?php

use App\Models\Setting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Enterprise Automated Database Backup Scheduler
 */
Schedule::command('db:backup --scheduled')
    ->daily()
    ->at(Setting::get('backup_schedule_time', '02:00'))
    ->when(fn() => Setting::getBool('backup_schedule_enabled', false))
    ->withoutOverlapping()
    ->name('automated_database_backup');
