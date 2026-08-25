<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'customer_code',
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'tax_number',
        'credit_limit',
        'opening_balance',
        'opening_balance_type',
        'notes',
        'status',
        'is_walk_in',
        'referral_code',
        'google_id',
        'facebook_id',
        'avatar',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->hasRole('Super Admin') || $this->hasRole('Admin');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function role()
    {
        return $this->roles();
    }

    public function hasRole(string $roleName): bool
    {
        return $this->roles->contains('name', $roleName);
    }

    public function hasPermission(string $permissionName): bool
    {
        if ($this->hasRole('Super Admin') || $this->hasRole('Admin') || $this->role === 'admin') {
            return true;
        }

        foreach ($this->roles as $role) {
            if ($role->permissions->contains('name', $permissionName)) {
                return true;
            }
        }

        return false;
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'customer_id');
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function notificationPreferences()
    {
        return $this->hasMany(NotificationPreference::class);
    }

    public function customNotifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class, 'user_id');
    }

    /**
     * Compute current outstanding receivable due for this customer.
     */
    public function getCurrentDueAttribute(): float
    {
        $openingType = $this->getAttribute('opening_balance_type');
        $openingBalance = (float)($this->getAttribute('opening_balance') ?? 0);
        $opening = ($openingType === 'receivable') ? $openingBalance : 0.0;
        
        $salesDue = 0.0;
        if ($this->exists) {
            $salesDue = (float)$this->sales()->where('status', '!=', 'cancelled')->sum('due_amount');
        }
        return round($opening + $salesDue, 2);
    }

    /**
     * Compute available credit balance for this customer.
     */
    public function getAvailableCreditAttribute(): float
    {
        $creditLimit = (float)($this->getAttribute('credit_limit') ?? 0);
        if ($creditLimit <= 0) {
            return 0.00;
        }
        return max(0.00, round($creditLimit - $this->current_due, 2));
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'credit_limit' => 'decimal:2',
            'opening_balance' => 'decimal:2',
            'is_walk_in' => 'boolean',
        ];
    }
}
