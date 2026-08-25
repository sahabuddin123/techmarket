<?php

namespace App\Services\BulkData;

use App\Services\BulkData\Contracts\ImportProcessorInterface;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TemplateGeneratorService
{
    public function generateCsv(ImportProcessorInterface $processor): StreamedResponse
    {
        $filename = "{$processor->getEntityType()}_import_template.csv";
        $columns = $processor->getTemplateColumns();

        return response()->streamDownload(function () use ($columns) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header row
            $headers = array_column($columns, 'label');
            fputcsv($handle, $headers);

            // Example row
            $examples = array_column($columns, 'example');
            fputcsv($handle, $examples);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function generateXlsx(ImportProcessorInterface $processor): StreamedResponse
    {
        $filename = "{$processor->getEntityType()}_import_template.xlsx";
        $columns = $processor->getTemplateColumns();
        $instructions = $processor->getInstructions();
        $allowedValues = $processor->getAllowedValues();

        $spreadsheet = new Spreadsheet();

        // -------------------------------------------------------------
        // SHEET 1: IMPORT DATA
        // -------------------------------------------------------------
        $dataSheet = $spreadsheet->getActiveSheet();
        $dataSheet->setTitle('Import Data');

        // Header Styling
        $colIndex = 1;
        foreach ($columns as $col) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
            $dataSheet->setCellValue("{$colLetter}1", $col['label'] . ($col['required'] ? ' *' : ''));
            $dataSheet->setCellValue("{$colLetter}2", $col['example'] ?? '');
            $dataSheet->getColumnDimension($colLetter)->setAutoSize(true);
            $colIndex++;
        }

        $lastColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($columns));
        $dataSheet->getStyle("A1:{$lastColLetter}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'], // TechMarket Indigo
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $dataSheet->getStyle("A2:{$lastColLetter}2")->applyFromArray([
            'font' => ['italic' => true, 'color' => ['rgb' => '64748B']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'F8FAFC'],
            ],
        ]);

        $dataSheet->freezePane('A2');

        // -------------------------------------------------------------
        // SHEET 2: FIELD INSTRUCTIONS
        // -------------------------------------------------------------
        $instrSheet = $spreadsheet->createSheet();
        $instrSheet->setTitle('Instructions');

        $instrSheet->setCellValue('A1', "Import Guidelines for {$processor->getEntityLabel()}");
        $instrSheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('4F46E5'));

        $r = 3;
        $instrSheet->setCellValue("A{$r}", "General Rules:");
        $instrSheet->getStyle("A{$r}")->getFont()->setBold(true);
        $r++;

        foreach ($instructions as $rule) {
            $instrSheet->setCellValue("A{$r}", "• " . $rule);
            $r++;
        }

        $r += 2;
        $instrSheet->setCellValue("A{$r}", "Column Details & Descriptions:");
        $instrSheet->getStyle("A{$r}")->getFont()->setBold(true);
        $r++;

        $instrSheet->setCellValue("A{$r}", "Field Name");
        $instrSheet->setCellValue("B{$r}", "Required?");
        $instrSheet->setCellValue("C{$r}", "Description");
        $instrSheet->setCellValue("D{$r}", "Sample Value");
        $instrSheet->getStyle("A{$r}:D{$r}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '334155']],
        ]);
        $r++;

        foreach ($columns as $col) {
            $instrSheet->setCellValue("A{$r}", $col['label']);
            $instrSheet->setCellValue("B{$r}", $col['required'] ? 'YES' : 'Optional');
            $instrSheet->setCellValue("C{$r}", $col['description']);
            $instrSheet->setCellValue("D{$r}", $col['example'] ?? '');

            if ($col['required']) {
                $instrSheet->getStyle("B{$r}")->getFont()->setBold(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('EF4444'));
            }
            $r++;
        }

        foreach (range('A', 'D') as $colLetter) {
            $instrSheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        // -------------------------------------------------------------
        // SHEET 3: ALLOWED VALUES
        // -------------------------------------------------------------
        if (!empty($allowedValues)) {
            $valSheet = $spreadsheet->createSheet();
            $valSheet->setTitle('Allowed Values');

            $valCol = 1;
            foreach ($allowedValues as $groupName => $items) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($valCol);
                $valSheet->setCellValue("{$colLetter}1", $groupName);
                $valSheet->getStyle("{$colLetter}1")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '10B981']],
                ]);

                $valRow = 2;
                foreach ($items as $item) {
                    $valSheet->setCellValue("{$colLetter}{$valRow}", $item);
                    $valRow++;
                }

                $valSheet->getColumnDimension($colLetter)->setAutoSize(true);
                $valCol += 2;
            }
        }

        $spreadsheet->setActiveSheetIndex(0);

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
