import React from "react";

/* ─── helpers ──────────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const getMonthStatus = (gameya, monthNumber) => {
  const payment = gameya.payments?.find((p) => p.monthNumber === monthNumber);
  if (!payment) return "pending";
  if (payment.type === "Received") return "received";
  if (payment.type === "Paid") return "paid";
  return "pending";
};

/* ─── timeline dot classes ─────────────────────────────── */
const dotBase =
  "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 relative";

const dotClasses = {
  paid: "bg-secondary text-on-secondary shadow-[0_2px_6px_rgba(0,99,151,0.25)]",
  received:
    "bg-tertiary text-on-tertiary ring-[3px] ring-tertiary/20 shadow-[0_2px_8px_rgba(77,49,0,0.3)]",
  pending: "bg-surface-container-high text-on-surface-variant",
};

const InstallmentCard = ({ gameya, onViewDetails }) => {
  const totalMonths = gameya.totalMembers || gameya.payments?.length || 0;
  const months = Array.from({ length: totalMonths }, (_, i) => i + 1);

  // Count how many months are paid/received (progress)
  const completedMonths = gameya.payments?.length || 0;
  const progressPct = totalMonths > 0 ? Math.round((completedMonths / totalMonths) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-[0_4px_15px_rgba(0,59,90,0.05)] flex flex-col relative overflow-hidden group hover:border-secondary/40 hover:shadow-[0_6px_24px_rgba(0,59,90,0.09)] transition-all duration-300">
      {/* ─── Accent top bar ──────────────────────────────── */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary/60"></div>

      <div className="p-6 flex flex-col gap-5">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
            <i className="ri-team-line text-primary text-2xl"></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface truncate">
                {gameya.name}
              </h3>
              <span
                className={`flex-shrink-0 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                  gameya.isActive
                    ? "bg-secondary/10 text-secondary"
                    : "bg-surface-container-high text-outline"
                }`}
              >
                {gameya.isActive ? "Active" : "Ended"}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-0.5">
              {gameya.createdBy && <>Created by {gameya.createdBy} • </>}
              {totalMonths} members •{" "}
              {gameya.endDate && gameya.endDate !== "0001-01-01"
                ? `Ends ${new Date(gameya.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}`
                : `Starts ${new Date(gameya.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}`}
            </p>
          </div>
        </div>

        {/* ─── Stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-surface-container-low rounded-xl">
            <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
              MONTHLY PAY
            </p>
            <p className="font-currency-display text-[20px] leading-7 text-primary">
              {fmt(gameya.monthlyContribution)}{" "}
              <span className="text-[12px] font-body-sm text-outline">EGP</span>
            </p>
          </div>
          <div className="p-3.5 bg-surface-container-low rounded-xl">
            <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
              TOTAL POT
            </p>
            <p className="font-currency-display text-[20px] leading-7 text-secondary">
              {fmt(gameya.monthlyContribution * totalMonths)}{" "}
              <span className="text-[12px] font-body-sm text-outline">EGP</span>
            </p>
          </div>
        </div>

        {/* ─── Timeline ────────────────────────────────────── */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="font-label-caps text-[10px] tracking-wider text-on-surface-variant">
              COLLECTION TIMELINE
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <p className="font-body-sm text-[12px] font-semibold text-tertiary">
                My Turn: Month {gameya.myTurn}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-surface-container-high rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between gap-1 flex-wrap">
            {months.map((m) => {
              const status = getMonthStatus(gameya, m);
              const isMyTurn = m === gameya.myTurn;

              return (
                <div
                  key={m}
                  title={`Month ${m}: ${status}${isMyTurn ? " (Your Turn)" : ""}`}
                  className={`${dotBase} ${
                    isMyTurn && status === "pending"
                      ? "border-2 border-tertiary text-tertiary ring-[3px] ring-tertiary/15 bg-surface-container-lowest"
                      : dotClasses[status]
                  }`}
                >
                  {m}
                  {isMyTurn && status === "received" && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-tertiary-fixed-dim rounded-full border-[1.5px] border-surface-container-lowest"></span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-[10px] text-outline">Paid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="text-[10px] text-outline">Received</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-surface-container-high border border-outline-variant"></span>
              <span className="text-[10px] text-outline">Upcoming</span>
            </div>
          </div>
        </div>

        {/* ─── Footer ──────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
          <p className="font-body-sm text-body-sm text-outline">
            {completedMonths} of {totalMonths} months completed
          </p>
          <button
            onClick={() => onViewDetails(gameya.gameyaId)}
            className="flex items-center gap-1 text-secondary font-label-caps text-label-caps hover:gap-2 transition-all duration-200"
          >
            VIEW DETAILS
            <i className="ri-arrow-right-s-line text-base"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallmentCard;