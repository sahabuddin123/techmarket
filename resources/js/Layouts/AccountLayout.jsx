import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import AccountSidebar from '@/Components/Account/AccountSidebar';

export default function AccountLayout({ children, unreadCount }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#273444] font-sans flex flex-col selection:bg-[#274a7d] selection:text-white">
      {/* Top Navbar & Category Mega Menu */}
      <Navbar onOpenCart={() => setCartOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Main Centered Account Content Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Account Navigation Sidebar */}
          <AccountSidebar unreadCount={unreadCount} />

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {children}
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
