<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'TechMarket BD') }}</title>
        @php
            $siteFavicon = \App\Models\Setting::get('site_favicon');
        @endphp
        @if ($siteFavicon)
            <link rel="icon" href="{{ $siteFavicon }}">
        @else
            <link rel="icon" type="image/svg+xml" href="/favicon.svg">
            <link rel="alternate icon" href="/favicon.ico">
        @endif

        @php
            $googleVerification = \App\Models\Setting::get('google_search_console_code');
            $bingVerification = \App\Models\Setting::get('bing_webmaster_code');
            $customHeaderScripts = \App\Models\Setting::get('custom_header_scripts');
            $customFooterScripts = \App\Models\Setting::get('custom_footer_scripts');

            $props = $page['props'] ?? [];
            $seo = $props['seo'] ?? [];
            $product = $props['product'] ?? null;
            $siteName = \App\Models\Setting::get('site_name', config('app.name', 'TechMarket BD'));
            $siteLogo = \App\Models\Setting::get('site_logo', url('/storage/logo.png'));
            
            $metaTitle = $seo['title'] ?? ($product ? (($product['title'] ?? '') . " Price in Bangladesh | {$siteName}") : "{$siteName} | Leading Computer, Laptop & Tech Shop in Bangladesh");
            $metaDesc = $seo['description'] ?? ($product ? strip_tags((string)($product['short_description'] ?? $product['description'] ?? 'Buy authentic tech products at best price in BD')) : "Buy authentic Computers, Laptops, Components and CCTV in Bangladesh from {$siteName}.");
            
            $ogImage = $seo['og']['image'] ?? null;
            if (!$ogImage && $product) {
                $rawImg = $product['og_image'] ?? ($product['image'] ?? ($product['featured_image'] ?? null));
                if ($rawImg) {
                    if (str_starts_with($rawImg, 'http')) {
                        $ogImage = $rawImg;
                    } elseif (str_starts_with($rawImg, '/storage/')) {
                        $ogImage = url($rawImg);
                    } elseif (str_starts_with($rawImg, 'storage/')) {
                        $ogImage = url('/' . $rawImg);
                    } elseif (str_starts_with($rawImg, 'media/')) {
                        $ogImage = url('/storage/' . $rawImg);
                    } else {
                        $ogImage = url('/' . ltrim($rawImg, '/'));
                    }
                }
            }
            if (!$ogImage) {
                $ogImage = str_starts_with($siteLogo, 'http') ? $siteLogo : url('/' . ltrim($siteLogo, '/'));
            }

            $currentCanonical = $seo['canonical_url'] ?? url()->current();
        @endphp
        @if ($googleVerification)
            <meta name="google-site-verification" content="{{ $googleVerification }}">
        @endif
        @if ($bingVerification)
            <meta name="msvalidate.01" content="{{ $bingVerification }}">
        @endif

        <!-- Server-Side Open Graph & Meta for Social Bots (WhatsApp, Telegram, Facebook, Messenger) -->
        <meta name="description" content="{{ $metaDesc }}">
        <link rel="canonical" href="{{ $currentCanonical }}">
        <meta property="og:site_name" content="{{ $siteName }}">
        <meta property="og:type" content="{{ !empty($product) ? 'product' : 'website' }}">
        <meta property="og:url" content="{{ $currentCanonical }}">
        <meta property="og:title" content="{{ $metaTitle }}">
        <meta property="og:description" content="{{ $metaDesc }}">
        <meta property="og:image" content="{{ $ogImage }}">
        <meta property="og:image:secure_url" content="{{ $ogImage }}">
        <meta property="og:image:alt" content="{{ $metaTitle }}">

        <!-- Twitter Cards -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ $currentCanonical }}">
        <meta name="twitter:title" content="{{ $metaTitle }}">
        <meta name="twitter:description" content="{{ $metaDesc }}">
        <meta name="twitter:image" content="{{ $ogImage }}">

        <!-- Optimized Asynchronous Google Fonts (Non-render-blocking) -->
        <link rel="dns-prefetch" href="//fonts.googleapis.com">
        <link rel="dns-prefetch" href="//fonts.gstatic.com">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'">
        <noscript>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap">
        </noscript>

        @if ($customHeaderScripts)
            {!! $customHeaderScripts !!}
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        @if ($customFooterScripts)
            {!! $customFooterScripts !!}
        @endif
    </body>
</html>
