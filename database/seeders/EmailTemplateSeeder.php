<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            // 1. Welcome Email
            [
                'name' => 'Customer Welcome & Registration',
                'slug' => 'customer-welcome',
                'category' => 'WELCOME',
                'subject' => '🎉 TechMarket BD-তে আপনাকে স্বাগতম!',
                'preheader' => 'আপনার নতুন অ্যাকাউন্টের সাথে সেরা টেক গ্যাজেট ও অফার উপভোগ করুন।',
                'html_content' => <<<HTML
<h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">স্বাগতম {{customer_name}}!</h2>
<p>TechMarket BD পরিবারে যোগদানের জন্য আপনাকে আন্তরিক ধন্যবাদ। আপনার অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে।</p>
<p>আমাদের স্টোরে আপনি পাচ্ছেন অথেনটিক কম্পিউটার পার্টস, গেমিং গিয়ার্স এবং লেটেস্ট স্মার্ট গ্যাজেটস দ্রুত ডেলিভারি ও ওয়ারেন্টি সহ।</p>
<div style="text-align: center; margin: 28px 0;">
  <a href="{{site_url}}/catalog" style="display: inline-block; padding: 12px 28px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 10px;">কেনাকাটা শুরু করুন</a>
</div>
<p style="font-size: 12px; color: #94a3b8;">কোনো সহায়তা প্রয়োজন হলে যোগাযোগ করুন আমাদের হটলাইনে: <strong>{{support_phone}}</strong> অথবা ইমেইল করুন <strong>{{support_email}}</strong></p>
HTML
                ,
                'plain_text_content' => "স্বাগতম {{customer_name}}!\nTechMarket BD-তে যোগদানের জন্য ধন্যবাদ। স্টোর ভিজিট করুন: {{site_url}}/catalog",
                'is_active' => true,
            ],

            // 2. Order Received / Created
            [
                'name' => 'New Order Received',
                'slug' => 'order-created',
                'category' => 'ORDER',
                'subject' => '📦 আপনার অর্ডার #{{order_number}} সফলভাবে গ্রহণ করা হয়েছে',
                'preheader' => 'আমরা আপনার অর্ডারের প্রক্রিয়া শুরু করেছি। অর্ডার বিবরণ দেখুন।',
                'html_content' => <<<HTML
<h2 style="color: #10b981; margin-top: 0; font-size: 20px;">ধন্যবাদ {{customer_name}}! আপনার অর্ডারটি গৃহীত হয়েছে</h2>
<p>আপনার অর্ডার নম্বর: <strong style="color: #f59e0b; font-family: monospace;">#{{order_number}}</strong></p>
<p>তারিখ: <strong>{{order_date}}</strong> • পেমেন্ট পদ্ধতি: <strong>{{payment_method}}</strong></p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #0b0f19; border-radius: 10px; overflow: hidden;">
  <tr style="background-color: #1e293b; color: #94a3b8; font-size: 12px; text-align: left;">
    <th style="padding: 10px 14px;">বিবরণ</th>
    <th style="padding: 10px 14px; text-align: right;">পরিমাণ</th>
  </tr>
  <tr>
    <td style="padding: 12px 14px; border-top: 1px solid #1e293b; color: #cbd5e1;">অর্ডার সর্বমোট (Total Amount)</td>
    <td style="padding: 12px 14px; border-top: 1px solid #1e293b; text-align: right; font-weight: 800; color: #f59e0b;">৳{{order_total}}</td>
  </tr>
</table>

<div style="background-color: #0b0f19; padding: 14px; border-radius: 10px; margin-bottom: 20px; font-size: 13px;">
  <strong style="color: #94a3b8;">ডেলিভারি ঠিকানা:</strong>
  <p style="margin: 4px 0 0 0; color: #cbd5e1;">{{delivery_address}}</p>
</div>

<div style="text-align: center; margin: 24px 0;">
  <a href="{{invoice_url}}" style="display: inline-block; padding: 12px 28px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 10px;">ইনভয়েস ডাউনলোড করুন</a>
</div>
HTML
                ,
                'plain_text_content' => "ধন্যবাদ {{customer_name}}!\nঅর্ডার #{{order_number}} গৃহীত হয়েছে। সর্বমোট: ৳{{order_total}}। ইনভয়েস: {{invoice_url}}",
                'is_active' => true,
            ],

            // 3. Order Confirmed
            [
                'name' => 'Order Confirmed',
                'slug' => 'order-confirmed',
                'category' => 'ORDER',
                'subject' => '✅ অর্ডার #{{order_number}} নিশ্চিত করা হয়েছে',
                'preheader' => 'আপনার অর্ডারটি কনফার্ম হয়েছে এবং প্যাকেজিংয়ের জন্য প্রস্তুত হচ্ছে।',
                'html_content' => <<<HTML
<h2 style="color: #10b981; margin-top: 0; font-size: 19px;">অর্ডার #{{order_number}} নিশ্চিত করা হয়েছে</h2>
<p>প্রিয় {{customer_name}}, আপনার অর্ডারটি ভেরিফিকেশন টিম দ্বারা কনফার্ম করা হয়েছে। আমাদের ওয়্যারহাউস টিম শীঘ্রই পার্সেলটি প্যাকেজিং করবে।</p>
<p>অর্ডার মূল্য: <strong>৳{{order_total}}</strong></p>
<div style="text-align: center; margin: 20px 0;">
  <a href="{{invoice_url}}" style="display: inline-block; padding: 10px 24px; background-color: #10b981; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px;">অর্ডার স্ট্যাটাস দেখুন</a>
</div>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} নিশ্চিত করা হয়েছে। মোট: ৳{{order_total}}।",
                'is_active' => true,
            ],

            // 4. Order Processing
            [
                'name' => 'Order Processing & Packaging',
                'slug' => 'order-processing',
                'category' => 'ORDER',
                'subject' => '⚙️ অর্ডার #{{order_number}} প্রক্রিয়াকরণ চলছে',
                'preheader' => 'আপনার অর্ডারের পণ্যগুলো ওয়্যারহাউসে কোয়ালিটি চেক ও প্যাক করা হচ্ছে।',
                'html_content' => <<<HTML
<h2 style="color: #38bdf8; margin-top: 0; font-size: 19px;">অর্ডার প্রক্রিয়াকরণ হচ্ছে #{{order_number}}</h2>
<p>প্রিয় {{customer_name}}, আপনার পণ্যের কোয়ালিটি ও ওয়ারেন্টি স্টিকার যাচাই শেষে সিকিউর প্যাকেজিং করা হচ্ছে। কুরিয়ারে হ্যান্ডওভার হলে আপনাকে ট্র্যাকিং কোড পাঠানো হবে।</p>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} প্রক্রিয়াকরণ চলছে। শীঘ্রই কুরিয়ারে পাঠানো হবে।",
                'is_active' => true,
            ],

            // 5. Order Shipped / Dispatched
            [
                'name' => 'Order Shipped & Courier Dispatched',
                'slug' => 'order-shipped',
                'category' => 'COURIER',
                'subject' => '🚚 আপনার পার্সেল কুরিয়ারে হ্যান্ডওভার করা হয়েছে #{{order_number}}',
                'preheader' => 'কুরিয়ার ট্র্যাকিং কোড দিয়ে আপনার ডেলিভারি লাইভ ট্র্যাক করুন।',
                'html_content' => <<<HTML
<h2 style="color: #38bdf8; margin-top: 0; font-size: 20px;">আপনার অর্ডারটি ডেলিভারির পথে রয়েছে!</h2>
<p>প্রিয় {{customer_name}}, আপনার অর্ডার #{{order_number}} কুরিয়ার <strong>{{courier_name}}</strong>-এর কাছে হস্তান্তর করা হয়েছে।</p>

<div style="background-color: #0b0f19; padding: 18px; border-radius: 12px; border: 1px solid #1e293b; margin: 20px 0; text-align: center;">
  <span style="font-size: 12px; color: #94a3b8;">ট্র্যাকিং নম্বর (Tracking ID):</span>
  <div style="font-size: 20px; font-weight: 800; color: #38bdf8; font-family: monospace; margin: 6px 0;">{{tracking_number}}</div>
  <a href="{{tracking_url}}" style="display: inline-block; margin-top: 8px; padding: 10px 24px; background-color: #38bdf8; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 8px;">লাইভ পার্সেল ট্র্যাক করুন</a>
</div>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} কুরিয়ারে পাঠানো হয়েছে। কুরিয়ার: {{courier_name}}। ট্র্যাকিং ID: {{tracking_number}}। লিংক: {{tracking_url}}",
                'is_active' => true,
            ],

            // 6. Order Delivered
            [
                'name' => 'Order Delivered Successfully',
                'slug' => 'order-delivered',
                'category' => 'ORDER',
                'subject' => '🎉 অর্ডার #{{order_number}} সফলভাবে ডেলিভারি সম্পন্ন হয়েছে',
                'preheader' => 'TechMarket BD-তে শপিং করার জন্য ধন্যবাদ। পণ্য সম্পর্কে আপনার মতামত জানান।',
                'html_content' => <<<HTML
<h2 style="color: #10b981; margin-top: 0; font-size: 20px;">ডেলিভারি সফল হয়েছে!</h2>
<p>প্রিয় {{customer_name}}, আপনার অর্ডার <strong>#{{order_number}}</strong> সফলভাবে ডেলিভারি সম্পন্ন হয়েছে।</p>
<p>পণ্যটি আপনার পছন্দ হলে স্টোরে একটি রিভিউ দিয়ে আমাদের উৎসাহিত করুন। কোনো সমস্যা থাকলে ৭ দিনের মধ্যে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন।</p>
<div style="text-align: center; margin: 24px 0;">
  <a href="{{site_url}}/account/orders" style="display: inline-block; padding: 12px 28px; background-color: #10b981; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 10px;">রিভিউ লিখুন</a>
</div>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} ডেলিভারি সম্পন্ন হয়েছে। TechMarket BD-এর সাথে থাকার জন্য ধন্যবাদ।",
                'is_active' => true,
            ],

            // 7. Order Cancelled
            [
                'name' => 'Order Cancelled',
                'slug' => 'order-cancelled',
                'category' => 'ORDER',
                'subject' => '❌ অর্ডার #{{order_number}} বাতিল করা হয়েছে',
                'preheader' => 'আপনার অনুরোধ বা স্টক অনুপলব্ধতার কারণে অর্ডারটি বাতিল করা হয়েছে।',
                'html_content' => <<<HTML
<h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">অর্ডার বাতিল সংক্রান্ত তথ্য</h2>
<p>প্রিয় {{customer_name}}, আপনার অর্ডার <strong>#{{order_number}}</strong> বাতিল করা হয়েছে।</p>
<p>যদি অনলাইন পেমেন্ট সম্পন্ন হয়ে থাকে, তবে ৭-১০ কর্মদিবসের মধ্যে রিফান্ড প্রক্রিয়া সম্পন্ন করা হবে।</p>
<p style="font-size: 12px; color: #94a3b8;">বিস্তারিত জানতে যোগাযোগ করুন: {{support_phone}}</p>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} বাতিল করা হয়েছে। বিস্তারিত জানতে যোগাযোগ করুন {{support_phone}}",
                'is_active' => true,
            ],

            // 8. Payment Successful
            [
                'name' => 'Payment Successful',
                'slug' => 'order-payment-success',
                'category' => 'PAYMENT',
                'subject' => '💳 পেমেন্ট সফল হয়েছে #{{order_number}}',
                'preheader' => 'আপনার অনলাইন পেমেন্ট ৳{{order_total}} সফলভাবে গৃহীত হয়েছে।',
                'html_content' => <<<HTML
<h2 style="color: #10b981; margin-top: 0; font-size: 20px;">অনলাইন পেমেন্ট সম্পন্ন হয়েছে</h2>
<p>অর্ডার নম্বর: <strong>#{{order_number}}</strong> • পরিশোধিত পরিমাণ: <strong style="color: #f59e0b;">৳{{order_total}}</strong></p>
<p>পেমেন্ট মেথড: <strong>{{payment_method}}</strong></p>
<div style="text-align: center; margin: 20px 0;">
  <a href="{{invoice_url}}" style="display: inline-block; padding: 10px 24px; background-color: #10b981; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px;">রিসিপ্ট দেখুন</a>
</div>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} এর পেমেন্ট ৳{{order_total}} সফল হয়েছে।",
                'is_active' => true,
            ],

            // 9. Payment Failed
            [
                'name' => 'Payment Failed',
                'slug' => 'order-payment-failed',
                'category' => 'PAYMENT',
                'subject' => '⚠️ পেমেন্ট ব্যর্থ হয়েছে #{{order_number}}',
                'preheader' => 'অনলাইন লেনদেন সম্পন্ন হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
                'html_content' => <<<HTML
<h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">পেমেন্ট ব্যর্থ হয়েছে</h2>
<p>প্রিয় {{customer_name}}, অর্ডার <strong>#{{order_number}}</strong> এর অনলাইন পেমেন্ট ব্যর্থ হয়েছে। আপনি পুনরায় পেমেন্ট করতে পারেন অথবা ক্যাশ অন ডেলিভারি বেছে নিতে পারেন।</p>
<div style="text-align: center; margin: 20px 0;">
  <a href="{{site_url}}/checkout" style="display: inline-block; padding: 10px 24px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px;">পুনরায় পেমেন্ট করুন</a>
</div>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} এর পেমেন্ট ব্যর্থ হয়েছে।",
                'is_active' => true,
            ],

            // 10. Refund Processed
            [
                'name' => 'Refund Processed',
                'slug' => 'order-refunded',
                'category' => 'PAYMENT',
                'subject' => '💸 আপনার রিফান্ড প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে #{{order_number}}',
                'preheader' => 'অর্ডার #{{order_number}} এর জন্য ৳{{order_total}} রিফান্ড সম্পন্ন হয়েছে।',
                'html_content' => <<<HTML
<h2 style="color: #10b981; margin-top: 0; font-size: 20px;">রিফান্ড সম্পন্ন হয়েছে</h2>
<p>প্রিয় {{customer_name}}, আপনার অর্ডার <strong>#{{order_number}}</strong> এর জন্য <strong>৳{{order_total}}</strong> রিফান্ড আপনার মূল পেমেন্ট অ্যাকাউন্টে প্রেরণ করা হয়েছে।</p>
<p style="font-size: 12px; color: #94a3b8;">ব্যাংক বা মোবাইল ফাইন্যান্সিয়াল সার্ভিসের উপর নির্ভর করে ব্যালেন্স যুক্ত হতে ১-৩ কর্মদিবস সময় লাগতে পারে।</p>
HTML
                ,
                'plain_text_content' => "অর্ডার #{{order_number}} এর রিফান্ড ৳{{order_total}} সম্পন্ন হয়েছে।",
                'is_active' => true,
            ],

            // 11. Password Reset
            [
                'name' => 'Password Reset Request',
                'slug' => 'password-reset',
                'category' => 'SECURITY',
                'subject' => '🔐 পাসওয়ার্ড রিসেট লিংক — TechMarket BD',
                'preheader' => 'আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করতে নিচের লিংকে ক্লিক করুন।',
                'html_content' => <<<HTML
<h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">পাসওয়ার্ড রিসেট অনুরোধ</h2>
<p>প্রিয় {{customer_name}}, আপনার TechMarket BD অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য একটি অনুরোধ পাওয়া গেছে।</p>
<div style="text-align: center; margin: 28px 0;">
  <a href="{{reset_url}}" style="display: inline-block; padding: 12px 28px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 10px;">পাসওয়ার্ড রিসেট করুন</a>
</div>
<p style="font-size: 12px; color: #94a3b8;">আপনি যদি এই অনুরোধটি না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন। আপনার অ্যাকাউন্ট নিরাপদ রয়েছে।</p>
HTML
                ,
                'plain_text_content' => "পাসওয়ার্ড রিসেট লিংক: {{reset_url}}",
                'is_active' => true,
            ],

            // 12. Account Verification
            [
                'name' => 'Account Email Verification',
                'slug' => 'account-verification',
                'category' => 'SECURITY',
                'subject' => '✉️ আপনার ইমেইল ঠিকানা ভেরিফাই করুন',
                'preheader' => 'TechMarket BD অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে ইমেইল নিশ্চিত করুন।',
                'html_content' => <<<HTML
<h2 style="color: #38bdf8; margin-top: 0; font-size: 20px;">ইমেইল ভেরিফিকেশন</h2>
<p>প্রিয় {{customer_name}}, আপনার অ্যাকাউন্ট ভেরিফাই করতে নিচের বাটনে ক্লিক করুন:</p>
<div style="text-align: center; margin: 24px 0;">
  <a href="{{verification_url}}" style="display: inline-block; padding: 12px 28px; background-color: #38bdf8; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 10px;">ইমেইল ভেরিফাই করুন</a>
</div>
HTML
                ,
                'plain_text_content' => "ভেরিফিকেশন লিংক: {{verification_url}}",
                'is_active' => true,
            ],

            // 13. Courier Tracking
            [
                'name' => 'Courier Tracking & Handover',
                'slug' => 'courier-booked',
                'category' => 'COURIER',
                'subject' => '📍 পার্সেল ট্র্যাকিং আপডেট #{{order_number}}',
                'preheader' => 'কুরিয়ার {{courier_name}} এর মাধ্যমে ট্র্যাকিং কোড: {{tracking_number}}',
                'html_content' => <<<HTML
<h2 style="color: #38bdf8; margin-top: 0; font-size: 20px;">কুরিয়ার ট্র্যাকিং তথ্য</h2>
<p>প্রিয় {{customer_name}}, আপনার অর্ডার <strong>#{{order_number}}</strong> কুরিয়ারে যুক্ত হয়েছে।</p>
<p>কুরিয়ার: <strong>{{courier_name}}</strong> • ট্র্যাকিং নম্বর: <strong style="font-family: monospace; color: #38bdf8;">{{tracking_number}}</strong></p>
<div style="text-align: center; margin: 20px 0;">
  <a href="{{tracking_url}}" style="display: inline-block; padding: 10px 24px; background-color: #38bdf8; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 8px;">ট্র্যাক করুন</a>
</div>
HTML
                ,
                'plain_text_content' => "কুরিয়ার: {{courier_name}}, ট্র্যাকিং: {{tracking_number}}, লিংক: {{tracking_url}}",
                'is_active' => true,
            ],

            // 14. Low Stock Alert (Admin)
            [
                'name' => 'Inventory Low Stock Alert (Admin)',
                'slug' => 'inventory-low-stock',
                'category' => 'INVENTORY',
                'subject' => '⚠️ Low Stock Warning: {{product_name}}',
                'preheader' => 'Product stock is running low ({{stock_quantity}} units remaining).',
                'html_content' => <<<HTML
<h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">Inventory Low Stock Warning</h2>
<p>Product: <strong>{{product_name}}</strong></p>
<p>SKU: <code>{{product_sku}}</code></p>
<p>Remaining Stock: <strong style="color: #f59e0b; font-size: 18px;">{{stock_quantity}} units</strong></p>
<div style="text-align: center; margin: 20px 0;">
  <a href="{{product_url}}" style="display: inline-block; padding: 10px 24px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 8px;">Update Stock in Admin</a>
</div>
HTML
                ,
                'plain_text_content' => "Low Stock Alert: {{product_name}} has {{stock_quantity}} units left.",
                'is_active' => true,
            ],

            // 15. Out of Stock Alert (Admin)
            [
                'name' => 'Product Out of Stock Alert (Admin)',
                'slug' => 'inventory-out-of-stock',
                'category' => 'INVENTORY',
                'subject' => '🚫 Out of Stock Alert: {{product_name}}',
                'preheader' => 'Product reached zero stock. Storefront checkouts disabled.',
                'html_content' => <<<HTML
<h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">Out of Stock Alert</h2>
<p>Product: <strong>{{product_name}}</strong> has reached zero stock.</p>
<p>Please restock from vendor to re-enable purchases.</p>
HTML
                ,
                'plain_text_content' => "Out of Stock: {{product_name}} has reached 0 units.",
                'is_active' => true,
            ],

            // 16. Critical Fraud Alert (Admin)
            [
                'name' => 'Critical Fraud Risk Alert (Admin)',
                'slug' => 'fraud-critical-risk',
                'category' => 'FRAUD',
                'subject' => '🚨 Critical Fraud Risk Alert: Order #{{order_number}}',
                'preheader' => 'High risk score {{fraud_score}} detected on Order #{{order_number}}.',
                'html_content' => <<<HTML
<h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">🚨 Critical Fraud Risk Detected</h2>
<p>Order Number: <strong style="color: #f59e0b; font-family: monospace;">#{{order_number}}</strong></p>
<p>Risk Score: <strong style="color: #f43f5e; font-size: 18px;">{{fraud_score}} / 100</strong></p>
<p>Customer: <strong>{{customer_name}}</strong> ({{customer_phone}})</p>
<p>Order Total: <strong>৳{{order_total}}</strong></p>
<p>Signals: <em>{{fraud_signals}}</em></p>
<div style="text-align: center; margin: 24px 0;">
  <a href="{{action_url}}" style="display: inline-block; padding: 12px 28px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 10px;">Review Fraud Queue</a>
</div>
HTML
                ,
                'plain_text_content' => "Critical Fraud Alert: Order #{{order_number}}, Risk Score: {{fraud_score}}. Review: {{action_url}}",
                'is_active' => true,
            ],

            // 17. SMS Gateway Failure (Admin)
            [
                'name' => 'SMS Gateway Outage Alert (Admin)',
                'slug' => 'sms-gateway-down',
                'category' => 'SMS',
                'subject' => '🚨 SMS Gateway Outage Alert',
                'preheader' => 'SMS delivery gateway failed to respond.',
                'html_content' => <<<HTML
<h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">SMS Gateway Downtime Detected</h2>
<p>SMS Gateway failed to deliver transactional SMS. Please check provider status or balance immediately.</p>
HTML
                ,
                'plain_text_content' => "SMS Gateway Downtime Detected. Please check provider.",
                'is_active' => true,
            ],

            // 18. System Error Alert (Admin)
            [
                'name' => 'System Critical Error Alert (Admin)',
                'slug' => 'system-error',
                'category' => 'SYSTEM',
                'subject' => '🚨 TechMarket BD System Exception Alert',
                'preheader' => 'Unhandled system error detected in application.',
                'html_content' => <<<HTML
<h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">System Exception Detected</h2>
<p>Error Message: <code>{{error_message}}</code></p>
<p>Event Time: <strong>{{event_time}}</strong></p>
HTML
                ,
                'plain_text_content' => "System Error: {{error_message}} at {{event_time}}",
                'is_active' => true,
            ],

            // 19. Security Alert (Customer / Admin)
            [
                'name' => 'Account Security Alert',
                'slug' => 'security-alert',
                'category' => 'SECURITY',
                'subject' => '🛡️ নতুন ডিভাইস থেকে লগইন সতর্কতা',
                'preheader' => 'আপনার অ্যাকাউন্টে নতুন লোকেশন বা ব্রাউজার থেকে প্রবেশ করা হয়েছে।',
                'html_content' => <<<HTML
<h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">নিরাপত্তা সতর্কতা</h2>
<p>প্রিয় {{customer_name}}, আপনার অ্যাকাউন্টে একটি নতুন সেশন সনাক্ত করা হয়েছে। আপনি যদি এটি না করে থাকেন, তবে অবিলম্বে আপনার পাসওয়ার্ড পরিবর্তন করুন।</p>
HTML
                ,
                'plain_text_content' => "নিরাপত্তা সতর্কতা: নতুন সেশন সনাক্ত হয়েছে।",
                'is_active' => true,
            ],

            // 20. Promotional Offer
            [
                'name' => 'Promotional Campaign Broadcast',
                'slug' => 'promotional-offer',
                'category' => 'MARKETING',
                'subject' => '🔥 বিশেষ ছাড় ও নতুন অফার — TechMarket BD',
                'preheader' => 'সেরা গ্যাজেটে দুর্দান্ত অফার ও ডিসকাউন্ট পেতে এখনই ভিজিট করুন।',
                'html_content' => <<<HTML
<h2 style="color: #f59e0b; margin-top: 0; font-size: 22px; text-align: center;">ধামাকাদার অফার ও ডিসকাউন্ট!</h2>
<p style="text-align: center;">সীমিত সময়ের জন্য বিশেষ অফারে কিনুন আপনার পছন্দের টেক পণ্য।</p>
<div style="text-align: center; margin: 28px 0;">
  <a href="{{site_url}}/flash-sales" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 900; font-size: 14px; border-radius: 12px;">অফারটি গ্রহণ করুন</a>
</div>
<p style="text-align: center; font-size: 11px; color: #64748b; margin-top: 24px;">
  আপনি যদি এই ধরণের ইমেইল আর পেতে না চান, তবে <a href="{{unsubscribe_url}}" style="color: #94a3b8; text-decoration: underline;">আনসাবস্ক্রাইব করুন</a>।
</p>
HTML
                ,
                'plain_text_content' => "TechMarket BD অফার: {{site_url}}/flash-sales\nআনসাবস্ক্রাইব করুন: {{unsubscribe_url}}",
                'is_active' => true,
            ],

            // 21. Product Back In Stock
            [
                'name' => 'Product Back in Stock Notification',
                'slug' => 'product-back-in-stock',
                'category' => 'PRODUCT',
                'subject' => '🎉 আপনার পছন্দের পণ্যটি আবার স্টকে এসেছে: {{product_name}}',
                'preheader' => 'দেরি না করে এখনই অর্ডার করুন স্টক শেষ হওয়ার আগেই!',
                'html_content' => <<<HTML
<h2 style="color: #10b981; margin-top: 0; font-size: 20px;">পণ্যটি আবার স্টকে এসেছে!</h2>
<p>প্রিয় {{customer_name}}, আপনি যে পণ্যটির জন্য অপেক্ষা করছিলেন <strong>{{product_name}}</strong> তা এখন স্টকে উপলব্ধ।</p>
<div style="text-align: center; margin: 24px 0;">
  <a href="{{product_url}}" style="display: inline-block; padding: 12px 28px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 10px;">এখনই কিনুন</a>
</div>
HTML
                ,
                'plain_text_content' => "{{product_name}} আবার স্টকে এসেছে: {{product_url}}",
                'is_active' => true,
            ],

            // 22. Abandoned Cart
            [
                'name' => 'Abandoned Cart Reminder',
                'slug' => 'cart-abandoned',
                'category' => 'MARKETING',
                'subject' => '🛒 আপনার কার্টে কিছু পণ্য অপেক্ষা করছে!',
                'preheader' => 'আপনার শপিং ব্যাগ সম্পন্ন করুন এবং উপভোগ করুন দ্রুত ডেলিভারি।',
                'html_content' => <<<HTML
<h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">আপনি কি কোনো পণ্য ভুলে গেছেন?</h2>
<p>প্রিয় {{customer_name}}, আপনার কার্টের পণ্যগুলো আপনার জন্য সংরক্ষিত আছে। চেকআউট সম্পন্ন করতে নিচের লিংকে ক্লিক করুন:</p>
<div style="text-align: center; margin: 24px 0;">
  <a href="{{site_url}}/cart" style="display: inline-block; padding: 12px 28px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 10px;">চেকআউট সম্পন্ন করুন</a>
</div>
HTML
                ,
                'plain_text_content' => "আপনার কার্ট সম্পন্ন করুন: {{site_url}}/cart",
                'is_active' => true,
            ],

            // 23. Customer Support Update
            [
                'name' => 'Customer Support Ticket Update',
                'slug' => 'customer-support-update',
                'category' => 'CUSTOMER',
                'subject' => '💬 সাপোর্ট টিকেট আপডেট #{{ticket_id}}',
                'preheader' => 'আপনার সহায়তা অনুরোধের একটি নতুন উত্তর প্রদান করা হয়েছে।',
                'html_content' => <<<HTML
<h2 style="color: #38bdf8; margin-top: 0; font-size: 20px;">সাপোর্ট টিকেট আপডেট</h2>
<p>প্রিয় {{customer_name}}, আপনার সাপোর্ট রিকোয়েস্ট #<strong>{{ticket_id}}</strong>-এ সাপোর্ট টিম থেকে একটি নতুন উত্তর দেওয়া হয়েছে।</p>
<div style="text-align: center; margin: 20px 0;">
  <a href="{{ticket_url}}" style="display: inline-block; padding: 10px 24px; background-color: #38bdf8; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 8px;">টিকেট দেখুন</a>
</div>
HTML
                ,
                'plain_text_content' => "সাপোর্ট টিকেট #{{ticket_id}} আপডেট হয়েছে: {{ticket_url}}",
                'is_active' => true,
            ],
        ];

        foreach ($templates as $t) {
            EmailTemplate::updateOrCreate(['slug' => $t['slug']], $t);
        }
    }
}
