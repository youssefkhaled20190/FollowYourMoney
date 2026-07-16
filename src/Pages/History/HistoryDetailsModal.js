import React, { useState } from "react";
import "remixicon/fonts/remixicon.css";

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const fmtDate = (s) => {
  const d = new Date(s);
  return d.toLocaleDateString("en-EG", { month: "short", day: "numeric" });
};

const HistoryDetailsModal = ({ snapshot, onClose }) => {
  const [activeTab, setActiveTab] = useState("weeks");

  if (!snapshot) return null;

  const totalIncome = snapshot.salary + snapshot.bonuses + snapshot.carryOver;

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,59,90,0.15)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <i className="ri-history-line text-on-primary text-lg"></i>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Snapshot Details
                </h3>
                <p className="font-body-sm text-[12px] text-outline mt-0.5">
                  Created on {new Date(snapshot.createdAt).toLocaleString("en-EG")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* ─── Overview Section ────────────────────────────── */}
        <div className="bg-surface-container-low/40 p-6 border-b border-outline-variant/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <span className="text-[12px] uppercase tracking-widest text-outline font-bold">Monthly Period</span>
              <h4 className="font-headline-lg text-primary text-2xl mt-0.5">
                {new Date(snapshot.year, snapshot.month - 1).toLocaleString("en-US", { month: "long" })} {snapshot.year}
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              <div className="bg-surface-container-lowest border border-outline-variant/25 px-4 py-2 rounded-xl text-center shadow-sm">
                <span className="text-[9px] font-bold text-outline block uppercase tracking-wider">Salary</span>
                <span className="font-currency-table text-on-surface font-bold text-[13px]">{fmt(snapshot.salary)} EGP</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/25 px-4 py-2 rounded-xl text-center shadow-sm">
                <span className="text-[9px] font-bold text-outline block uppercase tracking-wider">Bonuses</span>
                <span className="font-currency-table text-on-surface font-bold text-[13px]">{fmt(snapshot.bonuses)} EGP</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/25 px-4 py-2 rounded-xl text-center shadow-sm">
                <span className="text-[9px] font-bold text-outline block uppercase tracking-wider">Carry Over</span>
                <span className="font-currency-table text-on-surface font-bold text-[13px]">{fmt(snapshot.carryOver)} EGP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,59,90,0.03)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Total Income</span>
              <span className="font-currency-display text-lg text-primary block mt-1">{fmt(totalIncome)} EGP</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,59,90,0.03)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Commitments</span>
              <span className="font-currency-display text-lg text-error block mt-1">{fmt(snapshot.totalCommitments)} EGP</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,59,90,0.03)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Allocated to Wishlist</span>
              <span className="font-currency-display text-lg text-secondary block mt-1">{fmt(snapshot.allocatedToWishlist)} EGP</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,59,90,0.03)]">
              <span className="text-[10px] font-bold tracking-wider text-outline block uppercase">Weekly Budget</span>
              <span className="font-currency-display text-lg text-tertiary block mt-1">{fmt(snapshot.weeklyBudget)} EGP</span>
            </div>
          </div>
        </div>

        {/* ─── Tabs Navigation ────────────────────────────── */}
        <div className="px-6 border-b border-outline-variant/15 flex gap-4 bg-surface-container-lowest">
          <button
            onClick={() => setActiveTab("weeks")}
            className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "weeks"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <i className="ri-calendar-event-line"></i>
            Weekly Budgets
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "wishlist"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <i className="ri-heart-line"></i>
            Wishlist Goals
          </button>
          <button
            onClick={() => setActiveTab("commitments")}
            className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "commitments"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <i className="ri-bank-card-line"></i>
            Commitments Breakdown
          </button>
        </div>

        {/* ─── Content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-surface-container-lowest">
          {/* TAB 1: WEEKLY BUDGETS */}
          {activeTab === "weeks" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {snapshot.weeklyBudgets && snapshot.weeklyBudgets.length > 0 ? (
                snapshot.weeklyBudgets
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map((week) => {
                    const remaining = week.budgetAmount - week.spentAmount;
                    const pct = week.budgetAmount > 0
                      ? Math.min(100, Math.round((week.spentAmount / week.budgetAmount) * 100))
                      : 0;
                    const isOver = remaining < 0;

                    return (
                      <div
                        key={week.weekBudgetId || week.weekNumber}
                        className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-sm hover:border-secondary transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
                              Week {String(week.weekNumber).padStart(2, "0")}
                            </p>
                            <p className="text-[10px] text-outline mt-0.5">
                              {fmtDate(week.weekStart)} – {fmtDate(week.weekEnd)}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-surface-container text-on-surface-variant">
                            Historical
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-baseline">
                            <span className="text-on-surface-variant text-xs">Budget</span>
                            <span className="font-currency-table text-on-surface font-semibold">
                              {fmt(week.budgetAmount)} EGP
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-on-surface-variant text-xs">Spent</span>
                            <span className={`font-currency-table ${week.spentAmount > 0 ? "text-error" : "text-on-surface"} font-semibold`}>
                              {fmt(week.spentAmount)} EGP
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/20">
                            <span className="font-semibold text-xs">Remaining</span>
                            <span className={`font-currency-table font-bold ${isOver ? "text-error" : "text-secondary"}`}>
                              {fmt(remaining)} EGP
                            </span>
                          </div>

                          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-error" : "bg-secondary"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {week.note && (
                            <div className={`mt-3 p-2.5 rounded-lg text-[10px] border flex items-start gap-1.5 leading-relaxed bg-surface-container-low text-on-surface-variant border-outline-variant/20`}>
                              <i className="ri-information-line text-secondary text-xs flex-shrink-0"></i>
                              <span>{week.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-2 text-center py-10 text-outline">
                  No weekly budget data found.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST GOALS */}
          {activeTab === "wishlist" && (
            <div className="space-y-3">
              {snapshot.wishlistSummary && snapshot.wishlistSummary.length > 0 ? (
                <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/15">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-4 py-2.5 bg-surface-container border-b border-outline-variant/15 font-label-caps text-[10px] tracking-wider text-outline">
                    <span>Goal Name</span>
                    <span className="text-right">Target</span>
                    <span className="text-right">Saved</span>
                    <span className="text-right">ETA Status</span>
                  </div>

                  <div className="divide-y divide-outline-variant/10">
                    {snapshot.wishlistSummary.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-4 py-3 items-center hover:bg-surface-container-high/40 transition-colors">
                        <div className="flex items-center gap-2">
                          <i className={`ri-star-line text-sm ${item.isCritical ? "text-tertiary font-bold" : "text-outline"}`}></i>
                          <span className="font-semibold text-xs text-on-surface">{item.name}</span>
                        </div>
                        <span className="font-currency-table text-xs text-right text-on-surface">{fmt(item.targetAmount)} EGP</span>
                        <span className="font-currency-table text-xs text-right text-secondary">{fmt(item.savedAmount)} EGP</span>
                        <span className="text-xs text-right font-medium text-outline">{item.etaLabel || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-outline">
                  No wishlist goals configured for this snapshot.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMITMENTS BREAKDOWN */}
          {activeTab === "commitments" && (
            <div className="space-y-6">
              {/* Gameyas */}
              <div>
                <h5 className="text-[12px] font-bold text-outline uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <i className="ri-donut-chart-line text-primary"></i> Gameyas
                </h5>
                {snapshot.gameyas && snapshot.gameyas.length > 0 ? (
                  <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/15">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-4 py-2.5 bg-surface-container border-b border-outline-variant/15 font-label-caps text-[10px] tracking-wider text-outline">
                      <span>Name</span>
                      <span className="text-right">Monthly Pay</span>
                      <span className="text-right">My Turn</span>
                      <span className="text-right">Status</span>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                      {snapshot.gameyas.map((g, idx) => (
                        <div key={idx} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-4 py-3 items-center hover:bg-surface-container-high/40 transition-colors">
                          <span className="font-semibold text-xs text-on-surface">{g.name}</span>
                          <span className="font-currency-table text-xs text-right text-on-surface">{fmt(g.monthlyContribution)} EGP</span>
                          <span className="text-xs text-right text-on-surface-variant">Month {g.myTurn} of {g.totalMembers}</span>
                          <span className="text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              g.isActive
                                ? "bg-secondary/10 text-secondary"
                                : "bg-outline/10 text-outline"
                            }`}>
                              {g.isActive ? "Active" : "Ended"}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-outline italic ml-2">No active Gameyas in this period.</p>
                )}
              </div>

              {/* Installments */}
              <div>
                <h5 className="text-[12px] font-bold text-outline uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <i className="ri-cash-line text-error"></i> Installments
                </h5>
                {snapshot.installments && snapshot.installments.length > 0 ? (
                  <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/15">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr] px-4 py-2.5 bg-surface-container border-b border-outline-variant/15 font-label-caps text-[10px] tracking-wider text-outline">
                      <span>Name</span>
                      <span className="text-right">Monthly Amount</span>
                      <span className="text-right">End Date</span>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                      {snapshot.installments.map((inst, idx) => (
                        <div key={idx} className="grid grid-cols-[1.5fr_1fr_1fr] px-4 py-3 items-center hover:bg-surface-container-high/40 transition-colors">
                          <span className="font-semibold text-xs text-on-surface">{inst.name}</span>
                          <span className="font-currency-table text-xs text-right text-error">{fmt(inst.monthlyAmount)} EGP</span>
                          <span className="text-xs text-right text-outline">
                            {inst.endDate ? new Date(inst.endDate).toLocaleDateString("en-EG", { year: "numeric", month: "short" }) : "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-outline italic ml-2">No active Installments in this period.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer ──────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailsModal;
