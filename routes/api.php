<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProductApiController;
use App\Http\Controllers\Api\V1\OrderApiController;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public Endpoints
    Route::get('/products', [ProductApiController::class, 'index']);
    Route::get('/products/{slug}', [ProductApiController::class, 'show']);
    Route::get('/categories', [ProductApiController::class, 'categories']);

    // CCTV Estimator Endpoints
    Route::prefix('cctv')->group(function () {
        Route::post('/estimates/calculate', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'previewCalculate']);
        Route::get('/recommendations', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'getRecommendations']);
        Route::post('/presets', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'getPresets']);
        Route::post('/budget-evaluate', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'evaluateBudget']);
        Route::post('/estimates', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'store']);
        Route::get('/estimates/{estimateNumber}', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'show']);
        Route::post('/estimates/{estimateNumber}/validate', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'validateSystem']);
        Route::post('/estimates/{estimateNumber}/quote', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'createQuote']);
        Route::post('/quotes/{quoteNumber}/convert-to-cart', [\App\Http\Controllers\Api\V1\CctvEstimatorApiController::class, 'convertToCart']);
    });

    // Protected Endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        Route::get('/orders', [OrderApiController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderApiController::class, 'show']);
    });
});
