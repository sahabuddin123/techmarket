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
        @endphp
        @if ($googleVerification)
            <meta name="google-site-verification" content="{{ $googleVerification }}">
        @endif
        @if ($bingVerification)
            <meta name="msvalidate.01" content="{{ $bingVerification }}">
        @endif

        <!-- Optimized Asynchronous Google Fonts (Non-render-blocking) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=JetBrains+Mono:wght@400;700&display=swap">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=JetBrains+Mono:wght@400;700&display=swap" media="print" onload="this.media='all'">
        <noscript>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=JetBrains+Mono:wght@400;700&display=swap">
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
