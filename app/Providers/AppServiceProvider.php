<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // CCTV Repositories
        $this->app->bind(
            \App\Repositories\Contracts\Cctv\CctvProductProfileRepositoryInterface::class,
            \App\Repositories\Eloquent\Cctv\EloquentCctvProductProfileRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\Cctv\CctvRuleRepositoryInterface::class,
            \App\Repositories\Eloquent\Cctv\EloquentCctvRuleRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\Cctv\CctvEstimateRepositoryInterface::class,
            \App\Repositories\Eloquent\Cctv\EloquentCctvEstimateRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\Cctv\CctvQuoteRepositoryInterface::class,
            \App\Repositories\Eloquent\Cctv\EloquentCctvQuoteRepository::class
        );

        // CCTV Services
        $this->app->bind(
            \App\Services\Contracts\Cctv\CctvStorageCalculatorInterface::class,
            \App\Services\Cctv\CctvStorageCalculator::class
        );
        $this->app->bind(
            \App\Services\Contracts\Cctv\CctvCableCalculatorInterface::class,
            \App\Services\Cctv\CctvCableCalculator::class
        );
        $this->app->bind(
            \App\Services\Contracts\Cctv\CctvCompatibilityEngineInterface::class,
            \App\Services\Cctv\CctvCompatibilityService::class
        );
        $this->app->bind(
            \App\Services\Contracts\Cctv\CctvRecommendationEngineInterface::class,
            \App\Services\Cctv\CctvRecommendationService::class
        );
        $this->app->bind(
            \App\Services\Contracts\Cctv\CctvEstimatorServiceInterface::class,
            \App\Services\Cctv\CctvEstimateService::class
        );
        $this->app->bind(
            \App\Services\Contracts\Cctv\CctvQuoteServiceInterface::class,
            \App\Services\Cctv\CctvQuoteService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
