import React from 'react';
import { Head, usePage } from '@inertiajs/react';

/**
 * Enterprise SEO & Social Meta Tag Manager with JSON-LD Structured Data
 */
export default function SeoHead({
  title,
  description,
  canonical,
  og = {},
  twitter = {},
  jsonLd = null,
  robots = 'index, follow',
  keywords = '',
}) {
  const { url: currentPath } = usePage();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://techmarket.com.bd';
  const canonicalUrl = canonical || `${origin}${currentPath}`;

  const metaTitle = title || 'TechMarket BD | Leading Computer, Laptop & Gaming PC Shop in Bangladesh';
  const metaDescription = description || 'Buy authentic Computers, Laptops, Components, CCTV Surveillance and Accessories at the best price in Bangladesh from TechMarket BD with official warranty.';

  const ogTitle = og.title || metaTitle;
  const ogDescription = og.description || metaDescription;
  const ogImage = og.image || `${origin}/storage/logo.png`;
  const ogUrl = og.url || canonicalUrl;
  const ogType = og.type || 'website';

  const twitterCard = twitter.card || 'summary_large_image';
  const twitterTitle = twitter.title || ogTitle;
  const twitterDescription = twitter.description || ogDescription;
  const twitterImage = twitter.image || ogImage;

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph (Facebook, WhatsApp, Messenger, LinkedIn) */}
      <meta property="og:site_name" content="TechMarket BD" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={metaTitle} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={ogUrl} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />

      {/* Google Rich Results / Schema.org JSON-LD */}
      {jsonLd && (
        Array.isArray(jsonLd) ? (
          jsonLd.map((schema, idx) => (
            schema ? (
              <script
                key={`schema-${idx}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
              />
            ) : null
          ))
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )
      )}
    </Head>
  );
}
