import React, { useEffect, useState, useCallback } from "react";
import { createGetRequest } from "../../Hooks/Services/Requests";
import InstallmentCard from "./InstallmentsCard";
import InstallmentDetailsModal from "./InstallmentsDetailsModal";
import InstallmentFormModal from "./InstallmentsFormModal";

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const InstallmentList = () => {
  const [Installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null); // for details modal
  const [formData, setFormData] = useState(undefined); // undefined = closed, null = add, object = edit

  const fetchInstallments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createGetRequest("/Installment/List", { pageSize: 1000 });
      // single .data hop — res is response.data, items live at res.data.items
      setInstallments(res.data?.items || []);
    } catch (err) {
      setError("Failed to load installments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstallments();
  }, [fetchInstallments]);

  // ─── Computed summary stats ───────────────────────────
  const activeCount = Installments.filter((g) => g.isActive).length;
  const totalMonthly = Installments
    .filter((g) => g.isActive)
    .reduce((sum, g) => sum + (g.monthlyContribution || 0), 0);

  return (
    <div className="max-w-container_max_width mx-auto p-margin_mobile tab-sm:p-gutter">
      {/* ─── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col tab-sm:flex-row tab-sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <i className="ri-team-line text-on-primary text-xl"></i>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile tab-sm:text-headline-lg text-on-surface">
              My Installments
            </h2>
          </div>
          <p className="text-on-surface-variant font-body-sm text-body-sm mt-1 ml-[52px]">
            Keep track of your recurring payments and debt progress.
          </p>
        </div>
        <button
          onClick={() => setFormData(null)}
          className="flex items-center justify-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-headline-md text-body-md hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97]"
        >
          <i className="ri-add-line text-lg"></i>
          <span>Add Installment</span>
        </button>
      </div>

      {/* ─── Summary Stats Bar ───────────────────────────── */}
      {!loading && !error && Installments.length > 0 && (
        <div className="grid grid-cols-2 tab-sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 shadow-[0_2px_8px_rgba(0,59,90,0.04)]">
            <p className="font-label-caps text-label-caps text-outline mb-1">
              ACTIVE CIRCLES
            </p>
            <p className="font-currency-display text-currency-display text-primary">
              {activeCount}
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 shadow-[0_2px_8px_rgba(0,59,90,0.04)]">
            <p className="font-label-caps text-label-caps text-outline mb-1">
              MONTHLY COMMITMENT
            </p>
            <p className="font-currency-display text-currency-display text-secondary">
              {fmt(totalMonthly)}{" "}
              <span className="text-body-sm font-body-sm text-outline">
                EGP
              </span>
            </p>
          </div>
          <div className="hidden tab-sm:block bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 shadow-[0_2px_8px_rgba(0,59,90,0.04)]">
            <p className="font-label-caps text-label-caps text-outline mb-1">
              TOTAL CIRCLES
            </p>
            <p className="font-currency-display text-currency-display text-on-surface">
              {Installments.length}
            </p>
          </div>
        </div>
      )}

      {/* ─── Loading State ───────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Loading your installments…
            </p>
          </div>
        </div>
      )}

      {/* ─── Error State ─────────────────────────────────── */}
      {error && (
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-6 flex items-center gap-4">
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
            onClick={fetchInstallments}
            className="ml-auto px-4 py-2 text-error font-label-caps text-label-caps hover:bg-error/10 rounded-lg transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* ─── Gameya Cards Grid ───────────────────────────── */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {gameyas.map((g) => (
            <installmentCard
              key={g.installmentId}
              gameya={g}
              onViewDetails={setSelectedId}
            />
          ))}

          {/* ─── Empty State ─────────────────────────────── */}
          {gameyas.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-outline-variant/40 rounded-xl p-10 flex flex-col items-center justify-center text-center gap-5 bg-surface-container-low/30">
              <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center">
                <i className="ri-group-2-line text-primary text-4xl"></i>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                  No Gameyas Yet
                </h3>
                <p className="font-body-md text-body-md text-outline max-w-sm">
                  Create your first rotating savings circle and start tracking
                  your monthly contributions and turns.
                </p>
              </div>
              <button
                onClick={() => setFormData(null)}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97]"
              >
                <i className="ri-add-line"></i>
                ADD FIRST GAMEYA
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ──────────────────────────────────────── */}
      {selectedId && (
        <installmentDetailsModal
          gameyaId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={(gameya) => {
            setSelectedId(null);
            setFormData(gameya);
          }}
        />
      )}

      {formData !== undefined && (
        <InstallmentFormModal
          initialData={formData}
          onClose={() => setFormData(undefined)}
          onSuccess={fetchGameyas}
        />
      )}
    </div>
  );
};

export default InstallmentList;