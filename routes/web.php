<?php

use App\Http\Controllers\ShopController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductQuestionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\AnalyticsSettingController;
use App\Http\Controllers\Admin\ProductFeedController;
use App\Http\Controllers\Admin\MarketingAnalyticsController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\TrackingEventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AccountController;
use App\Models\CmsPage;
use App\Models\BlogPost;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Search Engine & Crawler Routes (SEO)
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'sitemap'])->name('seo.sitemap');
Route::get('/robots.txt', [\App\Http\Controllers\SitemapController::class, 'robots'])->name('seo.robots');
Route::get('/{key}.txt', [\App\Http\Controllers\SitemapController::class, 'indexNowKey'])->where('key', '^[a-zA-Z0-9_-]{16,64}$')->name('seo.indexnow');

// Public Storefront Routes
Route::get('/', [ShopController::class, 'home'])->name('home');
Route::get('/shop', [ShopController::class, 'catalog'])->name('shop');
Route::get('/catalog', [ShopController::class, 'catalog'])->name('catalog');
Route::get('/category/{slug}', [ShopController::class, 'category'])->name('category.show');
Route::get('/product/{slug}', [ShopController::class, 'product'])->name('product.show');
Route::get('/products/{slug}', [ShopController::class, 'product'])->name('products.show.alias');
Route::get('/compare', [\App\Http\Controllers\CompareController::class, 'index'])->name('compare');
Route::get('/compare/search', [\App\Http\Controllers\CompareController::class, 'search'])->name('compare.search');
Route::post('/compare/add', [\App\Http\Controllers\CompareController::class, 'add'])->name('compare.add');
Route::post('/compare/remove/{product}', [\App\Http\Controllers\CompareController::class, 'remove'])->name('compare.remove');
Route::post('/compare/clear', [\App\Http\Controllers\CompareController::class, 'clear'])->name('compare.clear');

// PC Builder Interactive Suite
Route::get('/pc-builder', [\App\Http\Controllers\PcBuilderController::class, 'index'])->name('pcBuilder.index');
Route::get('/pc-builder/build/component/choose/{component}', [\App\Http\Controllers\PcBuilderController::class, 'choose'])->name('pcBuilder.choose');
Route::get('/pc-builder/build/component/change/{component}', [\App\Http\Controllers\PcBuilderController::class, 'choose'])->name('pcBuilder.change');
Route::get('/pc-builder/choose/{component}', [\App\Http\Controllers\PcBuilderController::class, 'choose'])->name('pcBuilder.choose.alias');
Route::post('/pc-builder/add/{component}/{product}', [\App\Http\Controllers\PcBuilderController::class, 'add'])->name('pcBuilder.add');
Route::post('/pc-builder/remove/{component}', [\App\Http\Controllers\PcBuilderController::class, 'remove'])->name('pcBuilder.remove');
Route::post('/pc-builder/clear', [\App\Http\Controllers\PcBuilderController::class, 'clear'])->name('pcBuilder.clear');
Route::post('/pc-builder/add-to-cart', [\App\Http\Controllers\PcBuilderController::class, 'addToCart'])->name('pcBuilder.addToCart');
Route::post('/pc-builder/save', [\App\Http\Controllers\PcBuilderController::class, 'saveBuild'])->name('pcBuilder.save');
Route::post('/pc-builder/load/{savedBuild}', [\App\Http\Controllers\PcBuilderController::class, 'loadBuild'])->name('pcBuilder.load');
Route::delete('/pc-builder/builds/{savedBuild}', [\App\Http\Controllers\PcBuilderController::class, 'deleteBuild'])->name('pcBuilder.delete');

// CCTV Estimator / Surveillance System Builder
Route::get('/cctv-estimator', [\App\Http\Controllers\CctvEstimatorController::class, 'index'])->name('cctvEstimator.index');
Route::post('/cctv-estimator/add-to-cart', [\App\Http\Controllers\CctvEstimatorController::class, 'addToCart'])->name('cctvEstimator.addToCart');

// CCTV Commercial Quotation & Lifecycle
Route::get('/quotes/{token}', [\App\Http\Controllers\CctvQuoteViewController::class, 'show'])->name('cctvQuote.show');
Route::get('/quotes/{token}/print', [\App\Http\Controllers\CctvQuoteViewController::class, 'print'])->name('cctvQuote.print');
Route::post('/quotes/{token}/approve', [\App\Http\Controllers\CctvQuoteViewController::class, 'approve'])->name('cctvQuote.approve');
Route::post('/quotes/{token}/convert-to-cart', [\App\Http\Controllers\CctvQuoteViewController::class, 'convertToCart'])->name('cctvQuote.convertToCart');

// CCTV Site Survey & Engineering Assessment
Route::get('/site-survey', [\App\Http\Controllers\CctvSiteSurveyController::class, 'create'])->name('cctvSurvey.create');
Route::post('/site-survey', [\App\Http\Controllers\CctvSiteSurveyController::class, 'store'])->name('cctvSurvey.store');
Route::get('/site-survey/{surveyNumber}', [\App\Http\Controllers\CctvSiteSurveyController::class, 'show'])->name('cctvSurvey.show');

// Storefront Content Pages
Route::get('/about-us', [\App\Http\Controllers\ContentPageController::class, 'aboutUs'])->name('about-us');
Route::get('/brands', [\App\Http\Controllers\PublicBrandController::class, 'index'])->name('brands.index');
Route::get('/brand/{slug}', [\App\Http\Controllers\PublicBrandController::class, 'show'])->name('brands.show');
Route::get('/blog', [\App\Http\Controllers\PublicBlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [\App\Http\Controllers\PublicBlogController::class, 'show'])->name('blog.show');
Route::get('/servicing', [\App\Http\Controllers\ContentPageController::class, 'servicing'])->name('servicing');
Route::post('/servicing/request', [\App\Http\Controllers\ContentPageController::class, 'storeServiceRequest'])->middleware('throttle:10,1')->name('servicing.request');
Route::get('/emi-info', [\App\Http\Controllers\ContentPageController::class, 'emiInfo'])->name('emi-info');

// Storefront Useful Tools Suite
Route::get('/tools', [\App\Http\Controllers\ToolsController::class, 'index'])->name('tools.index');
Route::get('/tools/btu-calculator', [\App\Http\Controllers\ToolsController::class, 'btuCalculator'])->name('tools.btu');
Route::get('/tools/emi-calculator', [\App\Http\Controllers\ToolsController::class, 'emiCalculator'])->name('tools.emi');
Route::get('/tools/third-party-pickup-points', [\App\Http\Controllers\ToolsController::class, 'thirdPartyPickupPoints'])->name('tools.pickup');

// Storefront Offers & Campaign Routes
Route::get('/offers', [\App\Http\Controllers\PublicOfferController::class, 'index'])->name('offers.index');
Route::get('/offers/{slug}', [\App\Http\Controllers\PublicOfferController::class, 'show'])->name('offers.show');
Route::get('/offers/{offerSlug}/{productSlug}', [\App\Http\Controllers\PublicOfferController::class, 'showProduct'])->name('offers.product');

// Storefront Order & Service Tracking
Route::get('/track-order', function () {
    return Inertia::render('TrackOrder');
})->name('track-order');

Route::get('/track-request', function () {
    return redirect()->to('/servicing#track-request-section');
})->name('track-request');

Route::get('/servicing/track', function () {
    return redirect()->to('/servicing#track-request-section');
})->name('servicing.track');

// Storefront Complain Box
Route::get('/complain-box', function () {
    return Inertia::render('ComplainBox');
})->name('complain-box');

Route::post('/complain-box', function (\Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'phone' => 'required|string|max:20',
        'email' => 'required|email|max:255',
        'subject' => 'required|string|max:255',
        'details' => 'required|string|max:2000',
    ]);

    \App\Models\SupportTicket::create([
        'ticket_number' => 'TCK-' . strtoupper(\Illuminate\Support\Str::random(8)),
        'customer_id' => auth()->id(),
        'customer_name' => $validated['name'],
        'customer_email' => $validated['email'],
        'customer_phone' => $validated['phone'],
        'subject' => $validated['subject'],
        'inquiry_text' => $validated['details'],
        'priority' => 'high',
        'status' => 'new',
    ]);

    return back()->with('success', 'Your complaint has been submitted successfully.');
})->middleware('throttle:10,1')->name('complain-box.submit');

// Dynamic CMS Routes
Route::get('/privacy-policy', function () {
    $page = CmsPage::where('slug', 'privacy-policy')->first();
    return Inertia::render('CmsPage', [
        'title' => $page ? $page->title : 'Privacy Policy',
        'slug' => 'privacy-policy',
        'content' => $page ? $page->content : '',
        'sections' => $page ? $page->sections : null,
        'updated_at' => $page && $page->updated_at ? $page->updated_at->format('d F, Y') : '15 July, 2026',
        'meta_title' => 'Privacy Policy - TechMarket BD',
        'meta_description' => 'Privacy policy, information collection, and customer data safety guidelines at TechMarket BD.',
    ]);
})->name('privacy-policy');

