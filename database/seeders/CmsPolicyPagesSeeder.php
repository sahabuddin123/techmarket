<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CmsPage;

class CmsPolicyPagesSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Privacy Policy
        $privacySections = [
            [
                'badge' => 'Information Collection and Use',
                'paragraphs' => [
                    'TechMarket is the sole owner of information collected on this site. We will not sell, share, or rent this information to any outside parties, except as outlined in this policy. We collect information from our customers to process orders and better serve you with pertinent information, such as order confirmations and order status updates. Information collected includes your name, shipping address, billing address, telephone numbers, e-mail address, and payment information.',
                    'We also require you to submit a username and password of your choice for your future access to your account information. To safeguard that your username and password remain confidential, DO NOT share this information with anyone. If you elect to receive our newsletter or special promotions, your contact information will be used for the delivery of these items.',
                ],
            ],
            [
                'badge' => 'Registration',
                'paragraphs' => [
                    'In order to process your orders placed on this website, you must first complete the registration form. During registration, you will be required to provide your contact information, which includes your name, e-mail address, telephone number and street address. This information is used to provide you with important TechMarket services such as automated order status updates via e-mail.',
                ],
            ],
            [
                'badge' => 'Order',
                'paragraphs' => [
                    'Most of the information collected in the registration process will be used to process orders. During the order process, you will have to provide financial information such as payment mode, money order, wire transfer or check information. This information is used for billing purposes and to fulfill your order. If we have trouble processing an order, we will use this contact information to get in touch with you. We do not share your personal and financial information with any third parties.',
                ],
            ],
            [
                'badge' => 'Cookies',
                'paragraphs' => [
                    'We customize certain Web page content based upon your browser type and other information provided by our cookie. If you choose to reject the cookie, you can still browse our store but will be unable to use the shopping cart to buy merchandise. The TechMarket shopping cart cannot function without cookies enabled so that the necessary information to process your order is retained. If you disable cookies, TechMarket will be unable to accept your online order.',
                    'We will not share any personally identifiable information provided by this cookie with any third party. We will, however, link data stored in cookies to the personally identifiable information you submitted while on our site. This allows us to personalize your shopping experience and discern user preferences to evoke subconscious feelings of familiarity and assurance. Some of our business partners (e.g., advertisers) use cookies on our site. We have no access to or control over these cookies. This privacy statement covers the use of cookies by TechMarket only and does not cover the use of cookies by any advertisers.',
                ],
            ],
            [
                'badge' => 'Log Files',
                'paragraphs' => [
                    'We use IP addresses to analyze trends, administer the site, track user movement, and gather broad demographic information for aggregate use. We do not link IP addresses to personally identifiable information, and we do not distribute or share IP information with any third parties.',
                ],
            ],
            [
                'badge' => 'Links',
                'paragraphs' => [
                    'This website contains links to other sites. Please be aware that TechMarket is not responsible for the privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of each and every website that collects personally identifiable information. This privacy statement applies only to information collected by this website.',
                ],
            ],
            [
                'badge' => 'Security',
                'paragraphs' => [
                    'TechMarket takes precautions to protect its customers\' information. When you submit sensitive information via the website, your information is protected both online and offline. We employ secure networks and encryption techniques to safeguard your data from unauthorized access or disclosure.',
                ],
            ],
            [
                'badge' => 'Correction/Updating/Reviewing Personal Information',
                'paragraphs' => [
                    'Customers may change or review their stored account information such as street address or e-mail address through their "My Account" option. You must have your username and password in order to access your account. In the event you forget both your username and password, please contact our customer service department for assistance.',
                ],
            ],
            [
                'badge' => 'তথ্য সংগ্রহ এবং তার ব্যবহার',
                'paragraphs' => [
                    'এই ওয়েবসাইটে সংগৃহীত তথ্যের একমাত্র মালিক \'টেকমার্কেট\'। এই ওয়েবসাইটে উল্লেখিত নেই এমন কোনো পক্ষের কাছে \'টেকমার্কেট\' তাদের সংগৃহীত তথ্যাদি আদান-প্রদান করে না। ক্রেতা বা গ্রাহকের অর্ডার প্রক্রিয়া করার জন্য এবং আরও ভালো সেবা প্রদান করার জন্য ক্রেতার তথ্য সংগ্রহ করা হয় যেমন: অর্ডার নিশ্চিতকরণ এবং অর্ডারের স্ট্যাটাস আপডেট। সংগৃহীত তথ্যের মধ্যে রয়েছে ক্রেতার নাম, শিপিং ঠিকানা, বিলিং ঠিকানা, টেলিফোন নম্বর, ই-মেইল ঠিকানা এবং পেমেন্ট সম্পর্কিত তথ্য।',
                    'গ্রাহকের একাউন্টে প্রবেশের ভবিষ্যৎ আবেদন নিশ্চিত করার জন্য গ্রাহককে টেকমার্কেটের পক্ষ থেকে \'ইউজারনেম\' এবং \'পাসওয়ার্ড\' দিয়ে থাকে যা দিয়ে পরবর্তীতে গ্রাহক সহজেই তার নিজস্ব প্রোফাইলে লগ-ইন করতে পারবে। যেন গ্রাহকের ইউজারনেম এবং পাসওয়ার্ড গোপনীয় থাকে তা নিশ্চিত করতে গ্রাহককে উক্ত তথ্য দুটো কারো সাথে শেয়ার করা থেকে বিরত থাকতে অনুরোধ করা হচ্ছে।',
                ],
            ],
        ];

        CmsPage::updateOrCreate(
            ['slug' => 'privacy-policy'],
            [
                'title' => 'Privacy Policy',
                'content' => '',
                'sections' => $privacySections,
                'is_published' => true,
                'meta_title' => 'Privacy Policy - TechMarket BD',
                'meta_description' => 'Privacy policy, information collection, and customer data safety guidelines at TechMarket BD.',
            ]
        );

        // 2. Warranty Policy
        $warrantySections = [
            [
                'badge' => 'ওয়ারেন্টি সেবা গ্রহণের আগে জানুন',
                'paragraphs' => [
                    '১ | টেকমার্কেট একটি রিটেইল সেল বা খুচরা বিক্রয় কেন্দ্র। তারা কোন ধরনের পণ্য প্রস্তুত করে না। তাই, ওয়ারেন্টি দাবি করা পণ্য ক্রেতার পক্ষ থেকে টেকমার্কেট সরাসরি সরবরাহকারী বা উৎপাদনকারীর কাছে পাঠায়। ওয়ারেন্টির ক্ষেত্রে আমরা আন্তর্জাতিক (পণ্য ভেদে), দেশীয় এবং বাংলাদেশ কম্পিউটার সমিতি (বিসিএস) কর্তৃক প্রদত্ত নীতিমালা অনুসরণ করি।',
                    '২ | পণ্যের ওয়ারেন্টি দাবি করার সময় অবশ্যই পণ্যের ক্রয় রশিদ অথবা পণ্য ক্রয়ের প্রমাণ উপস্থাপন করতে হবে, অন্যথায় ওয়ারেন্টি ক্লেইম গ্রহণ করা হবে না।',
                    '৩ | পণ্যের সরবরাহ এবং সহজলভ্যতার উপর ভিত্তি করে ওয়ারেন্টি সম্পন্ন হওয়ার সময়কাল পরিবর্তন হতে পারে। কোন পণ্য ওয়ারেন্টি ক্লেইম করার পর পণ্যটি ডেলিভারি পেতে সাধারণতঃ ৭ দিন সময় লাগলেও বিশেষ ক্ষেত্রে ৩০-৯০ দিন বা তার অধিক সময় লাগতে পারে; কারণ মেরামতের জন্য প্রয়োজনীয় যন্ত্রাংশ দেশে পর্যাপ্ত না থাকলে তা বিশেষভাবে আমদানি করতে হয় যা সময় সাপেক্ষ।',
                ],
            ],
            [
                'badge' => 'যেসব কারণে পণ্য ওয়ারেন্টির আওতায় আসবে না',
                'paragraphs' => [
                    '১ | পণ্যের ক্রয় রশিদ, বিল, ইনভয়েস বা কোনরূপ ক্রয়ের প্রমাণপত্র না থাকে তবে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '২ | পণ্যের কোন অংশ যদি পুড়ে যায়, ভেঙ্গে যায়, কোন অংশ বসে যায়, টেম্পারিং হয়, লেয়ার কাটিং, মরিচা পড়া, বাকা হয়ে যাওয়া, ফাঙ্গাস পড়া, কোন পোর্টে ফাটা দাগ, ফাটা হওয়ার মত দাগ পাওয়া যায় সেক্ষেত্রে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '৩ | পণ্যের স্টিকার বা সিরিয়াল নাম্বার উঠে যাওয়া বা অস্পষ্ট অবস্থায় পাওয়া যায় সেক্ষেত্রে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '৪ | ল্যাপটপ/নোটবুক কম্পিউটারের ক্ষেত্রে ব্যাটারি, চার্জার এবং অন্যান্য আনুষঙ্গিক যন্ত্রাংশের ওয়ারেন্টি ১ বছরের অধিক নয় এবং তা মূল পণ্যের ওয়ারেন্টির অন্তর্ভুক্ত নয়।',
                    '৫ | পণ্যের কেসিং-এর ভিতরের কোন যন্ত্রাংশ পরিবর্তন এবং সিরিয়াল নাম্বার অমিল পাওয়া যায় সেক্ষেত্রে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '৬ | পণ্যের লক বা হক ভাঙ্গা অথবা খোলার চেষ্টা হয়েছে তা সনাক্ত হয় সেক্ষেত্রে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '৭ | পণ্যের স্ক্রিনে যদি স্ক্র্যাচ বা দাগ বেশি পড়া অবস্থায় পাওয়া যায় সেক্ষেত্রে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '৮ | পণ্যের কোন যন্ত্রাংশ যদি পোকা-মাকড়ের কারণে কোনরূপ ক্ষয়ক্ষতি বা বিনষ্ট অবস্থায় পাওয়া যায় সেক্ষেত্রে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '৯ | পণ্যের স্ক্রিনে আঘাতের কারণে কোন গোলাকার বা অর্দ্ধেক অনুরূপ কোন ক্ষতি সনাক্ত হলে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '১০ | তরল পদার্থ ব্যবহারের কারণে পণ্যের কোন ক্ষয়ক্ষতি হয় বা তরল পদার্থ পণ্যের ভিতরে প্রবেশ করে তবে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '১১ | পণ্যের অপব্যবহারের ফলে যদি কোন ক্ষয়ক্ষতি হয় তবে তা ওয়ারেন্টির আওতায় আসবে না।',
                    '১২ | মনিটরের ডেড পিক্সেল (Dead Pixel) বা স্টাক পিক্সেল (Stuck Pixel) এর ওয়ারেন্টি ক্লেইম করতে হলে ন্যূনতম ৩ বা তার অধিক ডেড/স্টাক পিক্সেল দৃশ্যমান হতে হবে।',
                    '১৩ | কোন অদৃশ্য প্রোডাক্ট যেমনঃ মাদারবোর্ড, র‍্যাম কেবল ইত্যাদির ক্ষেত্রে ওয়ারেন্টি ক্লেইমে অবশ্যই পণ্যের সাথে তার বক্স প্রদান করতে হবে।',
                    '১৪ | যদি কোন পণ্য এমন হয়ে থাকে যার গায়ে কোন সিরিয়াল থাকে না কিন্তু বক্সে সিরিয়াল থাকে, যেমনঃ হেডফোন, ইয়ারফোন, স্মার্ট ওয়াচ, কেবল ইত্যাদি পণ্যের ওয়ারেন্টির ক্ষেত্রে বক্স আবশ্যক।',
                    '১৫ | কোন পণ্য যদি ক্রেতা নিজে অথবা অননুমোদিত সার্ভিসিং থেকে মেরামত করার চেষ্টা করেন তাহলে ওয়ারেন্টি বাতিল বলে গণ্য হবে।',
                    '১৬ | কাস্টমাইজড সিস্টেমের ক্ষেত্রে অপারেটিং সিস্টেম কখনই ওয়ারেন্টির আওতায় পড়বে না।',
                ],
            ],
            [
                'badge' => 'সেলস রিটার্ন পলিসি',
                'paragraphs' => [
                    '১ | নির্দিষ্ট সময়ের মধ্যে কোন পণ্যের সরবরাহের ঘাটতি থাকলে ক্রেতাকে বিকল্প কোন পণ্য গ্রহণের প্রস্তাব দেয়া হবে অথবা মূল্য ফেরত দেয়া হবে। মূল্য ফেরতের ক্ষেত্রে সরবরাহকারী পলিসির পূর্ণ বিক্রয় মূল্য অথবা ব্যবহারের সময়সীমার উপর ভিত্তি করে আংশিক মূল্য ফেরত দিতে পারে।',
                    '২ | ক্ষেত্রবিশেষে কোন পণ্য সরবরাহ না থাকলে ক্রেতা বিকল্প পণ্য নেয়ার ক্ষেত্রে আংশিক মূল্য সংযোজন (Adjustment) করতে হতে পারে।',
                ],
            ],
            [
                'badge' => 'লাইফ টাইম ওয়ারেন্টি পলিসি',
                'paragraphs' => [
                    ' বাজারে প্রচলিত পণ্য হিসেবে বিবেচিত হওয়ার সময়কাল পর্যন্ত ঐ পণ্যের ওয়ারেন্টি প্রদানকে লাইফটাইম ওয়ারেন্টি বুঝাবে। কোন পণ্যের লাইফটাইম ওয়ারেন্টির আওতায় ঐ পণ্যটি মার্কেটে প্রচলিত পণ্য হলে, ক্রেতা ওয়ারেন্টি সেবা প্রাপ্ত হবেন। কোন পণ্য EOL (End Of Life) হিসেবে গণ্য হলে অর্থাৎ যদি পণ্যটির উৎপাদন বন্ধ হয়ে যায় তা আর ওয়ারেন্টির আওতায় আসবে না। পণ্যের নতুন ভার্সন বাজারে আসলে তা পুরাতন ভার্সনের সাথে ওয়ারেন্টি সেবা পাবে না।',
                ],
            ],
            [
                'badge' => 'সার্ভিস ওয়ারেন্টি পলিসি',
                'paragraphs' => [
                    'সার্ভিস ওয়ারেন্টির অন্তর্ভুক্ত কোন পণ্য ওয়ারেন্টি সীমার মধ্যে থাকলে তা রিপেয়ার করার জন্য কোন বাড়তি মূল্য নেয়া হবে না, তবে যদি কোন যন্ত্রাংশ পরিবর্তন বা সংযোজন করতে হলে সেই যন্ত্রাংশের মূল্য ক্রেতা পরিশোধ করবেন।',
                ],
            ],
            [
                'badge' => 'সতর্কবার্তা',
                'paragraphs' => [
                    'ওয়ারেন্টি সংক্রান্ত যেকোনো ধরণের সিদ্ধান্ত পরিবর্তন, পরিবর্ধন ও বাতিল করার সম্পূর্ণ অধিকার টেকমার্কেট সংরক্ষণ করে।',
                ],
            ],
        ];

        CmsPage::updateOrCreate(
            ['slug' => 'warranty-policy'],
            [
                'title' => 'Warranty Policy',
                'content' => '',
                'sections' => $warrantySections,
                'is_published' => true,
                'meta_title' => 'Warranty Policy - TechMarket BD',
                'meta_description' => 'Official Warranty Policy, coverage guidelines and terms at TechMarket BD.',
            ]
        );

        // 3. Delivery Policy
        $deliverySections = [
            [
                'badge' => 'সাধারণ শর্তাবলী',
                'paragraphs' => [
                    'টেকমার্কেট-এর ওয়েবসাইটে অনলাইন অর্ডার করে সকল প্রোডাক্ট ঘরে বসেই ডেলিভারি পেতে পারেন বাংলাদেশের যেকোনো প্রান্তে!',
                    'পেমেন্ট কনফার্মেশন কল পাওয়ার পর ৪৮ ঘণ্টার মধ্যে ক্রেতাকে পেমেন্ট করতে হবে। নির্দিষ্ট সময়ের পর পেমেন্ট করলে পণ্যের স্টক শেষ হয়ে যাওয়ার সম্ভাবনা থাকে অথবা পণ্যের মূল্য পরিবর্তিত হতে পারে।',
                ],
            ],
            [
                'badge' => 'ঢাকার ভিতর অনলাইন ডেলিভারি এর শর্তাবলী',
                'paragraphs' => [
                    '• শুধুমাত্র ঢাকার মধ্যে অনলাইন অর্ডারের ক্ষেত্রে \'Cash on delivery (COD)\' সুবিধা রয়েছে।',
                    '• অর্ডার কনফার্ম হওয়ার ৩-৫ কার্যদিবসের মধ্যে ক্রেতা পণ্য ডেলিভারি পাবেন।',
                    '• ডেলিভারি চার্জ পণ্য ও স্থান ভেদে পরিবর্তন যোগ্য। ফ্রি ডেলিভারি সকল পণ্যের ক্ষেত্রে প্রযোজ্য নয়।',
                    '• আমাদের ডেলিভারি পার্টনারগণ (যেমন: RedX, Pathao, eCourier, SteadFast) তাদের নিজ নিজ শর্তাবলী সংরক্ষণ করেন।',
                    '• হোম ডেলিভারির ক্ষেত্রে ক্রেতা পণ্য ব্যবহার করে দেখার সুযোগ পাবেন না। তবে সম্ভব হয় তবে প্রোডাক্ট আনবক্সিং এর একটি ভিডিও ধারণ করবেন। কোন ধরনের ত্রুটিপূর্ণ পণ্য গ্রহণ করলে সাথে সাথে তা আমাদের অবগত করুন।',
                ],
            ],
            [
                'badge' => 'ঢাকার বাইরে অনলাইন ডেলিভারি এর শর্তাবলী',
                'paragraphs' => [
                    '• ঢাকার বাইরের অনলাইন অর্ডারের ক্ষেত্রে কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি করা হবে, প্রোডাক্ট এর বুকিং এর জন্য এর সম্পূর্ণ অথবা আংশিক মূল্য অগ্রিম প্রদান করতে হবে।',
                    '• কুরিয়ার সার্ভিস চার্জ এবং কন্ডিশনাল পে-মেন্ট এর চার্জ ক্রেতা প্রদান করবে। প্রোডাক্ট পৌঁছানোর সময় এবং ডেলিভারি চার্জ নির্ভর করবে নির্দিষ্ট কুরিয়ার সার্ভিস ও প্রোডাক্ট এর ভিন্নতার উপর।',
                    '• কুরিয়ার সার্ভিসে পরিবহনকালীন পণ্যের কোনরূপ ক্ষয়ক্ষতি হলে টেকমার্কেট তার দায়ভার বহন করবে না।',
                    '• পণ্য কুরিয়ারে বুকিং এর পর তার কোন দায়িত্ব আর টেকমার্কেটের নয়, তবে ক্রেতা চাইলে বুকিং নাম্বার ও বুকিং সংক্রান্ত যাবতীয় তথ্য টেকমার্কেট থেকে সংগ্রহ করতে পারবেন।',
                    '• কুরিয়ারে পাঠানো পণ্য ক্রেতা সরাসরি তার নিকটস্থ কুরিয়ার সার্ভিসের ব্রাঞ্চ থেকে সংগ্রহ করতে হবে।',
                ],
            ],
            [
                'badge' => 'থার্ড পার্টি পিকআপ পয়েন্ট',
                'paragraphs' => [
                    'আমাদের কিছু নির্দিষ্ট পার্টনার লোকেশন রয়েছে যেখান থেকে আপনি আপনার অর্ডার করা পণ্যটি সংগ্রহ করতে পারেন। এসব পিকআপ পয়েন্ট সম্পর্কে জানতে আমাদের সাথে যোগাযোগ করুন অথবা নিচে পিকআপ পয়েন্ট লিস্ট দেখুন।',
                ],
            ],
        ];

        CmsPage::updateOrCreate(
            ['slug' => 'delivery-policy'],
            [
                'title' => 'Delivery Policy',
                'content' => '',
                'sections' => $deliverySections,
                'is_published' => true,
                'meta_title' => 'Delivery Policy - TechMarket BD',
                'meta_description' => 'Fast and reliable nationwide delivery policies and courier terms across Bangladesh.',
            ]
        );

        // 4. Payment Terms
        $paymentSections = [
            [
                'badge' => 'Available Payment Methods',
                'paragraphs' => [
                    'আমাদের ওয়েবসাইটে উল্লেখিত সকল মূল্য শুধুমাত্র নগদ (ক্যাশ) অর্থে ক্রয়ের জন্য প্রযোজ্য। অন্যান্য পেমেন্ট মেথড যেমন, বিকাশ বা কার্ড ব্যবহার করে মূল্য পরিশোধ করলে বাড়তি চার্জ প্রযোজ্য হবে। যেকোনো অফারের মূল্যের ক্ষেত্রেও একই শর্ত প্রযোজ্য হবে।',
                    'আমরা যে সকল মাধ্যমে পেমেন্ট গ্রহণ করিঃ ক্যাশ, ভিসা কার্ড, মাস্টারকার্ড, এমেক্স কার্ড, বিকাশ, নগদ, রকেট, নেক্সাস পে, উপায়, ব্যাংক ট্রান্সফার।',
                    'All Prices mentioned on our website is valid if it is paid by cash (both online & offline). Any other payment method such as a card or bKash may cost you an additional charge. Any offer price is valid for cash purchase only.',
                    'We accept payment by following methods: Cash, Visa Card, Mastercard, American Express Card, bKash, Nagad, Upay, Rocket, Nexus Pay, Bank Transfer.',
                ],
            ],
            [
                'badge' => 'Cash Payment (নগদ প্রদান)',
                'paragraphs' => [
                    'আমাদের আউটলেটে নগদ অর্থ প্রদানের মাধ্যমে লেনদেন করা যাবে। ক্যাশ অন ডেলিভারি (COD) শুধুমাত্র ঢাকা সিটির মধ্যে প্রযোজ্য। আপাতত ঢাকার বাইরে COD সুবিধা পাওয়া যাবে না।',
                    'ক্যাশ অন ডেলিভারি (COD) অর্ডারের ক্ষেত্রে মোট টাকার উপর অতিরিক্ত ১% সার্ভিস চার্জ প্রযোজ্য হবে।',
                    'We accept cash transactions on purchases from our store. Cash on Delivery (COD) for online orders is only available inside Dhaka city. COD is not available outside Dhaka at the moment.',
                    '1% service charge will be added to the total amount for all Cash on Delivery (COD) orders.',
                ],
            ],
            [
                'badge' => 'Cheque Payment (চেক প্রদান)',
                'paragraphs' => [
                    'চেকের মাধ্যমে মূল্য পরিশোধ করলে চেক পাশ হওয়ার এবং টাকা আমাদের একাউন্টে জমা হওয়ার পর লেনদেন সম্পন্ন হবে এবং তারপর পণ্য হস্তান্তর করা হবে।',
                    'Bank Cheque is accepted only after it is honored and fully deposited into our account. After that product will be delivered.',
                ],
            ],
            [
                'badge' => 'Card Payment (কার্ড পেমেন্ট)',
                'paragraphs' => [
                    'আমরা নারায়াণগঞ্জ, উত্তরা, মিরপুর, রামপুরা, নিউ এলিফ্যান্ট রোড, চট্টগ্রাম ও সকল ব্রাঞ্চে ক্রেডিট ও ডেবিট কার্ডের মাধ্যমে লেনদেন গ্রহণ করি।',
                    'POS লেনদেনের ক্ষেত্রেঃ',
                    '• ভিসা ও মাস্টারকার্ডের ক্ষেত্রে ১.৫%++ চার্জ প্রযোজ্য',
                    '• আমেরিকান এক্সপ্রেস কার্ডের ক্ষেত্রে ২.৫%++ চার্জ প্রযোজ্য',
                    'SSLCOMMERZ লেনদেনের ক্ষেত্রেঃ',
                    '• ভিসা ও মাস্টারকার্ডের ক্ষেত্রে ২%++ চার্জ প্রযোজ্য',
                    '• আমেরিকান এক্সপ্রেস কার্ডের ক্ষেত্রে ৩%++ চার্জ প্রযোজ্য',
                    'We accept VISA, MasterCard, Amex, JCB, NexusPay, QCash credit & debit cards in all our branches and online transactions.',
                    'POS Transactions: 1.5%++ transaction charge for Visa, Mastercard; 2.5%++ transaction charge for Amex are applicable on POS transactions.',
                    'SSLCOMMERZ Transactions: 2%++ transaction charge for Visa, Mastercard; 3%++ transaction charge for Amex are applicable for SSLCOMMERZ online transactions.',
                    'বিদেশী কার্ড দিয়ে পেমেন্ট এর ক্ষেত্রে বাংলাদেশ ব্যাংক এর নির্দেশনা মোতাবেক ভেরিফিকেশন ডকুমেন্ট প্রদান করা বাধ্যতামূলক। অন্যথায় গেটওয়ের পেমেন্ট হোল্ড হয়ে থাকতে পারে।',
                ],
            ],
            [
                'badge' => 'Mobile Banking (মোবাইল ব্যাংকিং)',
                'paragraphs' => [
                    'আমরা মোবাইল পেমেন্ট গ্রহণ করে থাকি। লেনদেনের ক্ষেত্রে \'পেমেন্ট\' অপশন নির্বাচন করুন।',
                    '• বিকাশ মার্চেন্ট পেমেন্টের ক্ষেত্রে ১.৫%++ ও SSLCOMMERZ গেটওয়ে ব্যবহার করে পেমেন্ট করলে ২% চার্জ প্রযোজ্য হবে।',
                    '• রকেট মার্চেন্ট পেমেন্টের ক্ষেত্রে ১%++ ও SSLCOMMERZ গেটওয়ে ব্যবহার করে পেমেন্ট করলে ২% চার্জ প্রযোজ্য হবে।',
                    '• নগদ মার্চেন্ট পেমেন্টের ক্ষেত্রে ১.২%++ ও SSLCOMMERZ গেটওয়ে ব্যবহার করে পেমেন্ট করলে ২% চার্জ প্রযোজ্য হবে।',
                    'We Accept MFS payment. Use payment option while making the transaction.',
                    '• 1.5%++ transaction charges applicable for bKash merchant payment and 2% for SSL Gateway digital payment.',
                    '• 1%++ transaction charges applicable for Rocket merchant payment and 2% for SSL Gateway digital payment.',
                    '• 1.2%++ Transaction charge applicable for Nagad merchant payment and 2% on SSL Gateway.',
                ],
            ],
        ];

        CmsPage::updateOrCreate(
            ['slug' => 'payment-terms'],
            [
                'title' => 'Payment Terms',
                'content' => '',
                'sections' => $paymentSections,
                'is_published' => true,
                'meta_title' => 'Payment Terms - TechMarket BD',
                'meta_description' => 'Official payment terms, card POS fees, MFS charges, and bank transfer policies at TechMarket BD.',
            ]
        );

        // 5. Refund & Return Policy (Matching Reference Screenshot 1)
        $refundSections = [
            [
                'badge' => 'রিটার্ন ও রিফান্ড পলিসি',
                'paragraphs' => [
                    '১ | ক্রেতা যখন একটি পণ্য নিচ্ছে সে সময় যদি ত্রুটিপূর্ণ পরিস্থিতিতে পেয়ে থাকে সেই মুহূর্তেই মোড়ক খোলা যাবে না এবং স্টিকার কোনভাবে সরানো যাবে না। ক্রেতা যেভাবে প্রোডাক্টটি পেয়েছে সেভাবে অপরিবর্তিত অবস্থায় পণ্যটিকে টেকমার্কেটে ফেরত পাঠাতে হবে।',
                    '২ | পণ্যটি হাতে পাওয়ার পর আমরা কোনোরকম ত্রুটি আছে কিনা তা যাচাই করে দেখব। পণ্যটি যদি খোলা হয়ে থাকে সেক্ষেত্রে ভিডিও করে রাখা অত্যাবশ্যক। যদি গ্রাহকের দ্বারা কোনোভাবে পণ্যটি ক্ষতিগ্রস্ত হয়ে থাকে সেক্ষেত্রে গ্রাহক পণ্যটির গ্যারান্টির আওতাভুক্ত হবেন না। অন্যথায় আমরা গ্রাহককে ব্র্যান্ড থেকে সম্পূর্ণ নতুন একটি পণ্য বুঝিয়ে দেয়ার ব্যবস্থা করব।',
                    '৩ | যদি ফেরত দেওয়ার উপায় না থেকে থাকে সেক্ষেত্রে ক্রেতা পণ্যটির সমমূল্য ফেরত নেওয়ার জন্য আবেদন করতে পারবে।',
                    '৪ | বিকাশ/রকেট/কার্ড/POS/অনলাইন পেমেন্টের জন্য রিফান্ড চার্জ প্রযোজ্য হবে।',
                    '৫ | অতিরিক্ত ফি যেমনঃ ইএমআই চার্জ, বিকাশ চার্জ, গেটওয়ে চার্জ, EFT চার্জ ইত্যাদি ফেরতযোগ্য নয়।',
                    '৬ | গ্রাহক যদি পণ্য কেনার সময় কোনপ্রকার ক্যাশব্যাক পেয়ে থাকেন, প্রোডাক্ট রিটার্নের সময় ক্যাশব্যাক এর পরিমাণ সমন্বয় করা হবে।',
                    '1. If a product is received and is in defective condition (Dead on Arrival) or damaged the product will be replaced with a new product. The product must be shipped back to TechMarket with all the original packaging and accessories with no damage to serial numbers.',
                    '2. Once the product is received, we will test it to see if the product is "Dead on Arrival" and inspect the product for any damages due to misuse, burn outs or wrong handling which does not cover under warranty policy, and after which if the product is found to be defective, we will get a new replacement from the brand and send it directly to user. In case a replacement is not available an alternative will be suggested, or a full refund will be offered. It is highly recommended to make an unboxing video of the product. Inform us immediately when you receive any defective or damaged goods.',
                    '3. If there is no replacement unit available then the user can request a refund.',
                    '4. Refund charges will be applicable for bKash/Rocket/Cards/POS/Online payments.',
                    '5. Additional fees such as EMI Charge, bKash charge, gateway charge, EFT charge etc. are non-refundable.',
                    '6. If the customer availed cash back offer during purchase, it will be adjusted during the sales return of the product.',
                ],
            ],
            [
                'badge' => 'রিটার্নস',
                'paragraphs' => [
                    '১ | বিক্রি হওয়া পণ্য কোন উপযুক্ত কারণ ছাড়া ফেরত বা পরিবর্তন করা যাবে না।',
                    '২ | অনলাইনে কোন পণ্য ক্রয় করার পর যদি যে পণ্য অর্ডার করেছে ঐ পণ্য না হয় অথবা বাহির থেকে দেখে পণ্যটি ক্ষতিগ্রস্ত মনে হয় তাহলে ক্রেতা ফেরত দিতে পারবে।',
                    '৩ | ক্রেতা কোন ব্যবহৃত পণ্য ফেরত দিতে পারবে না।',
                    '1. Goods once sold cannot be returned or exchanged without a valid reason.',
                    '2. In case of online purchase customer can return the goods if it is not the same model or the product seems damaged from outside.',
                    '3. User cannot return any used product.',
                ],
            ],
            [
                'badge' => 'রিফান্ড ও রিটার্ন পলিসি যেসব কারণে বৈধ হবে না',
                'paragraphs' => [
                    '১ | অনিচ্ছাকৃত পণ্যটি অর্ডার করেছি, এখন আমার এই পণ্যটি দরকার নেই।',
                    '২ | আমি পণ্যটি কেনার আগে দেখার জন্য অর্ডার করেছি।',
                    '৩ | আমি এই মুহূর্তে পণ্যটি নিতে আগ্রহী নই।',
                    '৪ | আমি পণ্যটি যেমন ভেবেছি আসলে তেমন নয়।',
                    '1. I don\'t want the product now, I ordered it unintentionally.',
                    '2. I like to try the product before taking it.',
                    '3. I have changed my mind; I don\'t want to take it now.',
                    '4. Product is not like my imagination.',
                ],
            ],
        ];

        CmsPage::updateOrCreate(
            ['slug' => 'refund-and-return-policy'],
            [
                'title' => 'Refund & Return Policy',
                'content' => '',
                'sections' => $refundSections,
                'is_published' => true,
                'meta_title' => 'Refund & Return Policy - TechMarket BD',
                'meta_description' => 'Comprehensive refund, return, Dead on Arrival (DOA) replacement terms at TechMarket BD.',
            ]
        );

        // 6. Terms & Conditions (Matching Reference Screenshot 2)
        $termsSections = [
            [
                'badge' => 'পণ্যের বিবরণী',
                'paragraphs' => [
                    'টেকমার্কেট তার ওয়েবসাইটে প্রদর্শিত যেকোনো পণ্যের দাম, স্পেসিফিকেশন এবং শর্তাবলী কোনো পূর্ব ঘোষণা ছাড়াই পরিবর্তন করার ক্ষমতা রাখে।',
                    'কোনো টাইপোগ্রাফি বা ফটোগ্রাফিক ত্রুটির জন্য টেকমার্কেট দায়ী নয়। আমাদের ওয়েবসাইটের সমস্ত ছবি ডিজিটালিভাবে তৈরি অথবা অন্যান্য ওয়েবসাইট থেকে সংগ্রহ করা হয়েছে। বাস্তব পণ্যের সাথে ওয়েবসাইটের প্রদর্শিত পণ্যের রঙ, এবং টেক্সচার, আকার ইত্যাদি ভিন্ন হতে পারে।',
                    'পণ্যের স্টক ও সহজলভ্যতা পরিবর্তনশীল। টেকমার্কেটের ওয়েবসাইটে কোন পণ্য যদি "In Stock" হিসেবে প্রদর্শিত হয় সেই ক্ষেত্রেও পণ্যটি না থাকার ক্ষুদ্র সম্ভাবনা থাকতে পারে।',
                    'মানবীয় ত্রুটি এবং অন্যান্য কারণের কারণে, আমরা গ্যারান্টি দিতে পারি না যে সমস্ত আইটেমের বিবরণ, ফটোগ্রাফ, রেফারেন্স, বিস্তারিত স্পেসিফিকেশন, মূল্য, লিঙ্ক এবং অন্যান্য তথ্য সম্পূর্ণ সঠিক, টেকমার্কেট এই ত্রুটির জন্য দায়ী নয়।',
                    'Price, specifications, and terms of offers are subject to change without any prior notice.',
                    'TechMarket is not responsible for typographical and/or photographic errors. All the images shown on our website are either digitally enhanced or taken from different websites. Products color, size and texture may differ from what is shown on the website.',
                    'Stock availability is subject to change. If a product is listed as "In Stock" on our website, there is still a chance that the product might already be out of stock.',
                    'Due to human error and other determinate, we cannot guarantee that all item descriptions, photographs, compatibility references, detailed specifications, pricing, links and any other product-related information listed is entirely accurate, complete or current, nor can we assume responsibility for these errors.',
                ],
            ],
            [
                'badge' => 'পেমেন্টের শর্তাবলী',
                'paragraphs' => [
                    'যেকোনো অর্ডারের পেমেন্ট করার আগে আপনার পণ্য টি স্টক এ আছে কিনা সেটা নিশ্চিত হয়ে নিন। আমাদের সকল প্রকার ডিজিটাল পেমেন্ট SSLCOMMERZ গেটওয়ের মাধ্যমে হয়ে থাকে। ডিজিটাল পেমেন্ট রিফান্ডের জন্য ১০-১৫ কার্যদিবস সময় লাগতে পারে এবং চার্জের অতিরিক্ত চার্জও লাগতে পারে, পেমেন্টের সময় নেয়া কোনোপ্রকার অতিরিক্ত ফি রিফান্ডের আওতায় আসবে না। ডিজিটাল পেমেন্টের সকল শর্তাবলী এবং অধিকার SSLCOMMERZ সংরক্ষণ করে।',
                    'আরও জানতে নিম্নের পেইজ গুলো ভিজিট করুনঃ',
                    '• টেকমার্কেটের বিস্তারিত পেমেন্ট পলিসি',
                    '• টেকমার্কেটের EMI পলিসি এবং এর শর্তসমূহ',
                    '• টেকমার্কেটের রিফান্ড ও রিটার্ন পলিসি',
                    'It is highly recommended to make sure the stock availability before making any payment. Online payment will be received through SSLCOMMERZ digital payment gateway. Additional gateway charges will be applicable with online payment.',
                    'If any payment needs to be refunded it may take 10-15 working days and it may even cost you additional charges, additional fees that is deducted during the payment will not be refunded in refund request. All payment terms and rights will be reserved by SSLCOMMERZ. Please carefully read the Payment Terms in detail before making any transaction.',
                    'For more detailed information, please visit:',
                    '• TechMarket\'s Payment Policy',
                    '• TechMarket\'s EMI Policy',
                    '• TechMarket\'s Return & Refund Policy',
                ],
            ],
            [
                'badge' => 'অর্ডার ও ডেলিভারি',
                'paragraphs' => [
                    'আপনার অর্ডারের প্রোডাক্টটি যদি আমাদের স্টকে থাকে এবং আপনার পেমেন্ট সম্পূর্ণ হয়ে থাকে, তাহলে অর্ডারটি ২৪-৭২ ঘণ্টার মধ্যে প্রসেসিং করা হবে। আমরা সেদিন দিনে যেকোনো পণ্য ডেলিভারির নিশ্চয়তা বা বিকল্প দেশের প্রায় সকল সাইটে আমরা পণ্য ডেলিভারির দিয়ে থাকি। সাপ্তাহিক ছুটি বা বন্ধের দিনে অর্ডার প্রসেসিং বা পণ্য ডেলিভারি যেকোনো পূর্ব ঘোষণা ছাড়াই বাতিল করার ক্ষমতা রাখে।',
                    'যদি আমাদের ওয়েবসাইটে দুর্ঘটনাবশত কোনো পণ্যের টাইপোগ্রাফিক্যাল, তথ্যগত, প্রযুক্তিগত বা অন্যান্য ত্রুটির কারণে ভুল মূল্য থাকে, তাহলে টেকমার্কেট সেই পণ্যের জন্য যেকোনো অর্ডার প্রত্যাখ্যান বা বাতিল করার এবং অবিলম্বে ভুল তথ্য পরিবর্তন, সংশোধন বা অপসারণ করার অধিকার রাখে।',
                    'আরও জানতে আমাদের ডেলিভারি সংক্রান্ত শর্তাবলী পড়ুন।',
                    'You can expect your order to be processed within approximately 48-72 hours, provided the items are in stock and there are no problems with payment verification. Although TechMarket does not guarantee same-day shipping we shall strive to do so wherever possible. Orders are not processed on weekends and holidays.',
                    'TechMarket reserves all right to cancel your order or reverse it without prior notice. In the event a product listed on our website is labeled with an incorrect price due to some typographical, informational, technical, or other error, TechMarket shall at its sole discretion have the right to refuse and/or cancel any order for said product and immediately amend, correct and/or remove the inaccurate information.',
                    'For more information, please read our Delivery Terms.',
                ],
            ],
            [
                'badge' => 'ওয়ারেন্টি গ্রহণের শর্তসমূহ',
                'paragraphs' => [
                    'ওয়ারেন্টি ক্লেইম করার জন্য গ্রাহক কে পণ্য ক্রয়ের প্রমাণ (চালান, ক্রয় রশিদ) বাধ্যতামূলক প্রদর্শন করতে হবে। ওয়ারেন্টি সম্পন্ন হওয়ার পর যদি পণ্যটি ক্রেতার ঠিকানায় পাঠাতে হয় তার জন্য গ্রাহক কে রিটার্ন শিপিং চার্জ প্রদান করতে হবে। টেকমার্কেট যে কাউকে ওয়ারেন্টি পরিষেবা প্রত্যাখ্যান করার বা বাতিল করার অধিকার সংরক্ষণ করে।',
                    'আরও জানতে নিম্নের পেইজ গুলো ভিজিট করুনঃ',
                    '• টেকমার্কেটের বিস্তারিত ওয়ারেন্টি পলিসি',
                    '• টেকমার্কেটের রিফান্ড ও রিটার্ন পলিসি',
                    'The customer needs to provide proof of purchase (invoice, money receipt) to claim a warranty. Customer will pay return shipping charges for all warranty services. TechMarket reserves the right to refuse service to anyone.',
                    'TechMarket cannot guarantee the compatibility of items. Please contact the manufacturer(s) directly if you have issues or concerns regarding compatibility.',
                    'For more detailed information, please visit:',
                    '• TechMarket\'s Warranty Policy',
                    '• TechMarket\'s Return & Refund Policy',
                ],
            ],
        ];

        CmsPage::updateOrCreate(
            ['slug' => 'terms-and-conditions'],
            [
                'title' => 'Terms & Conditions',
                'content' => '',
                'sections' => $termsSections,
                'is_published' => true,
                'meta_title' => 'Terms & Conditions - TechMarket BD',
                'meta_description' => 'Official terms of service, purchasing conditions, orders, and warranty terms at TechMarket BD.',
            ]
        );
    }
}
