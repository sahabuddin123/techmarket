import React from 'react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import SeoHead from '@/Components/SeoHead';

/**
 * Dynamic Storefront Product Detail Dispatcher
 * Resolves active product detail component from the centralized version registry.
 */
export default function ProductDetail(props) {
  const versionKey = props.storefront_version || props.settings?.storefront_version || 'v1';
  const activeDef = getStorefrontVersion(versionKey);
  const ProductDetailComponent = activeDef.ProductDetailPage;

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
        robots={seo.meta_robots}
        keywords={seo.focus_keyword}
      />
      <ProductDetailComponent {...props} />
    </>
  );
}


