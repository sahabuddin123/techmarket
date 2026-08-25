<?php

namespace App\Services\Accounting;

use App\Models\ChartOfAccount;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\JournalEntry;
use App\Models\Sale;
use App\Models\Purchase;
use App\Models\PurchasePayment;
use App\Models\Expense;
use App\Models\Income;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Exception;

class AccountingService
{
    public static function seedDefaultAccounts(): void
    {
        self::initializeDefaults();
    }

    /**
     * Ensure default chart of accounts and default cash/bank accounts exist.
     */
    public static function initializeDefaults(): void
    {
        $defaultAccounts = [
            // ASSETS (1000s)
            ['code' => '1001', 'name' => 'Cash in Hand', 'type' => 'asset', 'category' => 'cash_and_bank', 'is_system' => true],
            ['code' => '1002', 'name' => 'Bank Accounts', 'type' => 'asset', 'category' => 'cash_and_bank', 'is_system' => true],
            ['code' => '1003', 'name' => 'Mobile Money (bKash/Nagad)', 'type' => 'asset', 'category' => 'cash_and_bank', 'is_system' => true],
            ['code' => '1004', 'name' => 'Accounts Receivable', 'type' => 'asset', 'category' => 'current_asset', 'is_system' => true],
            ['code' => '1005', 'name' => 'Merchandise Inventory', 'type' => 'asset', 'category' => 'inventory', 'is_system' => true],
            
            // LIABILITIES (2000s)
            ['code' => '2001', 'name' => 'Accounts Payable (Suppliers)', 'type' => 'liability', 'category' => 'current_liability', 'is_system' => true],
            ['code' => '2002', 'name' => 'Sales Tax / VAT Payable', 'type' => 'liability', 'category' => 'tax_payable', 'is_system' => true],
            
            // EQUITY (3000s)
            ['code' => '3001', 'name' => 'Owner Equity / Capital', 'type' => 'equity', 'category' => 'equity', 'is_system' => true],
            ['code' => '3002', 'name' => 'Retained Earnings', 'type' => 'equity', 'category' => 'equity', 'is_system' => true],
            
            // INCOME (4000s)
            ['code' => '4001', 'name' => 'Sales Revenue', 'type' => 'income', 'category' => 'operating_revenue', 'is_system' => true],
            ['code' => '4002', 'name' => 'Shipping & Delivery Income', 'type' => 'income', 'category' => 'other_income', 'is_system' => true],
            ['code' => '4003', 'name' => 'Other Business Income', 'type' => 'income', 'category' => 'other_income', 'is_system' => true],
            
            // EXPENSES (5000s)
            ['code' => '5001', 'name' => 'Cost of Goods Sold (COGS)', 'type' => 'expense', 'category' => 'direct_expense', 'is_system' => true],
            ['code' => '5002', 'name' => 'Office & Operational Expenses', 'type' => 'expense', 'category' => 'operating_expense', 'is_system' => true],
            ['code' => '5003', 'name' => 'Logistics & Courier Charges', 'type' => 'expense', 'category' => 'operating_expense', 'is_system' => true],
            ['code' => '5004', 'name' => 'Marketing & Promotional Expenses', 'type' => 'expense', 'category' => 'operating_expense', 'is_system' => true],
            ['code' => '5005', 'name' => 'Inventory Loss & Damage', 'type' => 'expense', 'category' => 'operating_expense', 'is_system' => true],
        ];

        foreach ($defaultAccounts as $acc) {
            ChartOfAccount::firstOrCreate(['code' => $acc['code']], $acc);
        }

        // Initialize default financial registers
        $cashAcc = ChartOfAccount::where('code', '1001')->first();
        $bankAcc = ChartOfAccount::where('code', '1002')->first();
        $mobileAcc = ChartOfAccount::where('code', '1003')->first();

        if ($cashAcc && !FinancialAccount::where('name', 'Main Cash Register')->exists()) {
            FinancialAccount::create([
                'chart_of_account_id' => $cashAcc->id,
                'name' => 'Main Cash Register',
                'type' => 'cash',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
            ]);
        }

        if ($bankAcc && !FinancialAccount::where('name', 'BRAC Bank Corporate A/C')->exists()) {
            FinancialAccount::create([
                'chart_of_account_id' => $bankAcc->id,
                'name' => 'BRAC Bank Corporate A/C',
                'type' => 'bank',
                'account_number' => '1501204899001',
                'bank_name' => 'BRAC Bank PLC',
                'branch_name' => 'Gulshan Branch',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
            ]);
        }

        if ($mobileAcc && !FinancialAccount::where('name', 'bKash Merchant Account')->exists()) {
            FinancialAccount::create([
                'chart_of_account_id' => $mobileAcc->id,
                'name' => 'bKash Merchant Account',
                'type' => 'mobile_money',
                'account_number' => '01711000000',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
            ]);
        }
    }

    /**
     * Create double-entry financial transaction ensuring debit == credit.
     *
     * @param string $sourceModule
     * @param int|null $sourceId
     * @param string|null $referenceNumber
     * @param string $description
     * @param array $entries [['account_id' => int, 'type' => 'debit'|'credit', 'amount' => float, 'notes' => string|null]]
     * @param int|null $userId
     * @return FinancialTransaction
     * @throws Exception
     */
    public static function createTransaction(
        string $sourceModule,
        ?int $sourceId,
        ?string $referenceNumber,
        string $description,
        array $entries,
        ?int $userId = null
    ): FinancialTransaction {
        self::initializeDefaults();

        return DB::transaction(function () use ($sourceModule, $sourceId, $referenceNumber, $description, $entries, $userId) {
            $totalDebit = 0.00;
            $totalCredit = 0.00;

            foreach ($entries as $entry) {
                $amount = round((float)$entry['amount'], 2);
                if ($amount <= 0) continue;

                if ($entry['type'] === 'debit') {
                    $totalDebit += $amount;
                } elseif ($entry['type'] === 'credit') {
                    $totalCredit += $amount;
                }
            }

            $totalDebit = round($totalDebit, 2);
            $totalCredit = round($totalCredit, 2);

            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw new Exception("Unbalanced Journal Entry! Total Debits (৳{$totalDebit}) must equal Total Credits (৳{$totalCredit}).");
            }

            $txNumber = 'TXN-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            $transaction = FinancialTransaction::create([
                'transaction_number' => $txNumber,
                'transaction_date' => now()->toDateString(),
                'source_module' => $sourceModule,
                'source_id' => $sourceId,
                'reference_number' => $referenceNumber,
                'description' => $description,
                'total_amount' => $totalDebit,
                'created_by' => $userId,
            ]);

            foreach ($entries as $entry) {
                $amount = round((float)$entry['amount'], 2);
                if ($amount <= 0) continue;

                JournalEntry::create([
                    'financial_transaction_id' => $transaction->id,
                    'chart_of_account_id' => $entry['account_id'],
                    'type' => $entry['type'],
                    'amount' => $amount,
                    'notes' => $entry['notes'] ?? null,
                ]);

                // Update Chart of Account Current Balance
                $coa = ChartOfAccount::lockForUpdate()->find($entry['account_id']);
                if ($coa) {
                    // Normal balance: Assets & Expenses increase with Debit. Liabilities, Equity, Income increase with Credit.
                    $isDebitPositive = in_array($coa->type, ['asset', 'expense']);
                    if ($entry['type'] === 'debit') {
                        $coa->current_balance += $isDebitPositive ? $amount : -$amount;
                    } else {
                        $coa->current_balance += $isDebitPositive ? -$amount : $amount;
                    }
                    $coa->save();
                }
            }

            AuditLogger::log("accounting.transaction_created", $transaction, null, [
                'transaction_number' => $txNumber,
                'total_amount' => $totalDebit,
                'source_module' => $sourceModule
            ]);

