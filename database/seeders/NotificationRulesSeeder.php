<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NotificationRule;

class NotificationRulesSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            // ==================== ORDER EVENTS ====================
            [
                'event_key' => 'order.created',
                'name' => 'New Order Received',
                'description' => 'Dispatched immediately when a new customer or landing page order is created.',
                'category' => 'ORDER',
                'default_priority' => 'NORMAL',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Order Manager'],
                'channels' => ['in_app', 'browser'],
                'template_title' => '📦 New Order Received #{{order_number}}',
                'template_message' => 'Customer {{customer_name}} ({{customer_phone}}) placed order #{{order_number}} for ৳{{order_total}}.',
                'action_url_template' => '/admin/orders',
            ],
            [
                'event_key' => 'order.high_value',
                'name' => 'High Value Order Received',
                'description' => 'Triggered for orders exceeding high value threshold (৳50,000+).',
                'category' => 'ORDER',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin'],
                'channels' => ['in_app', 'browser', 'sms'],
                'template_title' => '💎 High Value Order #{{order_number}}',
                'template_message' => 'High value order #{{order_number}} received for ৳{{order_total}} from {{customer_name}}.',
                'action_url_template' => '/admin/orders',
            ],
            [
                'event_key' => 'order.cancelled',
                'name' => 'Order Cancelled',
                'description' => 'Triggered when an order is marked as cancelled.',
                'category' => 'ORDER',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Order Manager', 'Inventory Manager'],
                'channels' => ['in_app', 'browser'],
                'template_title' => '❌ Order Cancelled #{{order_number}}',
                'template_message' => 'Order #{{order_number}} has been cancelled. Inventory reserved has been restored.',
                'action_url_template' => '/admin/orders',
            ],
            [
                'event_key' => 'order.payment_failed',
                'name' => 'Online Payment Failed',
                'description' => 'Fired when bKash, Nagad or SSLCommerz payment transaction fails.',
                'category' => 'PAYMENT',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Customer Support'],
                'channels' => ['in_app', 'browser'],
                'template_title' => '⚠️ Payment Failed for #{{order_number}}',
                'template_message' => 'Online payment attempt for order #{{order_number}} (৳{{order_total}}) failed.',
                'action_url_template' => '/admin/payments',
            ],

            // ==================== COURIER EVENTS ====================
            [
                'event_key' => 'courier.booking_failed',
                'name' => 'Courier Booking Failed',
                'description' => 'Alert when API dispatch to Steadfast or Pathao fails.',
                'category' => 'COURIER',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Order Manager'],
                'channels' => ['in_app', 'browser'],
                'template_title' => '🚨 Courier Booking Failed for #{{order_number}}',
                'template_message' => 'Failed to book shipment with {{courier_name}} for order #{{order_number}}.',
                'action_url_template' => '/admin/shipments',
            ],
            [
                'event_key' => 'courier.returned',
                'name' => 'Parcel Returned / Return Initiated',
                'description' => 'Fired when courier delivers return status for a parcel.',
                'category' => 'COURIER',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Fraud Manager', 'Order Manager'],
                'channels' => ['in_app', 'browser'],
                'template_title' => '🔄 Parcel Return Alert #{{tracking_number}}',
                'template_message' => 'Parcel {{tracking_number}} returned by {{courier_name}}. Customer profile updated.',
                'action_url_template' => '/admin/shipments',
            ],

            // ==================== FRAUD EVENTS ====================
            [
                'event_key' => 'fraud.critical_risk',
                'name' => 'Critical Fraud Risk Detected',
                'description' => 'Automated risk engine flags order as critical fraud risk.',
                'category' => 'FRAUD',
                'default_priority' => 'CRITICAL',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Fraud Manager'],
                'channels' => ['in_app', 'browser', 'sms', 'email'],
                'template_title' => '🚨 Critical Fraud Alert: Order #{{order_number}}',
                'template_message' => 'Order #{{order_number}} received a fraud score of {{fraud_score}}. Immediate review required.',
                'action_url_template' => '/admin/customers/fraud-reviews',
            ],
            [
                'event_key' => 'fraud.review_required',
                'name' => 'Fraud Manual Review Required',
                'description' => 'Medium/High risk order placed in verification queue.',
                'category' => 'FRAUD',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Fraud Manager'],
                'channels' => ['in_app', 'browser', 'email'],
                'template_title' => '🛡️ Fraud Review Required for #{{order_number}}',
                'template_message' => 'Order #{{order_number}} flagged with risk score {{fraud_score}}. Pending admin decision.',
                'action_url_template' => '/admin/customers/fraud-reviews',
            ],

            // ==================== INVENTORY EVENTS ====================
            [
                'event_key' => 'inventory.low_stock',
                'name' => 'Low Stock Warning',
                'description' => 'Product stock is at or below threshold.',
                'category' => 'INVENTORY',
                'default_priority' => 'NORMAL',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Inventory Manager'],
                'channels' => ['in_app', 'browser', 'email'],
                'template_title' => '⚠️ Low Stock: {{product_name}}',
                'template_message' => '{{product_name}} stock is running low (Remaining: {{stock_quantity}} units).',
                'action_url_template' => '/admin/inventory',
            ],
            [
                'event_key' => 'inventory.out_of_stock',
                'name' => 'Product Out of Stock',
                'description' => 'Product stock has reached zero.',
                'category' => 'INVENTORY',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin', 'Inventory Manager'],
                'channels' => ['in_app', 'browser', 'email'],
                'template_title' => '🚫 Out of Stock: {{product_name}}',
                'template_message' => '{{product_name}} is now out of stock. Further customer checkouts blocked.',
                'action_url_template' => '/admin/inventory',
            ],
            [
                'event_key' => 'inventory.negative_stock_detected',
                'name' => 'Negative Stock Anomaly',
                'description' => 'Race condition or over-deduction caused negative inventory.',
                'category' => 'INVENTORY',
                'default_priority' => 'CRITICAL',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin'],
                'channels' => ['in_app', 'browser', 'sms', 'email'],
                'template_title' => '🚨 Negative Stock Detected: {{product_name}}',
                'template_message' => 'Critical inventory anomaly: {{product_name}} has negative stock quantity {{stock_quantity}}.',
                'action_url_template' => '/admin/inventory',
            ],

            // ==================== SMS GATEWAY EVENTS ====================
            [
                'event_key' => 'sms.low_balance',
                'name' => 'SMS Gateway Low Balance',
                'description' => 'Gateway balance is below critical threshold.',
                'category' => 'SMS',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin'],
                'channels' => ['in_app', 'browser', 'sms', 'email'],
                'template_title' => '💬 SMS Gateway Balance Low',
                'template_message' => 'SMS Gateway balance is running low. Please recharge to avoid delivery disruptions.',
                'action_url_template' => '/admin/settings/sms-gateways',
            ],
            [
                'event_key' => 'sms.gateway_down',
                'name' => 'SMS Gateway Down / Unavailable',
                'description' => 'SMS dispatch failed due to gateway timeout or invalid API credentials.',
                'category' => 'SMS',
                'default_priority' => 'CRITICAL',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin'],
                'channels' => ['in_app', 'browser', 'sms', 'email'],
                'template_title' => '🚨 SMS Gateway Unavailable',
                'template_message' => 'SMS Gateway failed to respond. Customer transactional messages queued.',
                'action_url_template' => '/admin/settings/sms-gateways',
            ],

            // ==================== SYSTEM EVENTS ====================
            [
                'event_key' => 'system.error',
                'name' => 'Critical System Exception',
                'description' => 'Severe application error or integration failure.',
                'category' => 'SYSTEM',
                'default_priority' => 'CRITICAL',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin'],
                'channels' => ['in_app', 'browser', 'email'],
                'template_title' => '🚨 System Critical Alert',
                'template_message' => 'An unhandled exception occurred in TechMarket OS. Check telemetry logs.',
                'action_url_template' => '/admin/system-health',
            ],
            [
                'event_key' => 'system.job_failed',
                'name' => 'Background Queue Job Failed',
                'description' => 'An asynchronous queue worker job failed after all retries.',
                'category' => 'SYSTEM',
                'default_priority' => 'HIGH',
                'enabled' => true,
                'notify_roles' => ['Super Admin', 'Admin'],
                'channels' => ['in_app', 'browser', 'email'],
                'template_title' => '⚠️ Background Job Failed',
                'template_message' => 'A background worker job failed after max retry attempts.',
                'action_url_template' => '/admin/system-health',
            ],
        ];

        foreach ($rules as $ruleData) {
            NotificationRule::updateOrCreate(
                ['event_key' => $ruleData['event_key']],
                $ruleData
            );
        }
    }
}
