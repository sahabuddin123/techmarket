/**
 * Centralized Storefront Version Registry
 * 
 * Maps version keys ('v1', 'v2', 'v3') to their type-safe UI implementations,
 * layouts, navigation, and page components.
 */

// Version 1 Components (Classic TechLand Store)
import NavbarV1 from '@/Components/Navbar';
import FooterV1 from '@/Components/Footer';
import MobileBottomNavV1 from '@/Components/MobileBottomNav';
import HomeV1 from '@/Pages/Storefront/Version1/HomeV1';
import CatalogV1 from '@/Pages/Storefront/Version1/CatalogV1';
import ProductDetailV1 from '@/Pages/Storefront/Version1/ProductDetailV1';

// Version 2 Components (Modern Superstore)
import NavbarV2 from '@/Pages/Storefront/Version2/Components/NavbarV2';
import FooterV2 from '@/Pages/Storefront/Version2/Components/FooterV2';
import HomeV2 from '@/Pages/Storefront/Version2/HomeV2';
import CatalogV2 from '@/Pages/Storefront/Version2/CatalogV2';
import ProductDetailV2 from '@/Pages/Storefront/Version2/ProductDetailV2';

// Version 3 Components (Gadget Hub)
import NavbarV3 from '@/Pages/Storefront/Version3/Components/NavbarV3';
import FooterV3 from '@/Pages/Storefront/Version3/Components/FooterV3';
import MobileBottomNavV3 from '@/Pages/Storefront/Version3/Components/MobileBottomNavV3';
import HomeV3 from '@/Pages/Storefront/Version3/HomeV3';
import CatalogV3 from '@/Pages/Storefront/Version3/CatalogV3';
import ProductDetailV3 from '@/Pages/Storefront/Version3/ProductDetailV3';
import BrandsV3 from '@/Pages/Storefront/Version3/BrandsV3';
import OffersV3 from '@/Pages/Storefront/Version3/OffersV3';

export const STOREFRONT_VERSIONS = {
  v1: {
    key: 'v1',
    name: 'TechLand Classic Computer & IT Store',
    description: 'Classic IT and computer hardware storefront with dark blue header, red accents, and multi-column mega menu.',
    Navbar: NavbarV1,
    Footer: FooterV1,
    MobileBottomNav: MobileBottomNavV1,
    HomePage: HomeV1,
    CatalogPage: CatalogV1,
    ProductDetailPage: ProductDetailV1,
    BrandsPage: null,
    OffersPage: null,
  },
  v2: {
    key: 'v2',
    name: 'Modern Tech Superstore',
    description: 'High-tech electronics and computer superstore with deep navy, vivid electric blue, and modern glassmorphism.',
    Navbar: NavbarV2,
    Footer: FooterV2,
    MobileBottomNav: MobileBottomNavV1,
    HomePage: HomeV2,
    CatalogPage: CatalogV2,
    ProductDetailPage: ProductDetailV2,
    BrandsPage: null,
    OffersPage: null,
  },
  v3: {
    key: 'v3',
    name: 'TechMarket BD - Gadget Hub',
    description: 'Clean, modern consumer gadget hub with royal blue accents, soft glow, and drag-to-scroll filter pills.',
    Navbar: NavbarV3,
    Footer: FooterV3,
    MobileBottomNav: MobileBottomNavV3,
    HomePage: HomeV3,
    CatalogPage: CatalogV3,
    ProductDetailPage: ProductDetailV3,
    BrandsPage: BrandsV3,
    OffersPage: OffersV3,
  },
};

/**
 * Resolve active storefront version definition
 * @param {string} versionKey - 'v1', 'v2', or 'v3'
 */
export function getStorefrontVersion(versionKey = 'v1') {
  const normalizedKey = versionKey ? String(versionKey).toLowerCase() : 'v1';
  return STOREFRONT_VERSIONS[normalizedKey] || STOREFRONT_VERSIONS.v1;
}
