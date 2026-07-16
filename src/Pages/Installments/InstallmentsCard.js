import React from "react";

/* ─── helpers ──────────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const InstallmentCard = ({ installment, onViewDetails }) => {
  const {
    installmentId,
    name,
    monthlyAmount,
    totalMonths,
    paidMonths,
    endDate,
    isCompleted,
  } = installment;

  // Compute progress with 1 decimal place
  const progressPct = totalMonths > 0 ? Math.round((paidMonths / totalMonths) * 1000) / 10 : 0;
  
  const formattedEndDate = endDate && endDate !== "0001-01-01"
    ? new Date(endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "N/A";

  const handleCardClick = () => {
    onViewDetails(installmentId);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="glass-card bg-surface-container-lowest/80 backdrop-blur-md p-6 rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Col 1: Icon & Title */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-on-primary font-bold flex-shrink-0 shadow-sm">
              <i className="ri-bank-card-fill text-lg"></i>
            </div>
            <div className="min-w-0">
              <h3 className="font-headline-md text-headline-md text-on-surface truncate">
                {name}
              </h3>
            </div>
          </div>
        </div>

        {/* Col 2: Monthly Amount */}
        <div className="lg:w-48">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">
            MONTHLY AMOUNT
          </p>
          <p className="font-currency-table text-currency-display text-primary">
            {fmt(monthlyAmount)} <span className="text-xs font-normal text-on-surface-variant">EGP</span>
          </p>
        </div>

        {/* Col 3: Progress & End Date */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between items-end mb-2">
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              PROGRESS ({paidMonths} OF {totalMonths} MONTHS)
            </p>
            <p className="font-body-sm font-bold text-secondary">
              {progressPct}%
            </p>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary rounded-full transition-all duration-500" 
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-2 flex items-center gap-1">
            <i className="ri-calendar-event-line text-base text-secondary"></i>
            Est. End Date: {formattedEndDate}
          </p>
        </div>

        {/* Col 4: Status Indicator */}
        <div className="lg:ml-auto flex items-center">
          {isCompleted ? (
            <span className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 flex items-center gap-1.5 shadow-sm">
              <i className="ri-checkbox-circle-fill text-base"></i>
              Completed
            </span>
          ) : (
            <span className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-secondary/10 text-secondary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallmentCard;