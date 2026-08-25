<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\JournalEntry;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Sale;
use App\Models\Purchase;
use App\Services\Accounting\AccountingService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class AccountsController extends Controller
{
    /**
     * Display executive financial dashboard.
     */
    public function index(): Response
    {
        AccountingService::initializeDefaults();

        $today = now()->toDateString();

        $todaySales = Sale::whereDate('created_at', $today)->where('status', '!=', 'cancelled')->sum('grand_total');
        $todayPurchases = Purchase::whereDate('purchase_date', $today)->where('status', '!=', 'cancelled')->sum('total');
        $totalReceivables = Sale::where('status', '!=', 'cancelled')->sum('due_amount');
        $totalPayables = Purchase::where('status', '!=', 'cancelled')->sum('due_amount');
        $totalIncome = Income::sum('amount');
        $totalExpense = Expense::sum('amount');

        $financialAccounts = FinancialAccount::with('chartOfAccount')->where('is_active', true)->get();
        $totalLiquidCash = $financialAccounts->sum('current_balance');

        $recentTransactions = FinancialTransaction::with(['creator:id,name', 'journalEntries.account'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Accounts/Index', [
            'metrics' => [
                'today_sales' => (float)$todaySales,
                'today_purchases' => (float)$todayPurchases,
                'total_receivables' => (float)$totalReceivables,
                'total_payables' => (float)$totalPayables,
                'total_income' => (float)$totalIncome,
                'total_expense' => (float)$totalExpense,
                'total_liquid_cash' => (float)$totalLiquidCash,
            ],
            'financialAccounts' => $financialAccounts,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * Display Chart of Accounts hierarchical tree.
     */
    public function chartOfAccounts(): Response
    {
        AccountingService::initializeDefaults();

        $accounts = ChartOfAccount::with('parent')
            ->orderBy('code')
            ->get();

        return Inertia::render('Admin/Accounts/ChartOfAccounts', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Store new custom chart of account.
     */
    public function storeAccount(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:chart_of_accounts,code',
            'name' => 'required|string|max:150',
            'type' => 'required|in:asset,liability,equity,income,expense',
            'category' => 'required|string|max:100',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'opening_balance' => 'nullable|numeric',
            'description' => 'nullable|string|max:500',
        ]);

        $openingBalance = (float)($validated['opening_balance'] ?? 0.00);
        $validated['current_balance'] = $openingBalance;

        $account = ChartOfAccount::create($validated);
        AuditLogger::log('accounting.account_created', $account, null, ['code' => $account->code]);

        return back()->with('success', "Account '{$account->name}' ({$account->code}) created successfully.");
    }

    /**
     * Display General Ledger & Double-Entry Transactions.
     */
    public function transactions(Request $request): Response
    {
        $query = FinancialTransaction::with(['creator:id,name', 'journalEntries.account']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('transaction_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('source_module')) {
            $query->where('source_module', $request->query('source_module'));
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Accounts/Transactions', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'source_module']),
        ]);
    }

    /**
     * Display and manage Expenses.
     */
    public function expenses(Request $request): Response
    {
        $expenses = Expense::with(['chartOfAccount', 'financialAccount', 'creator'])
            ->orderBy('expense_date', 'desc')
            ->paginate(15);

        $accounts = ChartOfAccount::where('type', 'expense')->orderBy('name')->get();
        $financialAccounts = FinancialAccount::where('is_active', true)->get();

        return Inertia::render('Admin/Accounts/Expenses', [
            'expenses' => $expenses,
            'accounts' => $accounts,
            'financialAccounts' => $financialAccounts,
        ]);
    }

    /**
     * Store new expense voucher.
     */
    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'financial_account_id' => 'required|exists:financial_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'payee' => 'nullable|string|max:150',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $expNumber = 'EXP-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $validated['expense_number'] = $expNumber;
        $validated['created_by'] = auth()->id();

        $expense = Expense::create($validated);

        // Deduct from financial register
        $finAcc = FinancialAccount::find($validated['financial_account_id']);
        if ($finAcc) {
            $finAcc->current_balance -= (float)$validated['amount'];
            $finAcc->save();
        }

        // Post Journal Entry (Debit Expense Account, Credit Cash/Bank)
        $finChartAccId = $finAcc?->chart_of_account_id ?? ChartOfAccount::where('code', '1001')->first()?->id;

        AccountingService::createTransaction(
            sourceModule: 'expense',
            sourceId: $expense->id,
            referenceNumber: $expNumber,
            description: "Expense: {$expense->category} - Paid to {$expense->payee}",
            entries: [
                ['account_id' => $validated['chart_of_account_id'], 'type' => 'debit', 'amount' => $validated['amount']],
                ['account_id' => $finChartAccId, 'type' => 'credit', 'amount' => $validated['amount']],
            ],
            userId: auth()->id()
        );

        return back()->with('success', "Expense voucher #{$expNumber} recorded successfully.");
    }

    /**
     * Display and manage Income vouchers.
     */
    public function income(Request $request): Response
    {
        $incomes = Income::with(['chartOfAccount', 'financialAccount', 'creator'])
            ->orderBy('income_date', 'desc')
            ->paginate(15);

        $accounts = ChartOfAccount::where('type', 'income')->orderBy('name')->get();
        $financialAccounts = FinancialAccount::where('is_active', true)->get();

        return Inertia::render('Admin/Accounts/Income', [
            'incomes' => $incomes,
            'accounts' => $accounts,
            'financialAccounts' => $financialAccounts,
        ]);
    }

    /**
     * Store new income voucher.
     */
    public function storeIncome(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'financial_account_id' => 'required|exists:financial_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'income_date' => 'required|date',
            'payer' => 'nullable|string|max:150',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $incNumber = 'INC-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $validated['income_number'] = $incNumber;
        $validated['created_by'] = auth()->id();

        $income = Income::create($validated);

        // Add to financial register
        $finAcc = FinancialAccount::find($validated['financial_account_id']);
        if ($finAcc) {
            $finAcc->current_balance += (float)$validated['amount'];
            $finAcc->save();
        }

        // Post Journal Entry (Debit Cash/Bank, Credit Income Account)
        $finChartAccId = $finAcc?->chart_of_account_id ?? ChartOfAccount::where('code', '1001')->first()?->id;

        AccountingService::createTransaction(
            sourceModule: 'income',
            sourceId: $income->id,
            referenceNumber: $incNumber,
            description: "Income: {$income->category} - Received from {$income->payer}",
            entries: [
                ['account_id' => $finChartAccId, 'type' => 'debit', 'amount' => $validated['amount']],
                ['account_id' => $validated['chart_of_account_id'], 'type' => 'credit', 'amount' => $validated['amount']],
            ],
            userId: auth()->id()
        );

        return back()->with('success', "Income voucher #{$incNumber} recorded successfully.");
    }

    /**
     * Display Receivables and record customer collection.
     */
    public function receivables(Request $request): Response
    {
        $receivables = Sale::where('due_amount', '>', 0)
            ->with(['customer', 'salesperson'])
            ->orderBy('due_amount', 'desc')
            ->paginate(15);

        $totalReceivable = Sale::where('status', '!=', 'cancelled')->sum('due_amount');
        $financialAccounts = FinancialAccount::where('is_active', true)->get();

        return Inertia::render('Admin/Accounts/Receivables', [
            'receivables' => $receivables,
            'totalReceivable' => (float)$totalReceivable,
            'financialAccounts' => $financialAccounts,
        ]);
    }

    /**
     * Display Payables and record supplier payment.
     */
    public function payables(Request $request): Response
    {
        $payables = Purchase::where('due_amount', '>', 0)
            ->with(['supplier', 'warehouse'])
            ->orderBy('due_amount', 'desc')
            ->paginate(15);

        $totalPayable = Purchase::where('status', '!=', 'cancelled')->sum('due_amount');
        $financialAccounts = FinancialAccount::where('is_active', true)->get();

        return Inertia::render('Admin/Accounts/Payables', [
            'payables' => $payables,
            'totalPayable' => (float)$totalPayable,
            'financialAccounts' => $financialAccounts,
        ]);
    }

    /**
     * Cash & Bank Accounts management.
     */
    public function cashBank(Request $request): Response
    {
        $financialAccounts = FinancialAccount::with('chartOfAccount')
            ->orderBy('type')
            ->get();

        return Inertia::render('Admin/Accounts/CashBank', [
            'financialAccounts' => $financialAccounts,
        ]);
    }
}
