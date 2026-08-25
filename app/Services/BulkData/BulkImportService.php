<?php

namespace App\Services\BulkData;

use App\Models\BulkImport;
use App\Services\AuditLogger;
use App\Services\BulkData\Contracts\ImportProcessorInterface;
use App\Services\BulkData\Processors\BrandImportProcessor;
use App\Services\BulkData\Processors\CategoryImportProcessor;
use App\Services\BulkData\Processors\ProductImportProcessor;
use App\Services\BulkData\Processors\UnitImportProcessor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BulkImportService
{
    /**
     * Map of entity_type to processor instance.
     */
    protected array $processors;

    public function __construct()
    {
        $this->processors = [
            'products' => new ProductImportProcessor(),
            'categories' => new CategoryImportProcessor(),
            'brands' => new BrandImportProcessor(),
            'units' => new UnitImportProcessor(),
        ];
    }

    public function getProcessor(string $entityType): ImportProcessorInterface
    {
        if (!isset($this->processors[$entityType])) {
            throw new \InvalidArgumentException("Unsupported entity type: {$entityType}");
        }
        return $this->processors[$entityType];
    }

    public function getSupportedEntities(): array
    {
        $list = [];
        foreach ($this->processors as $key => $proc) {
            $list[$key] = [
                'type' => $key,
                'label' => $proc->getEntityLabel(),
                'unique_key' => $proc->getUniqueKeyField(),
                'columns' => $proc->getTemplateColumns(),
            ];
        }
        return $list;
    }

    /**
     * Read uploaded file headers and sample rows.
     */
    public function inspectUploadedFile(string $filePath, string $format): array
    {
        $fullPath = Storage::path($filePath);
        if (!file_exists($fullPath)) {
            throw new \Exception("Uploaded file does not exist at {$filePath}");
        }

        $headers = [];
        $sampleRows = [];
        $totalRowCount = 0;

        if ($format === 'xlsx' || str_ends_with(strtolower($filePath), '.xlsx')) {
            $spreadsheet = IOFactory::load($fullPath);
            $sheet = $spreadsheet->getSheet(0);
            $highestRow = $sheet->getHighestRow();
            $highestColumn = $sheet->getHighestColumn();
            $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

            // Read header row
            for ($col = 1; $col <= $highestColumnIndex; $col++) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                $val = trim((string)$sheet->getCell("{$colLetter}1")->getValue());
                // Strip trailing asterisks
                $val = trim(rtrim($val, '*'));
                if ($val !== '') {
                    $headers[] = $val;
                }
            }

            // Read sample rows (up to 5)
            for ($r = 2; $r <= min($highestRow, 6); $r++) {
                $row = [];
                for ($col = 1; $col <= count($headers); $col++) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $row[] = (string)$sheet->getCell("{$colLetter}{$r}")->getValue();
                }
                $sampleRows[] = $row;
            }

            $totalRowCount = max(0, $highestRow - 1);
        } else {
            // CSV parsing
            $handle = fopen($fullPath, 'r');
            if ($handle !== false) {
                // Check and strip UTF-8 BOM
                $bom = fread($handle, 3);
                if ($bom !== "\xEF\xBB\xBF") {
                    rewind($handle);
                }

                $rawHeaders = fgetcsv($handle);
                if ($rawHeaders) {
                    foreach ($rawHeaders as $h) {
                        $cleaned = trim(rtrim(trim((string)$h), '*'));
                        if ($cleaned !== '') {
                            $headers[] = $cleaned;
                        }
                    }
                }

                $count = 0;
                while (($data = fgetcsv($handle)) !== false) {
                    $count++;
                    if ($count <= 5) {
                        $sampleRows[] = array_map('trim', $data);
                    }
                }
                $totalRowCount = $count;
                fclose($handle);
            }
        }

        return [
            'headers' => $headers,
            'sample_rows' => $sampleRows,
            'total_rows' => $totalRowCount,
        ];
    }

    /**
     * Auto-map file headers to system processor keys.
     */
    public function autoMapColumns(array $fileHeaders, ImportProcessorInterface $processor): array
    {
        $mapping = [];
        $templateCols = $processor->getTemplateColumns();

        foreach ($fileHeaders as $header) {
            $normalizedHeader = mb_strtolower(preg_replace('/[^a-z0-9]/', '', $header));
            $matchedKey = null;

            foreach ($templateCols as $col) {
                $colKeyNorm = mb_strtolower(preg_replace('/[^a-z0-9]/', '', $col['key']));
                $colLabelNorm = mb_strtolower(preg_replace('/[^a-z0-9]/', '', $col['label']));

                if ($normalizedHeader === $colKeyNorm || $normalizedHeader === $colLabelNorm) {
                    $matchedKey = $col['key'];
                    break;
                }
            }

            $mapping[$header] = $matchedKey;
        }

        return $mapping;
    }

    /**
     * Stream rows from file using column mapping.
     */
    protected function iterateMappedRows(string $filePath, string $format, array $columnMapping, callable $callback): void
    {
        $fullPath = Storage::path($filePath);
        $rowIndex = 2; // Data starts on line 2

        if ($format === 'xlsx' || str_ends_with(strtolower($filePath), '.xlsx')) {
            $spreadsheet = IOFactory::load($fullPath);
            $sheet = $spreadsheet->getSheet(0);
            $highestRow = $sheet->getHighestRow();
            $highestColumn = $sheet->getHighestColumn();
            $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

            // Read header row
            $headerMap = [];
            for ($col = 1; $col <= $highestColumnIndex; $col++) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                $val = trim(rtrim(trim((string)$sheet->getCell("{$colLetter}1")->getValue()), '*'));
                if ($val !== '' && isset($columnMapping[$val]) && $columnMapping[$val] !== null) {
                    $headerMap[$col] = $columnMapping[$val];
                }
            }

            for ($r = 2; $r <= $highestRow; $r++) {
                $rowData = [];
                $hasValues = false;

                foreach ($headerMap as $col => $systemKey) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $val = (string)$sheet->getCell("{$colLetter}{$r}")->getValue();
                    $rowData[$systemKey] = trim($val);
                    if ($val !== '') $hasValues = true;
                }

                if ($hasValues) {
                    $callback($rowData, $r);
                }
            }
        } else {
            $handle = fopen($fullPath, 'r');
            if ($handle !== false) {
                $bom = fread($handle, 3);
                if ($bom !== "\xEF\xBB\xBF") {
                    rewind($handle);
                }

                $rawHeaders = fgetcsv($handle);
                $headerMap = [];
                if ($rawHeaders) {
                    foreach ($rawHeaders as $idx => $h) {
                        $cleaned = trim(rtrim(trim((string)$h), '*'));
                        if ($cleaned !== '' && isset($columnMapping[$cleaned]) && $columnMapping[$cleaned] !== null) {
                            $headerMap[$idx] = $columnMapping[$cleaned];
                        }
                    }
                }

                while (($row = fgetcsv($handle)) !== false) {
                    $rowData = [];
                    $hasValues = false;

                    foreach ($headerMap as $idx => $systemKey) {
                        $val = $row[$idx] ?? '';
                        $rowData[$systemKey] = trim((string)$val);
                        if ($val !== '') $hasValues = true;
                    }

                    if ($hasValues) {
                        $callback($rowData, $rowIndex);
                    }
                    $rowIndex++;
                }

                fclose($handle);
            }
        }
    }

    /**
     * Preview and Validate an import without database mutation.
     */
    public function previewAndValidate(BulkImport $bulkImport): array
    {
        $processor = $this->getProcessor($bulkImport->entity_type);
        $mapping = $bulkImport->column_mapping ?? [];

        $totalRows = 0;
        $validCount = 0;
        $warningCount = 0;
        $errorCount = 0;
        $previewSample = [];
        $detailedErrors = [];
        $detailedWarnings = [];
        $seenKeys = [];

        $uniqueKeyField = $processor->getUniqueKeyField();

        $this->iterateMappedRows(
            $bulkImport->file_path,
            $bulkImport->file_format,
            $mapping,
            function (array $mappedRow, int $rowNumber) use (
                $processor, $uniqueKeyField, &$totalRows, &$validCount, &$warningCount,
                &$errorCount, &$previewSample, &$detailedErrors, &$detailedWarnings, &$seenKeys
            ) {
                $totalRows++;
                $valResult = $processor->validateRow($mappedRow, $rowNumber);

                // Duplicate key check within the same uploaded file
                $keyValue = $valResult['normalized_data'][$uniqueKeyField] ?? null;
                if (!empty($keyValue)) {
                    if (isset($seenKeys[$keyValue])) {
                        $valResult['is_valid'] = false;
                        $valResult['errors'][] = "Row {$rowNumber}: Duplicate {$uniqueKeyField} '{$keyValue}' found (previously on row {$seenKeys[$keyValue]}).";
                    } else {
                        $seenKeys[$keyValue] = $rowNumber;
                    }
                }

                if ($valResult['is_valid']) {
                    $validCount++;
                    if (!empty($valResult['warnings'])) {
                        $warningCount++;
                        $detailedWarnings[] = [
                            'row' => $rowNumber,
                            'key' => $keyValue ?? "Row {$rowNumber}",
                            'warnings' => $valResult['warnings'],
                        ];
                    }
                } else {
                    $errorCount++;
                    $detailedErrors[] = [
                        'row' => $rowNumber,
                        'key' => $keyValue ?? "Row {$rowNumber}",
                        'errors' => $valResult['errors'],
                    ];
                }

                if ($totalRows <= 10) {
                    $previewSample[] = [
                        'row_number' => $rowNumber,
                        'is_valid' => $valResult['is_valid'],
                        'data' => $valResult['normalized_data'],
                        'errors' => $valResult['errors'],
                        'warnings' => $valResult['warnings'],
                    ];
                }
            }
        );

        $results = [
            'total_rows' => $totalRows,
            'valid_count' => $validCount,
            'warning_count' => $warningCount,
            'error_count' => $errorCount,
            'preview_sample' => $previewSample,
            'top_errors' => array_slice($detailedErrors, 0, 50),
            'top_warnings' => array_slice($detailedWarnings, 0, 50),
        ];

        $bulkImport->update([
            'total_rows' => $totalRows,
            'validation_results' => $results,
            'status' => 'validating',
        ]);

        return $results;
    }

    /**
     * Execute the bulk import with transactional chunk processing.
     */
    public function executeImport(BulkImport $bulkImport): BulkImport
    {
        $processor = $this->getProcessor($bulkImport->entity_type);
        $mapping = $bulkImport->column_mapping ?? [];

        $bulkImport->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $failed = 0;
        $processed = 0;
        $failedRowsLog = [];
        $chunk = [];
        $chunkSize = 250;

        $processChunk = function (array $rows) use (
            $processor, $bulkImport, &$created, &$updated, &$skipped, &$failed, &$processed, &$failedRowsLog
        ) {
            DB::transaction(function () use (
                $processor, $bulkImport, $rows, &$created, &$updated, &$skipped, &$failed, &$processed, &$failedRowsLog
            ) {
                foreach ($rows as $item) {
                    $rowNumber = $item['row_number'];
                    $mappedData = $item['data'];

                    $valResult = $processor->validateRow($mappedData, $rowNumber);
                    if (!$valResult['is_valid']) {
                        $failed++;
                        $processed++;
                        $failedRowsLog[] = [
                            'row' => $rowNumber,
                            'key' => $mappedData[$processor->getUniqueKeyField()] ?? '',
                            'error' => implode(' | ', $valResult['errors']),
                        ];
                        continue;
                    }

                    if ($bulkImport->is_dry_run) {
                        $created++;
                        $processed++;
                        continue;
                    }

                    try {
                        $res = $processor->processRow($valResult['normalized_data'], $bulkImport->mode);
                        if ($res['action'] === 'created') $created++;
                        elseif ($res['action'] === 'updated') $updated++;
                        elseif ($res['action'] === 'skipped') $skipped++;
                        else {
                            $failed++;
                            $failedRowsLog[] = [
                                'row' => $rowNumber,
                                'key' => $mappedData[$processor->getUniqueKeyField()] ?? '',
                                'error' => $res['error'] ?? 'Processing error',
                            ];
                        }
                    } catch (\Exception $e) {
                        $failed++;
                        $failedRowsLog[] = [
                            'row' => $rowNumber,
                            'key' => $mappedData[$processor->getUniqueKeyField()] ?? '',
                            'error' => $e->getMessage(),
                        ];
                    }

                    $processed++;
                }
            });

            // Update live progress
            $bulkImport->update([
                'processed_rows' => $processed,
                'created_rows' => $created,
                'updated_rows' => $updated,
                'skipped_rows' => $skipped,
                'failed_rows' => $failed,
            ]);
        };

        $this->iterateMappedRows(
            $bulkImport->file_path,
            $bulkImport->file_format,
            $mapping,
            function (array $mappedRow, int $rowNumber) use (&$chunk, $chunkSize, $processChunk) {
                $chunk[] = ['row_number' => $rowNumber, 'data' => $mappedRow];
                if (count($chunk) >= $chunkSize) {
                    $processChunk($chunk);
                    $chunk = [];
                }
            }
        );

        if (count($chunk) > 0) {
            $processChunk($chunk);
        }

        // Generate error CSV if any rows failed
        $errorFilePath = null;
        if (count($failedRowsLog) > 0) {
            $errorFileName = "imports/errors/import_errors_{$bulkImport->id}_" . time() . ".csv";
            Storage::put($errorFileName, $this->buildErrorCsvString($failedRowsLog));
            $errorFilePath = $errorFileName;
        }

        $finalStatus = $failed === 0 ? 'completed' : ($created + $updated > 0 ? 'completed_with_errors' : 'failed');

        $bulkImport->update([
            'status' => $finalStatus,
            'processed_rows' => $processed,
            'created_rows' => $created,
            'updated_rows' => $updated,
            'skipped_rows' => $skipped,
            'failed_rows' => $failed,
            'error_file_path' => $errorFilePath,
            'error_summary' => array_slice($failedRowsLog, 0, 100),
            'completed_at' => now(),
        ]);

        AuditLogger::log('bulk_import.completed', $bulkImport, null, [
            'entity_type' => $bulkImport->entity_type,
            'total' => $processed,
            'created' => $created,
            'updated' => $updated,
            'failed' => $failed,
        ]);

        return $bulkImport;
    }

    protected function buildErrorCsvString(array $errors): string
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['Row Number', 'Identifier Key', 'Error Reason']);

        foreach ($errors as $err) {
            fputcsv($handle, [$err['row'], $err['key'], $err['error']]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }

    public function downloadErrorCsv(BulkImport $bulkImport): StreamedResponse
    {
        if (!$bulkImport->error_file_path || !Storage::exists($bulkImport->error_file_path)) {
            abort(404, 'No error report exists for this import.');
        }

        return Storage::download($bulkImport->error_file_path, "import_errors_{$bulkImport->entity_type}_{$bulkImport->id}.csv");
    }
}
