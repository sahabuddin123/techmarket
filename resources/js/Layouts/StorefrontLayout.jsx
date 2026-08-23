import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import { applyStorefrontTheme } from '@/Core/Storefront/themeManager';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import MobileBottomNav from '@/Components/MobileBottomNav';
import CartDrawer from '@/Components/CartDrawer';

export default function StorefrontLayout({ children, showCart = true }) {
  const { storefront_version, storefrontTheme, settings = {} } = usePage().props;
  const [cartOpen, setCartOpen] = useState(false);

  const activeVersion = getStorefrontVersion(storefront_version || settings.storefront_version || 'v3');

  useEffect(() => {
    applyStorefrontTheme(storefrontTheme, activeVersion.key);
  }, [storefrontTheme, activeVersion.key]);

  return (
    <div className={`storefront-${activeVersion.key} min-h-screen flex flex-col selection:bg-[var(--storefront-primary,#0153FD)] selection:text-white bg-[var(--storefront-bg,#F4F7FC)] text-[var(--storefront-text,#0f172a)] font-sans`}>
      {/* 1. Universal Version-Aware Navbar */}
      <Navbar onOpenCart={() => setCartOpen(true)} />

      {/* 2. Global Cart Drawer */}
      {showCart && (
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      )}

      {/* 3. Main Page Body */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* 4. Universal Version-Aware Footer */}
      <Footer onOpenCart={() => setCartOpen(true)} />

      {/* 5. Universal Version-Aware Mobile Bottom Navigation */}
      <MobileBottomNav onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
