import React, { useEffect, useState, useCallback } from "react";
import { createGetRequest, createUpdateRequest } from "../../Hooks/Services/Requests";
import WishlistCard from "./WishlistCard";
import WishlistDetailsModal from "./WishlistDetailsModal";
import WishlistFormModal from "./WishlistFormModal";

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const WishlistList = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null); // for details modal
  const [formData, setFormData] = useState(undefined); // undefined = closed, null = add, object = edit
  const [addSavingsData, setAddSavingsData] = useState(null); // stores wishlist object for inline Add Savings modal

  const fetchWishlists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createGetRequest("/Wishlist/List", { pageSize: 1000 });
      setWishlists(res.data?.items || []);
    } catch (err) {
      setError("Failed to load wishlists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlists();
  }, [fetchWishlists]);

  // Drag and Drop ordering handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    if (sourceIndex === targetIndex) return;

    const updated = [...wishlists];
    const [draggedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    // Recalculate priority locally based on list order
    const updatedWithNewPriorities = updated.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

    setWishlists(updatedWithNewPriorities);

    // Sequentially save priorities to backend
    try {
      for (const item of updatedWithNewPriorities) {
        await createUpdateRequest("/Wishlist/Update", {
          itemId: item.itemId,
          name: item.name,
          targetAmount: item.targetAmount,
          savedAmount: item.savedAmount,
          priority: item.priority,
          dueDate: item.dueDate,
          isCritical: item.isCritical,
          savePercentage: item.savePercentage || 0,
        });
      }
      fetchWishlists();
    } catch (err) {
      console.error("Failed to update priorities:", err);
      setError("Failed to save wishlist priorities.");
    }
  };

  // ─── Computed stats ──────────────────────────────────
  const totalGoalValue = wishlists.reduce((sum, i) => sum + (i.targetAmount || 0), 0);
  const totalSaved = wishlists.reduce((sum, i) => sum + (i.savedAmount || 0), 0);
  const overallProgressPct = totalGoalValue > 0 ? Math.min(100, Math.round((totalSaved / totalGoalValue) * 100)) : 0;

  const nextMilestone = wishlists.find((i) => !i.isAchieved);
  const selectedWishlist = wishlists.find((i) => i.itemId === selectedId);

  return (
    <div className="max-w-[1750px] mx-auto p-margin_mobile tab-sm:p-gutter">
      {/* ─── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col tab-sm:flex-row tab-sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <i className="ri-heart-3-line text-on-primary text-xl"></i>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile tab-sm:text-headline-lg text-on-surface">
              My wishlists
            </h2>
          </div>
          <p className="text-on-surface-variant font-body-sm text-body-sm mt-1 ml-[52px]">
            Track and Prioritize your future purchases and financial goals.
          </p>
        </div>
        <button
          onClick={() => setFormData(null)}
          className="flex items-center justify-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-headline-md text-body-md hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97]"
        >
          <i className="ri-add-line text-lg"></i>
          <span>Add Wishlist</span>
        </button>
      </div>

      {/* ─── Loading State ───────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Loading your wishlists…
            </p>
          </div>
        </div>
      )}

      {/* ─── Error State ─────────────────────────────────── */}
      {error && (
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-6 flex items-center gap-4 mb-8 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
            <i className="ri-error-warning-line text-error text-xl"></i>
          </div>
          <div>
            <p className="font-body-md text-body-md text-error font-semibold">
              Something went wrong
            </p>
            <p className="font-body-sm text-body-sm text-on-error-container">
              {error}
            </p>
          </div>
          <button
            onClick={fetchWishlists}
            className="ml-auto px-4 py-2 text-error font-label-caps text-label-caps hover:bg-error/10 rounded-lg transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* ─── Bento Grid Redesign ─────────────────────────── */}
      {!loading && !error && (
        <div className="grid grid-cols-12 gap-gutter">
          {/* Left Column: Bento Stats */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            {/* Overview Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-4">
                WISHLIST OVERVIEW
              </p>
              <div className="space-y-4">
                <div>
                  <span className="text-body-sm text-on-surface-variant">Total Goal Value</span>
                  <p className="font-currency-display text-currency-display text-primary font-bold">
                    {fmt(totalGoalValue)} <span className="text-body-sm font-normal text-outline">EGP</span>
                  </p>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-500 rounded-full"
                    style={{ width: `${overallProgressPct}%` }}
                  ></div>
                </div>
                <div>
                  <span className="text-body-sm text-on-surface-variant">Currently Saved ({overallProgressPct}%)</span>
                  <p className="font-currency-display text-currency-display text-secondary font-bold">
                    {fmt(totalSaved)} <span className="text-body-sm font-normal text-outline">EGP</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Next Milestone Card */}
            {nextMilestone && (
              <div className="bg-primary text-on-primary p-6 rounded-xl shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <p className="font-label-caps text-label-caps text-on-primary-container mb-2">
                    NEXT MILESTONE
                  </p>
                  <h3 className="font-headline-md text-headline-md mb-2 truncate" title={nextMilestone.name}>
                    {nextMilestone.name}
                  </h3>
                  <p className="text-body-sm opacity-90 mb-4 leading-relaxed">
                    {nextMilestone.etaLabel
                      ? `Estimated completion: ${nextMilestone.etaLabel}.`
                      : "No ETA details available."}
                  </p>
                  <button
                    onClick={() => setSelectedId(nextMilestone.itemId)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3 rounded-lg font-label-caps text-label-caps transition-colors"
                  >
                    View Breakdown
                  </button>
                </div>
                <i className="ri-sparkling-fill absolute -bottom-6 -right-6 text-[128px] opacity-10 pointer-events-none"></i>
              </div>
            )}
          </div>

          {/* Right Column: Active Goals List */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-headline-md text-primary">Active Goals</h3>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <i className="ri-information-line text-sm"></i>
                <span className="text-body-sm italic">Drag handles to re-prioritize</span>
              </div>
            </div>

            <div className="flex flex-col gap-gutter" id="wishlist-container">
              {wishlists.map((g, index) => (
                <WishlistCard
                  key={g.itemId}
                  wishlist={g}
                  index={index}
                  onViewDetails={setSelectedId}
                  onEdit={setFormData}
                  onAddSavings={setAddSavingsData}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                />
              ))}

              {/* Empty State */}
              {wishlists.length === 0 && (
                <div className="col-span-full border-2 border-dashed border-outline-variant/40 rounded-xl p-10 flex flex-col items-center justify-center text-center gap-5 bg-surface-container-low/30">
                  <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center">
                    <i className="ri-heart-3-line text-primary text-4xl"></i>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                      No Wishlists Yet
                    </h3>
                    <p className="font-body-md text-body-md text-outline max-w-sm">
                      Add your first wishlist to track your desired items and progress.
                    </p>
                  </div>
                  <button
                    onClick={() => setFormData(null)}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97]"
                  >
                    <i className="ri-add-line"></i>
                    ADD FIRST WISHLIST
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Details Modal ────────────────────────────────── */}
      {selectedId && selectedWishlist && (
        <WishlistDetailsModal
          wishlist={selectedWishlist}
          onClose={() => setSelectedId(null)}
          onSuccess={fetchWishlists}
          onEdit={(wishlist) => {
            setSelectedId(null);
            setFormData(wishlist);
          }}
        />
      )}

      {/* ─── Add/Edit Form Modal ──────────────────────────── */}
      {formData !== undefined && (
        <WishlistFormModal
          initialData={formData}
          onClose={() => setFormData(undefined)}
          onSuccess={fetchWishlists}
        />
      )}

      {/* ─── Add Savings Inline Modal ─────────────────────── */}
      {addSavingsData && (
        <div
          className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setAddSavingsData(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,59,90,0.15)] w-full max-w-md overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-outline-variant/20">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <i className="ri-money-dollar-circle-line text-secondary text-xl"></i>
                  Add Savings
                </h3>
                <button
                  onClick={() => setAddSavingsData(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-body-sm text-outline mb-4">
                Add savings amount for <strong>{addSavingsData.name}</strong>. Current savings: {fmt(addSavingsData.savedAmount)} / {fmt(addSavingsData.targetAmount)} EGP.
              </p>
              <label className="font-label-caps text-[10px] tracking-wider text-outline mb-1.5 block">
                SAVINGS AMOUNT (EGP)
              </label>
              <input
                type="number"
                id="savingsAmountInput"
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-on-surface font-currency-table"
              />
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-end gap-3">
              <button
                onClick={() => setAddSavingsData(null)}
                className="px-5 py-2.5 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={async () => {
                  const inputVal = document.getElementById("savingsAmountInput")?.value;
                  const addAmount = Number(inputVal);
                  if (!addAmount || addAmount <= 0) {
                    alert("Please enter a valid savings amount.");
                    return;
                  }
                  try {
                    const newSaved = Math.min(addSavingsData.targetAmount, addSavingsData.savedAmount + addAmount);
                    const res = await createUpdateRequest("/Wishlist/Update", {
                      itemId: addSavingsData.itemId,
                      name: addSavingsData.name,
                      targetAmount: addSavingsData.targetAmount,
                      savedAmount: newSaved,
                      priority: addSavingsData.priority,
                      dueDate: addSavingsData.dueDate,
                      isCritical: addSavingsData.isCritical,
                      savePercentage: addSavingsData.savePercentage || 0
                    });
                    if (res?.result) {
                      setAddSavingsData(null);
                      fetchWishlists();
                    } else {
                      alert(res?.message || "Failed to add savings.");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("An error occurred while adding savings.");
                  }
                }}
                className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg transition-all"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistList;