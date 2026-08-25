<?php

namespace App\Services\BulkData;

use App\Models\BulkExport;
use App\Services\AuditLogger;
use App\Services\BulkData\Contracts\ExportProcessorInterface;
use App\Services\BulkData\Processors\BrandExportProcessor;
use App\Services\BulkData\Processors\CategoryExportProcessor;
use App\Services\BulkData\Processors\ProductExportProcessor;
use App\Services\BulkData\Processors\UnitExportProcessor;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BulkExportService
{
    protected array $processors;

    public function __construct()
    {
        $this->processors = [
            'products' => new ProductExportProcessor(),
            'categories' => new CategoryExportProcessor(),
            'brands' => new BrandExportProcessor(),
            'units' => new UnitExportProcessor(),
        ];
    }

    public function getProcessor(string $entityType): ExportProcessorInterface
    {
        if (!isset($this->processors[$entityType])) {
            throw new \InvalidArgumentException("Unsupported entity type: {$entityType}");
        }
        return $this->processors[$entityType];
    }

    public function export(string $entityType, string $format, array $filters = [], array $selectedColumns = []): StreamedResponse
    {
        $processor = $this->getProcessor($entityType);
        $query = $processor->buildQuery($filters);
        $totalCount = $query->count();

        $availableColumns = $processor->getAvailableColumns();
        $colLabelMap = array_column($availableColumns, 'label', 'key');

        if (empty($selectedColumns)) {
            $selectedColumns = $processor->getDefaultColumns();
        }

        $headers = [];
        foreach ($selectedColumns as $key) {
            $headers[] = $colLabelMap[$key] ?? $key;
        }

        $timestamp = date('Ymd_His');
        $fileName = "{$entityType}_export_{$timestamp}.{$format}";

        // Save export log
        $bulkExport = BulkExport::create([
            'entity_type' => $entityType,
            'file_name' => $fileName,
            'file_format' => $format,
            'filter_criteria' => $filters,
            'selected_columns' => $selectedColumns,
            'total_rows' => $totalCount,
            'status' => 'completed',
            'user_id' => auth()->id() ?? 1,
            'completed_at' => now(),
        ]);

        AuditLogger::log('bulk_export.created', $bulkExport, null, [
            'entity_type' => $entityType,
            'format' => $format,
            'rows' => $totalCount,
        ]);

        if ($format === 'json') {
            return $this->exportJson($query, $processor, $selectedColumns, $fileName);
        }

        if ($format === 'xlsx') {
            return $this->exportXlsx($query, $processor, $selectedColumns, $headers, $fileName);
        }

        // Default CSV
        return $this->exportCsv($query, $processor, $selectedColumns, $headers, $fileName);
    }

    protected function exportCsv($query, ExportProcessorInterface $processor, array $selectedColumns, array $headers, string $fileName): StreamedResponse
    {
        return response()->streamDownload(function () use ($query, $processor, $selectedColumns, $headers) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($handle, $headers);

            $query->chunk(500, function ($models) use ($handle, $processor, $selectedColumns) {
                foreach ($models as $model) {
                    $row = $processor->transformRow($model, $selectedColumns);
                    fputcsv($handle, array_values($row));
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    protected function exportXlsx($query, ExportProcessorInterface $processor, array $selectedColumns, array $headers, string $fileName): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Exported Data');

        // Write Header
        $colIndex = 1;
        foreach ($headers as $headerText) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
            $sheet->setCellValue("{$colLetter}1", $headerText);
            $colIndex++;
        }

        $lastColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers));
        $sheet->getStyle("A1:{$lastColLetter}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F46E5']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $sheet->freezePane('A2');

        $currentRow = 2;
        $query->chunk(500, function ($models) use (&$currentRow, $sheet, $processor, $selectedColumns) {
            foreach ($models as $model) {
                $row = array_values($processor->transformRow($model, $selectedColumns));
                $colIdx = 1;
                foreach ($row as $val) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
                    $sheet->setCellValue("{$colLetter}{$currentRow}", $val);
                    $colIdx++;
                }
                $currentRow++;
            }
        });

        foreach (range(1, count($headers)) as $colIdx) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    protected function exportJson($query, ExportProcessorInterface $processor, array $selectedColumns, string $fileName): StreamedResponse
    {
        return response()->streamDownload(function () use ($query, $processor, $selectedColumns) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "[\n");

            $isFirst = true;
            $query->chunk(500, function ($models) use ($handle, $processor, $selectedColumns, &$isFirst) {
                foreach ($models as $model) {
                    $row = $processor->transformRow($model, $selectedColumns);
                    $json = json_encode($row, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                    
                    if (!$isFirst) {
                        fwrite($handle, ",\n");
                    }
                    fwrite($handle, $json);
                    $isFirst = false;
                }
            });

            fwrite($handle, "\n]");
            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'application/json',
        ]);
    }
}
