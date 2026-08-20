import React from 'react';
import CatalogV1 from './Storefront/Version1/CatalogV1';
import CatalogV2 from './Storefront/Version2/CatalogV2';

/**
 * Dynamic Storefront Category/Catalog Dispatcher
 * Automatically resolves and renders either:
 * - Version 1 (Classic Storefront Category Listing - preserved exactly)
 * - Version 2 (Modern Tech Storefront Category Listing - premium modern UI)
 * based on admin setting `storefront_version`.
 */
export default function Catalog(props) {
  const version = props.storefront_version || props.settings?.storefront_version || 'v1';

  if (version === 'v2') {
    return <CatalogV2 {...props} />;
  }

  return <CatalogV1 {...props} />;
}
