import React from 'react';
import HomeV1 from './Storefront/Version1/HomeV1';
import HomeV2 from './Storefront/Version2/HomeV2';

/**
 * Dynamic Storefront Dispatcher
 * Automatically resolves and renders either:
 * - Version 1 (Classic Storefront - preserved exactly)
 * - Version 2 (Modern Tech Storefront - premium modern UI)
 * based on admin setting `storefront_version`.
 */
export default function Home(props) {
  const version = props.storefront_version || props.settings?.storefront_version || 'v1';

  if (version === 'v2') {
    return <HomeV2 {...props} />;
  }

  return <HomeV1 {...props} />;
}
