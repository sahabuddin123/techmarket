<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\InventoryMovement;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportService
{
    public static function exportCsv(string $type, string $period = 'last_30_days', ?string $startDate = null, ?string $endDate = null): StreamedResponse
    {
        $range = AnalyticsService::resolveDateRange($period, $startDate, $endDate);
        $start = $range['start'];
        $end = $range['end'];
        $dateStr = now()->format('Y-m-d_His');
        $fileName = "techmarket_{$type}_report_{$dateStr}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($type, $start, $end) {
            $handle = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            match ($type) {
                'sales' => self::streamSalesReport($handle, $start, $end),
                'products' => self::streamProductsReport($handle, $start, $end),
                'inventory' => self::streamInventoryReport($handle),
                'customers' => self::streamCustomersReport($handle, $start, $end),
                'operations' => self::streamOperationsReport($handle, $start, $end),
                default => self::streamSalesReport($handle, $start, $end),
            };

            fclose($handle);
        }, 200, $headers);
    }

    protected static function streamSalesReport($handle, $start, $end): void
    {
        fputcsv($handle, [
            'Order Number',
            'Date',
            'Customer Name',
            'Customer Email',
            'Customer Phone',
            'Payment Method',
            'Payment Status',
            'Order Status',
            'Subtotal (BDT)',
            'Discount (BDT)',
            'Shipping (BDT)',
            'Total (BDT)',
        ]);

        Order::whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'desc')
            ->chunk(200, function ($orders) use ($handle) {
                foreach ($orders as $o) {
                    fputcsv($handle, [
                        $o->order_number,
                        $o->created_at->format('Y-m-d H:i:s'),
                        $o->customer_name,
                        $o->customer_email,
                        $o->customer_phone,
                        $o->payment_method,
                        $o->payment_status,
                        $o->status,
                        number_format($o->subtotal, 2, '.', ''),
                        number_format($o->discount, 2, '.', ''),
                        number_format($o->shipping_cost, 2, '.', ''),
                        number_format($o->total, 2, '.', ''),
                    ]);
                }
            });
    }

    protected static function streamProductsReport($handle, $start, $end): void
    {
        fputcsv($handle, [
            'Product ID',
            'SKU',
            'Product Title',
            'Category',
            'Brand',
            'Units Sold',
            'Total Revenue (BDT)',
            'Current Stock',
            'Unit Price (BDT)',
        ]);

        $data = AnalyticsService::getProductIntelligence('custom', $start->toDateString(), $end->toDateString());
        
        foreach ($data['best_selling'] as $p) {
            fputcsv($handle, [
                $p['product_id'] ?? 'N/A',
                $p['sku'] ?? 'N/A',
                $p['title'] ?? 'N/A',
                'Catalog Item',
                'N/A',
                $p['units_sold'] ?? 0,
                number_format($p['total_revenue'] ?? 0, 2, '.', ''),
                $p['current_stock'] ?? 0,
                number_format($p['price'] ?? 0, 2, '.', ''),
            ]);
        }
    }

    protected static function streamInventoryReport($handle): void
    {
        fputcsv($handle, [
            'Product ID',
            'SKU',
            'Product Title',
            'Category',
            'Brand',
            'Current Stock',
            'Retail Price (BDT)',
            'Cost Price (BDT)',
            'Total Valuation (BDT)',
            'Stock Status',
        ]);

        Product::with(['category', 'brand'])
            ->orderBy('stock', 'asc')
            ->chunk(200, function ($products) use ($handle) {
                foreach ($products as $p) {
                    $cost = $p->cost_price ?: ($p->price * 0.8);
                    $valuation = $p->stock * $p->price;
                    $status = $p->stock <= 0 ? 'Out of Stock' : ($p->stock <= 5 ? 'Low Stock' : 'In Stock');

                    fputcsv($handle, [
                        $p->id,
                        $p->sku,
                        $p->title,
                        $p->category ? $p->category->name : 'N/A',
                        $p->brand ? $p->brand->name : 'N/A',
                        $p->stock,
                        number_format($p->price, 2, '.', ''),
                        number_format($cost, 2, '.', ''),
                        number_format($valuation, 2, '.', ''),
                        $status,
                    ]);
                }
            });
    }

    protected static function streamCustomersReport($handle, $start, $end): void
    {
        fputcsv($handle, [
            'Customer Name',
            'Email',
            'Phone',
            'Total Orders',
            'Total Spent (BDT)',
            'Last Order Date',
        ]);

        $data = AnalyticsService::getCustomerIntelligence('custom', $start->toDateString(), $end->toDateString());

        foreach ($data['top_spenders'] as $c) {
            fputcsv($handle, [
                $c['name'],
                $c['email'],
                $c['phone'],
                $c['order_count'],
                number_format($c['total_spent'], 2, '.', ''),
                $c['last_order_at'] ? (string) $c['last_order_at'] : 'N/A',
            ]);
        }
    }

    protected static function streamOperationsReport($handle, $start, $end): void
    {
        fputcsv($handle, [
            'Courier Provider',
            'Total Consignments',
            'Delivered',
            'Failed/Returned',
            'Pending/In-Transit',
            'Success Rate (%)',
        ]);

        $data = AnalyticsService::getOperationalIntelligence('custom', $start->toDateString(), $end->toDateString());

        foreach ($data['courier_performance'] as $cp) {
            fputcsv($handle, [
                $cp['provider'],
                $cp['total_consignments'],
                $cp['delivered'],
                $cp['failed_returned'],
                $cp['pending_in_transit'],
                $cp['success_rate'] . '%',
            ]);
        }
    }
}
