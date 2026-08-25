<?php

namespace App\Services\Pos;

use App\Models\User;
use App\Models\Sale;
use App\Services\Accounting\AccountingService;
use App\Services\AuditLogger;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Exception;

class PosCustomerService
{
    /**
     * Get or create the canonical Walk-in Customer record.
     */
    public static function getCanonicalWalkInCustomer(): User
    {
        $walkIn = User::where('is_walk_in', true)->first();

        if (!$walkIn) {
            $walkIn = User::where('email', 'walkin@pos.internal')->first();
        }

        if (!$walkIn) {
            $walkIn = User::where('name', 'Walk-in Customer')->where('role', 'customer')->first();
        }

        if (!$walkIn) {
            $walkIn = User::create([
                'name' => 'Walk-in Customer',
                'email' => 'walkin@pos.internal',
                'phone' => null,
                'role' => 'customer',
                'is_walk_in' => true,
                'status' => 'active',
                'credit_limit' => 0.00,
                'opening_balance' => 0.00,
                'opening_balance_type' => 'neutral',
                'password' => Hash::make(Str::random(32)),
            ]);
        } else {
            if (!$walkIn->is_walk_in) {
                $walkIn->is_walk_in = true;
                $walkIn->save();
            }
        }

        return $walkIn;
    }

