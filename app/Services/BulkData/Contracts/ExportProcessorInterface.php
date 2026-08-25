<?php

namespace App\Services\BulkData\Contracts;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

interface ExportProcessorInterface
{
    public function getEntityType(): string;

    public function getEntityLabel(): string;

    public function getAvailableColumns(): array; // array of ['key' => 'sku', 'label' => 'SKU', 'default' => true]

    public function getDefaultColumns(): array;

    public function buildQuery(array $filters = []): Builder;

    public function transformRow(Model $model, array $selectedColumns = []): array;
}
