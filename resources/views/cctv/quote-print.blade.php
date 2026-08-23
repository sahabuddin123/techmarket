<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commercial Quotation #{{ $quote->quote_number }} - {{ $companyName }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            font-size: 13px;
            line-height: 1.5;
            background: #fff;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .brand-title {
            font-size: 24px;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.5px;
        }
        .quote-title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            text-align: right;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 25px;
        }
        .box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
        }
        .box-title {
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 8px;
        }
        .bom-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .bom-table th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 700;
            text-align: left;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            font-size: 11px;
            text-transform: uppercase;
        }
        .bom-table td {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .totals-table {
            width: 320px;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .totals-table td {
            padding: 6px 12px;
        }
        .grand-total-row {
            background: #eff6ff;
            font-weight: 900;
            font-size: 15px;
            color: #1e3a8a;
            border-top: 2px solid #2563eb;
        }
        .terms-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            font-size: 11px;
            color: #475569;
            margin-bottom: 35px;
        }
        .signature-table {
            width: 100%;
            margin-top: 50px;
        }
        .sign-line {
            border-top: 1px solid #94a3b8;
            width: 200px;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 11px;
            color: #64748b;
        }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
        </button>
    </div>

    <table class="header-table">
        <tr>
            <td style="vertical-align: top;">
                <div class="brand-title">{{ $companyName }}</div>
                <div style="color: #64748b; font-size: 12px;">{{ $companyAddress }}</div>
                <div style="color: #64748b; font-size: 12px;">Tel: {{ $companyPhone }} | Email: {{ $companyEmail }}</div>
            </td>
            <td style="vertical-align: top; text-align: right;">
                <div class="quote-title">COMMERCIAL QUOTATION</div>
                <div style="font-family: monospace; font-weight: bold; color: #2563eb; font-size: 14px;">#{{ $quote->quote_number }}</div>
                <div style="color: #64748b; font-size: 11px;">Date: {{ $quote->created_at->format('d M, Y') }}</div>
                <div style="color: #ef4444; font-weight: 600; font-size: 11px;">Valid Until: {{ $quote->valid_until->format('d M, Y') }}</div>
            </td>
        </tr>
    </table>

    <table class="meta-table">
        <tr>
            <td style="width: 48%; vertical-align: top;">
                <div class="box">
                    <div class="box-title">Client Information</div>
                    <div style="font-weight: bold; font-size: 14px;">{{ $quote->customer_name }}</div>
                    @if($quote->company_name)<div>{{ $quote->company_name }}</div>@endif
                    <div>Phone: {{ $quote->customer_phone }}</div>
                    @if($quote->customer_email)<div>Email: {{ $quote->customer_email }}</div>@endif
                </div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; vertical-align: top;">
                <div class="box">
                    <div class="box-title">Surveillance Project Scope</div>
                    <div style="font-weight: bold; font-size: 14px;">{{ $quote->estimate?->project_name ?? 'CCTV Security Setup' }}</div>
                    <div>Premises: {{ ucfirst(str_replace('_', ' ', $quote->estimate?->project_type?->value ?? 'Commercial')) }}</div>
                    <div>System Type: {{ strtoupper($quote->estimate?->system_type?->value ?? 'IP') }} Architecture</div>
                    <div>Location: {{ $quote->estimate?->location_district ?? 'Dhaka' }}</div>
                </div>
            </td>
        </tr>
    </table>

    <table class="bom-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 50%;">Item Specification</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Unit Price (BDT)</th>
                <th style="width: 15%; text-align: right;">Total (BDT)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quote->estimate?->items ?? [] as $index => $item)
            <tr>
                <td style="text-align: center; color: #94a3b8;">{{ $index + 1 }}</td>
                <td>
                    <div style="font-weight: bold;">{{ $item->product_name_snapshot }}</div>
                    <div style="font-size: 11px; color: #64748b; font-family: monospace;">SKU: {{ $item->product_sku_snapshot }}</div>
                </td>
                <td style="text-align: center; font-weight: 600;">{{ $item->quantity }} {{ $item->unit }}</td>
                <td style="text-align: right; font-family: monospace;">{{ number_format($item->unit_price_snapshot, 2) }}</td>
                <td style="text-align: right; font-family: monospace; font-weight: bold;">{{ number_format($item->subtotal_price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        <tr>
            <td style="color: #64748b;">Hardware Subtotal:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">BDT {{ number_format($quote->subtotal, 2) }}</td>
        </tr>
        @if($quote->installation_amount > 0)
        <tr>
            <td style="color: #64748b;">Installation & Cabling:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">BDT {{ number_format($quote->installation_amount, 2) }}</td>
        </tr>
        @endif
        @if($quote->discount_amount > 0)
        <tr>
            <td style="color: #ef4444;">Promotional Discount:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: #ef4444;">- BDT {{ number_format($quote->discount_amount, 2) }}</td>
        </tr>
        @endif
        <tr class="grand-total-row">
            <td>Grand Total:</td>
            <td style="text-align: right; font-family: monospace;">BDT {{ number_format($quote->grand_total, 2) }}</td>
        </tr>
    </table>

    <div class="terms-box">
        <div class="box-title">Terms & Conditions</div>
        <div>{!! nl2br(e($terms)) !!}</div>
    </div>

    <table class="signature-table">
        <tr>
            <td style="width: 50%;">
                <div class="sign-line">Customer Authorized Acceptance</div>
            </td>
            <td style="width: 50%; text-align: right;">
                <div class="sign-line" style="margin-left: auto;">For {{ $companyName }}</div>
            </td>
        </tr>
    </table>
</body>
</html>