            return $transaction;
        });
    }

    /**
     * Record automatic accounting entries for a Sale (POS / Direct / Web).
     */
    public static function recordSaleJournal(Sale $sale): ?FinancialTransaction
    {
        if ($sale->grand_total <= 0) return null;

        $salesRevenueAcc = ChartOfAccount::firstOrCreate(['code' => '4001'], [
            'name' => 'Sales Revenue',
            'type' => 'income',
            'category' => 'operating_revenue',
            'is_system' => true
        ]);
        $cashAcc = ChartOfAccount::firstOrCreate(['code' => '1001'], [
            'name' => 'Cash in Hand',
            'type' => 'asset',
            'category' => 'cash_and_bank',
            'is_system' => true
        ]);
        $bankAcc = ChartOfAccount::firstOrCreate(['code' => '1002'], [
            'name' => 'Bank Accounts',
            'type' => 'asset',
            'category' => 'cash_and_bank',
            'is_system' => true
        ]);
        $mobileAcc = ChartOfAccount::firstOrCreate(['code' => '1003'], [
            'name' => 'Mobile Financial Services',
            'type' => 'asset',
            'category' => 'cash_and_bank',
            'is_system' => true
        ]);
        $receivableAcc = ChartOfAccount::firstOrCreate(['code' => '1004'], [
            'name' => 'Accounts Receivable',
            'type' => 'asset',
            'category' => 'current_asset',
            'is_system' => true
        ]);

        $entries = [];

        // Debit Paid amounts to specific Asset accounts based on payment method
        if ($sale->payments && $sale->payments->count() > 0) {
            foreach ($sale->payments as $payment) {
                $payAmt = (float)$payment->amount;
                if ($payAmt <= 0) continue;

                $method = strtolower($payment->payment_method);
                $targetAccountId = match ($method) {
                    'bkash', 'nagad' => $mobileAcc->id,
                    'card', 'pos_card', 'bank_transfer' => $bankAcc->id,
                    default => $cashAcc->id,
                };

                $entries[] = [
                    'account_id' => $targetAccountId,
                    'type' => 'debit',
                    'amount' => $payAmt,
                    'notes' => strtoupper($method) . " payment received for Sale #{$sale->sale_number}" . ($payment->reference_number ? " (Ref: {$payment->reference_number})" : '')
                ];
            }
        } elseif ($sale->paid_amount > 0) {
            $entries[] = [
                'account_id' => $cashAcc->id,
                'type' => 'debit',
                'amount' => $sale->paid_amount,
                'notes' => "Payment received for Sale #{$sale->sale_number}"
            ];
        }

        // Debit Due amount to Accounts Receivable
        if ($sale->due_amount > 0) {
            $entries[] = [
                'account_id' => $receivableAcc->id,
                'type' => 'debit',
                'amount' => $sale->due_amount,
                'notes' => "Receivable from customer for Sale #{$sale->sale_number}"
            ];
        }

        // Credit Sales Revenue
        $entries[] = [
            'account_id' => $salesRevenueAcc->id,
            'type' => 'credit',
            'amount' => $sale->grand_total,
            'notes' => "Revenue recognized from Sale #{$sale->sale_number}"
        ];

        return self::createTransaction(
            sourceModule: 'sales',
            sourceId: $sale->id,
            referenceNumber: $sale->sale_number,
            description: "Sale #{$sale->sale_number} - {$sale->customer_name}",
            entries: $entries,
            userId: $sale->salesperson_id
        );
    }

    /**
     * Record automatic accounting entries for a Supplier Purchase receipt.
     */
    public static function recordPurchaseJournal(Purchase $purchase, ?PurchasePayment $payment = null): ?FinancialTransaction
    {
        if ($purchase->total <= 0) return null;

        $inventoryAcc = ChartOfAccount::firstOrCreate(['code' => '1005'], [
            'name' => 'Merchandise Inventory',
            'type' => 'asset',
            'category' => 'inventory',
            'is_system' => true
        ]);
        $payableAcc = ChartOfAccount::firstOrCreate(['code' => '2001'], [
            'name' => 'Accounts Payable (Suppliers)',
            'type' => 'liability',
            'category' => 'current_liability',
            'is_system' => true
        ]);
        $cashAcc = ChartOfAccount::firstOrCreate(['code' => '1001'], [
            'name' => 'Cash in Hand',
            'type' => 'asset',
            'category' => 'cash_and_bank',
            'is_system' => true
        ]);

        $entries = [];

        // Debit Merchandise Inventory
        $entries[] = [
            'account_id' => $inventoryAcc->id,
            'type' => 'debit',
            'amount' => $purchase->total,
            'notes' => "Inventory received from Purchase #{$purchase->purchase_number}"
        ];

        if ($payment && $payment->amount > 0) {
            $entries[] = [
                'account_id' => $cashAcc->id,
                'type' => 'credit',
                'amount' => $payment->amount,
                'notes' => "Payment made for Purchase #{$purchase->purchase_number}"
            ];
            $remaining = $purchase->total - $payment->amount;
            if ($remaining > 0) {
                $entries[] = [
                    'account_id' => $payableAcc->id,
                    'type' => 'credit',
                    'amount' => $remaining,
                    'notes' => "Payable to {$purchase->supplier?->company_name}"
                ];
            }
        } else {
            // Credit Full Accounts Payable
            $entries[] = [
                'account_id' => $payableAcc->id,
                'type' => 'credit',
                'amount' => $purchase->total,
                'notes' => "Payable to {$purchase->supplier?->company_name}"
            ];
        }

        return self::createTransaction(
            sourceModule: 'purchases',
            sourceId: $purchase->id,
            referenceNumber: $purchase->purchase_number,
            description: "Purchase #{$purchase->purchase_number} from {$purchase->supplier?->company_name}",
            entries: $entries,
            userId: $purchase->created_by
        );
    }

    /**
     * Record balanced double-entry accounting journal for customer opening balance.
     */
    public static function recordCustomerOpeningBalance(\App\Models\User $customer, float $amount, string $type = 'receivable', ?int $userId = null): ?FinancialTransaction
    {
        $amount = round($amount, 2);
        if ($amount <= 0 || $type === 'neutral') {
            return null;
        }

        self::initializeDefaults();

        $receivableAcc = ChartOfAccount::firstOrCreate(['code' => '1004'], [
            'name' => 'Accounts Receivable',
            'type' => 'asset',
            'category' => 'current_asset',
            'is_system' => true
        ]);

        $equityAcc = ChartOfAccount::firstOrCreate(['code' => '3001'], [
            'name' => 'Owner Equity / Capital',
            'type' => 'equity',
            'category' => 'equity',
            'is_system' => true
        ]);

        $payableAcc = ChartOfAccount::firstOrCreate(['code' => '2001'], [
            'name' => 'Accounts Payable (Suppliers)',
            'type' => 'liability',
            'category' => 'current_liability',
            'is_system' => true
        ]);

        $entries = [];

        if ($type === 'receivable') {
            // Customer owes us: Debit Accounts Receivable (Asset increases), Credit Owner Equity / Opening Balance (Equity increases)
            $entries[] = [
                'account_id' => $receivableAcc->id,
                'type' => 'debit',
                'amount' => $amount,
                'notes' => "Opening Receivable from Customer: {$customer->name}"
            ];
            $entries[] = [
                'account_id' => $equityAcc->id,
                'type' => 'credit',
                'amount' => $amount,
                'notes' => "Opening Balance Equity for Customer: {$customer->name}"
            ];
        } elseif ($type === 'payable') {
            // We owe customer (Advance): Debit Owner Equity (Equity decreases), Credit Accounts Payable / Advance (Liability increases)
            $entries[] = [
                'account_id' => $equityAcc->id,
                'type' => 'debit',
                'amount' => $amount,
                'notes' => "Opening Balance Equity reduction for Customer: {$customer->name}"
            ];
            $entries[] = [
                'account_id' => $payableAcc->id,
                'type' => 'credit',
                'amount' => $amount,
                'notes' => "Opening Payable / Advance to Customer: {$customer->name}"
            ];
        }

        if (empty($entries)) {
            return null;
        }

        $tx = self::createTransaction(
            sourceModule: 'pos',
            sourceId: $customer->id,
            referenceNumber: 'CUST-OB-' . $customer->id,
            description: "Opening balance ({$type}) for Customer {$customer->name}" . ($customer->phone ? " ({$customer->phone})" : ""),
            entries: $entries,
            userId: $userId
        );

        AuditLogger::log('customer.opening_balance_created', $customer, null, [
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'amount' => $amount,
            'type' => $type,
            'transaction_id' => $tx->id,
        ]);

        return $tx;
    }

    /**
     * Record balanced double-entry accounting transaction for Supplier opening balance.
     */
    public static function recordSupplierOpeningBalance(
        \App\Models\Supplier $supplier,
        float $amount,
        string $type = 'payable',
        ?int $userId = null
    ): ?FinancialTransaction {
        if ($amount <= 0 || $type === 'neutral') {
            return null;
        }

        self::initializeDefaults();

        $payableAcc = ChartOfAccount::where('code', '2001')->firstOrFail();
        $equityAcc = ChartOfAccount::where('code', '3001')->firstOrFail();
        $receivableAcc = ChartOfAccount::where('code', '1004')->firstOrFail();

        $entries = [];

        if ($type === 'payable') {
            // We owe the supplier: Debit Owner Equity / Opening Balance (Equity decreases), Credit Accounts Payable (Liability increases)
            $entries[] = [
                'account_id' => $equityAcc->id,
                'type' => 'debit',
                'amount' => $amount,
                'notes' => "Opening Balance Equity for Supplier Payable: {$supplier->company_name}"
            ];
            $entries[] = [
                'account_id' => $payableAcc->id,
                'type' => 'credit',
                'amount' => $amount,
                'notes' => "Opening Accounts Payable to Supplier: {$supplier->company_name}"
            ];
        } elseif ($type === 'advance') {
            // Advance / Supplier Credit (Supplier owes us goods/refund): Debit Accounts Receivable / Advance (Asset increases), Credit Owner Equity (Equity increases)
            $entries[] = [
                'account_id' => $receivableAcc->id,
                'type' => 'debit',
                'amount' => $amount,
                'notes' => "Opening Advance / Supplier Credit from: {$supplier->company_name}"
            ];
            $entries[] = [
                'account_id' => $equityAcc->id,
                'type' => 'credit',
                'amount' => $amount,
                'notes' => "Opening Balance Equity for Supplier Advance: {$supplier->company_name}"
            ];
        }

        if (empty($entries)) {
            return null;
        }

        $tx = self::createTransaction(
            sourceModule: 'purchases',
            sourceId: $supplier->id,
            referenceNumber: 'SUP-OB-' . $supplier->id,
            description: "Opening balance ({$type}) for Supplier {$supplier->company_name}" . ($supplier->phone ? " ({$supplier->phone})" : ""),
            entries: $entries,
            userId: $userId
        );

        AuditLogger::log('supplier.opening_balance_created', $supplier, null, [
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->company_name,
            'amount' => $amount,
            'type' => $type,
            'transaction_id' => $tx->id,
        ]);

        return $tx;
    }
}
