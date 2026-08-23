<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Cctv\CctvRequirementDTO;
use App\DTOs\Cctv\QuoteGenerationDTO;
use App\Http\Controllers\Controller;
use App\Repositories\Contracts\Cctv\CctvEstimateRepositoryInterface;
use App\Repositories\Contracts\Cctv\CctvProductProfileRepositoryInterface;
use App\Services\Contracts\Cctv\CctvCompatibilityEngineInterface;
use App\Services\Contracts\Cctv\CctvEstimatorServiceInterface;
use App\Services\Contracts\Cctv\CctvQuoteServiceInterface;
use App\Services\Contracts\Cctv\CctvRecommendationEngineInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CctvEstimatorApiController extends Controller
{
    public function __construct(
        private readonly CctvEstimatorServiceInterface $estimatorService,
        private readonly CctvRecommendationEngineInterface $recommendationService,
        private readonly CctvCompatibilityEngineInterface $compatibilityService,
        private readonly CctvQuoteServiceInterface $quoteService,
        private readonly CctvEstimateRepositoryInterface $estimateRepo,
        private readonly CctvProductProfileRepositoryInterface $productProfileRepo,
    ) {}

    /**
     * Preview calculation (Stateless without saving).
     */
    public function previewCalculate(Request $request): JsonResponse
    {
        $requirements = CctvRequirementDTO::fromArray($request->input('requirements', []));
        $selectedItems = $request->input('items', []);

        $summary = $this->estimatorService->calculateEstimate($requirements, $selectedItems);

        return response()->json([
            'status' => 'success',
            'data' => $summary->toArray(),
        ]);
    }

    /**
     * Create or persist an estimate.
     */
    public function store(Request $request): JsonResponse
    {
        $requirements = CctvRequirementDTO::fromArray($request->input('requirements', []));
        $selectedItems = $request->input('items', []);
        $userId = $request->user()?->id;
        $guestSessionId = $request->header('X-Guest-Session-ID') ?? session()->getId();

        $estimate = $this->estimatorService->saveEstimate(
            $requirements,
            $selectedItems,
            $userId,
            $guestSessionId
        );

        return response()->json([
            'status' => 'success',
            'message' => 'CCTV Project Estimate created successfully.',
            'data' => [
                'estimate_number' => $estimate->estimate_number,
                'id' => $estimate->id,
                'status' => $estimate->status->value,
                'grand_total' => (float) $estimate->grand_total,
            ],
        ], 201);
    }

    /**
     * Get full details of a saved estimate.
     */
    public function show(string $estimateNumber): JsonResponse
    {
        $summary = $this->estimatorService->getEstimateDetails($estimateNumber);
        if (!$summary) {
            return response()->json([
                'status' => 'error',
                'message' => "Estimate {$estimateNumber} not found.",
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $summary->toArray(),
        ]);
    }

    /**
     * Get system recommendations based on requirements.
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        $requirements = CctvRequirementDTO::fromArray($request->all());
        $recommendations = $this->recommendationService->generateSystemRecommendations($requirements);

        return response()->json([
            'status' => 'success',
            'data' => $recommendations->toArray(),
        ]);
    }

    /**
     * Validate compatibility for an estimate.
     */
    public function validateSystem(Request $request, string $estimateNumber): JsonResponse
    {
        $estimate = $this->estimateRepo->findByEstimateNumber($estimateNumber);
        if (!$estimate) {
            return response()->json(['status' => 'error', 'message' => 'Estimate not found.'], 404);
        }

        $requirements = CctvRequirementDTO::fromArray($estimate->requirements_payload ?? []);
        $items = $estimate->items->all();

        $result = $this->compatibilityService->validateSystemCompatibility($requirements, $items);

        return response()->json([
            'status' => 'success',
            'data' => $result->toArray(),
        ]);
    }

    /**
     * Generate a formal commercial quote.
     */
    public function createQuote(Request $request, string $estimateNumber): JsonResponse
    {
        $estimate = $this->estimateRepo->findByEstimateNumber($estimateNumber);
        if (!$estimate) {
            return response()->json(['status' => 'error', 'message' => 'Estimate not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:150',
            'company_name' => 'nullable|string|max:150',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $dto = new QuoteGenerationDTO(
            estimateId: $estimate->id,
            userId: $request->user()?->id,
            customerName: $request->input('customer_name'),
            customerPhone: $request->input('customer_phone'),
            customerEmail: $request->input('customer_email'),
            companyName: $request->input('company_name'),
            discountAmount: (float) $request->input('discount_amount', 0.0),
            customInstallationAmount: (float) $request->input('installation_amount', 0.0),
            notes: $request->input('notes')
        );

        $quote = $this->quoteService->generateQuote($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'CCTV Official Quote generated successfully.',
            'data' => [
                'quote_number' => $quote->quote_number,
                'valid_until' => $quote->valid_until->toIso8601String(),
                'grand_total' => (float) $quote->grand_total,
                'status' => $quote->status->value,
            ],
        ], 201);
    }

    /**
     * Convert an approved quote into commerce cart.
     */
    public function convertToCart(Request $request, string $quoteNumber): JsonResponse
    {
        try {
            $cartSummary = $this->quoteService->convertQuoteToCart($quoteNumber, session()->getId());

            return response()->json([
                'status' => 'success',
                'message' => 'Quote items successfully transferred to checkout cart.',
                'data' => $cartSummary,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Generate 3 configuration presets (Budget, Balanced, Premium) for side-by-side comparison.
     */
    public function getPresets(Request $request): JsonResponse
    {
        $requirements = CctvRequirementDTO::fromArray($request->input('requirements', $request->all()));
        $presets = $this->recommendationService->generatePresets($requirements);

        return response()->json([
            'status' => 'success',
            'data' => $presets,
        ]);
    }

    /**
     * Evaluate customer target budget against live configuration.
     */
    public function evaluateBudget(Request $request): JsonResponse
    {
        $requirements = CctvRequirementDTO::fromArray($request->input('requirements', []));
        $selectedItems = $request->input('items', []);
        $targetBudget = (float) $request->input('target_budget', 0.0);

        $summary = $this->estimatorService->calculateEstimate($requirements, $selectedItems);
        $grandTotal = $summary->grandTotal;

        $difference = $grandTotal - $targetBudget;
        $status = match (true) {
            $targetBudget <= 0 => 'unspecified',
            $difference <= 0 => 'within_budget',
            $difference <= ($targetBudget * 0.10) => 'near_budget',
            default => 'over_budget',
        };

        return response()->json([
            'status' => 'success',
            'data' => [
                'budget_status' => $status,
                'target_budget' => round($targetBudget, 2),
                'grand_total' => round($grandTotal, 2),
                'difference' => round($difference, 2),
                'is_within_budget' => $difference <= 0,
            ],
        ]);
    }
}