    /**
     * Search customers across name, phone, email, and customer code.
     */
    public static function searchCustomers(string $query = '', int $limit = 25): Collection
    {
        $walkIn = self::getCanonicalWalkInCustomer();

        $q = User::select('id', 'name', 'email', 'phone', 'customer_code', 'address', 'city', 'state', 'postal_code', 'country', 'tax_number', 'credit_limit', 'opening_balance', 'opening_balance_type', 'notes', 'status', 'is_walk_in')
            ->where('role', '!=', 'admin');

        if (!empty(trim($query))) {
            $search = trim($query);
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('customer_code', 'like', "%{$search}%");
            });
        }

        $customers = $q->orderByRaw("CASE WHEN id = {$walkIn->id} THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit($limit)
            ->get();

        // If query is empty and walk-in customer is not in the list, prepend it
        if (empty(trim($query)) && !$customers->contains('id', $walkIn->id)) {
            $customers->prepend($walkIn);
        }

        return $customers->map(function ($c) {
            return self::formatCustomerSummary($c);
        });
    }

    /**
     * Format customer object with computed financials for POS consumption.
     */
    public static function formatCustomerSummary(User $customer): array
    {
        $currentDue = $customer->current_due;
        $creditLimit = (float)($customer->credit_limit ?? 0);
        $availableCredit = $creditLimit > 0 ? max(0.00, round($creditLimit - $currentDue, 2)) : 0.00;

        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'customer_code' => $customer->customer_code,
            'address' => $customer->address,
            'city' => $customer->city,
            'state' => $customer->state,
            'postal_code' => $customer->postal_code,
            'country' => $customer->country ?? 'Bangladesh',
            'tax_number' => $customer->tax_number,
            'credit_limit' => $creditLimit,
            'opening_balance' => (float)($customer->opening_balance ?? 0),
            'opening_balance_type' => $customer->opening_balance_type ?? 'receivable',
            'current_due' => $currentDue,
            'available_credit' => $availableCredit,
            'status' => $customer->status ?? 'active',
            'is_walk_in' => (bool)$customer->is_walk_in,
            'notes' => $customer->notes,
        ];
    }

    /**
     * Get detailed customer record including sales history.
     */
    public static function getCustomerDetails(User $customer): array
    {
        $summary = self::formatCustomerSummary($customer);
        $salesCount = $customer->sales()->count();
        $totalPurchases = (float)$customer->sales()->where('status', '!=', 'cancelled')->sum('grand_total');
        $recentSales = $customer->sales()->latest()->limit(5)->get(['id', 'sale_number', 'grand_total', 'paid_amount', 'due_amount', 'status', 'payment_status', 'created_at']);

        return array_merge($summary, [
            'sales_count' => $salesCount,
            'total_purchases' => $totalPurchases,
            'recent_sales' => $recentSales,
        ]);
    }

    /**
     * Create a new customer safely from POS terminal with opening balance and audit trail.
     */
    public static function createCustomerFromPos(array $payload, ?int $createdBy = null): array
    {
        $name = trim($payload['name'] ?? '');
        if (empty($name)) {
            throw new Exception('Customer name is required.');
        }

        $phone = !empty($payload['phone']) ? trim($payload['phone']) : null;
        $email = !empty($payload['email']) ? trim(strtolower($payload['email'])) : null;

        // Duplicate Check
        if ($phone) {
            $existingPhone = User::where('phone', $phone)->first();
            if ($existingPhone) {
                throw new Exception("Customer with phone number '{$phone}' already exists: {$existingPhone->name} (ID #{$existingPhone->id}).");
            }
        }

        if ($email) {
            $existingEmail = User::where('email', $email)->first();
            if ($existingEmail) {
                throw new Exception("Customer with email '{$email}' already exists: {$existingEmail->name} (ID #{$existingEmail->id}).");
            }
        }

        $customerCode = !empty($payload['customer_code']) 
            ? trim($payload['customer_code']) 
            : 'CUST-' . strtoupper(substr(uniqid(), -6));

        $creditLimit = max(0.00, (float)($payload['credit_limit'] ?? 0.00));
        $openingBalance = max(0.00, (float)($payload['opening_balance'] ?? 0.00));
        $rawOpeningType = $payload['opening_balance_type'] ?? ($openingBalance > 0 ? 'receivable' : 'neutral');
        $openingType = in_array($rawOpeningType, ['receivable', 'payable', 'neutral']) 
            ? $rawOpeningType 
            : 'neutral';

        return DB::transaction(function () use ($name, $phone, $email, $customerCode, $creditLimit, $openingBalance, $openingType, $payload, $createdBy) {
            $customer = User::create([
                'customer_code' => $customerCode,
                'name' => $name,
                'email' => $email ?: ('customer_' . Str::random(8) . '@pos.internal'),
                'phone' => $phone,
                'password' => Hash::make(Str::random(24)),
                'role' => 'customer',
                'address' => $payload['address'] ?? null,
                'city' => $payload['city'] ?? null,
                'state' => $payload['state'] ?? null,
                'postal_code' => $payload['postal_code'] ?? null,
                'country' => $payload['country'] ?? 'Bangladesh',
                'tax_number' => $payload['tax_number'] ?? null,
                'credit_limit' => $creditLimit,
                'opening_balance' => $openingBalance,
                'opening_balance_type' => $openingType,
                'notes' => $payload['notes'] ?? null,
                'status' => $payload['status'] ?? 'active',
                'is_walk_in' => false,
            ]);

            // If opening balance was specified, record accounting journal
            if ($openingBalance > 0 && $openingType !== 'neutral') {
                AccountingService::recordCustomerOpeningBalance($customer, $openingBalance, $openingType, $createdBy);
            }

            AuditLogger::log('customer.created_from_pos', $customer, null, [
                'customer_id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'credit_limit' => $creditLimit,
                'opening_balance' => $openingBalance,
                'opening_balance_type' => $openingType,
            ]);

            return self::formatCustomerSummary($customer);
        });
    }

    /**
     * Update customer information from POS terminal.
     */
    public static function updateCustomerFromPos(User $customer, array $payload, ?int $updatedBy = null): array
    {
        if ($customer->is_walk_in) {
            throw new Exception("Cannot modify the default Walk-in Customer record.");
        }

        $phone = !empty($payload['phone']) ? trim($payload['phone']) : null;
        $email = !empty($payload['email']) ? trim(strtolower($payload['email'])) : null;

        if ($phone && $phone !== $customer->phone) {
            $existingPhone = User::where('phone', $phone)->where('id', '!=', $customer->id)->first();
            if ($existingPhone) {
                throw new Exception("Another customer with phone '{$phone}' already exists: {$existingPhone->name}.");
            }
        }

        if ($email && $email !== $customer->email) {
            $existingEmail = User::where('email', $email)->where('id', '!=', $customer->id)->first();
            if ($existingEmail) {
                throw new Exception("Another customer with email '{$email}' already exists: {$existingEmail->name}.");
            }
        }

        $oldData = $customer->only(['name', 'phone', 'email', 'address', 'credit_limit']);

        $customer->name = trim($payload['name'] ?? $customer->name);
        if ($phone !== null) $customer->phone = $phone;
        if ($email !== null) $customer->email = $email;
        if (isset($payload['address'])) $customer->address = $payload['address'];
        if (isset($payload['city'])) $customer->city = $payload['city'];
        if (isset($payload['state'])) $customer->state = $payload['state'];
        if (isset($payload['postal_code'])) $customer->postal_code = $payload['postal_code'];
        if (isset($payload['country'])) $customer->country = $payload['country'];
        if (isset($payload['tax_number'])) $customer->tax_number = $payload['tax_number'];
        if (isset($payload['credit_limit'])) $customer->credit_limit = max(0.00, (float)$payload['credit_limit']);
        if (isset($payload['notes'])) $customer->notes = $payload['notes'];
        if (isset($payload['status'])) $customer->status = $payload['status'];

        $customer->save();

        AuditLogger::log('customer.updated_from_pos', $customer, $oldData, [
            'customer_id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'credit_limit' => $customer->credit_limit,
        ]);

        return self::formatCustomerSummary($customer);
    }

    /**
     * Authoritative server-side credit limit and due validation for POS checkouts.
     */
    public static function validateCreditLimit(?User $customer, float $newDueAmount): void
    {
        if ($newDueAmount <= 0) {
            return;
        }

        // Walk-in Customer Check
        if (!$customer || $customer->is_walk_in) {
            throw new Exception("Due / credit sale is not permitted for Walk-in Customer. Please select or create a registered customer.");
        }

        if ($customer->status !== 'active') {
            throw new Exception("Customer '{$customer->name}' is {$customer->status} and cannot make credit purchases.");
        }

        $creditLimit = (float)($customer->credit_limit ?? 0);

        // If customer has a credit limit set (> 0)
        if ($creditLimit > 0) {
            $currentDue = $customer->current_due;
            $totalDueAfterSale = round($currentDue + $newDueAmount, 2);

            if ($totalDueAfterSale > $creditLimit) {
                $availableCredit = max(0.00, round($creditLimit - $currentDue, 2));
                throw new Exception("Credit limit exceeded. Customer credit limit is ৳" . number_format($creditLimit, 2) . ", Current Due is ৳" . number_format($currentDue, 2) . ". Available credit: ৳" . number_format($availableCredit, 2) . ".");
            }
        }
    }
}
