<?php

namespace App\Http\Controllers;

use App\Models\EmiPartner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ToolsController extends Controller
{
    /**
     * Display the Useful Tools index page.
     */
    public function index()
    {
        return Inertia::render('Tools/Index');
    }

    /**
     * Display the AC BTU Calculator.
     */
    public function btuCalculator()
    {
        return Inertia::render('Tools/BtuCalculator');
    }

    /**
     * Display the EMI Calculator with Bank Partners.
     */
    public function emiCalculator()
    {
        $partners = EmiPartner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Standard comprehensive Bangladeshi Banks for EMI calculation
        $allBanks = [
            ['name' => 'Al-Arafah Islami Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'AB Bank Limited', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Bank Asia Limited', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Brac Bank Limited', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'City Bank Limited', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Dhaka Bank Limited', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Dutch Bangla Bank Limited', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Eastern Bank Limited', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Jamuna Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24]],
            ['name' => 'Lanka Bangla Finance', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Mutual Trust Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Islami Bank Bangladesh', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24]],
            ['name' => 'NCC Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Shahjalal Islami Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24]],
            ['name' => 'South East Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Standard Chartered Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Premier Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24]],
            ['name' => 'Prime Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'Pubali Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24]],
            ['name' => 'Trust Bank', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
            ['name' => 'United Commercial Bank (UCB)', 'min_amount' => 5000, 'tenures' => [3, 6, 9, 12, 18, 24, 36]],
        ];

        return Inertia::render('Tools/EmiCalculator', [
            'partners' => $partners,
            'banks' => $allBanks,
        ]);
    }

    /**
     * Display the Third Party Pickup Points directory.
     */
    public function thirdPartyPickupPoints()
    {
        $pickupPoints = [
            [
                'no' => 1,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => '121, Motijheel, Dhaka',
                'contact' => '01740641004',
                'address' => 'M/S Faith & Famous, 121, Motijheel, Dhaka',
            ],
            [
                'no' => 2,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => '14 Purana Paltan, Dhaka',
                'contact' => '01918339985',
                'address' => 'Darussalam Arched, 14, Purana Paltan, Dhaka',
            ],
            [
                'no' => 3,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => '154, Motijheel, Dhaka',
                'contact' => '01818071595',
                'address' => '154, Motijheel C/A, Dhaka',
            ],
            [
                'no' => 4,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => '167, Motijheel, Dhaka',
                'contact' => '01722444802, 01823050068',
                'address' => '10 Toyenbi, Motijheel, Dhaka',
            ],
            [
                'no' => 5,
                'courier' => 'Sundarban Courier',
                'district' => 'Joypurhat',
                'pickup_point' => '588, Joypurhat',
                'contact' => '01734175095',
                'address' => 'Muktijhodda Market, Tin Matha, 588, Joypurhat',
            ],
            [
                'no' => 6,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => '608 Purana Paltan, Dhaka',
                'contact' => '01815553827',
                'address' => '608 Purana Paltan, Dhaka',
            ],
            [
                'no' => 7,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => '9/G, Toyenbee Road, Dhaka',
                'contact' => '01765402171',
                'address' => '9/G, Toyenbee Circular Road, Motijheel, C/A, Dhaka - 1000',
            ],
            [
                'no' => 8,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => 'Abdullahpur, Keranigonj',
                'contact' => '01780524210, 01918702204',
                'address' => 'Mazidullah Madbar Shoping Complex, Abdullahpur, South Keranigonj, Dhaka',
            ],
            [
                'no' => 9,
                'courier' => 'Sundarban Courier',
                'district' => 'Dinajpur',
                'pickup_point' => 'Amban, Dinajpur',
                'contact' => '01914398155',
                'address' => 'Amban, Dinajpur',
            ],
            [
                'no' => 10,
                'courier' => 'Sundarban Courier',
                'district' => 'Naogaon',
                'pickup_point' => 'Abad Pukur, Naogaon',
                'contact' => '01711412509',
                'address' => 'Shihab Internet, Abad Pukur Bazar, RaniNagar, Naogaon',
            ],
            [
                'no' => 11,
                'courier' => 'Sundarban Courier',
                'district' => 'Jessore',
                'pickup_point' => 'Ambottola, Jashore',
                'contact' => '01719630397',
                'address' => 'Mizan Dairy Farm, Ambottola, Jashore',
            ],
            [
                'no' => 12,
                'courier' => 'Sundarban Courier',
                'district' => 'Dhaka',
                'pickup_point' => 'Aminbazar, Savar',
                'contact' => '01625440577',
                'address' => 'Chowdhury Mansion, Aminbazar, Savar, Dhaka',
            ],
            [
                'no' => 13,
                'courier' => 'SA Paribahan',
                'district' => 'Dhaka',
                'pickup_point' => 'Kakrail Main Branch',
                'contact' => '01711122334',
                'address' => '22/1 Kakrail VIP Road, Dhaka',
            ],
            [
                'no' => 14,
                'courier' => 'SA Paribahan',
                'district' => 'Chittagong',
                'pickup_point' => 'Agrabad Branch',
                'contact' => '01819556677',
                'address' => 'Badamtoli Mor, Agrabad C/A, Chittagong',
            ],
            [
                'no' => 15,
                'courier' => 'Steadfast Courier',
                'district' => 'Dhaka',
                'pickup_point' => 'Multiplan Hub, Elephant Road',
                'contact' => '01900112233',
                'address' => 'Shop 612, Level 6, Multiplan Center, Dhaka',
            ],
            [
                'no' => 16,
                'courier' => 'Steadfast Courier',
                'district' => 'Sylhet',
                'pickup_point' => 'Zindabazar Hub',
                'contact' => '01712334455',
                'address' => 'Al-Hamra Shopping City, Zindabazar, Sylhet',
            ],
            [
                'no' => 17,
                'courier' => 'RedX Logistics',
                'district' => 'Dhaka',
                'pickup_point' => 'Mirpur-10 Hub',
                'contact' => '01844556677',
                'address' => 'Section-10, Block-C, Mirpur, Dhaka',
            ],
            [
                'no' => 18,
                'courier' => 'RedX Logistics',
                'district' => 'Rajshahi',
                'pickup_point' => 'Shaheb Bazar Hub',
                'contact' => '01777889900',
                'address' => 'Zero Point, Shaheb Bazar, Rajshahi',
            ],
            [
                'no' => 19,
                'courier' => 'Pathao Courier',
                'district' => 'Khulna',
                'pickup_point' => 'Dakbangla Hub',
                'contact' => '01999887766',
                'address' => 'KDA Avenue, Dakbangla Mor, Khulna',
            ],
            [
                'no' => 20,
                'courier' => 'Sundarban Courier',
                'district' => 'Bogra',
                'pickup_point' => 'Bogra Main Branch',
                'contact' => '01715443322',
                'address' => 'Borogola, Rangpur Road, Bogra',
            ],
        ];

        $couriers = ['All', 'Sundarban Courier', 'SA Paribahan', 'Steadfast Courier', 'RedX Logistics', 'Pathao Courier'];
        $districts = ['All', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Dinajpur', 'Joypurhat', 'Naogaon', 'Jessore', 'Bogra', 'Comilla', 'Gazipur', 'Narayanganj'];

        return Inertia::render('Tools/PickupPoints', [
            'pickupPoints' => $pickupPoints,
            'couriers' => $couriers,
            'districts' => $districts,
        ]);
    }
}
