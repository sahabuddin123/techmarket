import React from 'react';
import ProductDetailV1 from './Storefront/Version1/ProductDetailV1';
import ProductDetailV2 from './Storefront/Version2/ProductDetailV2';

/**
 * Dynamic Storefront Product Detail Page Dispatcher
 * Automatically resolves and renders either:
 * - Version 1 (Classic Storefront Product Detail Page - preserved 100%)
 * - Version 2 (Modern Tech Storefront Product Detail Page - premium modern UI)
 * based on admin setting `storefront_version`.
 */
export default function ProductDetail(props) {
  const version = props.storefront_version || props.settings?.storefront_version || 'v1';

  if (version === 'v2') {
    return <ProductDetailV2 {...props} />;
  }

  return <ProductDetailV1 {...props} />;
}
