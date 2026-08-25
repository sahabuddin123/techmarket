<?php

namespace App\Services\BulkData\Processors;

use App\Models\Unit;
use App\Services\BulkData\Contracts\ExportProcessorInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class UnitExportProcessor implements ExportProcessorInterface
{
    public function getEntityType(): string
    {
        return 'units';
    }

    public function getEntityLabel(): string
    {
        return 'Measurement Units';
    }

    public function getAvailableColumns(): array
    {
        return [
            ['key' => 'id', 'label' => 'ID', 'default' => false],
            ['key' => 'name', 'label' => 'Unit Name', 'default' => true],
            ['key' => 'short_code', 'label' => 'Short Code', 'default' => true],
            ['key' => 'symbol', 'label' => 'Symbol', 'default' => true],
            ['key' => 'type', 'label' => 'Unit Type', 'default' => true],
            ['key' => 'base_unit', 'label' => 'Base Unit', 'default' => true],
            ['key' => 'conversion_factor', 'label' => 'Conversion Factor', 'default' => true],
            ['key' => 'is_active', 'label' => 'Active Status (1/0)', 'default' => true],
            ['key' => 'products_count', 'label' => 'Total Products', 'default' => true],
            ['key' => 'created_at', 'label' => 'Created Date', 'default' => false],
        ];
    }

    public function getDefaultColumns(): array
    {
        return array_column(array_filter($this->getAvailableColumns(), fn($col) => $col['default']), 'key');
    }

    public function buildQuery(array $filters = []): Builder
    {
        $query = Unit::with('baseUnit')->withCount('products');

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('short_code', 'like', "%{$search}%")
                  ->orWhere('symbol', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool)$filters['is_active']);
        }

        return $query->orderBy('name');
    }

    public function transformRow(Model $model, array $selectedColumns = []): array
    {
        /** @var Unit $unit */
        $unit = $model;
        $allData = [
            'id' => (string)$unit->id,
            'name' => $unit->name,
            'short_code' => $unit->short_code,
            'symbol' => $unit->symbol ?? '',
            'type' => $unit->type,
            'base_unit' => $unit->baseUnit?->short_code ?? '',
            'conversion_factor' => (string)$unit->conversion_factor,
            'is_active' => $unit->is_active ? '1' : '0',
            'products_count' => (string)($unit->products_count ?? 0),
            'created_at' => $unit->created_at?->toIso8601String() ?? '',
        ];

        if (empty($selectedColumns)) {
            return $allData;
        }

        $row = [];
        foreach ($selectedColumns as $colKey) {
            $row[$colKey] = $allData[$colKey] ?? '';
        }
        return $row;
    }
}