Route::get('/warranty-policy', function () {
    $page = CmsPage::where('slug', 'warranty-policy')->first();
    return Inertia::render('CmsPage', [
        'title' => $page ? $page->title : 'Warranty Policy',
        'slug' => 'warranty-policy',
        'content' => $page ? $page->content : '',
        'sections' => $page ? $page->sections : null,
        'updated_at' => $page && $page->updated_at ? $page->updated_at->format('d F, Y') : '15 July, 2026',
        'meta_title' => 'Warranty Policy - TechMarket BD',
        'meta_description' => 'Official Warranty Policy, coverage guidelines and terms at TechMarket BD.',
    ]);
})->name('warranty-policy');

Route::get('/delivery-policy', function () {
    $page = CmsPage::where('slug', 'delivery-policy')->first();
    return Inertia::render('CmsPage', [
        'title' => $page ? $page->title : 'Delivery Policy',
        'slug' => 'delivery-policy',
        'content' => $page ? $page->content : '',
        'sections' => $page ? $page->sections : null,
        'updated_at' => $page && $page->updated_at ? $page->updated_at->format('d F, Y') : '15 July, 2026',
        'meta_title' => 'Delivery Policy - TechMarket BD',
        'meta_description' => 'Fast and reliable nationwide delivery policies and courier terms across Bangladesh.',
    ]);
})->name('delivery-policy');

Route::get('/payment-terms', function () {
    $page = CmsPage::where('slug', 'payment-terms')->first();
    return Inertia::render('CmsPage', [
        'title' => $page ? $page->title : 'Payment Terms',
        'slug' => 'payment-terms',
        'content' => $page ? $page->content : '',
        'sections' => $page ? $page->sections : null,
        'updated_at' => $page && $page->updated_at ? $page->updated_at->format('d F, Y') : '15 July, 2026',
        'meta_title' => 'Payment Terms - TechMarket BD',
        'meta_description' => 'Official payment terms, card POS fees, MFS charges, and bank transfer policies at TechMarket BD.',
    ]);
})->name('payment-terms');

Route::get('/refund-and-return-policy', function () {
    $page = CmsPage::where('slug', 'refund-and-return-policy')->first();
    return Inertia::render('CmsPage', [
        'title' => $page ? $page->title : 'Refund & Return Policy',
        'slug' => 'refund-and-return-policy',
        'content' => $page ? $page->content : '',
        'sections' => $page ? $page->sections : null,
        'updated_at' => $page && $page->updated_at ? $page->updated_at->format('d F, Y') : '15 July, 2026',
        'meta_title' => 'Refund & Return Policy - TechMarket BD',
        'meta_description' => 'Comprehensive refund, return, Dead on Arrival (DOA) replacement terms at TechMarket BD.',
    ]);
})->name('refund-and-return-policy');

Route::get('/refund-policy', fn () => redirect()->route('refund-and-return-policy'));
Route::get('/shipping-delivery', fn () => redirect()->route('delivery-policy'));
Route::get('/shipping-policy', fn () => redirect()->route('delivery-policy'));
Route::get('/terms-conditions', fn () => redirect()->route('terms-and-conditions'));
Route::get('/privacy', fn () => redirect()->route('privacy-policy'));
Route::get('/warranty', fn () => redirect()->route('warranty-policy'));

Route::get('/terms-and-conditions', function () {
    $page = CmsPage::where('slug', 'terms-and-conditions')->first();
    return Inertia::render('CmsPage', [
        'title' => $page ? $page->title : 'Terms & Conditions',
        'slug' => 'terms-and-conditions',
        'content' => $page ? $page->content : '',
        'sections' => $page ? $page->sections : null,
        'updated_at' => $page && $page->updated_at ? $page->updated_at->format('d F, Y') : '15 July, 2026',
        'meta_title' => 'Terms & Conditions - TechMarket BD',
        'meta_description' => 'Official terms of service, purchasing conditions, orders, and warranty terms at TechMarket BD.',
    ]);
})->name('terms-and-conditions');

Route::get('/page/{slug}', function ($slug) {
    if ($slug === 'complain-box') {
        return redirect()->route('complain-box');
    }
    if ($slug === 'about-us') {
        return redirect()->route('about-us');
    }
    if ($slug === 'servicing' || $slug === 'service-centers') {
        return redirect()->route('servicing');
    }
    if ($slug === 'emi-information' || $slug === 'emi-policy') {
        return redirect()->route('emi.info');
    }

    $page = CmsPage::where('slug', $slug)->first();
    if (!$page) {
        $formattedTitle = ucwords(str_replace('-', ' ', $slug));
        $page = new CmsPage([
            'title' => $formattedTitle,
            'slug' => $slug,
            'content' => '',
            'sections' => null,
            'updated_at' => now(),
        ]);
    }
    return Inertia::render('CmsPage', [
        'title' => $page->title,
        'slug' => $slug,
        'content' => $page->content,
        'sections' => $page->sections,
        'updated_at' => $page->updated_at ? $page->updated_at->format('d F, Y') : '15 July, 2026',
        'meta_title' => $page->meta_title ?? ($page->title . ' - TechMarket BD'),
        'meta_description' => $page->meta_description ?? substr(strip_tags($page->content ?: $page->title), 0, 160),
    ]);
})->name('cms.show');

// SSLCommerz Payment Callbacks
Route::post('/payment/sslcommerz/success', [PaymentController::class, 'sslCommerzSuccess'])->name('payment.sslcommerz.success');
Route::post('/payment/sslcommerz/fail', [PaymentController::class, 'sslCommerzFail'])->name('payment.sslcommerz.fail');
Route::post('/payment/sslcommerz/cancel', [PaymentController::class, 'sslCommerzCancel'])->name('payment.sslcommerz.cancel');
Route::post('/payment/sslcommerz/ipn', [PaymentController::class, 'sslCommerzIpn'])->name('payment.sslcommerz.ipn');

// Customer Q&A Submission
Route::post('/questions', [ProductQuestionController::class, 'store'])->middleware(['auth', 'throttle:10,1'])->name('questions.store');

