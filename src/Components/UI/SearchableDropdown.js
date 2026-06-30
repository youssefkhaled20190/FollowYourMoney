// src/Components/Common/SearchableDropdown.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createGetRequest } from '../../Hooks/Services/Requests';
import useTranslate from '../../Hooks/Translation/useTranslate';

const SearchableDropdown = ({
  endpoint,
  idField,
  nameField,
  nameFieldAr,
  label,
  placeholder,
  value,
  onChange,
  error,
  touched,
  disabled = false,
  required = false,
  className = '',
  isReadOnly, // Added for parent compatibility
  isLoading, // Added for parent compatibility
  searchParamName, // e.g., "Filter.searchText" for server-side search
  queryParams = {}, // Additional query parameters for API requests
}) => {
  const { lang, t } = useTranslate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // ── Pagination state ───────────────────────────────────────────────────────
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (endpoint) {
      pageRef.current = 1;
      fetchData(1, true);
    }
  }, [endpoint]);

  // Fetch from server whenever search term changes (debounced)
  useEffect(() => {
    if (!endpoint) return;
    const timer = setTimeout(() => {
      pageRef.current = 1;
      fetchData(1, true);
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async (page = 1, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // ✅ Build base params from queryParams prop
      const params = new URLSearchParams(queryParams);

      // Always send search text to the server
      if (searchTerm.trim()) {
        const paramName = searchParamName || 'Filter.searchText';
        params.set(paramName, searchTerm.trim());
      }

      // Add pagination params
      params.set('PageNumber', page);
      params.set('PageSize', 20);

      const queryString = params.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await createGetRequest(url, {});

      let items = [];
      let totalPages = 1;

      if (Array.isArray(response)) {
        items = response;
        totalPages = 1; // No pagination info — treat as single page
      } else if (Array.isArray(response?.data?.items)) {
        items = response.data.items;
        totalPages = response.data.totalPages || 1;
      } else if (Array.isArray(response?.items)) {
        items = response.items;
        totalPages = response.totalPages || 1;
      } else if (Array.isArray(response?.data)) {
        items = response.data;
        totalPages = 1;
      } else if (response?.result && Array.isArray(response?.data)) {
        items = response.data;
        totalPages = 1;
      }
      if (reset) {
        setData(items);
      } else {
        setData((prev) => {
          // Avoid duplicates by filtering out items already present
          const existingIds = new Set(prev.map((item) => item[idField]));
          const newItems = items.filter((item) => !existingIds.has(item[idField]));
          return [...prev, ...newItems];
        });
      }

      pageRef.current = page;
      setHasMore(page < totalPages);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ── Infinite scroll handler ────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;

    // When scrolled within 30px of the bottom, load more
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      fetchData(pageRef.current + 1, false);
    }
  }, [loadingMore, hasMore]);

  const getDisplayName = (item) => {
    if (lang === 'ar' && nameFieldAr && item[nameFieldAr]) {
      return item[nameFieldAr];
    }
    return item[nameField];
  };

  const getFilterName = (item) => {
    if (lang === 'ar' && nameFieldAr && item[nameFieldAr]) {
      return String(item[nameFieldAr]);
    }
    const enName = String(item[nameField] || '');
    const arName = String(item[nameFieldAr] || '');
    return (enName + ' ' + arName).trim();
  };

  const selectedItem = data.find((item) => item[idField] === value);

  // Server handles filtering — use data as-is
  const filteredData = data;

  // Disable interactions if readOnly
  const isDisabled = disabled || isReadOnly;

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 font-Cairo mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          disabled={isDisabled}
          className={`
            w-full px-4 py-2.5 text-left
            border rounded-lg font-Cairo text-sm
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${error && touched ? 'border-red-500' : 'border-gray-300'}
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        >
          <span className={selectedItem ? 'text-gray-900' : 'text-gray-400'}>
            {selectedItem ? getDisplayName(selectedItem) : placeholder || t('Select')}
          </span>
          <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-gray-400`}></i>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div
              className="overflow-y-auto max-h-48"
              ref={listRef}
              onScroll={handleScroll}
            >
              {isLoading || loading ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">Loading...</div>
              ) : filteredData.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No options found</div>
              ) : (
                <>
                  {filteredData.map((item) => (
                    <button
                      key={item[idField]}
                      type="button"
                      onClick={() => {
                        // ✅ UPDATED: Pass both the ID value AND the full item object
                        onChange(item[idField], item);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`
                        w-full px-4 py-2 text-left text-sm hover:bg-primary-50
                        ${item[idField] === value ? 'bg-primary-100 text-primary-700' : 'text-gray-900'}
                      `}
                    >
                      {getDisplayName(item)}
                    </button>
                  ))}
                  {loadingMore && (
                    <div className="px-4 py-2 text-sm text-gray-400 text-center">Loading more…</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && touched && <p className="text-red-500 text-xs mt-1 font-Cairo">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;
