<?php

namespace App\Services\Contracts\Cctv;

use App\DTOs\Cctv\CableCalculationInputDTO;
use App\DTOs\Cctv\CableCalculationResultDTO;

interface CctvCableCalculatorInterface
{
    public function calculateCable(CableCalculationInputDTO $input): CableCalculationResultDTO;
}