// Cart Routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/add-multiple', [CartController::class, 'addMultiple'])->name('cart.addMultiple');
Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
Route::post('/cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon.apply');
Route::delete('/cart/coupon', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove');
Route::post('/cart/points', [CartController::class, 'applyPoints'])->name('cart.points.apply');
Route::delete('/cart/points', [CartController::class, 'removePoints'])->name('cart.points.remove');

// Wishlist Routes (Accessible for both guests and logged-in customers)
Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
Route::post('/wishlist/merge', [WishlistController::class, 'merge'])->name('wishlist.merge');

Route::middleware('auth')->group(function () {
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
});

// Storefront Product Reviews & Questions
Route::post('/reviews', [\App\Http\Controllers\Storefront\ProductInteractionController::class, 'storeReview'])->name('storefront.reviews.store');
Route::post('/questions', [\App\Http\Controllers\Storefront\ProductInteractionController::class, 'storeQuestion'])->name('storefront.questions.store');

// Checkout & Invoice
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/invoice/{orderNumber}', [CheckoutController::class, 'invoice'])->name('checkout.invoice');

// Payment Result Page
Route::get('/payment/result/{orderNumber}', [\App\Http\Controllers\PaymentController::class, 'result'])->name('payment.result');

// bKash Payment Routes
Route::get('/payment/bkash/process/{orderNumber}', [\App\Http\Controllers\Payment\BkashController::class, 'process'])->name('payment.bkash.process');
Route::post('/payment/bkash/confirm/{orderNumber}', [\App\Http\Controllers\Payment\BkashController::class, 'confirm'])->name('payment.bkash.confirm');
Route::post('/payment/bkash/cancel/{orderNumber}', [\App\Http\Controllers\Payment\BkashController::class, 'cancel'])->name('payment.bkash.cancel');
Route::post('/payment/bkash/retry/{orderNumber}', [\App\Http\Controllers\Payment\BkashController::class, 'retry'])->name('payment.bkash.retry');

// Nagad Payment Routes
Route::get('/payment/nagad/process/{orderNumber}', [\App\Http\Controllers\Payment\NagadController::class, 'process'])->name('payment.nagad.process');
Route::post('/payment/nagad/confirm/{orderNumber}', [\App\Http\Controllers\Payment\NagadController::class, 'confirm'])->name('payment.nagad.confirm');
Route::post('/payment/nagad/cancel/{orderNumber}', [\App\Http\Controllers\Payment\NagadController::class, 'cancel'])->name('payment.nagad.cancel');
Route::post('/payment/nagad/retry/{orderNumber}', [\App\Http\Controllers\Payment\NagadController::class, 'retry'])->name('payment.nagad.retry');

// Customer Dashboard / Profile
Route::get('/dashboard', function () {
    $user = auth()->user();
    $orders = \App\Models\Order::with('items')->where('user_id', $user->id)->latest()->get();
    $addresses = \App\Models\Address::where('user_id', $user->id)->get();
    $wishlists = \App\Models\Wishlist::with('product')->where('user_id', $user->id)->get();

    return Inertia::render('Dashboard', [
        'user' => $user,
        'orders' => $orders,
        'addresses' => $addresses,
        'wishlists' => $wishlists,
    ]);
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Customer Account Suite (TechLand Reference UI)
Route::middleware('auth')->prefix('account')->group(function () {
    Route::get('/', fn () => redirect()->route('account.profile'))->name('account');
    Route::get('/profile', [AccountController::class, 'profile'])->name('account.profile');
    Route::get('/orders', fn () => redirect()->route('account.orders.history'))->name('account.orders');
    Route::get('/orders/history', [AccountController::class, 'orderHistory'])->name('account.orders.history');
    Route::get('/notifications', [AccountController::class, 'notifications'])->name('account.notifications');
    Route::get('/password/change', [AccountController::class, 'changePassword'])->name('account.password.change');
    Route::get('/reward-points', [AccountController::class, 'rewardPoints'])->name('account.reward-points');
    Route::get('/saved-pc-builds', [AccountController::class, 'savedPcBuilds'])->name('account.saved-pc-builds');
    Route::get('/service-requests', [AccountController::class, 'serviceRequests'])->name('account.service-requests');
    Route::get('/cctv-equipment', [\App\Http\Controllers\CctvCustomerServiceController::class, 'equipment'])->name('account.cctv.equipment');
    Route::get('/cctv-services', [\App\Http\Controllers\CctvCustomerServiceController::class, 'serviceRequests'])->name('account.cctv.services');
    Route::get('/cctv-services/create', [\App\Http\Controllers\CctvCustomerServiceController::class, 'createServiceRequest'])->name('account.cctv.services.create');
    Route::post('/cctv-services', [\App\Http\Controllers\CctvCustomerServiceController::class, 'storeServiceRequest'])->name('account.cctv.services.store');
    Route::get('/cctv-projects', [\App\Http\Controllers\CctvEnterpriseProjectController::class, 'index'])->name('account.cctv.projects');
    Route::get('/cctv-projects/{id}', [\App\Http\Controllers\CctvEnterpriseProjectController::class, 'show'])->name('account.cctv.projects.show');
    Route::post('/cctv-projects', [\App\Http\Controllers\CctvEnterpriseProjectController::class, 'store'])->name('account.cctv.projects.store');
    Route::post('/cctv-projects/{projectId}/sites', [\App\Http\Controllers\CctvEnterpriseProjectController::class, 'storeSite'])->name('account.cctv.projects.sites.store');
    Route::post('/cctv-projects/{projectId}/change-requests', [\App\Http\Controllers\CctvEnterpriseProjectController::class, 'storeChangeRequest'])->name('account.cctv.projects.cr.store');
});

// Admin Panel Routes
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard.alias');
    
    // Store Settings & Dynamic Admin Appearance
    Route::get('/settings', [SettingController::class, 'index'])->name('admin.settings');
    Route::post('/settings', [SettingController::class, 'update'])->name('admin.settings.update');
    Route::post('/settings/clear-cache', [SettingController::class, 'clearCache'])->name('admin.settings.clearCache');
    Route::get('/settings/appearance', [SettingController::class, 'appearance'])->name('admin.settings.appearance');
    Route::post('/settings/appearance', [SettingController::class, 'updateAppearance'])->name('admin.settings.appearance.update');
    Route::post('/settings/appearance/reset', [SettingController::class, 'resetAppearance'])->name('admin.settings.appearance.reset');

    // Central Media Library (Inertia View)
    Route::get('/media', [MediaController::class, 'index'])->name('admin.media');
    Route::get('/media/optimizer', [MediaController::class, 'optimizer'])->name('admin.media.optimizer');
    Route::post('/media/optimizer/process', [MediaController::class, 'processOptimizer'])->name('admin.media.optimizer.process');
    Route::post('/media/optimizer/settings', [MediaController::class, 'saveOptimizerSettings'])->name('admin.media.optimizer.settings');
    Route::get('/media/data', [MediaController::class, 'apiList'])->name('admin.media.data');
    Route::get('/media/folders', [MediaController::class, 'folders'])->name('admin.media.folders');
    Route::get('/api/media', [MediaController::class, 'apiList'])->name('admin.media.api');
    Route::post('/media/upload', [MediaController::class, 'upload'])->name('admin.media.upload');
    Route::put('/media/{media}', [MediaController::class, 'update'])->name('admin.media.update');
    Route::delete('/media/{media}', [MediaController::class, 'destroy'])->name('admin.media.delete');

    // Banners
    Route::get('/banners', [BannerController::class, 'index'])->name('admin.banners');
    Route::get('/banners/create', [BannerController::class, 'create'])->name('admin.banners.create');
    Route::post('/banners', [BannerController::class, 'store'])->name('admin.banners.store');
    Route::get('/banners/{banner}/edit', [BannerController::class, 'edit'])->name('admin.banners.edit');
    Route::put('/banners/{banner}', [BannerController::class, 'update'])->name('admin.banners.update');
    Route::delete('/banners/{banner}', [BannerController::class, 'destroy'])->name('admin.banners.delete');

    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])->name('admin.categories');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('admin.categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('admin.categories.store');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('admin.categories.edit');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('admin.categories.delete');

    // Brands
    Route::get('/brands', [BrandController::class, 'index'])->name('admin.brands');
    Route::get('/brands/create', [BrandController::class, 'create'])->name('admin.brands.create');
    Route::post('/brands', [BrandController::class, 'store'])->name('admin.brands.store');
    Route::get('/brands/{brand}/edit', [BrandController::class, 'edit'])->name('admin.brands.edit');
    Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('admin.brands.update');
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('admin.brands.delete');

    // Coupons
    Route::get('/coupons', [CouponController::class, 'index'])->name('admin.coupons');
    Route::get('/coupons/create', [CouponController::class, 'create'])->name('admin.coupons.create');
    Route::post('/coupons', [CouponController::class, 'store'])->name('admin.coupons.store');
    Route::get('/coupons/{coupon}/edit', [CouponController::class, 'edit'])->name('admin.coupons.edit');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('admin.coupons.update');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('admin.coupons.delete');

    // Products Management
    Route::get('/products', [AdminController::class, 'products'])->name('admin.products');
    Route::get('/products/create', [AdminController::class, 'createProduct'])->name('admin.products.create');
    Route::post('/products', [AdminController::class, 'storeProduct'])->name('admin.products.store');
    Route::get('/products/{product}', [AdminController::class, 'showProduct'])->name('admin.products.show');
    Route::get('/products/{product}/edit', [AdminController::class, 'editProduct'])->name('admin.products.edit');
    Route::put('/products/{product}', [AdminController::class, 'updateProduct'])->name('admin.products.update');
    Route::delete('/products/{product}', [AdminController::class, 'deleteProduct'])->name('admin.products.delete');
    Route::post('/products/bulk-seo', [AdminController::class, 'bulkSeoActions'])->name('admin.products.bulkSeo');
    Route::post('/products/bulk-prices', [AdminController::class, 'bulkPriceUpdate'])->name('admin.products.bulkPrices');

    // Orders Management
    Route::get('/orders', [AdminController::class, 'orders'])->name('admin.orders');
    Route::get('/orders/{order}', [AdminController::class, 'showOrder'])->name('admin.orders.show');
    Route::post('/orders/{order}/status', [AdminController::class, 'updateOrderStatus'])->name('admin.orders.status');

    // Payments Workspace & Manual Verification
    Route::get('/payments', [PaymentController::class, 'adminIndex'])->name('admin.payments');
    Route::post('/payments/{order}/approve', [PaymentController::class, 'adminApprove'])->name('admin.payments.approve');
    Route::post('/payments/{order}/reject', [PaymentController::class, 'adminReject'])->name('admin.payments.reject');

    // Product Q&A Moderation
    Route::get('/questions', [ProductQuestionController::class, 'adminIndex'])->name('admin.questions');
    Route::post('/questions/{question}/answer', [ProductQuestionController::class, 'adminAnswer'])->name('admin.questions.answer');
    Route::delete('/questions/{question}', [ProductQuestionController::class, 'adminDestroy'])->name('admin.questions.delete');

    // Customers
    Route::get('/customers', [CustomerController::class, 'index'])->name('admin.customers');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->whereNumber('customer')->name('admin.customers.show');

    // Inventory Ledger Workspace
    Route::get('/inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('admin.inventory');
    Route::post('/inventory/adjust', [\App\Http\Controllers\Admin\InventoryController::class, 'adjust'])->name('admin.inventory.adjust');

    // Units Management
    Route::get('/units', [\App\Http\Controllers\Admin\UnitController::class, 'index'])->name('admin.units');
    Route::post('/units', [\App\Http\Controllers\Admin\UnitController::class, 'store'])->name('admin.units.store');
    Route::put('/units/{unit}', [\App\Http\Controllers\Admin\UnitController::class, 'update'])->name('admin.units.update');
    Route::delete('/units/{unit}', [\App\Http\Controllers\Admin\UnitController::class, 'destroy'])->name('admin.units.delete');

    // Enterprise Bulk Data Import & Export Management
    Route::get('/data-management', [\App\Http\Controllers\Admin\BulkDataController::class, 'index'])->name('admin.data-management');
    Route::get('/data-management/import', [\App\Http\Controllers\Admin\BulkDataController::class, 'importWizard'])->name('admin.data-management.import');
    Route::post('/data-management/import/upload', [\App\Http\Controllers\Admin\BulkDataController::class, 'uploadFile'])->name('admin.data-management.import.upload');
    Route::post('/data-management/import/{id}/preview', [\App\Http\Controllers\Admin\BulkDataController::class, 'previewAndValidate'])->name('admin.data-management.import.preview');
    Route::post('/data-management/import/{id}/execute', [\App\Http\Controllers\Admin\BulkDataController::class, 'execute'])->name('admin.data-management.import.execute');
    Route::get('/data-management/import/{id}/status', [\App\Http\Controllers\Admin\BulkDataController::class, 'status'])->name('admin.data-management.import.status');
    Route::post('/data-management/import/{id}/cancel', [\App\Http\Controllers\Admin\BulkDataController::class, 'cancel'])->name('admin.data-management.import.cancel');
    Route::get('/data-management/import/{id}/errors', [\App\Http\Controllers\Admin\BulkDataController::class, 'downloadErrors'])->name('admin.data-management.import.errors');
    Route::get('/data-management/export', [\App\Http\Controllers\Admin\BulkDataController::class, 'exportStudio'])->name('admin.data-management.export');
    Route::post('/data-management/export', [\App\Http\Controllers\Admin\BulkDataController::class, 'executeExport'])->name('admin.data-management.export.execute');
    Route::get('/data-management/history', [\App\Http\Controllers\Admin\BulkDataController::class, 'history'])->name('admin.data-management.history');
    Route::get('/data-management/template/{entity}/{format?}', [\App\Http\Controllers\Admin\BulkDataController::class, 'downloadTemplate'])->name('admin.data-management.template');

    // Dynamic Specification Groups & Attributes
    Route::get('/specifications', [\App\Http\Controllers\Admin\SpecificationController::class, 'index'])->name('admin.specifications');
    Route::post('/specifications/groups', [\App\Http\Controllers\Admin\SpecificationController::class, 'storeGroup'])->name('admin.specifications.groups.store');
    Route::post('/specifications/attributes', [\App\Http\Controllers\Admin\SpecificationController::class, 'storeAttribute'])->name('admin.specifications.attributes.store');
    Route::delete('/specifications/groups/{group}', [\App\Http\Controllers\Admin\SpecificationController::class, 'deleteGroup'])->name('admin.specifications.groups.delete');
    Route::delete('/specifications/attributes/{attribute}', [\App\Http\Controllers\Admin\SpecificationController::class, 'deleteAttribute'])->name('admin.specifications.attributes.delete');

    // Flash Sales Campaigns
    Route::get('/flash-sales', [\App\Http\Controllers\Admin\FlashSaleController::class, 'index'])->name('admin.flash-sales');
    Route::post('/flash-sales', [\App\Http\Controllers\Admin\FlashSaleController::class, 'store'])->name('admin.flash-sales.store');
    Route::post('/flash-sales/{flashSale}/toggle', [\App\Http\Controllers\Admin\FlashSaleController::class, 'toggle'])->name('admin.flash-sales.toggle');
    Route::delete('/flash-sales/{flashSale}', [\App\Http\Controllers\Admin\FlashSaleController::class, 'destroy'])->name('admin.flash-sales.delete');

    // Product Reviews Moderation
    Route::get('/reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index'])->name('admin.reviews');
    Route::post('/reviews/{review}/status', [\App\Http\Controllers\Admin\ReviewController::class, 'updateStatus'])->name('admin.reviews.status');
    Route::delete('/reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy'])->name('admin.reviews.delete');

    // Security Audit Log Explorer
    Route::get('/audit-logs', [\App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('admin.audit-logs');

    // Sales & Analytics Reports
    Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->middleware('permission:reports.view')->name('admin.reports');
    Route::get('/reports/sales', [\App\Http\Controllers\Admin\ReportController::class, 'sales'])->middleware('permission:reports.sales')->name('admin.reports.sales');
    Route::get('/reports/products', [\App\Http\Controllers\Admin\ReportController::class, 'products'])->middleware('permission:reports.products')->name('admin.reports.products');
    Route::get('/reports/inventory', [\App\Http\Controllers\Admin\ReportController::class, 'inventory'])->middleware('permission:reports.inventory')->name('admin.reports.inventory');
    Route::get('/reports/customers', [\App\Http\Controllers\Admin\ReportController::class, 'customers'])->middleware('permission:reports.customers')->name('admin.reports.customers');
    Route::get('/reports/operations', [\App\Http\Controllers\Admin\ReportController::class, 'operations'])->middleware('permission:reports.operations')->name('admin.reports.operations');
    Route::get('/reports/export', [\App\Http\Controllers\Admin\ReportController::class, 'export'])->middleware('permission:reports.export')->name('admin.reports.export');

    // Admin Global Search
    Route::get('/search', [\App\Http\Controllers\Admin\SearchController::class, 'search'])->middleware('permission:admin.search')->name('admin.search');

    // =========================================================================
    // ENTERPRISE ERP: POS, SALES, PURCHASES, INVENTORY & ACCOUNTS
    // =========================================================================

    // POS / Point of Sale
    Route::get('/pos', [\App\Http\Controllers\Admin\PosController::class, 'index'])->name('admin.pos');
    Route::get('/pos/customers/search', [\App\Http\Controllers\Admin\PosController::class, 'searchCustomers'])->name('admin.pos.customers.search');
    Route::post('/pos/customers', [\App\Http\Controllers\Admin\PosController::class, 'createCustomer'])->name('admin.pos.customers.create');
    Route::get('/pos/customers/default-walkin', [\App\Http\Controllers\Admin\PosController::class, 'getDefaultWalkIn'])->name('admin.pos.customers.defaultWalkin');
    Route::get('/pos/customers/{customer}', [\App\Http\Controllers\Admin\PosController::class, 'getCustomer'])->name('admin.pos.customers.show');
    Route::put('/pos/customers/{customer}', [\App\Http\Controllers\Admin\PosController::class, 'updateCustomer'])->name('admin.pos.customers.update');
    Route::post('/pos/checkout', [\App\Http\Controllers\Admin\PosController::class, 'checkout'])->name('admin.pos.checkout');
    Route::post('/pos/hold', [\App\Http\Controllers\Admin\PosController::class, 'hold'])->name('admin.pos.hold');
    Route::delete('/pos/held/{sale}', [\App\Http\Controllers\Admin\PosController::class, 'deleteHeld'])->name('admin.pos.deleteHeld');

    // Sales Operations
    Route::get('/sales', [\App\Http\Controllers\Admin\SalesController::class, 'index'])->name('admin.sales');
    Route::get('/sales/{sale}', [\App\Http\Controllers\Admin\SalesController::class, 'show'])->name('admin.sales.show');
    Route::post('/sales/{sale}/refund', [\App\Http\Controllers\Admin\SalesController::class, 'refund'])->name('admin.sales.refund');

    // Suppliers Management
    Route::get('/suppliers/search', [\App\Http\Controllers\Admin\SuppliersController::class, 'search'])->name('admin.suppliers.search');
    Route::get('/suppliers', [\App\Http\Controllers\Admin\SuppliersController::class, 'index'])->name('admin.suppliers');
    Route::post('/suppliers', [\App\Http\Controllers\Admin\SuppliersController::class, 'store'])->name('admin.suppliers.store');
    Route::put('/suppliers/{supplier}', [\App\Http\Controllers\Admin\SuppliersController::class, 'update'])->name('admin.suppliers.update');
    Route::delete('/suppliers/{supplier}', [\App\Http\Controllers\Admin\SuppliersController::class, 'destroy'])->name('admin.suppliers.delete');

    // Purchases Management
    Route::get('/purchases', [\App\Http\Controllers\Admin\PurchasesController::class, 'index'])->name('admin.purchases');
    Route::post('/purchases', [\App\Http\Controllers\Admin\PurchasesController::class, 'store'])->name('admin.purchases.store');
    Route::post('/purchases/{purchase}/receive', [\App\Http\Controllers\Admin\PurchasesController::class, 'receive'])->name('admin.purchases.receive');
    Route::post('/purchases/{purchase}/payment', [\App\Http\Controllers\Admin\PurchasesController::class, 'addPayment'])->name('admin.purchases.payment');

    // Inventory & Warehouse Multi-Location Management
    Route::get('/inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('admin.inventory');
    Route::get('/inventory/overview', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('admin.inventory.index');
    Route::post('/inventory/adjust', [\App\Http\Controllers\Admin\InventoryController::class, 'adjust'])->name('admin.inventory.adjust');
    Route::get('/inventory/transfers', [\App\Http\Controllers\Admin\InventoryController::class, 'transfers'])->name('admin.inventory.transfers');
    Route::post('/inventory/transfers', [\App\Http\Controllers\Admin\InventoryController::class, 'storeTransfer'])->name('admin.inventory.transfers.store');
    Route::get('/inventory/counts', [\App\Http\Controllers\Admin\InventoryController::class, 'counts'])->name('admin.inventory.counts');
    Route::post('/inventory/counts', [\App\Http\Controllers\Admin\InventoryController::class, 'storeCount'])->name('admin.inventory.counts.store');
    Route::post('/inventory/counts/{stockCount}/approve', [\App\Http\Controllers\Admin\InventoryController::class, 'approveCount'])->name('admin.inventory.counts.approve');

    Route::get('/warehouses', [\App\Http\Controllers\Admin\WarehousesController::class, 'index'])->name('admin.warehouses');
    Route::post('/warehouses', [\App\Http\Controllers\Admin\WarehousesController::class, 'store'])->name('admin.warehouses.store');
    Route::put('/warehouses/{warehouse}', [\App\Http\Controllers\Admin\WarehousesController::class, 'update'])->name('admin.warehouses.update');

    // Accounts & Double-Entry Finance
    Route::get('/accounts', [\App\Http\Controllers\Admin\AccountsController::class, 'index'])->name('admin.accounts');
    Route::get('/accounts/chart-of-accounts', [\App\Http\Controllers\Admin\AccountsController::class, 'chartOfAccounts'])->name('admin.accounts.chartOfAccounts');
    Route::post('/accounts/chart-of-accounts', [\App\Http\Controllers\Admin\AccountsController::class, 'storeAccount'])->name('admin.accounts.storeAccount');
    Route::get('/accounts/transactions', [\App\Http\Controllers\Admin\AccountsController::class, 'transactions'])->name('admin.accounts.transactions');
    Route::get('/accounts/expenses', [\App\Http\Controllers\Admin\AccountsController::class, 'expenses'])->name('admin.accounts.expenses');
    Route::post('/accounts/expenses', [\App\Http\Controllers\Admin\AccountsController::class, 'storeExpense'])->name('admin.accounts.storeExpense');
    Route::get('/accounts/income', [\App\Http\Controllers\Admin\AccountsController::class, 'income'])->name('admin.accounts.income');
    Route::post('/accounts/income', [\App\Http\Controllers\Admin\AccountsController::class, 'storeIncome'])->name('admin.accounts.storeIncome');
    Route::get('/accounts/receivables', [\App\Http\Controllers\Admin\AccountsController::class, 'receivables'])->name('admin.accounts.receivables');
    Route::get('/accounts/payables', [\App\Http\Controllers\Admin\AccountsController::class, 'payables'])->name('admin.accounts.payables');
    Route::get('/accounts/cash-bank', [\App\Http\Controllers\Admin\AccountsController::class, 'cashBank'])->name('admin.accounts.cashBank');

    // Admin Users & RBAC Roles
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users');
    Route::post('/users/{user}/role', [\App\Http\Controllers\Admin\UserController::class, 'assignRole'])->name('admin.users.role');

    // Admin Enterprise Notification & Alert Center
    Route::get('/notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('admin.notifications');
    Route::get('/notifications/feed', [\App\Http\Controllers\Admin\NotificationController::class, 'feed'])->name('admin.notifications.feed');
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Admin\NotificationController::class, 'unreadCount'])->name('admin.notifications.unreadCount');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('admin.notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('admin.notifications.readAll');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('admin.notifications.destroy');
    Route::post('/notifications/bulk', [\App\Http\Controllers\Admin\NotificationController::class, 'bulk'])->name('admin.notifications.bulk');

    // Admin Notification Preferences & Alert Rules
    Route::get('/settings/notifications', [\App\Http\Controllers\Admin\NotificationSettingController::class, 'settings'])->name('admin.settings.notifications');
    Route::post('/settings/notifications', [\App\Http\Controllers\Admin\NotificationSettingController::class, 'updateSettings'])->name('admin.settings.notifications.update');
    Route::get('/settings/notification-rules', [\App\Http\Controllers\Admin\NotificationSettingController::class, 'rules'])->name('admin.settings.notificationRules');
    Route::post('/settings/notification-rules', [\App\Http\Controllers\Admin\NotificationSettingController::class, 'storeRule'])->name('admin.settings.notificationRules.store');
    Route::post('/settings/notification-rules/{rule}/toggle', [\App\Http\Controllers\Admin\NotificationSettingController::class, 'toggleRule'])->name('admin.settings.notificationRules.toggle');

    // Admin Abandoned Carts Recovery Workspace
    Route::get('/abandoned-carts', [\App\Http\Controllers\Admin\AbandonedCartController::class, 'index'])->name('admin.abandonedCarts');

    // Admin Marketing Automations Engine
    Route::get('/marketing-automations', [\App\Http\Controllers\Admin\MarketingAutomationController::class, 'index'])->name('admin.marketingAutomations');
    Route::post('/marketing-automations', [\App\Http\Controllers\Admin\MarketingAutomationController::class, 'store'])->name('admin.marketingAutomations.store');
    Route::post('/marketing-automations/{marketingAutomation}/toggle', [\App\Http\Controllers\Admin\MarketingAutomationController::class, 'toggle'])->name('admin.marketingAutomations.toggle');

    // Admin Operational System Health
    Route::get('/system-health', [\App\Http\Controllers\Admin\SystemHealthController::class, 'index'])->name('admin.systemHealth');

    // Admin Database Backups & Schedule Management
    Route::get('/backups', [\App\Http\Controllers\Admin\BackupController::class, 'index'])->name('admin.backups');
    Route::post('/backups', [\App\Http\Controllers\Admin\BackupController::class, 'store'])->name('admin.backups.store');
    Route::get('/backups/{backup}/download', [\App\Http\Controllers\Admin\BackupController::class, 'download'])->name('admin.backups.download');
    Route::delete('/backups/{backup}', [\App\Http\Controllers\Admin\BackupController::class, 'destroy'])->name('admin.backups.delete');
    Route::post('/backups/schedule', [\App\Http\Controllers\Admin\BackupController::class, 'updateSchedule'])->name('admin.backups.schedule');
    Route::post('/backups/run-scheduled-now', [\App\Http\Controllers\Admin\BackupController::class, 'runScheduledNow'])->name('admin.backups.runScheduledNow');
    Route::post('/backups/prune', [\App\Http\Controllers\Admin\BackupController::class, 'pruneExpired'])->name('admin.backups.prune');

    // Admin Unified Customer Support Workspace
    Route::get('/support', [\App\Http\Controllers\Admin\CustomerSupportController::class, 'index'])->name('admin.support');

    // Admin Navigation & Menu Manager
    Route::get('/navigation', [\App\Http\Controllers\Admin\NavigationController::class, 'index'])->name('admin.navigation');
    Route::post('/navigation', [\App\Http\Controllers\Admin\NavigationController::class, 'store'])->name('admin.navigation.store');
    Route::delete('/navigation/{navigation}', [\App\Http\Controllers\Admin\NavigationController::class, 'destroy'])->name('admin.navigation.delete');
    Route::get('/navigation/mega-menu/{category}', [\App\Http\Controllers\Admin\NavigationController::class, 'megaMenu'])->name('admin.navigation.megaMenu');
    Route::put('/navigation/mega-menu/{category}', [\App\Http\Controllers\Admin\NavigationController::class, 'updateMegaMenu'])->name('admin.navigation.megaMenu.update');
    Route::post('/navigation/categories/reorder', [\App\Http\Controllers\Admin\NavigationController::class, 'reorderCategories'])->name('admin.navigation.categories.reorder');
    Route::post('/navigation/categories/{category}/toggle', [\App\Http\Controllers\Admin\NavigationController::class, 'toggleCategoryVisibility'])->name('admin.navigation.categories.toggle');

    // Admin Header & Footer Dynamic Builder
    Route::get('/header-footer', [\App\Http\Controllers\Admin\HeaderFooterController::class, 'index'])->name('admin.headerFooter.index');
    Route::post('/header-footer/settings', [\App\Http\Controllers\Admin\HeaderFooterController::class, 'updateSettings'])->name('admin.headerFooter.settings');
    Route::post('/header-footer/links', [\App\Http\Controllers\Admin\HeaderFooterController::class, 'storeLink'])->name('admin.headerFooter.links.store');
    Route::put('/header-footer/links/{navigation}', [\App\Http\Controllers\Admin\HeaderFooterController::class, 'updateLink'])->name('admin.headerFooter.links.update');
    Route::delete('/header-footer/links/{navigation}', [\App\Http\Controllers\Admin\HeaderFooterController::class, 'deleteLink'])->name('admin.headerFooter.links.delete');
    Route::post('/header-footer/links/reorder', [\App\Http\Controllers\Admin\HeaderFooterController::class, 'reorderLinks'])->name('admin.headerFooter.links.reorder');

    // Admin Homepage & Layout Management
    Route::get('/homepage', [\App\Http\Controllers\Admin\HomepageController::class, 'index'])->middleware('permission:homepage.manage')->name('admin.homepage');
    Route::put('/homepage/sections/{section}', [\App\Http\Controllers\Admin\HomepageController::class, 'updateSection'])->middleware('permission:homepage.manage')->name('admin.homepage.sections.update');
    Route::post('/homepage/sections/reorder', [\App\Http\Controllers\Admin\HomepageController::class, 'reorderSections'])->middleware('permission:homepage.manage')->name('admin.homepage.sections.reorder');
    Route::post('/homepage/quick-actions', [\App\Http\Controllers\Admin\HomepageController::class, 'storeQuickAction'])->middleware('permission:homepage.manage')->name('admin.homepage.quickActions.store');
    Route::put('/homepage/quick-actions/{quickAction}', [\App\Http\Controllers\Admin\HomepageController::class, 'updateQuickAction'])->middleware('permission:homepage.manage')->name('admin.homepage.quickActions.update');
    Route::delete('/homepage/quick-actions/{quickAction}', [\App\Http\Controllers\Admin\HomepageController::class, 'destroyQuickAction'])->middleware('permission:homepage.manage')->name('admin.homepage.quickActions.delete');

    // Admin CMS Pages & Policy Manager
    Route::get('/pages', [\App\Http\Controllers\Admin\PageController::class, 'index'])->name('admin.pages.index');
    Route::get('/pages/create', [\App\Http\Controllers\Admin\PageController::class, 'create'])->name('admin.pages.create');
    Route::post('/pages', [\App\Http\Controllers\Admin\PageController::class, 'store'])->name('admin.pages.store');
    Route::get('/pages/{page}/edit', [\App\Http\Controllers\Admin\PageController::class, 'edit'])->name('admin.pages.edit');
    Route::put('/pages/{page}', [\App\Http\Controllers\Admin\PageController::class, 'update'])->name('admin.pages.update');
    Route::delete('/pages/{page}', [\App\Http\Controllers\Admin\PageController::class, 'destroy'])->name('admin.pages.delete');
    Route::post('/pages/{page}/toggle', [\App\Http\Controllers\Admin\PageController::class, 'toggle'])->name('admin.pages.toggle');
    Route::get('/pages/about-us', [\App\Http\Controllers\Admin\PageController::class, 'aboutUs'])->name('admin.pages.aboutUs');
    Route::post('/pages/about-us', [\App\Http\Controllers\Admin\PageController::class, 'updateAboutUs'])->name('admin.pages.aboutUs.update');

    // Admin Blog System
    Route::get('/blog', [\App\Http\Controllers\Admin\BlogController::class, 'index'])->name('admin.blog.index');
    Route::get('/blog/create', [\App\Http\Controllers\Admin\BlogController::class, 'create'])->name('admin.blog.create');
    Route::post('/blog', [\App\Http\Controllers\Admin\BlogController::class, 'store'])->name('admin.blog.store');
    Route::get('/blog/{post}/edit', [\App\Http\Controllers\Admin\BlogController::class, 'edit'])->name('admin.blog.edit');
    Route::put('/blog/{post}', [\App\Http\Controllers\Admin\BlogController::class, 'update'])->name('admin.blog.update');
    Route::delete('/blog/{post}', [\App\Http\Controllers\Admin\BlogController::class, 'destroy'])->name('admin.blog.delete');

    // Admin Customer Service & Repair Requests
    Route::get('/service-requests', [\App\Http\Controllers\Admin\ServiceRequestController::class, 'index'])->name('admin.serviceRequests');
    Route::put('/service-requests/{serviceRequest}', [\App\Http\Controllers\Admin\ServiceRequestController::class, 'updateStatus'])->name('admin.serviceRequests.status');

    // Admin EMI Financing Partners
    Route::get('/emi-partners', [\App\Http\Controllers\Admin\EmiPartnerController::class, 'index'])->name('admin.emiPartners');
    Route::post('/emi-partners', [\App\Http\Controllers\Admin\EmiPartnerController::class, 'store'])->name('admin.emiPartners.store');
    Route::put('/emi-partners/{emiPartner}', [\App\Http\Controllers\Admin\EmiPartnerController::class, 'update'])->name('admin.emiPartners.update');
    Route::delete('/emi-partners/{emiPartner}', [\App\Http\Controllers\Admin\EmiPartnerController::class, 'destroy'])->name('admin.emiPartners.delete');

    // Admin Offers & Campaign Management
    Route::get('/offers', [\App\Http\Controllers\Admin\OfferController::class, 'index'])->name('admin.offers.index');
    Route::get('/offers/create', [\App\Http\Controllers\Admin\OfferController::class, 'create'])->name('admin.offers.create');
    Route::post('/offers', [\App\Http\Controllers\Admin\OfferController::class, 'store'])->name('admin.offers.store');
    Route::get('/offers/{offer}/edit', [\App\Http\Controllers\Admin\OfferController::class, 'edit'])->name('admin.offers.edit');
    Route::put('/offers/{offer}', [\App\Http\Controllers\Admin\OfferController::class, 'update'])->name('admin.offers.update');
    Route::delete('/offers/{offer}', [\App\Http\Controllers\Admin\OfferController::class, 'destroy'])->name('admin.offers.delete');
    Route::post('/offers/{offer}/duplicate', [\App\Http\Controllers\Admin\OfferController::class, 'duplicate'])->name('admin.offers.duplicate');
    Route::post('/offers/{offer}/toggle', [\App\Http\Controllers\Admin\OfferController::class, 'toggle'])->name('admin.offers.toggle');

    // Admin AI Support Tickets & Escalated Chat Inquiries
    Route::resource('/support-tickets', \App\Http\Controllers\Admin\SupportTicketController::class)->names('admin.supportTickets');

    // Admin Payment Method Settings
    Route::get('/settings/payment-methods', [\App\Http\Controllers\Admin\PaymentMethodSettingController::class, 'index'])->name('admin.settings.paymentMethods');
    Route::post('/settings/payment-methods', [\App\Http\Controllers\Admin\PaymentMethodSettingController::class, 'update'])->name('admin.settings.paymentMethods.update');

    // Marketing Analytics & Diagnostics
    Route::get('/analytics', [MarketingAnalyticsController::class, 'index'])->name('admin.analytics');
    Route::get('/analytics/debug', [MarketingAnalyticsController::class, 'debug'])->name('admin.analytics.debug');

    // Landing Page Hub & Builder (Meta/Facebook Ads Optimized)
    Route::get('/marketing/landing-pages', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'index'])->name('admin.landingPages.index');
    Route::get('/marketing/landing-pages/create', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'create'])->name('admin.landingPages.create');
    Route::post('/marketing/landing-pages', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'store'])->name('admin.landingPages.store');
    Route::get('/marketing/landing-pages/templates', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'templates'])->name('admin.landingPages.templates');
    Route::get('/marketing/landing-pages/analytics/{landingPage?}', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'analytics'])->name('admin.landingPages.analytics');
    Route::get('/marketing/landing-pages/{landingPage}/edit', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'edit'])->name('admin.landingPages.edit');
    Route::put('/marketing/landing-pages/{landingPage}', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'update'])->name('admin.landingPages.update');
    Route::post('/marketing/landing-pages/{landingPage}/duplicate', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'duplicate'])->name('admin.landingPages.duplicate');
    Route::post('/marketing/landing-pages/{landingPage}/toggle', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'toggle'])->name('admin.landingPages.toggle');
    Route::delete('/marketing/landing-pages/{landingPage}', [\App\Http\Controllers\Admin\LandingPageAdminController::class, 'destroy'])->name('admin.landingPages.destroy');

    // Product Feeds Management
    Route::get('/marketing/feeds', [ProductFeedController::class, 'index'])->name('admin.marketing.feeds');
    Route::post('/marketing/feeds', [ProductFeedController::class, 'updateSettings'])->name('admin.marketing.feeds.update');

    // Tracking Settings
    Route::get('/settings/analytics', [AnalyticsSettingController::class, 'index'])->name('admin.settings.analytics');
    Route::post('/settings/analytics', [AnalyticsSettingController::class, 'update'])->name('admin.settings.analytics.update');

    // Central Shipments & Courier Delivery Management
    Route::get('/shipments', [\App\Http\Controllers\Admin\CourierController::class, 'index'])->name('admin.shipments');
    Route::get('/settings/courier', [\App\Http\Controllers\Admin\CourierController::class, 'settings'])->name('admin.settings.courier');
    Route::post('/settings/courier', [\App\Http\Controllers\Admin\CourierController::class, 'updateSettings'])->name('admin.settings.courier.update');
    Route::post('/settings/courier/test', [\App\Http\Controllers\Admin\CourierController::class, 'testConnection'])->name('admin.settings.courier.test');
    Route::get('/courier/locations', [\App\Http\Controllers\Admin\CourierController::class, 'locations'])->name('admin.courier.locations');
    Route::post('/orders/{order}/courier-book', [\App\Http\Controllers\Admin\CourierController::class, 'book'])->name('admin.orders.courier.book');
    Route::post('/shipments/{shipment}/track', [\App\Http\Controllers\Admin\CourierController::class, 'track'])->name('admin.shipments.track');
    Route::post('/shipments/{shipment}/cancel', [\App\Http\Controllers\Admin\CourierController::class, 'cancel'])->name('admin.shipments.cancel');

    // Customer Fraud Checker & Review System
    Route::get('/customers/fraud-checker', [\App\Http\Controllers\Admin\FraudController::class, 'checker'])->name('admin.customers.fraudChecker');
    Route::get('/customers/fraud-reviews', [\App\Http\Controllers\Admin\FraudController::class, 'reviews'])->name('admin.customers.fraudReviews');
    Route::post('/orders/{order}/fraud-check', [\App\Http\Controllers\Admin\FraudController::class, 'runCheck'])->name('admin.orders.fraudCheck');
    Route::post('/orders/{order}/fraud-review', [\App\Http\Controllers\Admin\FraudController::class, 'reviewOrder'])->name('admin.orders.fraudReview');
    Route::get('/settings/fraud', [\App\Http\Controllers\Admin\FraudController::class, 'settings'])->name('admin.settings.fraud');
    Route::post('/settings/fraud', [\App\Http\Controllers\Admin\FraudController::class, 'updateSettings'])->name('admin.settings.fraud.update');

    // SMS Gateway & Communication System
    Route::get('/communication/sms-dashboard', [\App\Http\Controllers\Admin\SmsController::class, 'dashboard'])->name('admin.sms.dashboard');
    Route::get('/settings/sms-gateways', [\App\Http\Controllers\Admin\SmsController::class, 'gateways'])->name('admin.sms.gateways');
    Route::post('/settings/sms-gateways/{smsGateway}', [\App\Http\Controllers\Admin\SmsController::class, 'updateGateway'])->name('admin.sms.gateways.update');
    Route::post('/settings/sms-gateways/{smsGateway}/test', [\App\Http\Controllers\Admin\SmsController::class, 'testGateway'])->name('admin.sms.gateways.test');
    
    Route::get('/communication/sms-templates', [\App\Http\Controllers\Admin\SmsController::class, 'templates'])->name('admin.sms.templates');
    Route::post('/communication/sms-templates/{smsTemplate}', [\App\Http\Controllers\Admin\SmsController::class, 'updateTemplate'])->name('admin.sms.templates.update');
    Route::post('/communication/sms-templates/{smsTemplate}/preview', [\App\Http\Controllers\Admin\SmsController::class, 'previewTemplate'])->name('admin.sms.templates.preview');

    Route::get('/communication/sms-logs', [\App\Http\Controllers\Admin\SmsController::class, 'logs'])->name('admin.sms.logs');
    Route::post('/communication/sms-logs/{smsLog}/retry', [\App\Http\Controllers\Admin\SmsController::class, 'retryLog'])->name('admin.sms.logs.retry');
    Route::get('/communication/sms-logs/export', [\App\Http\Controllers\Admin\SmsController::class, 'exportLogs'])->name('admin.sms.logs.export');

    Route::get('/communication/send-sms', [\App\Http\Controllers\Admin\SmsController::class, 'sendView'])->name('admin.sms.send');
    Route::post('/communication/send-sms', [\App\Http\Controllers\Admin\SmsController::class, 'sendManual'])->name('admin.sms.sendManual');

    Route::get('/settings/sms', [\App\Http\Controllers\Admin\SmsController::class, 'settings'])->name('admin.sms.settings');
    Route::post('/settings/sms', [\App\Http\Controllers\Admin\SmsController::class, 'updateSettings'])->name('admin.sms.settings.update');

    // Email Notification & Communication System
    Route::get('/communication/email-dashboard', [\App\Http\Controllers\Admin\EmailController::class, 'dashboard'])->name('admin.email.dashboard');

    Route::get('/communication/email-campaigns', [\App\Http\Controllers\Admin\EmailController::class, 'campaigns'])->name('admin.email.campaigns');
    Route::post('/communication/email-campaigns', [\App\Http\Controllers\Admin\EmailController::class, 'storeCampaign'])->name('admin.email.campaigns.store');
    Route::post('/communication/email-campaigns/{emailCampaign}/launch', [\App\Http\Controllers\Admin\EmailController::class, 'launchCampaign'])->name('admin.email.campaigns.launch');
    Route::delete('/communication/email-campaigns/{emailCampaign}', [\App\Http\Controllers\Admin\EmailController::class, 'destroyCampaign'])->name('admin.email.campaigns.destroy');
    Route::post('/communication/email-campaigns/preview-audience', [\App\Http\Controllers\Admin\EmailController::class, 'previewAudience'])->name('admin.email.campaigns.previewAudience');

    Route::get('/communication/email-templates', [\App\Http\Controllers\Admin\EmailController::class, 'templates'])->name('admin.email.templates');
    Route::post('/communication/email-templates', [\App\Http\Controllers\Admin\EmailController::class, 'storeTemplate'])->name('admin.email.templates.store');
    Route::post('/communication/email-templates/{emailTemplate}', [\App\Http\Controllers\Admin\EmailController::class, 'updateTemplate'])->name('admin.email.templates.update');
    Route::post('/communication/email-templates/{emailTemplate}/duplicate', [\App\Http\Controllers\Admin\EmailController::class, 'duplicateTemplate'])->name('admin.email.templates.duplicate');
    Route::delete('/communication/email-templates/{emailTemplate}', [\App\Http\Controllers\Admin\EmailController::class, 'destroyTemplate'])->name('admin.email.templates.destroy');
    Route::post('/communication/email-templates/{emailTemplate}/preview', [\App\Http\Controllers\Admin\EmailController::class, 'previewTemplate'])->name('admin.email.templates.preview');
    Route::post('/communication/email-templates/{emailTemplate}/test-send', [\App\Http\Controllers\Admin\EmailController::class, 'testSendTemplate'])->name('admin.email.templates.testSend');
    Route::post('/communication/email-builder/compile', [\App\Http\Controllers\Admin\EmailController::class, 'compileBuilderSchema'])->name('admin.email.builder.compile');

    Route::get('/communication/email-logs', [\App\Http\Controllers\Admin\EmailController::class, 'logs'])->name('admin.email.logs');
    Route::post('/communication/email-logs/{emailLog}/retry', [\App\Http\Controllers\Admin\EmailController::class, 'retryLog'])->name('admin.email.logs.retry');
    Route::get('/communication/email-logs/export', [\App\Http\Controllers\Admin\EmailController::class, 'exportLogs'])->name('admin.email.logs.export');

    Route::get('/settings/email', [\App\Http\Controllers\Admin\EmailController::class, 'settings'])->name('admin.email.settings');
    Route::post('/settings/email', [\App\Http\Controllers\Admin\EmailController::class, 'updateSettings'])->name('admin.email.settings.update');
    Route::post('/settings/email-gateways/{emailGateway?}', [\App\Http\Controllers\Admin\EmailController::class, 'updateGateway'])->name('admin.email.gateways.update');
    Route::post('/settings/email-gateways/{emailGateway}/test', [\App\Http\Controllers\Admin\EmailController::class, 'testGateway'])->name('admin.email.gateways.test');

    // CCTV Estimator Administration Suite
    Route::prefix('cctv')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\CctvAdminController::class, 'index'])->name('admin.cctv.dashboard');
        Route::get('/profiles', [\App\Http\Controllers\Admin\CctvAdminController::class, 'profiles'])->name('admin.cctv.profiles');
        Route::post('/profiles', [\App\Http\Controllers\Admin\CctvAdminController::class, 'storeProfile'])->name('admin.cctv.profiles.store');
        Route::delete('/profiles/{id}', [\App\Http\Controllers\Admin\CctvAdminController::class, 'destroyProfile'])->name('admin.cctv.profiles.destroy');

        Route::get('/rules', [\App\Http\Controllers\Admin\CctvAdminController::class, 'rules'])->name('admin.cctv.rules');
        Route::post('/rules', [\App\Http\Controllers\Admin\CctvAdminController::class, 'storeRule'])->name('admin.cctv.rules.store');
        Route::post('/rules/{id}/toggle-status', [\App\Http\Controllers\Admin\CctvAdminController::class, 'toggleRuleStatus'])->name('admin.cctv.rules.toggle');
        Route::delete('/rules/{id}', [\App\Http\Controllers\Admin\CctvAdminController::class, 'destroyRule'])->name('admin.cctv.rules.destroy');

        Route::get('/estimates', [\App\Http\Controllers\Admin\CctvAdminController::class, 'estimates'])->name('admin.cctv.estimates');
        Route::delete('/estimates/{id}', [\App\Http\Controllers\Admin\CctvAdminController::class, 'destroyEstimate'])->name('admin.cctv.estimates.destroy');

        Route::get('/quotes', [\App\Http\Controllers\Admin\CctvAdminController::class, 'quotes'])->name('admin.cctv.quotes');

        Route::get('/surveys', [\App\Http\Controllers\Admin\CctvAdminController::class, 'surveys'])->name('admin.cctv.surveys');
        Route::post('/surveys/{id}/status', [\App\Http\Controllers\Admin\CctvAdminController::class, 'updateSurveyStatus'])->name('admin.cctv.surveys.status');
        Route::post('/surveys/{id}/report', [\App\Http\Controllers\Admin\CctvAdminController::class, 'storeSurveyReport'])->name('admin.cctv.surveys.report');

        Route::get('/installations', [\App\Http\Controllers\Admin\CctvAdminController::class, 'installations'])->name('admin.cctv.installations');
        Route::post('/installations/{id}/status', [\App\Http\Controllers\Admin\CctvAdminController::class, 'updateInstallationStatus'])->name('admin.cctv.installations.status');

        Route::get('/services', [\App\Http\Controllers\Admin\CctvAdminController::class, 'services'])->name('admin.cctv.services');
        Route::post('/services', [\App\Http\Controllers\Admin\CctvAdminController::class, 'storeServiceType'])->name('admin.cctv.services.store');

        Route::get('/service-center', [\App\Http\Controllers\Admin\CctvAdminController::class, 'serviceCenterDashboard'])->name('admin.cctv.serviceCenter');
        Route::get('/service-requests', [\App\Http\Controllers\Admin\CctvAdminController::class, 'serviceRequests'])->name('admin.cctv.serviceRequests');
        Route::post('/service-requests/{id}/status', [\App\Http\Controllers\Admin\CctvAdminController::class, 'updateServiceRequestStatus'])->name('admin.cctv.serviceRequests.status');

        Route::get('/installed-equipment', [\App\Http\Controllers\Admin\CctvAdminController::class, 'installedEquipment'])->name('admin.cctv.installedEquipment');
        Route::post('/installed-equipment', [\App\Http\Controllers\Admin\CctvAdminController::class, 'storeInstalledEquipment'])->name('admin.cctv.installedEquipment.store');

        Route::get('/projects', [\App\Http\Controllers\Admin\CctvAdminController::class, 'projects'])->name('admin.cctv.projects');
        Route::get('/projects/{id}', [\App\Http\Controllers\Admin\CctvAdminController::class, 'projectDetails'])->name('admin.cctv.projects.details');
        Route::post('/projects/{id}/status', [\App\Http\Controllers\Admin\CctvAdminController::class, 'updateProjectStatus'])->name('admin.cctv.projects.status');

        Route::get('/settings', [\App\Http\Controllers\Admin\CctvAdminController::class, 'settings'])->name('admin.cctv.settings');
        Route::post('/settings', [\App\Http\Controllers\Admin\CctvAdminController::class, 'updateSettings'])->name('admin.cctv.settings.update');

        Route::get('/analytics', [\App\Http\Controllers\Admin\CctvAnalyticsAdminController::class, 'dashboard'])->name('admin.cctv.analytics');
        Route::get('/reports', [\App\Http\Controllers\Admin\CctvAnalyticsAdminController::class, 'reportBuilder'])->name('admin.cctv.reports');
        Route::post('/reports/save', [\App\Http\Controllers\Admin\CctvAnalyticsAdminController::class, 'saveReport'])->name('admin.cctv.reports.save');
        Route::get('/alerts', [\App\Http\Controllers\Admin\CctvAnalyticsAdminController::class, 'alertCenter'])->name('admin.cctv.alerts');

        Route::get('/test', [\App\Http\Controllers\Admin\CctvAdminController::class, 'ruleTester'])->name('admin.cctv.tester');
        Route::post('/test/run', [\App\Http\Controllers\Admin\CctvAdminController::class, 'runRuleTest'])->name('admin.cctv.tester.run');
    });

    // Database Backups & Restore Module
    Route::get('/backups', [\App\Http\Controllers\Admin\BackupController::class, 'index'])->name('admin.backups.index');
    Route::post('/backups', [\App\Http\Controllers\Admin\BackupController::class, 'store'])->name('admin.backups.store');
    Route::get('/backups/{backup}/download', [\App\Http\Controllers\Admin\BackupController::class, 'download'])->name('admin.backups.download');
    Route::delete('/backups/{backup}', [\App\Http\Controllers\Admin\BackupController::class, 'destroy'])->name('admin.backups.destroy');
    Route::post('/backups/{backup}/restore', [\App\Http\Controllers\Admin\BackupController::class, 'restore'])->name('admin.backups.restore');
    Route::post('/backups/upload-restore', [\App\Http\Controllers\Admin\BackupController::class, 'uploadRestore'])->name('admin.backups.uploadRestore');
    Route::post('/backups/schedule', [\App\Http\Controllers\Admin\BackupController::class, 'updateSchedule'])->name('admin.backups.schedule.update');
    Route::post('/backups/run-scheduled-now', [\App\Http\Controllers\Admin\BackupController::class, 'runScheduledNow'])->name('admin.backups.runScheduledNow');
    Route::post('/backups/prune', [\App\Http\Controllers\Admin\BackupController::class, 'pruneExpired'])->name('admin.backups.prune');
});

