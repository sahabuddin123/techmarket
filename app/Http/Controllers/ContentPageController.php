<?php

namespace App\Http\Controllers;

use App\Models\CmsPage;
use App\Models\EmiPartner;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ContentPageController extends Controller
{
    /**
     * Display the dynamic About Us page.
     */
    public function aboutUs()
    {
        $page = CmsPage::where('slug', 'about-us')->first();

        $defaultSections = [
            'hero' => [
                'title' => 'About TechMarket BD',
                'subtitle' => 'The Leading Trusted Computer & Hardware Retailer in Bangladesh',
                'banner' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop',
            ],
            'story' => [
                'heading' => 'Our Journey Since 2016',
                'paragraphs' => [
                    'Founded with a passion for high-performance computing, TechMarket BD has grown from a specialized hardware boutique to one of Bangladesh’s most reputable retail tech destinations.',
                    'We specialize in authentic gaming laptops, custom desktop PCs, NVIDIA RTX GPUs, AMD Ryzen & Intel processors, and complete office IT infrastructure solutions with official brand warranty.',
                ],
            ],
            'mission_vision' => [
                'mission' => 'To empower tech enthusiasts, gamers, and businesses across Bangladesh by delivering 100% original hardware at genuine pricing with zero-compromise warranty support.',
                'vision' => 'To be recognized as Bangladesh’s most reliable IT ecosystem where technology meets trust, seamless service, and innovative shopping experiences.',
            ],
            'stats' => [
                ['label' => 'Satisfied Customers', 'value' => '150,000+'],
                ['label' => 'Custom PCs Built', 'value' => '35,000+'],
                ['label' => 'Official Brand Partners', 'value' => '85+'],
                ['label' => 'Physical Service Outlets', 'value' => '6 Branches'],
            ],
            'values' => [
                ['title' => '100% Genuine Products', 'description' => 'Direct authorized brand sourcing with manufacturer warranty.'],
                ['title' => 'Customer-First Warranty', 'description' => 'Fast-track RMA and dedicated service center diagnostic support.'],
                ['title' => 'Competitive Pricing', 'description' => 'Transparent BDT market prices with attractive EMI payment options.'],
                ['title' => 'Nationwide Fast Delivery', 'description' => 'Express door-to-door delivery inside Dhaka and all 64 districts.'],
            ],
            'timeline' => [
                ['year' => '2016', 'title' => 'TechMarket BD Founded', 'desc' => 'Started operations at Multiplan Center, Elephant Road, Dhaka.'],
                ['year' => '2019', 'title' => 'PC Builder & Gaming Division', 'desc' => 'Introduced custom gaming rigs and interactive online PC builder tool.'],
                ['year' => '2022', 'title' => 'Nationwide Service Expansion', 'desc' => 'Opened authorized hardware diagnostic and RMA branches.'],
                ['year' => '2026', 'title' => 'Enterprise Ecommerce Platform', 'desc' => 'Launched modern online marketplace with automated delivery and instant EMI.'],
            ],
        ];

        $sections = ($page && !empty($page->sections)) ? array_merge($defaultSections, $page->sections) : $defaultSections;

        return Inertia::render('AboutUs', [
            'page' => $page,
            'sections' => $sections,
        ]);
    }

    /**
     * Display the Servicing & Repair Center page.
     */
    public function servicing()
    {
        $serviceCategories = [
            ['title' => 'Laptop Repair & Maintenance', 'desc' => 'Screen replacement, keyboard fix, battery & motherboard repair.', 'icon' => 'Laptop'],
            ['title' => 'Custom PC Diagnostics & Tuning', 'desc' => 'Hardware testing, cable management, BIOS updating & benchmarking.', 'icon' => 'Cpu'],
            ['title' => 'GPU Thermal Servicing & Pad Fix', 'desc' => 'Thermal paste replacement, heatsink cleaning & fan repairs.', 'icon' => 'Zap'],
            ['title' => 'Chip-Level Component Repair', 'desc' => 'Advanced micro-soldering for motherboards and power circuits.', 'icon' => 'CircuitBoard'],
            ['title' => 'OS & Software Deployment', 'desc' => 'Genuine Windows setup, driver configuration & virus removal.', 'icon' => 'Monitor'],
            ['title' => 'Custom Watercooling Service', 'desc' => 'Hardline loop leak testing, coolant flush & RGB lighting sync.', 'icon' => 'Wind'],
        ];

        $branches = [
            ['name' => 'Dhaka Multiplan Center', 'address' => 'Level 6, Shop 608-610, Elephant Road, Dhaka', 'phone' => '+880 1324294323', 'hours' => '10:00 AM – 8:00 PM (Tuesday Closed)'],
            ['name' => 'IDB Bhaban Branch', 'address' => 'Level 3, BCS Computer City, Agargaon, Dhaka', 'phone' => '+880 1324294324', 'hours' => '10:00 AM – 8:00 PM (Sunday Closed)'],
            ['name' => 'Chittagong GEC Outlet', 'address' => 'Central Shopping Complex, GEC Circle, Chittagong', 'phone' => '+880 1324294325', 'hours' => '10:00 AM – 8:00 PM (Friday Closed)'],
        ];

        return Inertia::render('Servicing', [
            'serviceCategories' => $serviceCategories,
            'branches' => $branches,
        ]);
    }

    /**
     * Submit a customer service/repair booking.
     */
    public function storeServiceRequest(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:30',
            'customer_email' => 'nullable|email|max:255',
            'device_type' => 'required|string|max:100',
            'brand_name' => 'nullable|string|max:100',
            'issue_description' => 'required|string|max:2000',
            'preferred_date' => 'nullable|date',
            'service_branch' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $trackingCode = 'SR-' . date('Y') . '-' . strtoupper(Str::random(6));

        $serviceRequest = ServiceRequest::create([
            ...$validated,
            'tracking_code' => $trackingCode,
            'status' => 'pending',
            'user_id' => auth()->id(),
        ]);

        return back()->with([
            'success' => "Your service request #{$trackingCode} has been submitted! Our support engineer will contact you shortly.",
            'tracking_code' => $trackingCode,
        ]);
    }

    /**
     * Display the dynamic EMI Information page.
     */
    public function emiInfo()
    {
        $partners = EmiPartner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        if ($partners->isEmpty()) {
            // Provide default fallback bank partners if none seeded yet
            $partners = collect([
                ['bank_name' => 'City Bank (Amex)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '18', '24', '36'], 'interest_rate_note' => '0% Interest up to 12 months'],
                ['bank_name' => 'BRAC Bank', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '24'], 'interest_rate_note' => '0% Interest on selected credit cards'],
                ['bank_name' => 'Eastern Bank (EBL)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '24'], 'interest_rate_note' => '0% Interest facility available'],
                ['bank_name' => 'Standard Chartered', 'min_amount' => 10000, 'available_tenures' => ['3', '6', '9', '12'], 'interest_rate_note' => 'SCB EasyPay 0% available'],
                ['bank_name' => 'Dutch-Bangla Bank (DBBL)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12', '24'], 'interest_rate_note' => 'InstaPay 0% facility'],
                ['bank_name' => 'Mutual Trust Bank (MTB)', 'min_amount' => 5000, 'available_tenures' => ['3', '6', '9', '12'], 'interest_rate_note' => 'FlexiPay available'],
            ]);
        }

        $faqs = [
            ['q' => 'What is the minimum order amount to qualify for EMI?', 'a' => 'The minimum product order amount to avail EMI is BDT 5,000 on supported credit cards.'],
            ['q' => 'Can I avail EMI using debit card or bKash?', 'a' => 'No, bank EMI facilities in Bangladesh are strictly available for credit card holders of participating partner banks.'],
            ['q' => 'How can I choose EMI tenure during online checkout?', 'a' => 'Select "Credit Card / Online EMI" at checkout, choose your issuing bank, and select your preferred tenure from 3 to 36 months.'],
            ['q' => 'Are there any hidden fees for 0% EMI?', 'a' => 'No hidden charges. For 0% EMI campaigns, you only pay the exact retail product value divided across your selected monthly installments.'],
        ];

        return Inertia::render('EmiInfo', [
            'partners' => $partners,
            'faqs' => $faqs,
        ]);
    }
}
