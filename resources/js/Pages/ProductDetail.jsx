import React from 'react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';

/**
 * Dynamic Storefront Product Detail Dispatcher
 * Resolves active product detail component from the centralized version registry.
 */
export default function ProductDetail(props) {
  const versionKey = props.storefront_version || props.settings?.storefront_version || 'v1';
  const activeDef = getStorefrontVersion(versionKey);
  const ProductDetailComponent = activeDef.ProductDetailPage;

  return <ProductDetailComponent {...props} />;
}

