import React, { useState, useEffect } from 'react';
import useTranslate from '../../Hooks/Translation/useTranslate';
import { useSelector } from 'react-redux';
import SearchableDropdown from './SearchableDropdown';

const ServerSideTable = ({
  columns = [],
  data = [],
  totalRecords = 0,
  isLoading = false,
  onPagination,
  refresherKey = 1,
  enableAdd = false,
  enableSearch = false,
  handleAddButton,
  addButtonText,
  role,

  // Search: 'text' | 'dropdown' | 'daterange' | 'daterange_text' | 'multi_dropdown'
  searchType = 'text',

  // --- text search ---
  dropdownSearchBy = 'name',

  // --- dropdown search ---
  dropdownEndpoint = '',
  dropdownIdField = 'id',
  dropdownNameField = 'name',
  dropdownNameFieldAr = '',
  dropdownPlaceholder = '',
  dropdownQueryParams = {},

  // --- multi_dropdown search (two dropdowns) ---
  // First dropdown (reuses the single-dropdown props above)
  // Second dropdown:
  dropdown2Endpoint = '',
  dropdown2IdField = 'id',
  dropdown2NameField = 'name',
  dropdown2NameFieldAr = '',
  dropdown2Placeholder = '',
  dropdown2QueryParams = {},
  dropdown2SearchBy = 'id', // 'id' | 'name' — which value is passed to onPagination
  // Keys used when calling onPagination({ dropdown1Key: val, dropdown2Key: val })
  dropdown1Key = 'filter1',
  dropdown2Key = 'filter2',

  // --- daterange search ---
  fromDateKey = 'fromDate',
  toDateKey = 'toDate',
  fromDateLabel = '',
  toDateLabel = '',

  // --- daterange_text search (combined date range + text) ---
  textSearchKey = 'searchText',
  textSearchPlaceholder = '',
}) => {
  const { t } = useTranslate();
  const currentLang = useSelector((state) => state.language.lang);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // text search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // dropdown search
  const [selectedDropdownId, setSelectedDropdownId] = useState(null);
  const [selectedDropdownName, setSelectedDropdownName] = useState(null);

  // second dropdown (multi_dropdown)
  const [selectedDropdown2Id, setSelectedDropdown2Id] = useState(null);
  const [selectedDropdown2Name, setSelectedDropdown2Name] = useState(null);

  // date range search
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // daterange_text: combined text input
  const [dateTextSearch, setDateTextSearch] = useState('');
  const [dateTextInput, setDateTextInput] = useState('');

  // ─── derived values ───────────────────────────────────────────────────────
  // single dropdown (unchanged behaviour)
  const dropdownSearchValue = dropdownSearchBy === 'id' ? selectedDropdownId : selectedDropdownName;

  const totalPages = Math.ceil(totalRecords / pageSize);

  // ─── fire onPagination whenever deps change ───────────────────────────────
  useEffect(() => {
    if (!onPagination) return;

    if (searchType === 'dropdown') {
      onPagination(currentPage, pageSize, dropdownSearchValue);
    } else if (searchType === 'multi_dropdown') {
      // Always send BOTH id and name for each dropdown so the parent
      // can use whichever it needs without any extra config.
      onPagination(currentPage, pageSize, {
        // dropdown 1
        [`${dropdown1Key}Id`]: selectedDropdownId,
        [`${dropdown1Key}Name`]: selectedDropdownName,
        // dropdown 2
        [`${dropdown2Key}Id`]: selectedDropdown2Id,
        [`${dropdown2Key}Name`]: selectedDropdown2Name,
      });
    } else if (searchType === 'daterange') {
      onPagination(currentPage, pageSize, { [fromDateKey]: fromDate, [toDateKey]: toDate });
    } else if (searchType === 'daterange_text') {
      onPagination(currentPage, pageSize, {
        [fromDateKey]: fromDate,
        [toDateKey]: toDate,
        [textSearchKey]: dateTextSearch,
      });
    } else {
      // text
      onPagination(currentPage, pageSize, searchTerm);
    }
  }, [
    currentPage,
    pageSize,
    searchTerm,
    dropdownSearchValue,
    selectedDropdown2Id,
    selectedDropdown2Name,
    fromDate,
    toDate,
    dateTextSearch,
    refresherKey,
  ]);

  // ─── handlers ────────────────────────────────────────────────────────────
  const handleSearchTrigger = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  // dropdown 1
  const handleDropdownChange = (id, item) => {
    setSelectedDropdownId(id);
    setSelectedDropdownName(item[dropdownNameField]);
    setCurrentPage(1);
  };
  const handleDropdownClear = () => {
    setSelectedDropdownId(null);
    setSelectedDropdownName(null);
    setCurrentPage(1);
  };

  // dropdown 2
  const handleDropdown2Change = (id, item) => {
    setSelectedDropdown2Id(id);
    setSelectedDropdown2Name(item[dropdown2NameField]);
    setCurrentPage(1);
  };
  const handleDropdown2Clear = () => {
    setSelectedDropdown2Id(null);
    setSelectedDropdown2Name(null);
    setCurrentPage(1);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setCurrentPage(1);
  };
  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setCurrentPage(1);
  };
  const handleDateRangeClear = () => {
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handleDateTextSearchTrigger = () => {
    setDateTextSearch(dateTextInput);
    setCurrentPage(1);
  };
  const handleDateTextClearAll = () => {
    setFromDate('');
    setToDate('');
    setDateTextInput('');
    setDateTextSearch('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // ─── render search ────────────────────────────────────────────────────────
  const renderSearch = () => {
    if (!enableSearch) return null;

    // ── DROPDOWN ──────────────────────────────────────────────────────────
    if (searchType === 'dropdown') {
      return (
        <div className="flex items-center gap-2 w-full sm:w-64 md:w-80">
          <div className="flex-1">
            <SearchableDropdown
              endpoint={dropdownEndpoint}
              idField={dropdownIdField}
              nameField={dropdownNameField}
              nameFieldAr={dropdownNameFieldAr}
              placeholder={dropdownPlaceholder || t('Search') || 'Select...'}
              value={selectedDropdownId}
              onChange={handleDropdownChange}
              queryParams={dropdownQueryParams}
            />
          </div>
          {selectedDropdownId !== null && (
            <button
              onClick={handleDropdownClear}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={t('Clear') || 'Clear'}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          )}
        </div>
      );
    }

    // ── MULTI DROPDOWN (2 dropdowns) ──────────────────────────────────────
    if (searchType === 'multi_dropdown') {
      return (
        <div className="flex flex-wrap items-center gap-3">
          {/* ── Dropdown 1 ── */}
          <div className="flex items-center gap-1 w-full sm:w-56 md:w-64">
            <div className="flex-1">
              <SearchableDropdown
                endpoint={dropdownEndpoint}
                idField={dropdownIdField}
                nameField={dropdownNameField}
                nameFieldAr={dropdownNameFieldAr}
                placeholder={dropdownPlaceholder || t('Search') || 'Select...'}
                value={selectedDropdownId}
                onChange={handleDropdownChange}
                queryParams={dropdownQueryParams}
              />
            </div>
            {selectedDropdownId !== null && (
              <button
                onClick={handleDropdownClear}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title={t('Clear') || 'Clear'}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            )}
          </div>

          {/* ── Dropdown 2 ── */}
          <div className="flex items-center gap-1 w-full sm:w-56 md:w-64">
            <div className="flex-1">
              <SearchableDropdown
                endpoint={dropdown2Endpoint}
                idField={dropdown2IdField}
                nameField={dropdown2NameField}
                nameFieldAr={dropdown2NameFieldAr}
                placeholder={dropdown2Placeholder || t('Search') || 'Select...'}
                value={selectedDropdown2Id}
                onChange={handleDropdown2Change}
                queryParams={dropdown2QueryParams}
              />
            </div>
            {selectedDropdown2Id !== null && (
              <button
                onClick={handleDropdown2Clear}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title={t('Clear') || 'Clear'}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            )}
          </div>
        </div>
      );
    }

    // ── DATE RANGE ────────────────────────────────────────────────────────
    if (searchType === 'daterange') {
      const hasValue = fromDate || toDate;
      return (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-Cairo">
              {fromDateLabel || t('From') || 'From'}
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={handleFromDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-Cairo text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-Cairo">
              {toDateLabel || t('To') || 'To'}
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={handleToDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-Cairo text-sm"
            />
          </div>
          {hasValue && (
            <button
              onClick={handleDateRangeClear}
              className="mb-0.5 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end"
              title={t('Clear') || 'Clear'}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          )}
        </div>
      );
    }

    // ── DATE RANGE + TEXT ─────────────────────────────────────────────────
    if (searchType === 'daterange_text') {
      const hasValue = fromDate || toDate || dateTextInput;
      return (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-Cairo">
              {textSearchPlaceholder || t('Search') || 'Search'}
            </label>
            <input
              type="text"
              placeholder={textSearchPlaceholder || t('Search') || 'Search...'}
              value={dateTextInput}
              onChange={(e) => setDateTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleDateTextSearchTrigger();
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-Cairo text-sm w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-Cairo">
              {fromDateLabel || t('From') || 'From'}
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={handleFromDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-Cairo text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-Cairo">
              {toDateLabel || t('To') || 'To'}
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={handleToDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-Cairo text-sm"
            />
          </div>
          <button
            onClick={handleDateTextSearchTrigger}
            className="mb-0.5 p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors self-end"
            title={t('Search') || 'Search'}
          >
            <i className="ri-search-line text-xl"></i>
          </button>
          {hasValue && (
            <button
              onClick={handleDateTextClearAll}
              className="mb-0.5 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end"
              title={t('Clear') || 'Clear'}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          )}
        </div>
      );
    }

    // ── TEXT (default) ────────────────────────────────────────────────────
    if (searchType == 'text')
      return (
        <div className="relative w-full sm:w-64 md:w-80">
          <input
            type="text"
            placeholder={t('Search') || 'Search...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchTrigger();
              }
            }}
            className="w-full px-4 py-2 ltr:pr-10 rtl:pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-Cairo"
          />
          <i className="ri-search-line absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
        </div>
      );
  };

  return (
    <div className="w-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      {(enableSearch || enableAdd) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          {renderSearch()}

          {enableAdd && (
            <div title={role === 'Auditor' ? t('NotAllowed') : ''}>
              <button
                disabled={role === 'Auditor'}
                onClick={handleAddButton}
                className={`flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-Cairo font-medium shadow-md hover:shadow-lg whitespace-nowrap ${role === 'Auditor' ? 'cursor-not-allowed' : ''
                  }`}
              >
                <i className="ri-add-line text-xl"></i>
                <span>{addButtonText || t('Add') || 'Add'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full table-auto">
            <thead className="bg-primary-500 text-white">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-3 md:px-4 py-3 text-start text-sm font-semibold font-Cairo whitespace-nowrap"
                    style={{ minWidth: column.minWidth || '100px' }}
                  >
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500 mb-4"></div>
                      <p className="text-gray-600 font-Cairo">{t('Loading') || 'Loading...'}</p>
                    </div>
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    style={{ backgroundColor: row.backColor || '#FFFFFF' }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-3 md:px-4 py-3 text-sm text-gray-700 font-Cairo text-start align-middle whitespace-nowrap"
                      >
                        {column.cell ? column.cell(row) : row[column.selector]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 font-Cairo text-lg">
                        {t('NoData') || 'No data available'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {!isLoading && data && data.length > 0 && (
          <div className="bg-gray-50 px-3 md:px-4 py-3 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-xs md:text-sm text-gray-700 font-Cairo whitespace-nowrap">
                    {t('RowsPerPage') || 'Rows per page:'}
                  </label>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="px-2 md:px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-Cairo text-xs md:text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-Cairo whitespace-nowrap">
                  {t('Showing') || 'Showing'} {(currentPage - 1) * pageSize + 1} –{' '}
                  {Math.min(currentPage * pageSize, totalRecords)} {t('of') || 'of'} {totalRecords}
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 md:px-3 py-1 rounded-md font-Cairo text-xs md:text-sm transition-colors duration-200 ${currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <i
                    className={
                      currentLang === 'ar' ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'
                    }
                  ></i>
                </button>

                {getPageNumbers().map((page, index) =>
                  page === '...' ? (
                    <span
                      key={index}
                      className="px-2 md:px-3 py-1 text-gray-500 text-xs md:text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 md:px-3 py-1 rounded-md font-Cairo text-xs md:text-sm transition-colors duration-200 min-w-[32px] ${currentPage === page
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 md:px-3 py-1 rounded-md font-Cairo text-xs md:text-sm transition-colors duration-200 ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <i
                    className={
                      currentLang === 'ar' ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'
                    }
                  ></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerSideTable;
