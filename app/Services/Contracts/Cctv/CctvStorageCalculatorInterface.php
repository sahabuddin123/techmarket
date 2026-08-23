<?php

namespace App\Services\Contracts\Cctv;

use App\DTOs\Cctv\StorageCalculationInputDTO;
use App\DTOs\Cctv\StorageCalculationResultDTO;

interface CctvStorageCalculatorInterface
{
    public function calculateStorage(StorageCalculationInputDTO $input): StorageCalculationResultDTO;

    public function getEstimatedBitrateKbps(float $resolutionMp, string $codec, int $fps = 25): float;
}
