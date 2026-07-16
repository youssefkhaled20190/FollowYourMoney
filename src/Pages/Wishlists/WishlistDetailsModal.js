import React from "react";
import { createDeleteRequest, createPostRequest } from "../../Hooks/Services/Requests";
import { useSwal } from "../../Hooks/Alert/Swal";
import { toast } from "react-toastify";

/* ─── helpers ──────────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const fmtDate = (s) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const WishlistDetailsModal = ({ wishlist, onClose, onEdit, onSuccess }) => {
  const { showDeleteConfirmation, showConfirmation, SwalComponent } = useSwal();

  if (!wishlist) return null;

  const {
    itemId,
    name,
    targetAmount,
    savedAmount,
    priority,
    dueDate,
    isAchieved,
    isCritical,
    etaLabel,
    remaining,
    requiredMonthlySaving,
    actualMonthlySave,
    requiredPercentage,
    statusLabel,
  } = wishlist;


  const progressPct = targetAmount > 0 ? Math.min(100, Math.round((savedAmount / targetAmount) * 1000) / 10) : 0;

  const formattedDueDate = dueDate && dueDate !== "0001-01-01"
    ? fmtDate(dueDate)
    : "No target date";

  const handleAchieve = () => {
    showConfirmation(
      "Confirm Achievement",
      `Are you sure you want to mark "${name}" as achieved?`,
      async () => {
        try {
          const res = await createPostRequest(`/Wishlist/Achieve/${itemId}`);
          if (res?.result) {
            toast.success("Wishlist item marked as achieved successfully");
            if (onSuccess) onSuccess();
            onClose();
          } else {
            toast.error(res?.message || "Failed to mark item as achieved");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to mark item as achieved.");
        }
      }
    );
  };

  const handleDelete = () => {
    showDeleteConfirmation(
      "Delete Item",
      `Are you sure you want to delete "${name}"?`,
      async () => {
        try {
          const res = await createDeleteRequest("/Wishlist/Delete/", itemId);
          if (res?.result) {
            toast.success("Wishlist item deleted successfully");
            if (onSuccess) onSuccess();
            onClose();
          } else {
            toast.error(res?.message || "Failed to delete wishlist item");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete wishlist item.");
        }
      }
    );
  };

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
                <i className="ri-heart-3-line text-on-primary text-lg"></i>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Wishlist Item Details
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
            {/* ─── Wishlist Item Name & Meta ────────────────────── */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
                <i className="ri-gift-line text-primary text-3xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-headline-md text-headline-md text-on-surface truncate">
                  {name}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold">
                    PRIORITY #{priority}
                  </span>
                  {isCritical && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-error/10 text-error rounded-full text-[10px] font-bold">
                      CRITICAL GOAL
                    </span>
                  )}
                  {isAchieved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold">
                      ACHIEVED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-surface-container-high text-outline rounded-full text-[10px] font-bold">
                      PENDING
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Progress Bar Section ────────────────────────── */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
              <div className="flex justify-between items-end mb-2">
                <p className="font-label-caps text-label-caps text-outline">
                  SAVINGS PROGRESS
                </p>
                <p className="font-headline-md text-secondary font-bold">
                  {progressPct}%
                </p>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mt-2">
                <div className="border-r border-outline-variant/20">
                  <p className="text-[11px] font-label-caps text-outline mb-0.5">SAVED AMOUNT</p>
                  <p className="font-currency-display text-primary text-[20px] font-semibold">{fmt(savedAmount)} EGP</p>
                </div>
                <div>
                  <p className="text-[11px] font-label-caps text-outline mb-0.5">TARGET AMOUNT</p>
                  <p className="font-currency-display text-on-surface text-[20px] font-semibold">{fmt(targetAmount)} EGP</p>
                </div>
              </div>
            </div>

            {/* ─── Stats Grid ────────────────────────────── */}
            <div className="grid grid-cols-2 tab-sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  REMAINING TO SAVE
                </p>
                <p className="font-currency-display text-[18px] leading-6 text-primary">
                  {fmt(remaining)} EGP
                </p>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  ETA
                </p>
                <p className="font-currency-display text-[18px] leading-6 text-secondary truncate" title={etaLabel}>
                  {etaLabel || "N/A"}
                </p>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  TARGET DATE
                </p>
                <p className="font-currency-display text-[18px] leading-6 text-tertiary truncate" title={formattedDueDate}>
                  {formattedDueDate}
                </p>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                  STATUS
                </p>
                <p className={`font-currency-display text-[18px] leading-6 font-semibold ${statusLabel === "On Track" || statusLabel === "Achieved"
                    ? "text-emerald-600"
                    : statusLabel === "Critical" || statusLabel === "Behind"
                      ? "text-error"
                      : "text-on-surface"
                  }`}>
                  {statusLabel || "N/A"}
                </p>
              </div>
            </div>

            {/* ─── Monthly Planning Details ──────────────────── */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
              <h5 className="font-label-caps text-label-caps text-on-surface mb-3">Monthly Allocation Insights</h5>
              <div className="grid grid-cols-1 tab-sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-label-caps text-outline mb-0.5">ACTUAL MONTHLY SAVE</p>
                  <p className="text-[16px] font-semibold text-secondary">{fmt(actualMonthlySave)} EGP</p>
                  <p className="text-[11px] text-outline mt-0.5">Allocation for all wishlists</p>
                </div>
                {dueDate && dueDate !== "0001-01-01" && (
                  <>
                    <div>
                      <p className="text-[10px] font-label-caps text-outline mb-0.5">REQUIRED MONTHLY SAVE</p>
                      <p className="text-[16px] font-semibold text-primary">{fmt(requiredMonthlySaving)} EGP</p>
                      <p className="text-[11px] text-outline mt-0.5">To reach goal by target date</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-label-caps text-outline mb-0.5">REQUIRED % OF FREE CASH</p>
                      <p className="text-[16px] font-semibold text-tertiary">{Number(requiredPercentage || 0).toFixed(1)} %</p>
                      <p className="text-[11px] text-outline mt-0.5">Share of monthly free cash</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer Actions ────────────────────────────── */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-between items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl font-label-caps text-label-caps text-error hover:bg-error/10 transition-colors flex items-center gap-1.5"
            >
              <i className="ri-delete-bin-line text-sm"></i>
              DELETE
            </button>
            {!isAchieved && (
              <button
                onClick={handleAchieve}
                className="px-4 py-2.5 rounded-xl font-label-caps text-label-caps text-emerald-600 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
              >
                <i className="ri-checkbox-circle-line text-sm"></i>
                MARK ACHIEVED
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              CLOSE
            </button>
            <button
              onClick={() => onEdit(wishlist)}
              className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97] flex items-center gap-2"
            >
              <i className="ri-edit-line text-sm"></i>
              EDIT
            </button>
          </div>
        </div>
        <SwalComponent />

      </div>
    </div>
  );
};

export default WishlistDetailsModal;