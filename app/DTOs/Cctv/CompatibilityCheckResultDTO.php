<?php

namespace App\DTOs\Cctv;

readonly class CompatibilityCheckResultDTO
{
    public function __construct(
        public bool $isCompatible,
        public array $errors = [], // Blocking issues (e.g. 16 cameras selected for an 8-channel NVR)
        public array $warnings = [], // Non-blocking alerts (e.g. 4K camera on 1080P monitor output)
        public array $recommendations = [], // Optimization tips
        public array $validatedPairs = [], // Pairs checked (Camera <-> NVR, Camera <-> PoE, etc.)
    ) {}

    public function toArray(): array
    {
        return [
            'is_compatible' => $this->isCompatible,
            'errors' => $this->errors,
            'warnings' => $this->warnings,
            'recommendations' => $this->recommendations,
            'validated_pairs' => $this->validatedPairs,
        ];
    }
}