// Public Unsubscribe Endpoints
Route::get('/email/unsubscribe/{token}', [\App\Http\Controllers\EmailUnsubscribeController::class, 'show'])->name('email.unsubscribe.show');
Route::post('/email/unsubscribe/{token}', [\App\Http\Controllers\EmailUnsubscribeController::class, 'unsubscribe'])->middleware('throttle:30,1')->name('email.unsubscribe.process');

// Public Product Feeds for Meta Catalog, Google Merchant & Universal CSV
Route::get('/feeds/meta-products.xml', [FeedController::class, 'metaCatalogXml'])->name('feeds.meta.xml');
Route::get('/feeds/meta-products.csv', [FeedController::class, 'metaCatalogCsv'])->name('feeds.meta.csv');
Route::get('/feeds/products.csv', [FeedController::class, 'productsCsv'])->name('feeds.products.csv');
Route::get('/feeds/google-products.xml', [FeedController::class, 'googleMerchantXml'])->name('feeds.google.xml');
Route::get('/feeds/google-merchant.xml', [FeedController::class, 'googleMerchantXml'])->name('feeds.google-merchant.xml');

// Public Non-Blocking Tracking Events API
Route::post('/api/tracking/event', [TrackingEventController::class, 'logEvent'])->middleware('throttle:60,1')->name('tracking.event');

