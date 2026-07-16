import React from "react";

/* ─── helpers ──────────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const formatDate = (dateStr) =>
  dateStr && dateStr !== "0001-01-01"
    ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "N/A";

/* Maps the numeric priority (1 = highest) to a display label + badge classes */
const PRIORITY_STYLES = {
  1: { label: "Critical", classes: "bg-error-container text-on-error-container" },
  2: { label: "High", classes: "bg-tertiary-fixed text-on-tertiary-fixed" },
  3: { label: "Medium", classes: "bg-surface-container-highest text-on-surface-variant" },
};
const getPriorityStyle = (priority) =>
  PRIORITY_STYLES[priority] || {
    label: `Priority #${priority}`,
    classes: "bg-surface-container-highest text-on-surface-variant",
  };

/* statusLabel badge (Behind / On Track / Ahead ...) */
const STATUS_STYLES = {
  Behind: "bg-error-container text-on-error-container",
  "On Track": "bg-secondary-fixed text-on-secondary-fixed",
  Ahead: "bg-tertiary-fixed text-on-tertiary-fixed",
};
const getStatusClasses = (statusLabel) =>
  STATUS_STYLES[statusLabel] || "bg-surface-container-highest text-on-surface-variant";

/* ────────────────────────────────────────────────────────── */

const WishlistCard = ({ wishlist, index, onViewDetails, onEdit, onAddSavings, onDragStart, onDragOver, onDrop }) => {
  const {
    itemId,
    name,
    targetAmount,
    savedAmount,
    priority,
    isAchieved,
    isCritical,
    dueDate,
    remaining,
    etaLabel,
    statusLabel,
  } = wishlist;

  const progressPct =
    targetAmount > 0
      ? Math.min(100, Math.round((savedAmount / targetAmount) * 1000) / 10)
      : 0;

  const priorityStyle = getPriorityStyle(priority);

  const stop = (e) => e.stopPropagation();

  return (
    <div
      onClick={() => onViewDetails?.(itemId)}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="group bg-surface-container-lowest p-5 rounded-xl shadow-sm hover:shadow-md flex gap-5 items-start border border-transparent hover:border-secondary/20 transition-all cursor-pointer"
    >
      {/* Rank badge */}
      <div className="flex flex-col items-center gap-2 pt-1" onClick={stop}>
        <button
          className="drag-handle text-outline-variant hover:text-primary cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <i className="ri-drag-move-fill text-lg"></i>
        </button>
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
          {index + 1}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h4 className="font-headline-md text-headline-md text-on-surface truncate">
                {name}
              </h4>

              {isCritical && (
                <span className={`px-2 py-0.5 rounded font-label-caps text-[10px] uppercase tracking-wider font-bold ${priorityStyle.classes}`}>
                  {priorityStyle.label}
                </span>
              )}

              {!isAchieved && statusLabel && (
                <span className={`px-2 py-0.5 rounded font-label-caps text-[10px] uppercase tracking-wider font-bold ${getStatusClasses(statusLabel)}`}>
                  {statusLabel}
                </span>
              )}

              {isAchieved && (
                <span className="px-2 py-0.5 rounded font-label-caps text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                  <i className="ri-checkbox-circle-fill text-[11px]"></i>
                  Achieved
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                <i className="ri-time-line text-base text-secondary"></i>
                ETA: {etaLabel || "N/A"}
              </span>
              {dueDate && dueDate !== "0001-01-01" && (
                <span className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                  <i className="ri-calendar-event-line text-base text-secondary"></i>
                  Target: {formatDate(dueDate)}
                </span>
              )}
              <span className="flex items-center gap-1 text-secondary text-body-sm font-semibold">
                <i className="ri-line-chart-line text-base"></i>
                {progressPct}% Complete
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="font-currency-table text-currency-table text-on-surface-variant">
              Target: {fmt(targetAmount)} EGP
            </p>
            <p className="font-currency-display text-currency-display text-primary">
              {fmt(savedAmount)} EGP
            </p>
            {remaining > 0 && (
              <p className="font-currency-table text-currency-table text-on-surface-variant">
                {fmt(remaining)} EGP left
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-surface-container-highest rounded-full mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAchieved ? "bg-emerald-500" : "bg-primary"
              }`}
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => { stop(e); onEdit?.(wishlist); }}
            className="px-4 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-low transition-colors"
          >
            Edit
          </button>
          {!isAchieved && (
            <button
              onClick={(e) => { stop(e); onAddSavings?.(wishlist); }}
              className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-caps text-label-caps hover:shadow-lg transition-all active:scale-95"
            >
              Add Savings
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;