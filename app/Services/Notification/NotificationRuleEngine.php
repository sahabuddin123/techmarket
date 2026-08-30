<?php

namespace App\Services\Notification;

use App\Models\NotificationRule;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Collection;

class NotificationRuleEngine
{
    /**
     * Resolve the active rule for a given event key.
     */
    public function getRule(string $eventKey): ?NotificationRule
    {
        return NotificationRule::where('event_key', $eventKey)
            ->where('enabled', true)
            ->first();
    }

    /**
     * Resolve target User models for an event rule.
     *
     * @return Collection<User>
     */
    public function resolveRecipients(NotificationRule $rule, array $context = []): Collection
    {
        $userIds = collect($rule->notify_users ?? []);

        // Resolve users from assigned roles
        if (!empty($rule->notify_roles)) {
            $roleNames = (array) $rule->notify_roles;

            $usersFromRoles = User::whereHas('roles', function ($q) use ($roleNames) {
                $q->whereIn('name', $roleNames);
            })->pluck('id');

            $userIds = $userIds->merge($usersFromRoles);

            // Also include legacy direct role column if exists
            $lowerRoles = array_map('strtolower', $roleNames);
            if (in_array('admin', $lowerRoles) || in_array('super admin', $lowerRoles) || in_array('superadmin', $lowerRoles)) {
                $legacyAdmins = User::whereIn('role', ['admin', 'superadmin'])->pluck('id');
                $userIds = $userIds->merge($legacyAdmins);
            }
        }

        // If context provides explicit target user (e.g. for customer notifications)
        if (isset($context['target_user_id'])) {
            $userIds->push((int) $context['target_user_id']);
        }

        // Fallback: If no users resolved for critical system alerts, send to all super admins / admins
        if ($userIds->isEmpty()) {
            $userIds = User::whereIn('role', ['admin', 'superadmin'])
                ->orWhereHas('roles', function ($q) {
                    $q->whereIn('name', ['Super Admin', 'Admin']);
                })
                ->pluck('id');
        }

        return User::whereIn('id', $userIds->unique()->filter())->get();
    }

    /**
     * Interpolate template placeholders with context data.
     */
    public function interpolate(string $template, array $data): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', function ($matches) use ($data) {
            $key = $matches[1];
            if (array_key_exists($key, $data)) {
                $val = $data[$key];
                return is_scalar($val) ? (string) $val : json_encode($val);
            }
            return $matches[0];
        }, $template);
    }

    /**
     * Build standard context placeholders from models / raw data.
     */
    public function buildPlaceholders(array $rawContext): array
    {
        $placeholders = $rawContext;

        if (isset($rawContext['order'])) {
            $o = $rawContext['order'];
            $placeholders['order_number'] = $o->order_number ?? '';
            $placeholders['customer_name'] = $o->customer_name ?? '';
            $placeholders['customer_phone'] = $o->customer_phone ?? '';
            $placeholders['order_total'] = number_format($o->total ?? 0, 2);
            $placeholders['order_url'] = "/admin/orders/" . ($o->id ?? '');
        }

        if (isset($rawContext['shipment'])) {
            $s = $rawContext['shipment'];
            $placeholders['tracking_number'] = $s->tracking_number ?? '';
            $placeholders['courier_name'] = $s->courier_name ?? 'Steadfast';
            $placeholders['shipment_url'] = "/admin/shipments";
        }

        if (isset($rawContext['product'])) {
            $p = $rawContext['product'];
            $placeholders['product_name'] = $p->title ?? '';
            $placeholders['stock_quantity'] = $p->stock ?? 0;
            $placeholders['product_url'] = "/admin/products/" . ($p->id ?? '') . "/edit";
        }

        if (isset($rawContext['fraud_check'])) {
            $f = $rawContext['fraud_check'];
            $placeholders['fraud_score'] = $f->risk_score ?? 0;
            $placeholders['fraud_url'] = "/admin/customers/fraud-reviews";
        }

        return $placeholders;
    }
}