// AI Chatbot & Customer Assistant Routes
Route::post('/api/chatbot/message', [\App\Http\Controllers\ChatbotController::class, 'message'])->middleware('throttle:20,1')->name('chatbot.message');
Route::get('/api/chatbot/history', [\App\Http\Controllers\ChatbotController::class, 'history'])->middleware('throttle:30,1')->name('chatbot.history');
Route::post('/api/chatbot/escalate', [\App\Http\Controllers\ChatbotController::class, 'escalate'])->middleware('throttle:10,1')->name('chatbot.escalate');

// Customer Notifications Center
Route::middleware('auth')->group(function () {
    Route::get('/customer-notifications', [\App\Http\Controllers\CustomerNotificationController::class, 'index'])->name('customerNotifications');
    Route::post('/customer-notifications/{id}/read', [\App\Http\Controllers\CustomerNotificationController::class, 'markAsRead'])->name('customerNotifications.read');
    Route::post('/customer-notifications/read-all', [\App\Http\Controllers\CustomerNotificationController::class, 'markAllAsRead'])->name('customerNotifications.readAll');

    Route::post('/product-alerts/subscribe', [\App\Http\Controllers\ProductAlertController::class, 'subscribe'])->name('productAlerts.subscribe');
});

// High-Converting Landing Pages (Public Meta/Facebook Ads Optimized)
Route::get('/l/{slug}', [\App\Http\Controllers\LandingPageController::class, 'show'])->name('landingPage.show');
Route::post('/l/{slug}/order', [\App\Http\Controllers\LandingPageController::class, 'quickOrder'])->middleware('throttle:30,1')->name('landingPage.order');
Route::post('/l/{slug}/track', [\App\Http\Controllers\LandingPageController::class, 'trackEvent'])->middleware('throttle:60,1')->name('landingPage.track');

