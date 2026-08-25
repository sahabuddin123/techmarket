<?php

namespace App\Services\BulkData\Processors;

use App\Models\Unit;
use App\Services\BulkData\Contracts\ImportProcessorInterface;

class UnitImportProcessor implements ImportProcessorInterface
{
    protected ?array $unitCache = null;

    public function getEntityType(): string
    {
        return 'units';
    }

    public function getEntityLabel(): string
    {
        return 'Measurement Units';
    }

    public function getUniqueKeyField(): string
    {
        return 'short_code';
    }

    public function getTemplateColumns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Unit Name', 'required' => true, 'description' => 'Full name of the unit', 'example' => 'Box of 12'],
            ['key' => 'short_code', 'label' => 'Short Code', 'required' => true, 'description' => 'Unique system identifier code', 'example' => 'box12'],
            ['key' => 'symbol', 'label' => 'Symbol', 'required' => false, 'description' => 'Short display abbreviation', 'example' => 'bx'],
            ['key' => 'type', 'label' => 'Unit Type', 'required' => false, 'description' => 'quantity, length, weight, volume, or other', 'example' => 'quantity'],
            ['key' => 'base_unit', 'label' => 'Base Unit Code', 'required' => false, 'description' => 'Short code of parent base unit (e.g. pcs)', 'example' => 'pcs'],
            ['key' => 'conversion_factor', 'label' => 'Conversion Factor', 'required' => false, 'description' => 'Multiplier to base unit (e.g. 12.0 for a box of 12 pcs)', 'example' => '12.0'],
            ['key' => 'is_active', 'label' => 'Active Status', 'required' => false, 'description' => '1 for Active, 0 for Inactive', 'example' => '1'],
        ];
    }

    public function getInstructions(): array
    {
        return [
            'Short Code must be unique across all units (e.g. pcs, box, kg, meter).',
            'If Base Unit is specified, it must match an existing unit short code.',
            'Conversion Factor indicates how many base units make up 1 of this unit (e.g. 1 Box = 12 Pieces -> factor = 12.0).',
            'Unit Type accepts: quantity, length, weight, volume, other.',
        ];
    }

    public function getAllowedValues(): array
    {
        return [
            'Existing Units' => Unit::orderBy('name')->pluck('short_code')->toArray(),
            'Unit Types' => ['quantity', 'length', 'weight', 'volume', 'other'],
            'Status' => ['1 (Active)', '0 (Inactive)'],
        ];
    }

    protected function resolveBaseUnit(?string $baseInput): ?Unit
    {
        if (empty($baseInput)) return null;
        if ($this->unitCache === null) {
            $this->unitCache = [];
            foreach (Unit::all() as $u) {
                $this->unitCache[mb_strtolower(trim($u->short_code))] = $u;
                $this->unitCache[mb_strtolower(trim($u->name))] = $u;
            }
        }
        $key = mb_strtolower(trim($baseInput));
        return $this->unitCache[$key] ?? null;
    }

    public function validateRow(array $row, int $rowNumber, array $options = []): array
    {
        $errors = [];
        $warnings = [];
        $normalized = [];

        $name = trim((string)($row['name'] ?? $row['Unit Name'] ?? ''));
        if (empty($name)) {
            $errors[] = "Row {$rowNumber}: Unit Name is required.";
        } else {
            $normalized['name'] = $name;
        }

        $code = mb_strtolower(trim((string)($row['short_code'] ?? $row['Short Code'] ?? '')));
        if (empty($code)) {
            $errors[] = "Row {$rowNumber}: Short Code is required.";
        } else {
            $normalized['short_code'] = $code;
        }

        $normalized['symbol'] = trim((string)($row['symbol'] ?? $row['Symbol'] ?? ''));

        $type = mb_strtolower(trim((string)($row['type'] ?? $row['Unit Type'] ?? 'quantity')));
        $normalized['type'] = in_array($type, ['quantity', 'length', 'weight', 'volume', 'other'], true) ? $type : 'quantity';

        $baseInput = trim((string)($row['base_unit'] ?? $row['Base Unit Code'] ?? ''));
        if (!empty($baseInput)) {
            $base = $this->resolveBaseUnit($baseInput);
            if (!$base) {
                $warnings[] = "Row {$rowNumber}: Base unit '{$baseInput}' not found; unit saved without conversion parent.";
                $normalized['base_unit_id'] = null;
            } else {
                $normalized['base_unit_id'] = $base->id;
            }
        } else {
            $normalized['base_unit_id'] = null;
        }

        $factorRaw = trim((string)($row['conversion_factor'] ?? $row['Conversion Factor'] ?? '1.0'));
        $normalized['conversion_factor'] = (is_numeric($factorRaw) && (float)$factorRaw > 0) ? (float)$factorRaw : 1.0;

        $act = mb_strtolower(trim((string)($row['is_active'] ?? $row['Active Status'] ?? '1')));
        $normalized['is_active'] = in_array($act, ['1', 'true', 'yes', 'active'], true);

        return [
            'is_valid' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
            'normalized_data' => $normalized,
        ];
    }

    public function processRow(array $normalizedData, string $mode, array $options = []): array
    {
        $code = $normalizedData['short_code'];
        $existing = Unit::where('short_code', $code)->first();

        if ($existing) {
            if ($mode === 'create_only') {
                return ['action' => 'skipped', 'entity_id' => $existing->id, 'error' => null];
            }

            $existing->update($normalizedData);
            return ['action' => 'updated', 'entity_id' => $existing->id, 'error' => null];
        }

        if ($mode === 'update_only') {
            return ['action' => 'skipped', 'entity_id' => null, 'error' => null];
        }

        $unit = Unit::create($normalizedData);

        if ($this->unitCache !== null) {
            $this->unitCache[mb_strtolower(trim($unit->short_code))] = $unit;
            $this->unitCache[mb_strtolower(trim($unit->name))] = $unit;
        }

        return ['action' => 'created', 'entity_id' => $unit->id, 'error' => null];
    }
}
