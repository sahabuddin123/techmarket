<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\ChartOfAccount;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\Expense;
use App\Models\Income;
use App\Services\Accounting\AccountingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AccountingModuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected AccountingService $accountingService;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create([
            'email' => 'acc_admin@techmarket.com',
            'role' => 'admin',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->accountingService = new AccountingService();
        $this->accountingService->seedDefaultAccounts();
    }

    public function test_default_chart_of_accounts_and_financial_registers_are_seeded(): void
    {
        $this->assertDatabaseHas('chart_of_accounts', ['code' => '1001', 'name' => 'Cash in Hand']);
        $this->assertDatabaseHas('chart_of_accounts', ['code' => '4001', 'name' => 'Sales Revenue']);
        $this->assertDatabaseHas('chart_of_accounts', ['code' => '5001', 'name' => 'Cost of Goods Sold (COGS)']);

        $this->assertDatabaseHas('financial_accounts', ['name' => 'Main Cash Register']);
        $this->assertDatabaseHas('financial_accounts', ['name' => 'BRAC Bank Corporate A/C']);
    }

    public function test_double_entry_transaction_must_be_strictly_balanced(): void
    {
        $cashAcc = ChartOfAccount::where('code', '1001')->first();
        $salesAcc = ChartOfAccount::where('code', '4001')->first();

        // Valid balanced transaction: Debit Cash 5000, Credit Sales 5000
        $tx = $this->accountingService->createTransaction(
            description: 'Balanced Sale Test',
            sourceModule: 'sales',
            sourceId: null,
            entries: [
                ['account_id' => $cashAcc->id, 'type' => 'debit', 'amount' => 5000.00],
                ['account_id' => $salesAcc->id, 'type' => 'credit', 'amount' => 5000.00],
            ],
            referenceNumber: 'BAL-001',
            userId: $this->admin->id
        );

        $this->assertNotNull($tx);
        $this->assertEquals(5000.00, $cashAcc->fresh()->current_balance);
        $this->assertEquals(5000.00, $salesAcc->fresh()->current_balance);

        // Attempting an unbalanced entry throws exception
        $this->expectException(\Exception::class);
        $this->accountingService->createTransaction(
            description: 'Unbalanced Fraud Test',
            sourceModule: 'sales',
            sourceId: null,
            entries: [
                ['account_id' => $cashAcc->id, 'type' => 'debit', 'amount' => 5000.00],
                ['account_id' => $salesAcc->id, 'type' => 'credit', 'amount' => 4000.00], // Unbalanced by 1000!
            ],
            referenceNumber: 'UNBAL-001',
            userId: $this->admin->id
        );
    }

    public function test_admin_can_record_expense_voucher(): void
    {
        $officeExpenseAcc = ChartOfAccount::where('code', '5003')->first();
        $cashRegister = FinancialAccount::where('type', 'cash')->first();
        $cashRegister->update(['current_balance' => 50000.00]);

        $payload = [
            'chart_of_account_id' => $officeExpenseAcc->id,
            'financial_account_id' => $cashRegister->id,
            'amount' => 4500.00,
            'expense_date' => now()->toDateString(),
            'category' => 'Office Utility & Internet',
            'payee' => 'ISP Provider',
            'notes' => 'Monthly dedicated broadband fiber connection bill',
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.accounts.storeExpense'), $payload)
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'amount' => 4500.00,
            'payee' => 'ISP Provider',
        ]);

        // Financial account deducted
        $this->assertEquals(45500.00, $cashRegister->fresh()->current_balance);
    }

    public function test_admin_can_record_income_voucher(): void
    {
        $revenueAcc = ChartOfAccount::where('code', '4001')->first();
        $bankRegister = FinancialAccount::where('type', 'bank')->first();
        $bankRegister->update(['current_balance' => 100000.00]);

        $payload = [
            'chart_of_account_id' => $revenueAcc->id,
            'financial_account_id' => $bankRegister->id,
            'amount' => 25000.00,
            'income_date' => now()->toDateString(),
            'category' => 'Corporate IT Consultancy',
            'payer' => 'Apex Group',
            'notes' => 'Network architecture setup consulting fee',
        ];

        $this->actingAs($this->admin)
            ->post(route('admin.accounts.storeIncome'), $payload)
            ->assertRedirect();

        $this->assertDatabaseHas('incomes', [
            'amount' => 25000.00,
            'payer' => 'Apex Group',
        ]);

        // Bank register increased
        $this->assertEquals(125000.00, $bankRegister->fresh()->current_balance);
    }
}
