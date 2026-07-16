import React, { useState, useEffect } from "react";
import { createGetRequest } from "../../Hooks/Services/Requests";
import HistoryDetailsModal from "./HistoryDetailsModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const HistoryList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  /* ─── Filters State ──────────────────────────────────── */
  const [showFilters, setShowFilters] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  /* ─── Selected Snapshot for Modal ────────────────────── */
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  const fetchHistory = async (pageNumber = 1, append = false) => {
    setLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize: 10,
        orderBy: "CreatedAt",
        order: "desc",
      };

      if (filterYear) {
        params["Filter.Year"] = Number(filterYear);
      }
      if (filterMonth) {
        params["Filter.Month"] = Number(filterMonth);
      }

      const res = await createGetRequest("/MonthlySnapshot/History", params);

      if (res?.result) {
        const historyData = res.data;
        const newItems = historyData.items || [];
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasNext(historyData.hasNext);
        setPage(historyData.pageNumber);
      } else {
        toast.error(res?.message || "Failed to load financial history.");
      }
    } catch (err) {
      console.error("Error fetching financial history:", err);
      toast.error("Failed to fetch financial history.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterMonth]);

  const loadMore = () => {
    if (!loading && hasNext) {
      fetchHistory(page + 1, true);
    }
  };

  /* ─── Group by Year ───────────────────────────────────── */
  const groupItemsByYear = () => {
    const groups = {};
    items.forEach((item) => {
      const y = item.year;
      if (!groups[y]) {
        groups[y] = [];
      }
      groups[y].push(item);
    });
    // Sort years descending
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        snapshots: groups[year].sort((a, b) => b.month - a.month),
      }));
  };

  const groupedYears = groupItemsByYear();

  /* ─── Export CSV ─────────────────────────────────────── */
  const exportToCSV = () => {
    if (items.length === 0) {
      toast.info("No data available to export.");
      return;
    }
    const headers = ["Year", "Month", "Salary", "Bonuses", "Carry Over", "Total Income", "Total Commitments", "Free Cash", "Weekly Budget"];
    const rows = items.map((item) => [
      item.year,
      MONTH_NAMES[item.month],
      item.salary,
      item.bonuses,
      item.carryOver,
      item.salary + item.bonuses + item.carryOver,
      item.totalCommitments,
      item.freeCash,
      item.weeklyBudget,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial history exported successfully!");
  };

  return (
    <div className="p-gutter max-w-[1750px] mx-auto w-full flex flex-col gap-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Financial History</h1>
          <p className="text-on-surface-variant font-body-lg">Retrospective view of your monthly performance and cash flow trends.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters || filterYear || filterMonth
              ? "border-primary bg-primary/5 text-primary"
              : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
              }`}
          >
            <i class="ri-filter-line"></i>
            <span className="font-label-caps">Filter</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">download</span>
            <span className="font-label-caps">Export</span>
          </button>
        </div>
      </div>

      {/* Sleek Filters Panel */}
      {showFilters && (
        <div className="mb-8 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/35 flex flex-wrap gap-4 items-end animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col gap-1.5 w-full sm:w-48">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Years</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-48">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Months</option>
              {MONTH_NAMES.map((name, index) =>
                index === 0 ? null : (
                  <option key={index} value={index}>{name}</option>
                )
              )}
            </select>
          </div>
          <button
            onClick={() => {
              setFilterYear("");
              setFilterMonth("");
            }}
            className="px-4 py-2 text-xs font-semibold text-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Main Content / List */}
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-outline font-body-md text-sm">Loading history logs...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center shadow-sm">
          <i className="ri-history-line text-4xl text-outline mb-3 block"></i>
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">No History Logs Found</h3>
          <p className="text-outline text-sm mt-1 max-w-md mx-auto">
            You haven't created any monthly plans yet. Once you set up blueprints or finalize snapshots, they will be archived here.
          </p>
        </div>
      ) : (
        groupedYears.map(({ year, snapshots }) => (
          <section key={year} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-headline-md text-headline-md text-primary font-bold">{year}</h2>
              <div className="h-px flex-1 bg-outline-variant/50"></div>
            </div>

            <div className="space-y-4">
              {snapshots.map((item) => {
                const totalIncome = item.salary + item.bonuses + item.carryOver;
                return (
                  <div
                    key={item.snapshotId}
                    className="bg-surface-container-lowest rounded-xl p-6 hover:bg-surface-container-low transition-all border border-transparent hover:border-outline-variant/60 group shadow-sm"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-6 items-center gap-6">
                      <div className="col-span-2 md:col-span-1">
                        <p className="font-label-caps text-[10px] text-outline tracking-wider font-bold">PERIOD</p>
                        <h3 className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">
                          {MONTH_NAMES[item.month]} {item.year}
                        </h3>
                      </div>

                      <div className="col-span-1">
                        <p className="font-label-caps text-[10px] text-outline tracking-wider font-bold mb-1">INCOME</p>
                        <p className="font-currency-table text-currency-table text-primary font-semibold">
                          {fmt(totalIncome)} EGP
                        </p>
                      </div>

                      <div className="col-span-1">
                        <p className="font-label-caps text-[10px] text-outline tracking-wider font-bold mb-1">COMMITMENTS</p>
                        <p className="font-currency-table text-currency-table text-error font-semibold">
                          {fmt(item.totalCommitments)} EGP
                        </p>
                      </div>

                      <div className="col-span-1">
                        <p className="font-label-caps text-[10px] text-outline tracking-wider font-bold mb-1">FREE CASH</p>
                        <p className="font-currency-table text-currency-table text-secondary font-semibold">
                          {fmt(item.freeCash)} EGP
                        </p>
                      </div>

                      <div className="col-span-1">
                        <p className="font-label-caps text-[10px] text-outline tracking-wider font-bold mb-1">WEEKLY BUDGET</p>
                        <p className="font-currency-table text-currency-table text-tertiary font-semibold">
                          {fmt(item.weeklyBudget)} EGP
                        </p>
                      </div>

                      <div className="col-span-2 md:col-span-1 text-right">
                        <button
                          onClick={() => setSelectedSnapshot(item)}
                          className="w-full md:w-auto bg-surface-container-highest text-primary font-bold px-6 py-2 rounded-lg group-hover:bg-primary group-hover:text-on-primary transition-all active:scale-95 text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* Pagination Button */}
      {hasNext && !initialLoading && (
        <div className="flex justify-center py-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-primary font-bold flex items-center gap-2 hover:underline disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined">keyboard_arrow_down</span>
            )}
            Load Older History
          </button>
        </div>
      )}

      {/* History Detail Modal */}
      {selectedSnapshot && (
        <HistoryDetailsModal
          snapshot={selectedSnapshot}
          onClose={() => setSelectedSnapshot(null)}
        />
      )}
    </div>
  );
};

export default HistoryList;
