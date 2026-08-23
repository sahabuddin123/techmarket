import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import SectionBoxV3 from './SectionBoxV3';
import ProductCardV3 from './ProductCardV3';
import { ArrowRight } from 'lucide-react';

export default function GadgetsForYouSectionV3({ products = [] }) {
  const [activeTab, setActiveTab] = useState('All');
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleTabClick = (tab) => {
    if (hasMoved) return;
    setActiveTab(tab);
  };

  const filterTabs = [
    'All',
    'Rechargeable Lights & Fans',
    'Powerbanks',
    'Charger & Cables',
    'TWS & Headphones',
    'Appliances',
    'Smartwatches',
    'Kids Zone',
    'Winter Items',
    'Summer Items',
  ];

  // Exact 10-11 products from TechJhuli screenshot with real studio images
  const defaultGadgetProducts = [
    {
      id: 'g-1',
      title: 'Hollyland Lark M2S Wireless',
      slug: 'hollyland-lark-m2s-wireless',
      price: 10500,
      regular_price: 12500,
      discount_percent: 16,
      category: 'TWS & Headphones',
      image: '/images/storefront/v3/prod_hollyland_mic.jpg',
      stock: 20,
    },
    {
      id: 'g-2',
      title: 'Xiaomi Solove F5 Pro Max',
      slug: 'xiaomi-solove-f5-pro-max',
      price: 3450,
      regular_price: 3850,
      discount_percent: 10,
      category: 'Rechargeable Lights & Fans',
      image: '/images/storefront/v3/prod_solove_fan.jpg',
      stock: 30,
    },
    {
      id: 'g-3',
      title: 'Awei PA-92 20000mAh',
      slug: 'awei-pa-92-20000mah',
      price: 1550,
      regular_price: 1850,
      discount_percent: 16,
      category: 'Powerbanks',
      image: '/images/storefront/v3/prod_awei_powerbank.jpg',
      stock: 40,
    },
    {
      id: 'g-4',
      title: 'Unikyy Blade Pro Portable',
      slug: 'unikyy-blade-pro-portable',
      price: 1250,
      regular_price: 1550,
      discount_percent: 19,
      category: 'Rechargeable Lights & Fans',
      image: '/images/storefront/v3/prod_unikyy_fan.jpg',
      stock: 25,
    },
    {
      id: 'g-5',
      title: 'Weidasi WD-959 Original',
      slug: 'weidasi-wd-959-original',
      price: 750,
      regular_price: 1150,
      discount_percent: 35,
      category: 'Rechargeable Lights & Fans',
      image: '/images/storefront/v3/prod_weidasi_racket.jpg',
      stock: 50,
    },
    {
      id: 'g-6',
      title: 'JYSUPER JY-2219',
      slug: 'jysuper-jy-2219',
      price: 3790,
      regular_price: 4190,
      discount_percent: 10,
      category: 'Rechargeable Lights & Fans',
      image: '/images/storefront/v3/prod_jysuper_stand.jpg',
      stock: 18,
    },
    {
      id: 'g-7',
      title: 'JYSUPER JY-2218',
      slug: 'jysuper-jy-2218',
      price: 1190,
      regular_price: 1590,
      discount_percent: 25,
      category: 'Rechargeable Lights & Fans',
      image: '/images/storefront/v3/prod_jysuper_white_fan.jpg',
      stock: 22,
    },
    {
      id: 'g-8',
      title: 'JYSUPER JY-2570',
      slug: 'jysuper-jy-2570',
      price: 2090,
      regular_price: 2790,
      discount_percent: 25,
      category: 'Rechargeable Lights & Fans',
      image: '/images/storefront/v3/prod_jysuper_pink.jpg',
      stock: 35,
    },
    {
      id: 'g-9',
      title: 'Original X10 laser Flashlight',
      slug: 'original-x10-laser-flashlight',
      price: 850,
      regular_price: 1250,
      discount_percent: 32,
      category: 'Winter Items',
      image: '/images/storefront/v3/prod_x10_flashlight.jpg',
      stock: 45,
    },
    {
      id: 'g-10',
      title: 'QCY PB20A 45W PD QC',
      slug: 'qcy-pb20a-45w-pd-qc',
      price: 3190,
      regular_price: 3750,
      discount_percent: 15,
      category: 'Powerbanks',
      image: '/images/storefront/v3/prod_qcy_powerbank.jpg',
      stock: 28,
    },
    {
      id: 'g-11',
      title: 'SKE POE-36E-LFP',
      slug: 'ske-poe-36e-lfp',
      price: 3750,
      regular_price: 4250,
      discount_percent: 12,
      category: 'Appliances',
      image: '/images/storefront/v3/prod_ske_ups.jpg',
      stock: 20,
    },
  ];

  const allItems = (products && products.length >= 6) ? products : defaultGadgetProducts;

  const filteredItems = activeTab === 'All'
    ? allItems
    : allItems.filter(p => p.category?.name === activeTab || p.category === activeTab || p.title?.toLowerCase().includes(activeTab.toLowerCase()));

  const displayList = filteredItems.length > 0 ? filteredItems : allItems;

  return (
    <SectionBoxV3 title="Gadgets For You" badgeText="Gadgets For You">
      
      {/* Draggable Category Filter Pills */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-center space-x-2 overflow-x-auto pb-4 pt-1 text-xs select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {filterTabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-[#0153FD] text-white shadow-md'
                  : 'bg-[#F4F7FC] hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 2 Rows of 5 Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
        {displayList.slice(0, 10).map((product) => (
          <ProductCardV3 key={product.id} product={product} />
        ))}
      </div>

      {/* Bottom View All Pill Button */}
      <div className="flex justify-end pt-6">
        <Link
          href="/catalog"
          className="inline-flex items-center space-x-1.5 px-6 py-2 rounded-full border-2 border-[#0153FD] text-[#0153FD] hover:bg-[#0153FD] hover:text-white font-bold text-xs transition-all shadow-xs"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </SectionBoxV3>
  );
}
