import React, { useEffect, useState } from "react";
import { createGetRequest } from "../../Hooks/Services/Requests";

/* ─── helpers ──────────────────────────────────────────── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const fmtDate = (s) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const InstallmentDetailsModal = ({ gameyaId, onClose, onEdit }) => {
  const [gameya, setGameya] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameyaId) return;

    const fetchGameya = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await createGetRequest(`/Gameya/${gameyaId}`);
        // single .data hop — createGetRequest already returns response.data
        setGameya(res.data);
      } catch (err) {
        setError("Failed to load gameya details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameya();
  }, [gameyaId]);

  if (!gameyaId) return null;

  const totalMonths = gameya?.totalMembers || 0;
  const totalPot = (gameya?.monthlyContribution || 0) * totalMonths;

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
                <i className="ri-team-line text-on-primary text-lg"></i>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Gameya Details
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
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Loading details…
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 flex items-center gap-3">
              <i className="ri-error-warning-line text-error text-xl"></i>
              <p className="font-body-md text-body-md text-error">{error}</p>
            </div>
          )}

          {!loading && !error && gameya && (
            <div className="flex flex-col gap-6">
              {/* ─── Gameya Name & Meta ────────────────────── */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
                  <i className="ri-group-2-line text-primary text-3xl"></i>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">
                    {gameya.name}
                  </h4>
                  <p className="font-body-sm text-body-sm text-outline mt-0.5">
                    {gameya.createdBy && `Created by ${gameya.createdBy}`}
                    {gameya.isActive ? (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high text-outline rounded-full text-[10px] font-bold">
                        ENDED
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* ─── Stats Grid ────────────────────────────── */}
              <div className="grid grid-cols-2 tab-sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-surface-container-low rounded-xl">
                  <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                    MONTHLY PAY
                  </p>
                  <p className="font-currency-display text-[18px] leading-6 text-primary">
                    {fmt(gameya.monthlyContribution)}
                  </p>
                </div>
                <div className="p-3.5 bg-surface-container-low rounded-xl">
                  <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                    MEMBERS
                  </p>
                  <p className="font-currency-display text-[18px] leading-6 text-secondary">
                    {gameya.totalMembers}
                  </p>
                </div>
                <div className="p-3.5 bg-surface-container-low rounded-xl">
                  <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                    MY TURN
                  </p>
                  <p className="font-currency-display text-[18px] leading-6 text-tertiary">
                    Month {gameya.myTurn}
                  </p>
                </div>
                <div className="p-3.5 bg-surface-container-low rounded-xl">
                  <p className="font-label-caps text-[10px] tracking-wider text-outline mb-0.5">
                    TOTAL POT
                  </p>
                  <p className="font-currency-display text-[18px] leading-6 text-primary">
                    {fmt(totalPot)}
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
                    {gameya.payments?.length || 0} months
                  </p>
                </div>

                <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/15">
                  {/* Table Header */}
                  <div className="grid grid-cols-[0.5fr_1fr_1fr_1fr] px-4 py-2.5 bg-surface-container border-b border-outline-variant/15">
                    <span className="font-label-caps text-[10px] tracking-wider text-outline">
                      #
                    </span>
                    <span className="font-label-caps text-[10px] tracking-wider text-outline">
                      TYPE
                    </span>
                    <span className="font-label-caps text-[10px] tracking-wider text-outline">
                      DATE
                    </span>
                    <span className="font-label-caps text-[10px] tracking-wider text-outline text-right">
                      AMOUNT
                    </span>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-outline-variant/10 max-h-[300px] overflow-y-auto">
                    {gameya.payments
                      ?.sort((a, b) => a.monthNumber - b.monthNumber)
                      .map((p) => {
                        const isReceived = p.type === "Received";
                        return (
                          <div
                            key={p.paymentId}
                            className={`grid grid-cols-[0.5fr_1fr_1fr_1fr] px-4 py-3 items-center transition-colors hover:bg-surface-container/50 ${
                              isReceived ? "bg-tertiary-fixed/10" : ""
                            }`}
                          >
                            <span className="font-currency-table text-[13px] text-on-surface">
                              {p.monthNumber}
                            </span>
                            <span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                                  isReceived
                                    ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                                    : "bg-primary-fixed text-on-primary-fixed-variant"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isReceived ? "bg-tertiary" : "bg-primary"
                                  }`}
                                ></span>
                                {isReceived ? "RECEIVED" : "PAID"}
                              </span>
                            </span>
                            <span className="font-body-sm text-[13px] text-outline">
                              {fmtDate(p.paidOn)}
                            </span>
                            <span
                              className={`font-currency-table text-[13px] text-right ${
                                isReceived ? "text-tertiary font-bold" : "text-on-surface"
                              }`}
                            >
                              {isReceived
                                ? `+${fmt(totalPot)}`
                                : `-${fmt(gameya.monthlyContribution)}`}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer Actions ────────────────────────────── */}
        {!loading && !error && gameya && (
          <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              CLOSE
            </button>
            <button
              onClick={() => onEdit(gameya)}
              className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97] flex items-center gap-2"
            >
              <i className="ri-edit-line text-sm"></i>
              EDIT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallmentDetailsModal;