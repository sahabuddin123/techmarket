<?php

namespace App\Repositories\Contracts\Cctv;

use App\Models\Cctv\CctvRule;
use App\Enums\Cctv\CctvRuleType;
use App\Enums\Cctv\CctvSystemType;
use Illuminate\Database\Eloquent\Collection;

interface CctvRuleRepositoryInterface
{
    public function getActiveRulesByType(
        CctvRuleType $ruleType,
        ?CctvSystemType $systemType = null
    ): Collection;

    public function findByCode(string $code): ?CctvRule;

    public function getAllActiveRules(): Collection;
}
