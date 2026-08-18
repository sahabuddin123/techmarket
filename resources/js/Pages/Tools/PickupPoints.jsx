import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight, Search, MapPin, Phone } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title="Third Party Pickup Points - TechMarket BD" />
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 shadow-xs">
          {/* Header */}
          <div className="pb-4 border-b border-slate-200">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Third Party Pickup Points
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Find convenient pickup locations near you for hassle-free order collection
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between py-4 text-xs">
            <Link
              href="/tools"
              className="text-slate-600 hover:text-[#1c4289] font-semibold flex items-center transition-colors"
            >
              <span>← Back to Tools</span>
            </Link>

            <span className="text-slate-400 font-medium text-[11px]">
              ↔ Drag or swipe to view columns
            </span>
          </div>

          {/* Horizontally Scrollable Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-xs text-left border-collapse min-w-[800px]">
              <thead>
                {/* Column Headers */}
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-14 text-center">NO</th>
                  <th 
                    onClick={() => handleSort('courier')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors w-44"
                  >
                    <div className="flex items-center space-x-1">
                      <span>COURIER</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('district')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors w-36"
                  >
                    <div className="flex items-center space-x-1">
                      <span>DISTRICT</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('pickup_point')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors w-52"
                  >
                    <div className="flex items-center space-x-1">
                      <span>PICKUP POINT</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('contact')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors w-48"
                  >
                    <div className="flex items-center space-x-1">
                      <span>CONTACT</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('address')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
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
                      className="w-8 h-8 mx-auto bg-[#1c4289] hover:bg-[#15326b] text-white rounded flex items-center justify-center transition-colors cursor-pointer"
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
                      className="w-full bg-white text-slate-800 rounded border border-slate-300 py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289]"
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
                      className="w-full bg-white text-slate-800 rounded border border-slate-300 py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289]"
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
                      placeholder="Search pickup point"
                      className="w-full bg-white text-slate-800 rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289] placeholder-slate-400"
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
                      placeholder="Search contact number"
                      className="w-full bg-white text-slate-800 rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289] placeholder-slate-400"
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
                      className="w-full bg-white text-slate-800 rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1c4289] placeholder-slate-400"
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
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {item.courier}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {item.district}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {item.pickup_point}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {item.contact}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.address}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No matching pickup points found. Click the reset button to clear filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} locations
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === pg 
                        ? 'bg-[#1c4289] text-white' 
                        : 'border border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
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
