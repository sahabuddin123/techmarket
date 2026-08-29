import React from 'react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import SeoHead from '@/Components/SeoHead';

/**
 * Dynamic Storefront Home Dispatcher
 * Resolves active home component from the centralized version registry.
 */
export default function Home(props) {
  const versionKey = props.storefront_version || props.settings?.storefront_version || 'v1';
  const activeDef = getStorefrontVersion(versionKey);
  const HomeComponent = activeDef.HomePage;

  const seo = props.seo || {};

  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical_url}
        og={seo.og}
        twitter={seo.twitter}
        jsonLd={seo.json_ld}
      />
      <HomeComponent {...props} />
    </>
  );
}


