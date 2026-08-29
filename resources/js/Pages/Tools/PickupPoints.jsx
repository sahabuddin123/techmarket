import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight, Search, MapPin, Phone, Building2, Truck } from 'lucide-react';

export default function PickupPoints({ pickupPoints = [], couriers = [], districts = [] }) {
  const [filters, setFilters] = useState({
    courier: 'All',
    district: 'All',
    pickup_point: '',
    contact: '',
    address: '',
  });

  const [sortColumn, setSortColumn] = useState('no');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleReset = () => {
    setFilters({
      courier: 'All',
      district: 'All',
      pickup_point: '',
      contact: '',
      address: '',
    });
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    return pickupPoints.filter((item) => {
      if (filters.courier !== 'All' && item.courier !== filters.courier) return false;
      if (filters.district !== 'All' && item.district !== filters.district) return false;
      if (filters.pickup_point && !item.pickup_point.toLowerCase().includes(filters.pickup_point.toLowerCase())) return false;
      if (filters.contact && !item.contact.toLowerCase().includes(filters.contact.toLowerCase())) return false;
      if (filters.address && !item.address.toLowerCase().includes(filters.address.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [pickupPoints, filters, sortColumn, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title="Third Party Pickup Points - TechMarket BD" />
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-200/90 py-3">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#1c4289] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/tools" className="hover:text-[#1c4289] transition-colors">Useful Tools</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate">Pickup Hubs & Counters</span>
          </div>
          <div className="text-slate-500 text-xs font-semibold">
            <span>{filteredList.length} Pickup Points Found</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-2xs">
          
          {/* Header Section */}
          <div className="pb-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#1c4289] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Truck className="w-3.5 h-3.5" />
                <span>NATIONWIDE LOGISTICS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                Third Party Courier Pickup Hubs
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Search verified partner courier branch counters across 64 districts for convenient self-pickup.
              </p>
            </div>

            <Link
              href="/tools"
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#1c4289] flex items-center gap-1.5 self-start md:self-auto transition-colors"
            >
              <span>← Back to Tools</span>
            </Link>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between py-4 text-xs">
            <span className="text-slate-700 font-bold">
              Showing <span className="text-[#1c4289]">{filteredList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-[#1c4289]">{Math.min(currentPage * itemsPerPage, filteredList.length)}</span> of <span className="text-[#1c4289]">{filteredList.length}</span> entries
            </span>

            <span className="text-slate-400 font-medium text-[11px]">
              ↔ Drag or swipe horizontally to view all columns
            </span>
          </div>

          {/* Horizontally Scrollable Table */}
          <div className="overflow-x-auto border border-slate-200/90 rounded-xl shadow-2xs">
            <table className="w-full text-xs text-left border-collapse min-w-[850px]">
              <thead>
                {/* Column Headers */}
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-14 text-center">NO</th>
                  <th 
                    onClick={() => handleSort('courier')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors w-44"
                  >
                    <div className="flex items-center space-x-1">
                      <span>COURIER</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('district')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors w-36"
                  >
                    <div className="flex items-center space-x-1">
                      <span>DISTRICT</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('pickup_point')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors w-52"
                  >
                    <div className="flex items-center space-x-1">
                      <span>PICKUP POINT</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('contact')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors w-48"
                  >
                    <div className="flex items-center space-x-1">
                      <span>CONTACT</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('address')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ADDRESS</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                </tr>

                {/* Filter Row (Directly underneath header) */}
                <tr className="bg-slate-50 border-b border-slate-200">
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Reset Filters"
                      className="w-8 h-8 mx-auto bg-[#1c4289] hover:bg-[#15326b] text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Courier Dropdown */}
                  <td className="p-2">
                    <select
                      value={filters.courier}
                      onChange={(e) => {
                        setFilters({ ...filters, courier: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full bg-white text-slate-800 rounded-lg border border-slate-300 py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289]"
                    >
                      {couriers.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>

                  {/* District Dropdown */}
                  <td className="p-2">
                    <select
                      value={filters.district}
                      onChange={(e) => {
                        setFilters({ ...filters, district: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full bg-white text-slate-800 rounded-lg border border-slate-300 py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289]"
                    >
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </td>

                  {/* Pickup Point Search Input */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={filters.pickup_point}
                      onChange={(e) => {
                        setFilters({ ...filters, pickup_point: e.target.value });
                        setCurrentPage(1);
                      }}
                      placeholder="Search point"
                      className="w-full bg-white text-slate-800 rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289] placeholder-slate-400"
                    />
                  </td>

                  {/* Contact Search Input */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={filters.contact}
                      onChange={(e) => {
                        setFilters({ ...filters, contact: e.target.value });
                        setCurrentPage(1);
                      }}
                      placeholder="Search phone"
                      className="w-full bg-white text-slate-800 rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289] placeholder-slate-400"
                    />
                  </td>

                  {/* Address Search Input */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={filters.address}
                      onChange={(e) => {
                        setFilters({ ...filters, address: e.target.value });
                        setCurrentPage(1);
                      }}
                      placeholder="Search address"
                      className="w-full bg-white text-slate-800 rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289] placeholder-slate-400"
                    />
                  </td>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody className="divide-y divide-slate-200">
                {paginatedList.length > 0 ? (
                  paginatedList.map((item, idx) => (
                    <tr key={item.no || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 font-medium font-mono">
                        {item.no}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                          {item.courier}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {item.district}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#1c4289]">
                        {item.pickup_point}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                        {item.contact}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.address}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold">No pickup points match your search filter</p>
                      <button
                        onClick={handleReset}
                        className="mt-2 text-[#1c4289] hover:underline text-xs font-bold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-slate-200/80 text-xs">
              <span className="text-slate-500 font-medium">
                Page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
              </span>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="hidden sm:flex items-center space-x-1 px-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i + 1;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#1c4289] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold shadow-2xs cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
