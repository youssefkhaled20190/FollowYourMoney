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
  const activeCount = Installments.filter((i) => i.isActive).length;
  const totalMonthly = Installments
    .filter((i) => i.isActive)
    .reduce((sum, i) => sum + (i.monthlyAmount || 0), 0);

  const selectedInstallment = Installments.find((i) => i.installmentId === selectedId);

  return (
    <div className="max-w-[1750px] mx-auto p-margin_mobile tab-sm:p-gutter w-full flex flex-col gap-8">
      {/* ─── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col tab-sm:flex-row tab-sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <i className="ri-bank-card-line text-on-primary text-xl"></i>
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
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-[0_2px_8px_rgba(0,59,90,0.04)] overflow-hidden relative group transition-all hover:shadow-[0_4px_16px_rgba(0,59,90,0.08)]">
            <div className="relative z-10">
              <p className="font-label-caps text-label-caps text-outline mb-2">
                ACTIVE INSTALLMENTS
              </p>
              <p className="font-currency-display text-currency-display text-primary font-bold">
                {activeCount}
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-[0.06] text-secondary pointer-events-none z-0 group-hover:scale-110 transition-transform duration-300">
              <i className="ri-checkbox-circle-fill text-[96px]"></i>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-[0_2px_8px_rgba(0,59,90,0.04)] overflow-hidden relative group transition-all hover:shadow-[0_4px_16px_rgba(0,59,90,0.08)]">
            <div className="relative z-10">
              <p className="font-label-caps text-label-caps text-outline mb-2">
                MONTHLY COMMITMENT
              </p>
              <p className="font-currency-display text-currency-display text-secondary font-bold">
                {fmt(totalMonthly)}{" "}
                <span className="text-body-sm font-body-sm text-outline font-normal">
                  EGP
                </span>
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-[0.06] text-primary pointer-events-none z-0 group-hover:scale-110 transition-transform duration-300">
              <i className="ri-cash-line text-[96px]"></i>
            </div>
          </div>
          <div className="hidden tab-sm:block bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-[0_2px_8px_rgba(0,59,90,0.04)] overflow-hidden relative group transition-all hover:shadow-[0_4px_16px_rgba(0,59,90,0.08)]">
            <div className="relative z-10">
              <p className="font-label-caps text-label-caps text-outline mb-2">
                TOTAL INSTALLMENTS
              </p>
              <p className="font-currency-display text-currency-display text-on-surface font-bold">
                {Installments.length}
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-[0.06] text-outline pointer-events-none z-0 group-hover:scale-110 transition-transform duration-300">
              <i className="ri-bank-card-fill text-[96px]"></i>
            </div>
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

      {/* ─── Cards List ───────────────────────────── */}
      {!loading && !error && (
        <div className="flex flex-col gap-gutter">
          {Installments.map((g) => (
            <InstallmentCard
              key={g.installmentId}
              installment={g}
              onViewDetails={setSelectedId}
              onSuccess={fetchInstallments}
            />
          ))}

          {/* ─── Empty State ─────────────────────────────── */}
          {Installments.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-outline-variant/40 rounded-xl p-10 flex flex-col items-center justify-center text-center gap-5 bg-surface-container-low/30">
              <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center">
                <i className="ri-bank-card-line text-primary text-4xl"></i>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                  No Installments Yet
                </h3>
                <p className="font-body-md text-body-md text-outline max-w-sm">
                  Add your first installment to track your recurring payments, loans, and debt progress.
                </p>
              </div>
              <button
                onClick={() => setFormData(null)}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97]"
              >
                <i className="ri-add-line"></i>
                ADD FIRST INSTALLMENT
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ──────────────────────────────────────── */}
      {selectedId && selectedInstallment && (
        <InstallmentDetailsModal
          installment={selectedInstallment}
          onClose={() => setSelectedId(null)}
          onEdit={(installment) => {
            setSelectedId(null);
            setFormData(installment);
          }}
        />
      )}

      {formData !== undefined && (
        <InstallmentFormModal
          initialData={formData}
          onClose={() => setFormData(undefined)}
          onSuccess={fetchInstallments}
        />
      )}
    </div>
  );
};

export default InstallmentList;