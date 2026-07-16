import React from "react";

/* ─── helpers ──────────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const fmtDate = (s) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const InstallmentDetailsModal = ({ installment, onClose, onEdit }) => {
  if (!installment) return null;

  const {
    name,
    monthlyAmount,
    totalMonths,
    paidMonths,
    startDate,
    isActive,
    remainingMonths,
    isCompleted,
  } = installment;

  const totalVal = monthlyAmount * totalMonths;

  // Generate simulated payment schedule
  const baseDate = new Date(startDate);
  const payments = Array.from({ length: totalMonths || 0 }, (_, i) => {
    const monthNum = i + 1;
    const dueDate = new Date(baseDate);
    dueDate.setMonth(baseDate.getMonth() + i);
    return {
      monthNumber: monthNum,
      dueDate: dueDate.toISOString(),
      isPaid: monthNum <= paidMonths,
    };
  });

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,59,90,0.15)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <i className="ri-bank-card-line text-on-primary text-lg"></i>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Installment Details
                </h3>
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

        {/* ─── Content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6">
            {/* ─── Installment Name & Meta ────────────────────── */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
                <i className="ri-bank-card-line text-primary text-3xl"></i>
              </div>
              <div>
                <h4 className="font-headline-md text-headline-md text-on-surface">
                  {name}
                </h4>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high text-outline rounded-full text-[10px] font-bold">
                      COMPLETED
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high text-outline rounded-full text-[10px] font-bold">
                      INACTIVE
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* ─── Stats Grid ────────────────────────────── */}
            <div className="grid grid-cols-2 tab-sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  MONTHLY AMOUNT
                </p>
                <p className="font-currency-display text-[18px] leading-6 text-primary">
                  {fmt(monthlyAmount)}
                </p>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  PAID MONTHS
                </p>
                <p className="font-currency-display text-[18px] leading-6 text-secondary">
                  {paidMonths} / {totalMonths}
                </p>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  MONTHS LEFT
                </p>
                <p className="font-currency-display text-[18px] leading-6 text-tertiary">
                  {remainingMonths}
                </p>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  TOTAL VALUE
                </p>
                <p className="font-currency-display text-[18px] leading-6 text-primary">
                  {fmt(totalVal)}
                </p>
              </div>
            </div>

            {/* ─── Payment Schedule ──────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-label-caps text-label-caps text-on-surface-variant">
                  PAYMENT SCHEDULE
                </p>
                <p className="font-body-sm text-[12px] text-outline">
                  {totalMonths} months duration
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/15">
                {/* Table Header */}
                <div className="grid grid-cols-[0.5fr_1fr_1.2fr_1fr] px-4 py-2.5 bg-surface-container border-b border-outline-variant/15">
                  <span className="font-label-caps text-[10px] tracking-wider text-outline">
                    MONTH
                  </span>
                  <span className="font-label-caps text-[10px] tracking-wider text-outline">
                    STATUS
                  </span>
                  <span className="font-label-caps text-[10px] tracking-wider text-outline">
                    DUE DATE
                  </span>
                  <span className="font-label-caps text-[10px] tracking-wider text-outline text-right">
                    AMOUNT
                  </span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-outline-variant/10 max-h-[300px] overflow-y-auto">
                  {payments.map((p) => {
                    return (
                      <div
                        key={p.monthNumber}
                        className={`grid grid-cols-[0.5fr_1fr_1.2fr_1fr] px-4 py-3 items-center transition-colors hover:bg-surface-container/50 ${
                          p.isPaid ? "bg-secondary-fixed/5" : ""
                        }`}
                      >
                        <span className="font-currency-table text-[13px] text-on-surface font-semibold">
                          #{p.monthNumber}
                        </span>
                        <span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                              p.isPaid
                                ? "bg-secondary/15 text-secondary"
                                : "bg-outline/10 text-outline"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.isPaid ? "bg-secondary animate-pulse" : "bg-outline"
                              }`}
                            ></span>
                            {p.isPaid ? "PAID" : "PENDING"}
                          </span>
                        </span>
                        <span className="font-body-sm text-[13px] text-outline">
                          {fmtDate(p.dueDate)}
                        </span>
                        <span className="font-currency-table text-[13px] text-right text-on-surface font-bold">
                          -{fmt(monthlyAmount)} EGP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer Actions ────────────────────────────── */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            CLOSE
          </button>
          <button
            onClick={() => onEdit(installment)}
            className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97] flex items-center gap-2"
          >
            <i className="ri-edit-line text-sm"></i>
            EDIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallmentDetailsModal;