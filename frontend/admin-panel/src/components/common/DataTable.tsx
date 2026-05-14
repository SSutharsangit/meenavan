'use client';

import React from 'react';
import { Search, SlidersHorizontal, Maximize, Minimize } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  // Pagination props
  currentPage?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  // Toolbar props
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  hasActiveFilters?: boolean;
  onFilterClick?: () => void;
  isFullView?: boolean;
  setIsFullView?: (val: boolean) => void;
  minHeight?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  total = 0,
  currentPage = 1,
  perPage = 15,
  onPageChange,
  onPerPageChange,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  hasActiveFilters = false,
  onFilterClick,
  isFullView = false,
  setIsFullView,
  minHeight = 'min-h-[350px] lg:min-h-[480px]',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / perPage);
  const startRange = (currentPage - 1) * perPage + 1;
  const endRange = Math.min(currentPage * perPage, total);

  const isLoadingInitial = loading && data.length === 0;
  const isUpdating = loading && data.length > 0;

  const Pagination = () => {
    if (!onPageChange || total <= 0) return null;

    return (
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-medium text-gray-500">
          Showing <span className="text-gray-900 font-bold">{startRange}</span> to <span className="text-gray-900 font-bold">{endRange}</span> of <span className="text-gray-900 font-bold">{total}</span> results
        </div>
        
        <div className="flex items-center gap-2">
          {onPerPageChange && (
            <select 
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              disabled={loading}
              className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]/10 transition-all mr-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {[10, 15, 30, 50, 100].map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-bold text-[#0A6CFF]">{currentPage}</span>
              <span className="text-xs font-medium text-gray-400">/</span>
              <span className="text-xs font-bold text-gray-600">{totalPages || 1}</span>
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-100 shadow-sm shadow-black/[0.02] flex flex-col ${isFullView ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'rounded-2xl overflow-hidden'}`}>
      
      {/* Top Toolbar */}
      {(onSearchChange || onFilterClick || setIsFullView) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 gap-3 bg-white shrink-0">
          <div className="flex-1 min-w-0 max-w-sm">
            {onSearchChange && (
              <div className="relative group">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onFilterClick && (
              <button 
                onClick={onFilterClick} 
                className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center relative border shadow-sm hover:shadow active:scale-95 ${hasActiveFilters ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                title="Filters"
              >
                <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
                {hasActiveFilters && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />}
              </button>
            )}
            {setIsFullView && (
              <button 
                onClick={() => setIsFullView(!isFullView)} 
                className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow hover:bg-gray-50 text-gray-600 transition-all duration-200 flex items-center justify-center active:scale-95"
                title={isFullView ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullView ? <Minimize className="w-4 h-4" strokeWidth={2.5} /> : <Maximize className="w-4 h-4" strokeWidth={2.5} />}
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`overflow-x-auto relative ${isFullView ? 'flex-1' : minHeight}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F9FAFB]">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={`text-[12px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 ${col.label === 'Actions' || col.key === 'actions' || col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-50 transition-opacity duration-300 ${isUpdating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {isLoadingInitial ? (
              [...Array(5)].map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-5">
                      <div className="h-5 bg-gray-100/80 rounded-lg animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (!Array.isArray(data) || data.length === 0) ? (
              <tr>
                <td colSpan={columns.length} className="px-6 bg-white relative">
                  <div className="flex flex-col items-center justify-center text-center py-24 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#0A6CFF]/[0.03] rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative mb-8 group cursor-default">
                      <div className="absolute inset-0 bg-[#0A6CFF]/5 rounded-[2rem] scale-[1.3] animate-pulse pointer-events-none" style={{ animationDuration: '3s' }}></div>
                      <div className="absolute inset-0 bg-[#0A6CFF]/5 rounded-[1.8rem] scale-[1.15] pointer-events-none"></div>

                      <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-[1.8rem] border border-gray-100 shadow-xl shadow-[#0A6CFF]/5 flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-105">
                        <div className="w-[4.5rem] h-[4.5rem] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-50/50 shadow-inner">
                          <svg className="w-9 h-9 text-gray-300 group-hover:text-[#0A6CFF] transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="absolute -bottom-3 -right-4 w-10 h-10 bg-white border border-gray-100 rounded-[14px] flex items-center justify-center shadow-lg z-20 animate-bounce" style={{ animationDuration: '2.5s' }}>
                        <div className="w-7 h-7 bg-red-50 rounded-[8px] flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 max-w-sm">
                      <h3 className="text-gray-900 text-xl font-black tracking-tight mb-2.5">
                        {emptyMessage.split('.')[0]}
                      </h3>
                      <p className="text-[#6B7280] text-[13px] font-medium leading-relaxed">
                        {emptyMessage.indexOf('.') !== -1 && emptyMessage.substring(emptyMessage.indexOf('.') + 1).trim().length > 0 
                          ? emptyMessage.substring(emptyMessage.indexOf('.') + 1).trim()
                          : "We couldn't find any data matching your criteria. Try adjusting your filters or creating a new record."}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={`transition-all duration-200 ${onRowClick ? 'cursor-pointer hover:bg-gray-50/60' : 'hover:bg-gray-50/40'}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key as string} className="px-6 py-4">
                      {col.render ? col.render(row) : <span className="text-gray-600 font-medium">{row[col.key]}</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {(!isLoadingInitial && total > 0) && <Pagination />}
    </div>
  );
}
