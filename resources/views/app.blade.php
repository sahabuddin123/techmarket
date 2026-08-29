<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'TechMarket BD') }}</title>
        @php
            $siteFavicon = \App\Models\Setting::get('site_favicon');
            $gtmId = \App\Models\Setting::get('gtm_container_id') ?: \App\Models\Setting::get('gtm_id');
            $ga4Id = \App\Models\Setting::get('ga_measurement_id') ?: \App\Models\Setting::get('ga4_measurement_id');
            $fbPixelId = \App\Models\Setting::get('fb_pixel_id') ?: \App\Models\Setting::get('meta_pixel_id');
        @endphp

        @if ($gtmId)
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ $gtmId }}');</script>
        <!-- End Google Tag Manager -->
        @endif

        @if ($ga4Id)
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $ga4Id }}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '{{ $ga4Id }}');
        </script>
        @endif

        @if ($fbPixelId)
        <!-- Meta Pixel Code -->
        <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '{{ $fbPixelId }}');
        fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id={{ $fbPixelId }}&ev=PageView&noscript=1"
        /></noscript>
        <!-- End Meta Pixel Code -->
        @endif

        @if ($siteFavicon)
            <link rel="icon" href="{{ $siteFavicon }}">
        @else
            <link rel="icon" type="image/svg+xml" href="/favicon.svg">
            <link rel="alternate icon" href="/favicon.ico">
        @endif

        @php
            $googleVerification = \App\Models\Setting::get('google_search_console_code') ?: \App\Models\Setting::get('google_site_verification');
            $bingVerification = \App\Models\Setting::get('bing_webmaster_code') ?: \App\Models\Setting::get('bing_site_verification');
            $seoRobots = \App\Models\Setting::get('seo_robots_indexing', 'index, follow');
            $customHeaderScripts = \App\Models\Setting::get('custom_header_scripts');
            $customFooterScripts = \App\Models\Setting::get('custom_footer_scripts');

            $props = $page['props'] ?? [];
            $seo = $props['seo'] ?? [];
            $product = $props['product'] ?? null;
            $siteName = \App\Models\Setting::get('site_name', config('app.name', 'TechMarket BD'));
            $siteLogo = \App\Models\Setting::get('site_logo', url('/storage/logo.png'));
            $defaultOgSetting = \App\Models\Setting::get('default_og_image');
            $defaultTitleSetting = \App\Models\Setting::get('default_meta_title', "{$siteName} | Best Computer, Laptop, Component & CCTV Shop in Bangladesh");
            $defaultDescSetting = \App\Models\Setting::get('default_meta_description', "Buy authentic Computers, Laptops, Components and CCTV in Bangladesh from {$siteName}.");
            $defaultKeywordsSetting = \App\Models\Setting::get('default_meta_keywords', 'computer shop bd, pc builder bangladesh, laptop price in bd, cctv package bangladesh, tech market bd');
            
            $metaTitle = $seo['title'] ?? ($product ? (($product['title'] ?? '') . " Price in Bangladesh | {$siteName}") : $defaultTitleSetting);
            $metaDesc = $seo['description'] ?? ($product ? strip_tags((string)($product['short_description'] ?? $product['description'] ?? $defaultDescSetting)) : $defaultDescSetting);
            $metaKeywords = $seo['keywords'] ?? $defaultKeywordsSetting;
            
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
            if (!$ogImage && $defaultOgSetting) {
                $ogImage = str_starts_with($defaultOgSetting, 'http') ? $defaultOgSetting : url('/' . ltrim($defaultOgSetting, '/'));
            }
            if (!$ogImage) {
                $ogImage = str_starts_with($siteLogo, 'http') ? $siteLogo : url('/' . ltrim($siteLogo, '/'));
            }

            $currentCanonical = $seo['canonical_url'] ?? url()->current();
        @endphp

        <!-- Search Engine Robots Indexing -->
        <meta name="robots" content="{{ $seoRobots }}">
        <meta name="googlebot" content="{{ $seoRobots }}">

        <!-- Core Meta & Keywords -->
        <meta name="description" content="{{ $metaDesc }}">
        <meta name="keywords" content="{{ $metaKeywords }}">
        <link rel="canonical" href="{{ $currentCanonical }}">

        @if ($googleVerification)
            <meta name="google-site-verification" content="{{ $googleVerification }}">
        @endif
        @if ($bingVerification)
            <meta name="msvalidate.01" content="{{ $bingVerification }}">
        @endif

        <!-- Server-Side Open Graph & Meta for Social Bots (WhatsApp, Telegram, Facebook, Messenger) -->
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
        @if ($gtmId)
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtmId }}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
        @endif

        @inertia
        @if ($customFooterScripts)
            {!! $customFooterScripts !!}
        @endif
    </body>
</html>
