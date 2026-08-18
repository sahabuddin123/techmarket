<?php

namespace App\Services\Notification;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Get paginated notifications for the Notification Center.
     */
    public function getNotificationCenterList(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Notification::query();

        // Scope to recipient
        if (!$user->hasRole('Super Admin')) {
            $query->forRecipient($user->id, $user->role);
        }

        // Filter Category
        if (!empty($filters['category']) && $filters['category'] !== 'ALL') {
            $query->where('category', strtoupper($filters['category']));
        }

        // Filter Priority
        if (!empty($filters['priority']) && $filters['priority'] !== 'ALL') {
            $query->where('priority', strtoupper($filters['priority']));
        }

        // Filter Status (unread / read)
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'unread') {
                $query->unread();
            } elseif ($filters['status'] === 'read') {
                $query->read();
            }
        }

        // Search Query
        if (!empty($filters['search'])) {
            $s = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($s) {
                $q->where('title', 'LIKE', $s)
                  ->orWhere('message', 'LIKE', $s)
                  ->orWhere('type', 'LIKE', $s);
            });
        }

        return $query->latest()->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Get live topbar feed notifications (latest 10 items + unread counter).
     */
    public function getTopbarFeed(User $user, string $category = 'ALL'): array
    {
        $query = Notification::query();

        if (!$user->hasRole('Super Admin')) {
            $query->forRecipient($user->id, $user->role);
        }

        if ($category !== 'ALL') {
            $query->where('category', strtoupper($category));
        }

        $items = $query->latest()->take(10)->get();
        $unreadCount = $this->getUnreadCount($user);

        return [
            'notifications' => $items,
            'unread_count' => $unreadCount,
        ];
    }

    /**
     * Get unread notification count.
     */
    public function getUnreadCount(User $user): int
    {
        $query = Notification::unread();
        if (!$user->hasRole('Super Admin')) {
            $query->forRecipient($user->id, $user->role);
        }
        return $query->count();
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(string $id, User $user): bool
    {
        $notif = Notification::where('id', $id)->first();
        if ($notif) {
            $notif->markAsRead();
            return true;
        }
        return false;
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(User $user, ?string $category = null): int
    {
        $query = Notification::unread();
        if (!$user->hasRole('Super Admin')) {
            $query->forRecipient($user->id, $user->role);
        }
        if ($category && $category !== 'ALL') {
            $query->where('category', strtoupper($category));
        }

        return $query->update(['read_at' => now()]);
    }

    /**
     * Delete a single notification.
     */
    public function delete(string $id, User $user): bool
    {
        $query = Notification::where('id', $id);
        if (!$user->hasRole('Super Admin')) {
            $query->forRecipient($user->id, $user->role);
        }
        return (bool) $query->delete();
    }

    /**
     * Bulk actions (mark_read, delete).
     */
    public function bulkAction(array $ids, string $action, User $user): int
    {
        $query = Notification::whereIn('id', $ids);
        if (!$user->hasRole('Super Admin')) {
            $query->forRecipient($user->id, $user->role);
        }

        return match ($action) {
            'mark_read' => $query->update(['read_at' => now()]),
            'delete' => $query->delete(),
            default => 0,
        };
    }

    /**
     * Get Notification Center KPI Stats.
     */
    public function getStats(User $user): array
    {
        $baseQuery = Notification::query();
        if (!$user->hasRole('Super Admin')) {
            $baseQuery->forRecipient($user->id, $user->role);
        }

        return [
            'total_unread' => (clone $baseQuery)->unread()->count(),
            'today_count' => (clone $baseQuery)->whereDate('created_at', today())->count(),
            'high_priority_count' => (clone $baseQuery)->whereIn('priority', ['HIGH', 'URGENT'])->unread()->count(),
            'critical_count' => (clone $baseQuery)->where('priority', 'CRITICAL')->unread()->count(),
        ];
    }
}
