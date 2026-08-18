<?php

namespace App\Services\Email;

use App\Models\EmailCampaign;
use App\Models\EmailCampaignRecipient;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;

class EmailCampaignService
{
    protected EmailPreferenceService $preferenceService;
    protected EmailManager $emailManager;
    protected EmailTemplateService $templateService;

    public function __construct(
        ?EmailPreferenceService $preferenceService = null,
        ?EmailManager $emailManager = null,
        ?EmailTemplateService $templateService = null
    ) {
        $this->preferenceService = $preferenceService ?? new EmailPreferenceService();
        $this->emailManager = $emailManager ?? new EmailManager();
        $this->templateService = $templateService ?? new EmailTemplateService();
    }

    /**
     * Resolve audience recipients for campaign based on audience_type and filters.
     *
     * @return Collection<User|object>
     */
    public function resolveAudience(string $audienceType, array $filters = []): Collection
    {
        $query = User::whereNotNull('email');

        switch ($audienceType) {
            case 'active_buyers':
                $query->whereHas('orders', function ($q) {
                    $q->whereIn('status', ['Completed', 'Delivered']);
                });
                break;

            case 'inactive_customers':
                $days = (int) ($filters['inactive_days'] ?? 30);
                $query->whereDoesntHave('orders', function ($q) use ($days) {
                    $q->where('created_at', '>=', now()->subDays($days));
                });
                break;

            case 'product_buyers':
                $productId = (int) ($filters['product_id'] ?? 0);
                if ($productId > 0) {
                    $query->whereHas('orders.orderItems', function ($q) use ($productId) {
                        $q->where('product_id', $productId);
                    });
                }
                break;

            case 'custom_filtered':
                if (!empty($filters['role'])) {
                    $query->where('role', $filters['role']);
                }
                if (!empty($filters['district'])) {
                    $query->whereHas('orders', function ($q) use ($filters) {
                        $q->where('district', $filters['district']);
                    });
                }
                break;

            case 'all_customers':
            default:
                $query->where('role', 'customer');
                break;
        }

        $users = $query->get();

        // Filter out unsubscribed emails
        return $users->filter(function ($user) {
            return $this->preferenceService->canReceiveEmail($user->email, 'marketing');
        });
    }

    /**
     * Launch or queue campaign sending.
     */
    public function launchCampaign(EmailCampaign $campaign): void
    {
        $audience = $this->resolveAudience($campaign->audience_type, $campaign->audience_filters ?? []);

        $campaign->update([
            'status' => 'sending',
            'started_at' => now(),
            'total_recipients' => $audience->count(),
        ]);

        foreach ($audience as $user) {
            EmailCampaignRecipient::create([
                'campaign_id' => $campaign->id,
                'user_id' => $user->id ?? null,
                'email' => $user->email,
                'status' => 'pending',
            ]);
        }

        \App\Jobs\ProcessEmailCampaignJob::dispatch($campaign->id);
    }
}
