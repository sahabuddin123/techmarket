<?php

namespace App\Services\BulkData\Contracts;

interface ImportProcessorInterface
{
    public function getEntityType(): string;

    public function getEntityLabel(): string;

    public function getUniqueKeyField(): string; // e.g. 'sku', 'slug', 'short_code'

    public function getTemplateColumns(): array; // array of ['key' => 'sku', 'label' => 'SKU', 'required' => true, 'description' => '...', 'example' => '...']

    public function getInstructions(): array;

    public function getAllowedValues(): array;

    public function validateRow(array $row, int $rowNumber, array $options = []): array; // returns ['is_valid' => bool, 'errors' => [], 'warnings' => [], 'normalized_data' => []]

    public function processRow(array $normalizedData, string $mode, array $options = []): array; // returns ['action' => 'created'|'updated'|'skipped'|'failed', 'entity_id' => int|null, 'error' => string|null]
}
