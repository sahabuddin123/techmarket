import React from 'react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';

/**
 * Dynamic Storefront Home Dispatcher
 * Resolves active home component from the centralized version registry.
 */
export default function Home(props) {
  const versionKey = props.storefront_version || props.settings?.storefront_version || 'v3';
  const activeDef = getStorefrontVersion(versionKey);
  const HomeComponent = activeDef.HomePage;

  return <HomeComponent {...props} />;
}

