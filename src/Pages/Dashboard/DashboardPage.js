import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createGetRequest } from "../../Hooks/Services/Requests";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COLORS = ["#003b5a", "#006397", "#f2bd74", "#ba1a1a", "#4caf50"];

const DashboardPage = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (selectedYear, selectedMonth) => {
    setLoading(true);
    try {
      const params = {
        "Filter.Year": selectedYear,
        "Filter.Month": selectedMonth,
        pageNumber: 1,
        pageSize: 1,
      };

      const res = await createGetRequest("/MonthlySnapshot/Latest", params);

      if (res?.result && res.data) {
        setSnapshot(res.data);
      } else {
        setSnapshot(null);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      toast.error("Failed to load dashboard data.");
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(year, month);
  }, [year, month]);

  /* ─── Prepare Data for Income Allocation Pie Chart ─────── */
  const getPieData = () => {
    if (!snapshot) return [];
    const totalIncome = snapshot.salary + snapshot.bonuses + snapshot.carryOver;
    const weeklyTotal = snapshot.weeklyBudget * 4;
    const remaining = Math.max(
      0,
      totalIncome -
      snapshot.totalCommitments -
      snapshot.allocatedToWishlist -
      weeklyTotal -
      snapshot.carryOverGoal
    );

    return [
      { name: "Commitments", value: Number(snapshot.totalCommitments) },
      { name: "Wishlist Alloc", value: Number(snapshot.allocatedToWishlist) },
      { name: "Weekly Budgets", value: Number(weeklyTotal) },
      { name: "Carry Over Goal", value: Number(snapshot.carryOverGoal) },
      { name: "Remaining Cash", value: Number(remaining) },
    ].filter((d) => d.value > 0);
  };

  /* ─── Prepare Data for Weekly Budgets Bar Chart ────────── */
  const getBarData = () => {
    if (!snapshot || !snapshot.weeklyBudgets) return [];
    return snapshot.weeklyBudgets
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map((w) => ({
        name: `W${w.weekNumber}`,
        Budget: Number(w.budgetAmount),
        Spent: Number(w.spentAmount),
      }));
  };

  const totalIncome = snapshot
    ? snapshot.salary + snapshot.bonuses + snapshot.carryOver
    : 0;

  return (
    <div className="p-gutter max-w-[1750px] mx-auto w-full flex flex-col gap-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Financial Dashboard</h1>
          <p className="text-on-surface-variant font-body-lg">
            Real-time analytics and tracking of your monthly budgets and cash flows.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/35 shadow-sm">
          <div className="flex flex-col px-2">
            <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="h-8 w-px bg-outline-variant/50"></div>
          <div className="flex flex-col px-2">
            <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Month</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) =>
                idx === 0 ? null : (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-outline font-body-md text-sm">Aggregating visual insights...</p>
        </div>
      ) : !snapshot ? (
        /* Empty State with Call to Action */
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-16 text-center shadow-sm max-w-2xl mx-auto mt-8">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-5">
            <i className="ri-folder-open-line text-3xl text-outline"></i>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            No Monthly Plan Created
          </h3>
          <p className="text-outline text-sm mt-2 max-w-md mx-auto leading-relaxed">
            There is no active financial blueprint configured for{" "}
            <span className="font-semibold text-on-surface">
              {MONTH_NAMES[month]} {year}
            </span>
            . Create one now to define your budgets, wishlist targets, and track commitments.
          </p>
          <Link
            to="/monthly-plan/page"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-label-caps text-label-caps hover:shadow-lg transition-all duration-200"
          >
            <i className="ri-add-line text-lg"></i>
            Configure Month Plan
          </Link>
        </div>
      ) : (
        /* Dashboard Charts and Metrics */
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,59,90,0.02)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Total Income</span>
              <span className="font-currency-display text-xl text-primary font-bold block mt-1.5">
                {fmt(totalIncome)} EGP
              </span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,59,90,0.02)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Commitments</span>
              <span className="font-currency-display text-xl text-error font-bold block mt-1.5">
                {fmt(snapshot.totalCommitments)} EGP
              </span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,59,90,0.02)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Wishlist Alloc</span>
              <span className="font-currency-display text-xl text-secondary font-bold block mt-1.5">
                {fmt(snapshot.allocatedToWishlist)} EGP
              </span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,59,90,0.02)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Weekly Budget</span>
              <span className="font-currency-display text-xl text-tertiary font-bold block mt-1.5">
                {fmt(snapshot.weeklyBudget)} EGP
              </span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,59,90,0.02)] col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Free Cash</span>
              <span className="font-currency-display text-xl text-emerald-600 font-bold block mt-1.5">
                {fmt(snapshot.freeCash)} EGP
              </span>
            </div>
          </div>

          {/* Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Income Allocation (Pie Chart) */}
            <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 className="text-on-surface font-headline-md text-[16px] font-bold uppercase tracking-wider mb-1">
                  Income Allocation
                </h3>
                <p className="text-outline text-xs">How your monthly income is utilized.</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {getPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${fmt(value)} EGP`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-outline-variant/20 pt-4">
                {getPieData().map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    <span className="text-on-surface-variant font-medium truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Budget Progress (Bar Chart) */}
            <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 className="text-on-surface font-headline-md text-[16px] font-bold uppercase tracking-wider mb-1">
                  Weekly Budgets Comparison
                </h3>
                <p className="text-outline text-xs">Weekly allocated budgets vs actual spent amounts.</p>
              </div>

              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getBarData()}
                    margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ebeef0" />
                    <XAxis dataKey="name" stroke="#72787f" fontSize={11} tickLine={false} />
                    <YAxis stroke="#72787f" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => `${fmt(value)} EGP`} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="Budget" fill="#003b5a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Spent" fill="#ba1a1a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Summaries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Commitments */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-on-surface font-headline-md text-[15px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <i className="ri-bank-card-line text-primary"></i> Active Commitments
              </h3>
              <div className="space-y-4">
                {/* Gameyas List */}
                <div>
                  <h4 className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Gameyas</h4>
                  {snapshot.gameyas && snapshot.gameyas.length > 0 ? (
                    <div className="space-y-2">
                      {snapshot.gameyas.map((g, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 text-xs font-semibold"
                        >
                          <span className="text-on-surface">{g.name}</span>
                          <span className="font-currency-table text-primary">{fmt(g.monthlyContribution)} EGP</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-outline italic">No active Gameyas for this month.</p>
                  )}
                </div>

                {/* Installments List */}
                <div>
                  <h4 className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Installments</h4>
                  {snapshot.installments && snapshot.installments.length > 0 ? (
                    <div className="space-y-2">
                      {snapshot.installments.map((inst, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 text-xs font-semibold"
                        >
                          <span className="text-on-surface">{inst.name}</span>
                          <span className="font-currency-table text-error">{fmt(inst.monthlyAmount)} EGP</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-outline italic">No active installments for this month.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Wishlist Tracking */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-on-surface font-headline-md text-[15px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <i className="ri-heart-line text-secondary"></i> Wishlist Goals Tracker
              </h3>
              {snapshot.wishlistSummary && snapshot.wishlistSummary.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {snapshot.wishlistSummary.map((item, idx) => {
                    const pct = item.targetAmount > 0
                      ? Math.min(100, Math.round((item.savedAmount / item.targetAmount) * 100))
                      : 0;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 text-xs flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-on-surface">{item.name}</span>
                          <span className="text-outline text-[10px]">{item.etaLabel || "Achieved"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-outline">Saved: <span className="text-secondary font-semibold">{fmt(item.savedAmount)} EGP</span></span>
                          <span className="text-outline">Target: <span className="text-on-surface font-semibold">{fmt(item.targetAmount)} EGP</span></span>
                        </div>
                        <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-outline text-xs">
                  No pending wishlist goals configured.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
