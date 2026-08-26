import React from 'react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';

/**
 * Dynamic Storefront Catalog/Shop Dispatcher
 * Resolves active catalog component from the centralized version registry.
 */
export default function Catalog(props) {
  const versionKey = props.storefront_version || props.settings?.storefront_version || 'v1';
  const activeDef = getStorefrontVersion(versionKey);
  const CatalogComponent = activeDef.CatalogPage;

  return <CatalogComponent {...props} />;
}

