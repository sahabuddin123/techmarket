<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Order;
use App\Models\CategoryFaq;
use App\Models\CmsPage;
use App\Models\Setting;
use App\Models\EmiPartner;
use App\Models\Offer;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    /**
     * Process an incoming customer message, query the database, and return an intelligent real-time response.
     */
    public static function processMessage(ChatSession $session, string $rawMessage, ?User $user = null): array
    {
        $message = trim($rawMessage);
        $lower = mb_strtolower($message);

        // Store User Message in Transcript
        ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'user',
            'message' => $message,
            'type' => 'text',
        ]);

        $session->update(['last_activity_at' => now()]);

        // 1. Check for Human Support Request Intent
        if (self::matchesSupportKeywords($lower)) {
            return self::createEscalationPrompt($session, "অবশ্যই! আমাদের হিউম্যান সাপোর্ট টিমের সাথে আপনাকে যুক্ত করে দিচ্ছি। আপনার নাম এবং মোবাইল নাম্বার নিচে দিন, আমাদের কাস্টমার সাপোর্ট প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।");
        }

        // 2. Check for Order Tracking Intent (e.g. "track order", "ORD-20260817-XXXX", "order status")
        $orderResponse = self::resolveOrderTracking($lower, $user);
        if ($orderResponse) {
            return self::saveBotMessage($session, $orderResponse['message'], $orderResponse['type'], $orderResponse['payload'] ?? null, $orderResponse['suggestions'] ?? []);
        }

        // 3. Check for Product Search & Budget / Category Queries (e.g. "search laptops under 60k", "asus laptop", "gree ac")
        $productResponse = self::resolveProductSearch($lower);
        if ($productResponse) {
            return self::saveBotMessage($session, $productResponse['message'], $productResponse['type'], $productResponse['payload'] ?? null, $productResponse['suggestions'] ?? []);
        }

        // 4. Check for Catalog / Shop / Browse Products Intent (e.g. "view all in catalog", "search products", "shop")
        if (str_contains($lower, 'catalog') || str_contains($lower, 'shop') || str_contains($lower, 'all product') || str_contains($lower, 'সব প্রোডাক্ট') || str_contains($lower, 'browse') || str_contains($lower, 'search product') || str_contains($lower, 'পণ্য')) {
            $catalogResponse = self::resolveCatalogInfo();
            return self::saveBotMessage($session, $catalogResponse['message'], $catalogResponse['type'], $catalogResponse['payload'] ?? null, $catalogResponse['suggestions'] ?? []);
        }

        // 5. Check for PC Builder Intent
        if (str_contains($lower, 'pc build') || str_contains($lower, 'custom pc') || str_contains($lower, 'pc builder') || str_contains($lower, 'কম্পিউটার বিল্ড')) {
            $pcBuilderResponse = self::resolvePcBuilderInfo();
            return self::saveBotMessage($session, $pcBuilderResponse['message'], $pcBuilderResponse['type'], $pcBuilderResponse['payload'] ?? null, $pcBuilderResponse['suggestions'] ?? []);
        }

        // 6. Check for Customer Servicing & Repairs Intent
        if (str_contains($lower, 'service') || str_contains($lower, 'repair') || str_contains($lower, 'সার্ভিস') || str_contains($lower, 'মেরামত') || str_contains($lower, 'nosto') || str_contains($lower, 'fix')) {
            $serviceResponse = self::resolveServiceBookingInfo();
            return self::saveBotMessage($session, $serviceResponse['message'], $serviceResponse['type'], $serviceResponse['payload'] ?? null, $serviceResponse['suggestions'] ?? []);
        }

        // 7. Check for Offers & Campaign Intent
        if (str_contains($lower, 'offer') || str_contains($lower, 'discount') || str_contains($lower, 'অফার') || str_contains($lower, 'ছাড়') || str_contains($lower, 'deal') || str_contains($lower, 'promo') || str_contains($lower, 'coupon')) {
            $offerResponse = self::resolveOffersInfo();
            return self::saveBotMessage($session, $offerResponse['message'], $offerResponse['type'], $offerResponse['payload'] ?? null, $offerResponse['suggestions'] ?? []);
        }

        // 8. Check for EMI & Financing Intent
        if (str_contains($lower, 'emi') || str_contains($lower, 'installment') || str_contains($lower, 'কিস্তি') || str_contains($lower, 'financing')) {
            $emiResponse = self::resolveEmiInfo();
            return self::saveBotMessage($session, $emiResponse['message'], $emiResponse['type'], $emiResponse['payload'] ?? null, $emiResponse['suggestions'] ?? []);
        }

        // 9. Check for Policy / Warranty / Shipping / Return Intent
        $policyResponse = self::resolvePolicyOrFaq($lower);
        if ($policyResponse) {
            return self::saveBotMessage($session, $policyResponse['message'], $policyResponse['type'], $policyResponse['payload'] ?? null, $policyResponse['suggestions'] ?? []);
        }

        // 10. Check for Showrooms, Hotline & Contact Info Intent
        if (str_contains($lower, 'showroom') || str_contains($lower, 'branch') || str_contains($lower, 'address') || str_contains($lower, 'hotline') || str_contains($lower, 'phone') || str_contains($lower, 'contact') || str_contains($lower, 'ঠিকানা') || str_contains($lower, 'ফোন') || str_contains($lower, 'location')) {
            $contactResponse = self::resolveContactInfo();
            return self::saveBotMessage($session, $contactResponse['message'], $contactResponse['type'], $contactResponse['payload'] ?? null, $contactResponse['suggestions'] ?? []);
        }

        // 11. General Greetings & Small Talk
        if (in_array($lower, ['hi', 'hello', 'hey', 'salam', 'assalamu alaikum', 'hola', 'হাই', 'হ্যালো', 'সালাম', 'kemon asen', 'kemon aso', 'how are you'])) {
            return self::saveBotMessage(
                $session,
                "Hello! 👋 I am your **TechMarket AI Assistant**.\n\nআমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনি যেকোনো প্রোডাক্টের লাইভ দাম ও স্টক জানতে পারেন, অর্ডার ট্র্যাক করতে পারেন, অথবা ওয়ারেন্টি ও ০% EMI সুবিধা সম্পর্কে প্রশ্ন করতে পারেন।",
                'text',
                null,
                ['Search Laptops under 60k', 'Air Conditioner Deals', 'Track Order', '0% EMI Facilities', 'Official Warranty Policy', 'Talk to Support Team']
            );
        }

        // 10. Try Gemini AI Free API Model (If API Key is Configured in env/settings)
        $geminiResponse = self::callGeminiAi($message);
        if ($geminiResponse) {
            return self::saveBotMessage(
                $session,
                $geminiResponse,
                'text',
                null,
                ['Search Products', 'Track Order', '0% EMI Facilities', 'Talk to Support Team']
            );
        }

        // 11. Fallback / Unresolved Query -> Gracefully Offer Human Support Escalation
        return self::createEscalationPrompt(
            $session,
            "আমি আপনার প্রশ্নের সরাসরি উত্তর ডেটাবেজে খুঁজে পাচ্ছি না: \"{$message}\"।\n\nআপনি কি আমাদের টেকনিক্যাল সাপোর্ট টিমের সাথে কথা বলতে চান? নিচে আপনার তথ্য দিলে আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।"
        );
    }

    /**
     * Resolve Product Search & Filtering against database with multi-synonym and budget extraction.
     */
    protected static function resolveProductSearch(string $query): ?array
    {
        // Extract budget numbers if mentioned (e.g. under 60k, under 60000, 50k, 70000 taka)
        $maxPrice = null;
        $minPrice = null;

        if (preg_match('/(?:under|below|কম|মধ্যে|up to|maximum|budget|বাজেট)\s*(?:৳|tk|taka)?\s*(\d{2,7})/i', $query, $matches)) {
            $maxPrice = (float)$matches[1];
        } elseif (preg_match('/(\d{1,3})\s*k\b/i', $query, $matches)) {
            $maxPrice = (float)$matches[1] * 1000;
        }

        // Conversational stopwords to ignore
        $stopwords = [
            'search', 'find', 'show', 'me', 'i', 'need', 'want', 'looking', 'for', 'the', 'a', 'an', 
            'please', 'tell', 'about', 'get', 'buy', 'price', 'deals', 'available', 'stock', 'dam', 
            'koto', 'naki', 'ase', 'chai', 'dorkar', 'dekhao', 'kinbo', 'bhalo', 'best', 'good', 
            'in', 'bd', 'bangladesh', 'under', 'below', 'k', 'within'
        ];

        // Synonyms mapping for tech keywords
        $synonyms = [
            'laptop' => ['laptop', 'laptops', 'notebook', 'ultrabook', 'macbook'],
            'ac' => ['ac', 'air conditioner', 'inverter ac', 'split ac'],
            'gpu' => ['gpu', 'graphics card', 'rtx', 'geforce', 'radeon'],
            'cpu' => ['cpu', 'processor', 'intel', 'ryzen', 'core i5', 'core i7', 'core i3'],
            'monitor' => ['monitor', 'monitors', 'display', 'screen', 'oled'],
            'keyboard' => ['keyboard', 'keyboards', 'mechanical keyboard'],
            'mouse' => ['mouse', 'gaming mouse'],
            'router' => ['router', 'wifi', 'wifi router'],
            'ram' => ['ram', 'memory', 'ddr4', 'ddr5'],
            'ssd' => ['ssd', 'nvme', 'solid state drive', 'storage'],
            'tv' => ['tv', 'television', 'smart tv', 'android tv'],
            'mobile' => ['phone', 'mobile', 'smartphone'],
        ];

        $tokens = preg_split('/[\s,\.\?\!]+/u', $query, -1, PREG_SPLIT_NO_EMPTY);
        $significantWords = [];

        foreach ($tokens as $token) {
            $t = trim(mb_strtolower($token));
            if (strlen($t) >= 2 && !in_array($t, $stopwords)) {
                $significantWords[] = $t;
            }
        }

        if (empty($significantWords)) {
            return null;
        }

        $q = Product::query()->with(['category', 'brand']);

        $matchedCategoryIds = [];
        $matchedBrandId = null;
        $searchTerms = [];

        foreach ($significantWords as $word) {
            // Check synonyms
            $matchedSynonym = null;
            foreach ($synonyms as $key => $synList) {
                if (in_array($word, $synList) || $word === $key) {
                    $matchedSynonym = $key;
                    break;
                }
            }

            $searchWord = $matchedSynonym ?: $word;

            $cat = Category::where('name', 'like', "%{$searchWord}%")
                ->orWhere('slug', 'like', "%{$searchWord}%")
                ->first();

            if ($cat) {
                $matchedCategoryIds = array_merge($matchedCategoryIds, $cat->getAllChildrenIds());
            }

            $brand = Brand::where('name', 'like', "%{$word}%")
                ->orWhere('slug', 'like', "%{$word}%")
                ->first();

            if ($brand) {
                $matchedBrandId = $brand->id;
            }

            if (!$cat && !$brand) {
                $searchTerms[] = $word;
            }
        }

        if (!empty($matchedCategoryIds)) {
            $q->whereIn('category_id', array_unique($matchedCategoryIds));
        }

        if ($matchedBrandId) {
            $q->where('brand_id', $matchedBrandId);
        }

        if (!empty($searchTerms)) {
            $q->where(function ($sub) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $sub->where(function ($w) use ($term) {
                        $w->where('title', 'like', "%{$term}%")
                          ->orWhere('sku', 'like', "%{$term}%")
                          ->orWhere('description', 'like', "%{$term}%");
                    });
                }
            });
        } elseif (empty($matchedCategoryIds) && !$matchedBrandId) {
            $q->where(function ($sub) use ($significantWords) {
                foreach ($significantWords as $word) {
                    $sub->orWhere('title', 'like', "%{$word}%")
                        ->orWhere('sku', 'like', "%{$word}%")
                        ->orWhere('description', 'like', "%{$word}%");
                }
            });
        }

        if ($maxPrice) {
            $q->where('price', '<=', $maxPrice);
        }
        if ($minPrice) {
            $q->where('price', '>=', $minPrice);
        }

        $products = $q->orderBy('is_featured', 'desc')->latest()->take(5)->get();

        // If strict search had no result but maxPrice or category matched, fallback gracefully
        if ($products->isEmpty() && !empty($matchedCategoryIds)) {
            $products = Product::whereIn('category_id', array_unique($matchedCategoryIds))->latest()->take(4)->get();
        }

        if ($products->isEmpty()) {
            return null;
        }

        $items = $products->map(function ($p) {
            $currentPrice = (float)($p->flash_price ?: $p->price);
            $regularPrice = (float)($p->regular_price ?: $p->price);
            $savings = max(0, $regularPrice - $currentPrice);

            return [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'price' => $currentPrice,
                'regular_price' => $regularPrice,
                'savings' => $savings,
                'in_stock' => $p->stock > 0,
                'image' => $p->image ?: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop',
                'category' => $p->category?->name,
                'brand' => $p->brand?->name,
                'url' => "/product/{$p->slug}",
            ];
        })->values()->toArray();

        $count = count($items);
        $msg = "I found {$count} matching product" . ($count > 1 ? 's' : '') . " in our live inventory:";
        if ($maxPrice) {
            $msg = "Here are matching products within ৳" . number_format($maxPrice) . " in our live inventory:";
        }

        return [
            'message' => $msg,
            'type' => 'products',
            'payload' => [
                'products' => $items,
            ],
            'suggestions' => ['View all in Catalog', '0% EMI Facilities', 'Track Order', 'Talk to Support']
        ];
    }

    /**
     * Resolve Order Status & Tracking lookup.
     */
    protected static function resolveOrderTracking(string $query, ?User $user = null): ?array
    {
        $orderNumber = null;

        // Detect order number patterns: ORD-20260817-XXXX, #12345, 12345
        if (preg_match('/(ORD-[\w\-]+|#\d{4,8}|\b\d{4,8}\b)/i', $query, $matches)) {
            $orderNumber = ltrim($matches[0], '#');
        } elseif ($user && (str_contains($query, 'my order') || str_contains($query, 'order status') || str_contains($query, 'track') || str_contains($query, 'অর্ডার'))) {
            $latestOrder = Order::where('user_id', $user->id)->latest()->first();
            if ($latestOrder) {
                $orderNumber = $latestOrder->order_number;
            }
        }

        if (!$orderNumber && (str_contains($query, 'track') || str_contains($query, 'order status') || str_contains($query, 'অর্ডার') || str_contains($query, 'delivery status') || str_contains($query, 'kobe pabo'))) {
            return [
                'message' => "অর্ডার ট্র্যাক করতে আপনার **Order Number** (যেমন: `ORD-20260817-XXXX` বা `#12345`) লিখুন।",
                'type' => 'text',
                'suggestions' => ['Track Order', 'Talk to Support']
            ];
        }

        if ($orderNumber) {
            $order = Order::whereRaw('LOWER(order_number) = ?', [strtolower($orderNumber)])
                ->orWhere('order_number', 'like', "%{$orderNumber}%")
                ->orWhere('id', $orderNumber)
                ->with(['items.product'])
                ->first();

            if ($order) {
                $statusFormatted = strtoupper($order->status);
                $statusColors = [
                    'pending' => '#f59e0b',
                    'processing' => '#3b82f6',
                    'shipped' => '#8b5cf6',
                    'delivered' => '#10b981',
                    'cancelled' => '#ef4444',
                ];

                $payload = [
                    'order_number' => $order->order_number,
                    'status' => strtolower($order->status),
                    'status_formatted' => $statusFormatted,
                    'color' => $statusColors[strtolower($order->status)] ?? '#3b82f6',
                    'total' => (float)$order->total,
                    'courier' => $order->courier_provider ?: ($order->courier_name ?? 'Nationwide Express'),
                    'tracking_number' => $order->courier_tracking_code ?: ($order->tracking_number ?? 'N/A'),
                    'items_count' => $order->items ? $order->items->count() : 0,
                    'created_at' => $order->created_at ? $order->created_at->format('M d, Y h:i A') : now()->format('M d, Y h:i A'),
                ];

                return [
                    'message' => "Here is the current live status for order **#{$order->order_number}**:",
                    'type' => 'order_status',
                    'payload' => $payload,
                    'suggestions' => ['Track another order', 'Return Policy', 'Talk to Support']
                ];
            } else {
                return [
                    'message' => "I couldn't find an order matching `{$orderNumber}`. Please double check your order number or reach out to our support team.",
                    'type' => 'text',
                    'suggestions' => ['Talk to Support', 'Search Products']
                ];
            }
        }

        return null;
    }

    /**
     * Resolve Catalog & Shop browse information with featured product cards.
     */
    protected static function resolveCatalogInfo(): array
    {
        $products = Product::where('is_active', true)
            ->orderBy('is_featured', 'desc')
            ->latest()
            ->take(4)
            ->get();

        $items = $products->map(function ($p) {
            $currentPrice = (float)($p->flash_price ?: $p->price);
            $regularPrice = (float)($p->regular_price ?: $p->price);
            $savings = max(0, $regularPrice - $currentPrice);

            return [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'price' => $currentPrice,
                'regular_price' => $regularPrice,
                'savings' => $savings,
                'in_stock' => $p->stock > 0,
                'image' => $p->image ?: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop',
                'category' => $p->category?->name,
                'brand' => $p->brand?->name,
                'url' => "/product/{$p->slug}",
            ];
        })->values()->toArray();

        $msg = "🛍️ **TechMarket Product Catalog & Shop**\n\nআমাদের সমস্ত প্রোডাক্ট ক্যাটাগরি, ব্র্যান্ড ও সেরা অফার ব্রাউজ করতে [এখানে ক্লিক করে Catalog ওপেন করুন](/catalog) অথবা নিচের জনপ্রিয় ক্যাটাগরিগুলো দেখুন:";

        return [
            'message' => $msg,
            'type' => 'products',
            'payload' => [
                'products' => $items,
            ],
            'suggestions' => ['Search Laptops under 60k', 'Air Conditioner Deals', '0% EMI Facilities', 'PC Builder']
        ];
    }

    /**
     * Resolve Customer Servicing & Repairs Information.
     */
    protected static function resolveServiceBookingInfo(): array
    {
        $msg = "🔧 **TechMarket Customer Servicing & Hardware Repairs**\n\n"
             . "ল্যাপটপ, ডেস্কটপ, প্রিন্টার, মনিটর ও হার্ডওয়্যার রিপেয়ারিংয়ের জন্য আমাদের ডেডিকেটেড সার্ভিস টিম প্রস্তুত রয়েছে।\n\n"
             . "• **ডোরস্টেপ পিকআপ ও ড্রপ-অফ**: সার্ভিস রিকোয়েস্ট সাবমিট করুন সহজে।\n"
             . "• **লাইভ সার্ভিস ট্র্যাকিং**: রিকোয়েস্ট কোড দিয়ে সার্ভিসের বর্তমান অবস্থা ট্র্যাক করুন।\n\n"
             . "👉 [এখানে ক্লিক করে সার্ভিস রিকোয়েস্ট বুক করুন](/servicing)";

        return [
            'message' => $msg,
            'type' => 'policy',
            'suggestions' => ['Official Warranty Policy', 'Showroom Locations', 'Talk to Support']
        ];
    }

    /**
     * Resolve PC Builder Information.
     */
    protected static function resolvePcBuilderInfo(): array
    {
        $msg = "🖥️ **TechMarket Custom PC Builder Tool**\n\n"
             . "আপনার পছন্দের প্রসেসর, মাদারবোর্ড, গ্রাফিক্স কার্ড, র‍্যাম ও স্টোরেজ মিলিয়ে সম্পূর্ণ কাস্টম পিসি কনফিগার করুন খুব সহজে!\n\n"
             . "• **লাইভ কম্প্যাটিবিলিটি চেক**: কম্পোনেন্ট ম্যাচিং স্বয়ংক্রিয়ভাবে যাচাই হবে।\n"
             . "• **ইনস্ট্যান্ট কোটেশন ও প্রিন্ট**: পিসি বিল্ড শিট ডাউনলোড ও সরাসরি অর্ডার সুবিধা।\n\n"
             . "👉 [এখানে ক্লিক করে PC Builder ওপেন করুন](/pc-builder)";

        return [
            'message' => $msg,
            'type' => 'policy',
            'suggestions' => ['Search Graphics Card', '0% EMI Facilities', 'Talk to Support']
        ];
    }

    /**
     * Resolve Active Offers & Campaign details.
     */
    protected static function resolveOffersInfo(): array
    {
        $activeOffers = Offer::where('is_active', true)->where('status', 'active')->latest()->take(3)->get();
        
        $offersText = "";
        if ($activeOffers->isNotEmpty()) {
            foreach ($activeOffers as $off) {
                $offersText .= "• **{$off->title}**: {$off->short_description}\n";
            }
        } else {
            $offersText = "• **Flash Sale Deals**: বিভিন্ন ব্র্যান্ডের হার্ডওয়্যারে বিশেষ ক্যাশব্যাক ও ডিসকাউন্ট!\n• **Spider-Man Movie Ticket Free**: নির্দিষ্ট ল্যাপটপ ক্রয়ে মুভি টিকেট গিফট।\n";
        }

        $msg = "🔥 **Exclusive Offers & Discounts at TechMarket BD**\n\n"
             . $offersText . "\n"
             . "👉 [সকল অফার দেখতে এখানে ক্লিক করুন](/offers)";

        return [
            'message' => $msg,
            'type' => 'policy',
            'suggestions' => ['Search Laptops', '0% EMI Facilities', 'Talk to Support']
        ];
    }

    /**
     * Resolve EMI & Financing details.
     */
    protected static function resolveEmiInfo(): array
    {
        $partners = EmiPartner::where('is_active', true)->get();
        $bankNames = $partners->pluck('bank_name')->take(6)->implode(', ');

        $msg = "💳 **0% EMI Financing Facilities at TechMarket BD**\n\n"
             . "• **Available Tenures**: 3, 6, 9, 12, 24, and up to 36 months.\n"
             . "• **Partner Banks**: " . ($bankNames ?: 'City Bank (Amex), BRAC Bank, Eastern Bank, SCB, Dutch-Bangla Bank, Dhaka Bank') . ".\n"
             . "• **Minimum Purchase**: ৳5,000 BDT.\n"
             . "• **Eligibility**: Available with all major Credit Cards at our online checkout and physical showrooms.\n\n"
             . "For more details, visit our [EMI Information Page](/emi-info).";

        return [
            'message' => $msg,
            'type' => 'policy',
            'suggestions' => ['Showroom Locations', 'Search Laptops', 'Talk to Support']
        ];
    }

    /**
     * Resolve Policy, FAQs, Warranty & Shipping info.
     */
    protected static function resolvePolicyOrFaq(string $query): ?array
    {
        // 1. Warranty Policy
        if (str_contains($query, 'warranty') || str_contains($query, 'গ্যারান্টি') || str_contains($query, 'ওয়ারেন্টি')) {
            return [
                'message' => "🛡️ **Official Warranty Policy**\n\n"
                           . "• All products at TechMarket BD come with **100% Genuine Official Manufacturer Warranty** (1 to 3 years depending on product & brand).\n"
                           . "• You can claim warranty support at any official authorized service center or drop off your product at our TechMarket Service Centers.\n"
                           . "• For service requests or status, visit our [Customer Servicing Page](/servicing).",
                'type' => 'policy',
                'suggestions' => ['Book a Service', 'Return Policy', 'Talk to Support']
            ];
        }

        // 2. Delivery & Shipping
        if (str_contains($query, 'delivery') || str_contains($query, 'shipping') || str_contains($query, 'চার্জ') || str_contains($query, 'ডেলিভারি')) {
            $hotline = Setting::where('key', 'hotline')->value('value') ?: '09612-888888';
            return [
                'message' => "🚚 **Nationwide Delivery & Shipping Rates**\n\n"
                           . "• **Inside Dhaka**: 24 – 48 Hours (Standard Delivery: ৳60 – ৳80).\n"
                           . "• **Outside Dhaka**: 2 – 4 Days via Courier (৳120 – ৳150 with secure cash on delivery support).\n"
                           . "• **Express Same-Day Delivery**: Available for select Dhaka locations on request.\n\n"
                           . "For delivery inquiries, contact our hotline: `{$hotline}`.",
                'type' => 'policy',
                'suggestions' => ['Track Order', 'Payment Methods', 'Talk to Support']
            ];
        }

        // 3. Return & Refund Policy
        if (str_contains($query, 'return') || str_contains($query, 'refund') || str_contains($query, 'রিটার্ন') || str_contains($query, 'ফেরত')) {
            return [
                'message' => "🔄 **Return & Refund Policy**\n\n"
                           . "• **7-Day Easy Replacement**: If you receive a physically damaged, defective, or incorrect product, report it within 7 days for an instant replacement or refund.\n"
                           . "• Product must be returned in original packaging with all included accessories and invoice.\n"
                           . "• Online refunds via bKash/Nagad/Cards are processed within 3-5 business days.",
                'type' => 'policy',
                'suggestions' => ['Warranty Policy', 'Showroom Locations', 'Talk to Support']
            ];
        }

        // 4. Check Category FAQs in Database
        $faq = CategoryFaq::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('question', 'like', "%{$query}%")
                  ->orWhere('answer', 'like', "%{$query}%");
            })
            ->first();

        if ($faq) {
            return [
                'message' => "💡 **{$faq->question}**\n\n{$faq->answer}",
                'type' => 'policy',
                'suggestions' => ['Search Products', 'Talk to Support']
            ];
        }

        return null;
    }

    /**
     * Resolve Showroom, Hotline, and Branch Contact Info.
     */
    protected static function resolveContactInfo(): array
    {
        $hotline = Setting::where('key', 'hotline')->value('value') ?: '09612-888888';
        $email = Setting::where('key', 'support_email')->value('value') ?: 'support@techlandbd.com';
        $dhaka = Setting::where('key', 'showroom_dhaka')->value('value') ?: 'Multiplan Center, Level 9, New Elephant Road, Dhaka 1205';

        $msg = "📍 **TechMarket BD Branches & Hotline Contact**\n\n"
             . "📞 **Hotline**: `{$hotline}` (9 AM – 9 PM, Everyday)\n"
             . "✉️ **Email**: `{$email}`\n"
             . "🏢 **Central Showroom (Dhaka)**: {$dhaka}\n"
             . "🕒 **Showroom Hours**: Saturday – Thursday (10:00 AM to 8:30 PM)\n\n"
             . "Need immediate help? Click **Talk to Support** below.";

        return [
            'message' => $msg,
            'type' => 'policy',
            'suggestions' => ['Search Products', 'Track Order', 'Talk to Support']
        ];
    }

    /**
     * Call Google Gemini API (Free tier) if API key is provided.
     */
    protected static function callGeminiAi(string $userPrompt): ?string
    {
        $apiKey = env('GEMINI_API_KEY') ?: Setting::where('key', 'gemini_api_key')->value('value');
        if (!$apiKey) {
            return null;
        }

        try {
            $systemPrompt = "You are TechMarket AI Assistant, a helpful and expert AI ecommerce assistant for TechMarket BD (Bangladesh's leading computer and hardware retail store). Answer friendly and concisely in English or Bengali depending on the user's language. Assist with laptops, desktops, computer parts, AC, monitors, warranty, 0% EMI, and order delivery.";

            $response = Http::timeout(8)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => "{$systemPrompt}\n\nUser Question: {$userPrompt}"]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 300,
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if (!empty($text)) {
                    return trim($text);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gemini AI API call failed: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Create Escalation Prompt when user or bot needs human support handover.
     */
    protected static function createEscalationPrompt(ChatSession $session, string $promptText): array
    {
        return self::saveBotMessage(
            $session,
            $promptText,
            'escalation_prompt',
            [
                'session_token' => $session->session_token,
                'customer_name' => $session->customer_name ?: '',
                'customer_phone' => $session->customer_phone ?: '',
            ],
            ['Submit Inquiry', 'Search Products', 'Showroom Locations']
        );
    }

    /**
     * Escalate session into a formal Support Ticket in the database.
     */
    public static function escalateToSupportTicket(ChatSession $session, array $data, ?User $user = null): SupportTicket
    {
        $ticketNumber = 'TIC-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        // Get last user message as inquiry summary
        $lastUserMsg = $session->messages()->where('sender', 'user')->latest()->first();
        $inquiry = $data['inquiry_text'] ?? ($lastUserMsg ? $lastUserMsg->message : 'Customer requested human support assistance via AI Chatbot.');

        $ticket = SupportTicket::create([
            'ticket_number' => $ticketNumber,
            'chat_session_id' => $session->id,
            'customer_id' => $user?->id ?: $session->user_id,
            'customer_name' => $data['customer_name'] ?? ($session->customer_name ?: 'Guest Customer'),
            'customer_phone' => $data['customer_phone'] ?? ($session->customer_phone ?: ''),
            'customer_email' => $data['customer_email'] ?? $session->customer_email,
            'subject' => $data['subject'] ?? 'Chatbot Escalated Support Request',
            'inquiry_text' => $inquiry,
            'status' => 'new',
            'priority' => 'medium',
        ]);

        $session->update([
            'status' => 'escalated',
            'customer_name' => $ticket->customer_name,
            'customer_phone' => $ticket->customer_phone,
            'customer_email' => $ticket->customer_email,
        ]);

        // Add confirmation message to chat
        self::saveBotMessage(
            $session,
            "✅ **Inquiry Submitted to Support Team!**\n\nYour support ticket **#{$ticketNumber}** has been created. Our customer support team has received your chat details and will reach out to you at `{$ticket->customer_phone}` shortly.\n\nThank you for choosing TechMarket BD!",
            'text',
            ['ticket_number' => $ticketNumber],
            ['Search Products', 'Track Order', 'Showroom Locations']
        );

        return $ticket;
    }

    /**
     * Check if query matches support escalation triggers.
     */
    protected static function matchesSupportKeywords(string $lower): bool
    {
        $triggers = [
            'talk to human', 'human support', 'talk to agent', 'live support', 'customer care',
            'call me', 'agent', 'support team', 'talk to support team', 'talk to support',
            'কথা বলতে চাই', 'মানুষের সাথে কথা', 'সাপোর্ট এজেন্ট', 'সাপোর্ট টিম', 'হেল্প দরকার'
        ];

        foreach ($triggers as $t) {
            if (str_contains($lower, $t)) return true;
        }
        return false;
    }

    /**
     * Save bot message helper and return standardized response format.
     */
    protected static function saveBotMessage(ChatSession $session, string $message, string $type = 'text', ?array $payload = null, array $suggestions = []): array
    {
        $botMsg = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'bot',
            'message' => $message,
            'type' => $type,
            'payload' => $payload ? array_merge($payload, ['suggestions' => $suggestions]) : ['suggestions' => $suggestions],
        ]);

        return [
            'id' => $botMsg->id,
            'message' => $message,
            'type' => $type,
            'payload' => $botMsg->payload,
            'sender' => 'bot',
            'suggestions' => $suggestions,
            'created_at' => $botMsg->created_at->toISOString(),
        ];
    }
}