require __DIR__.'/auth.php';

// Universal Smart 404 Fallback Route
Route::fallback(function (\Illuminate\Http\Request $request) {
    $path = trim($request->path(), '/');

    // Smart typo autocorrect / canonical redirects
    if ($path === 'sitem' || $path === 'sitemap' || $path === 'sitemaps') {
        return redirect()->to('/sitemap.xml', 301);
    }
    if ($path === 'robot' || $path === 'robots') {
        return redirect()->to('/robots.txt', 301);
    }

    // Smart 404 Recovery Data
    $recommendedProducts = \App\Models\Product::where(function ($q) {
        $q->where('is_active', true)->orWhereNull('is_active');
    })
    ->where('is_featured', true)
    ->latest()
    ->take(8)
    ->get();

    if ($recommendedProducts->count() < 4) {
        $recommendedProducts = \App\Models\Product::where(function ($q) {
            $q->where('is_active', true)->orWhereNull('is_active');
        })
        ->latest()
        ->take(8)
        ->get();
    }

    $topCategories = \App\Models\Category::whereNull('parent_id')
        ->where('is_nav_visible', true)
        ->orderBy('sort_order')
        ->take(8)
        ->get();

    return \Inertia\Inertia::render('Errors/NotFound', [
        'status' => 404,
        'requestedPath' => $request->path(),
        'recommendedProducts' => $recommendedProducts,
        'topCategories' => $topCategories,
        'seo' => [
            'title' => '404 - Page Not Found | TechMarket BD',
            'description' => 'Sorry, the page or product you are looking for could not be found. Explore TechMarket BD for latest laptops, gaming computers and accessories.',
            'meta_robots' => 'noindex, nofollow',
        ],
    ])->toResponse($request)->setStatusCode(404);
});
