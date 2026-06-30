import React, { useState, useEffect } from "react";
import useTranslate from "../../Hooks/Translation/useTranslate";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import swal from "sweetalert";
import {
    createGetRequest,
    createPostRequest,
    createUpdateRequest,
    createDeleteRequest,
} from "../../Hooks/Services/Requests";

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n) =>
    Number(n ?? 0).toLocaleString("en-EG", { maximumFractionDigits: 0 });

const MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/* ─── helper: extract snapshot from API response ── */
const extractSnapshot = (res) => {
    const snapshot = res?.data ?? null;

    if (!snapshot || typeof snapshot !== "object") {
        console.warn("[MonthlyPlan] Unexpected response shape:", res);
        return null;
    }
    return snapshot;
};

/* ─── icon shorthand ────────────────────────────────────── */
const Icon = ({ name, className = "" }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

/* ─── Week card ─────────────────────────────────────────── */
const WeekCard = ({ week }) => {
    const pct = week.budgetAmount > 0
        ? Math.min(100, Math.round((week.spentAmount / week.budgetAmount) * 100))
        : 0;
    const fmtDate = (s) => {
        const d = new Date(s);
        return d.toLocaleDateString("en-EG", { month: "short", day: "numeric" });
    };
    const isActive = week.daysRemaining > 0;
    const remaining = week.remainingBudget;
    const isOver = remaining < 0;

    return (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-[0_4px_15px_rgba(0,59,90,0.05)] group hover:border-secondary transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                        Week {String(week.weekNumber).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] text-outline mt-0.5">
                        {fmtDate(week.weekStart)} – {fmtDate(week.weekEnd)}
                    </p>
                </div>
                <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isActive
                        ? "bg-secondary/10 text-secondary"
                        : "bg-surface-container text-on-surface-variant"
                        }`}
                >
                    {isActive ? "Active" : "Upcoming"}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-body-sm text-on-surface-variant">Budget</span>
                    <span className="font-currency-table text-currency-table text-on-surface">
                        {fmt(week.budgetAmount)}
                    </span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-body-sm text-on-surface-variant">Spent</span>
                    <span className={`font-currency-table text-currency-table ${week.spentAmount > 0 ? "text-error" : "text-on-surface"}`}>
                        {fmt(week.spentAmount)}
                    </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/30">
                    <span className="text-body-sm font-bold">Remaining</span>
                    <span className={`font-currency-table text-currency-table font-bold ${isOver ? "text-error" : isActive ? "text-secondary" : "text-on-surface"}`}>
                        {fmt(remaining)}
                    </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full mt-3">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${isOver ? "bg-error" : "bg-secondary"}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>

                {week.note && (
                    <div className={`mt-4 p-3 rounded-lg text-[11px] border flex items-start gap-1.5 leading-relaxed ${week.note.includes("more money")
                            ? "bg-green-50 text-green-800 border-green-200/50"
                            : "bg-amber-50 text-amber-800 border-amber-200/50"
                        }`}>
                        <i className={`text-sm flex-shrink-0 ${week.note.includes("more money")
                                ? "ri-checkbox-circle-line text-green-600"
                                : "ri-information-line text-amber-600"
                            }`}></i>
                        <span>{week.note}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Main Page ─────────────────────────────────────────── */
const Page = () => {
    const { t } = useTranslate();
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    /* ── Replan Form State ── */
    const [isReplanOpen, setIsReplanOpen] = useState(false);
    const [replanCashInHand, setReplanCashInHand] = useState("");
    const [replanCarryOverGoal, setReplanCarryOverGoal] = useState("");
    const [replanNote, setReplanNote] = useState("");
    const [replanLoading, setReplanLoading] = useState(false);

    /* ── Wishlist Modal State ── */
    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
    const [editingWishlistId, setEditingWishlistId] = useState(null);
    const [wishlistName, setWishlistName] = useState("");
    const [wishlistPrice, setWishlistPrice] = useState("");
    const [wishlistSavedAmount, setWishlistSavedAmount] = useState("");
    const [wishlistDueDate, setWishlistDueDate] = useState("");
    const [wishlistPriority, setWishlistPriority] = useState(1);
    const [wishlistIsCritical, setWishlistIsCritical] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    /* ── Load latest snapshot on mount ── */
    const fetchLatest = async () => {
        try {
            const res = await createGetRequest("/MonthlySnapshot/Latest");
            const data = extractSnapshot(res);
            if (data) {
                setSnapshot(data);
                setIsEditing(false);
            } else {
                setSnapshot(null);
                setIsEditing(true); // default to configure mode if no snapshot
            }
        } catch (err) {
            console.info("[MonthlyPlan] No existing snapshot:", err?.message);
            setSnapshot(null);
            setIsEditing(true);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchLatest();
    }, []);

    const formik = useFormik({
        initialValues: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            salary: 0,
            bonuses: 0,
            carryOver: 0,
            wishlistCalculationMode: "fixed", // "fixed" or "percentage"
            wishlistPercentage: 20, // default 20%
            allocatedToWishlist: 0,
            customWeeklyBudgetEnabled: false,
            customWeeklyBudget: 0,
            carryOverGoal: 0,
        },
        validationSchema: Yup.object({
            year: Yup.number().min(2000, t("Invalid year")).required(t("Year is required")),
            month: Yup.number().min(1, t("Select a month")).max(12).required(t("Month is required")),
            salary: Yup.number().min(1, t("Salary must be greater than 0")).required(t("Salary is required")),
            wishlistPercentage: Yup.number().min(0).max(100),
            allocatedToWishlist: Yup.number().min(0, t("Cannot be negative")),
            customWeeklyBudget: Yup.number().min(0, t("Cannot be negative")),
            carryOverGoal: Yup.number().min(0, t("Cannot be negative")),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const payload = {
                    year: values.year,
                    month: values.month,
                    salary: values.salary,
                    bonuses: values.bonuses,
                    carryOver: values.carryOver,
                    carryOverGoal: values.carryOverGoal,
                    allocatedToWishlist: values.wishlistCalculationMode === "percentage" ? 0 : values.allocatedToWishlist,
                    wishlistPercentage: values.wishlistCalculationMode === "percentage" ? values.wishlistPercentage : null,
                    customWeeklyBudget: values.customWeeklyBudgetEnabled ? values.customWeeklyBudget : null,
                };

                if (isEditing && snapshot) {
                    // PUT Update endpoint
                    await createUpdateRequest("/MonthlySnapshot/Update", {
                        snapshotId: snapshot.snapshotId,
                        ...payload
                    });
                    toast.success(t("Plan blueprint updated successfully"));
                } else {
                    // POST Create endpoint
                    await createPostRequest("/MonthlySnapshot/create", payload);
                    toast.success(t("Plan blueprint calculated successfully"));
                }

                await fetchLatest();
            } catch (error) {
                toast.error(error.response?.data?.message || t("Failed to save plan blueprint"));
                console.error("[MonthlyPlan] Submit error:", error);
            } finally {
                setLoading(false);
            }
        },
    });

    const startEditing = () => {
        if (snapshot) {
            formik.setValues({
                year: snapshot.year,
                month: snapshot.month,
                salary: snapshot.salary,
                bonuses: snapshot.bonuses,
                carryOver: snapshot.carryOver,
                wishlistCalculationMode: snapshot.wishlistPercentage !== null ? "percentage" : "fixed",
                wishlistPercentage: snapshot.wishlistPercentage ?? 20,
                allocatedToWishlist: snapshot.allocatedToWishlist,
                customWeeklyBudgetEnabled: snapshot.customWeeklyBudget !== null,
                customWeeklyBudget: snapshot.customWeeklyBudget ?? 0,
                carryOverGoal: snapshot.carryOverGoal,
            });
        }
        setIsEditing(true);
    };

    const handleMidMonthReplan = async (e) => {
        e.preventDefault();
        if (!replanCashInHand || isNaN(replanCashInHand) || Number(replanCashInHand) < 0) {
            toast.error(t("Please enter a valid cash amount in hand"));
            return;
        }

        try {
            setReplanLoading(true);
            await createPostRequest("/MonthlySnapshot/RePlan", {
                cashInHand: Number(replanCashInHand),
                carryOverGoal: replanCarryOverGoal ? Number(replanCarryOverGoal) : null,
                note: replanNote,
            });
            toast.success(t("Re-plan redistribution completed successfully"));
            setIsReplanOpen(false);
            setReplanCashInHand("");
            setReplanCarryOverGoal("");
            setReplanNote("");
            await fetchLatest();
        } catch (err) {
            toast.error(err.response?.data?.message || t("Re-plan failed."));
        } finally {
            setReplanLoading(false);
        }
    };

    const openAddWishlistModal = () => {
        setEditingWishlistId(null);
        setWishlistName("");
        setWishlistPrice("");
        setWishlistSavedAmount("");
        setWishlistDueDate("");
        setWishlistPriority(1);
        setWishlistIsCritical(false);
        setIsWishlistModalOpen(true);
    };

    const openEditWishlistModal = (item) => {
        setEditingWishlistId(item.itemId);
        setWishlistName(item.name);
        setWishlistPrice(item.targetAmount);
        setWishlistSavedAmount(item.savedAmount);
        setWishlistDueDate(item.dueDate || "");
        setWishlistPriority(item.priority || 1);
        setWishlistIsCritical(item.isCritical || false);
        setIsWishlistModalOpen(true);
    };

    const handleSaveWishlist = async (e) => {
        e.preventDefault();
        if (!wishlistName.trim()) {
            toast.error(t("Please enter a goal name"));
            return;
        }
        if (!wishlistPrice || Number(wishlistPrice) <= 0) {
            toast.error(t("Please enter a valid price"));
            return;
        }

        try {
            setWishlistLoading(true);
            const payload = {
                itemId: editingWishlistId || 0,
                name: wishlistName,
                targetAmount: Number(wishlistPrice),
                savedAmount: wishlistSavedAmount ? Number(wishlistSavedAmount) : 0,
                priority: Number(wishlistPriority),
                dueDate: wishlistDueDate || null,
                isCritical: wishlistIsCritical,
                savePercentage: 0,
            };

            let response;
            if (editingWishlistId) {
                response = await createUpdateRequest("/Wishlist/Update", payload);
            } else {
                response = await createPostRequest("/Wishlist/Add", payload);
            }

            if (response?.result) {
                toast.success(editingWishlistId ? t("Goal updated successfully") : t("Goal added successfully"));
                setIsWishlistModalOpen(false);
                await fetchLatest();

                // Trigger SweetAlert popup if critical goal is underfunded
                if (wishlistIsCritical && wishlistDueDate && snapshot) {
                    const today = new Date();
                    const targetDate = new Date(wishlistDueDate);
                    const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
                    const validMonths = Math.max(1, monthsRemaining);
                    const remainingToSave = Number(wishlistPrice) - Number(wishlistSavedAmount || 0);
                    const requiredMonthlySaving = remainingToSave / validMonths;

                    if (snapshot.allocatedToWishlist < requiredMonthlySaving) {
                        const extraMonth = Math.ceil(requiredMonthlySaving - snapshot.allocatedToWishlist);
                        const extraWeek = Math.ceil(extraMonth / 4);

                        swal({
                            title: "Goal Underfunded!",
                            text: `This goal is Critical! However, your current monthly wishlist saving (${fmt(snapshot.allocatedToWishlist)} EGP) cannot achieve this goal by the target date. \n\nTo achieve this, you need to save an additional ${fmt(extraMonth)} EGP per month (around ${fmt(extraWeek)} EGP per week from your recommended weekly budget of ${fmt(snapshot.weeklyBudget)} EGP).\n\nPlease increase your wishlist saving percentage in your blueprint settings or adjust your weekly budget to achieve this goal.`,
                            icon: "warning",
                            button: "I Understand",
                        });
                    }
                }
            } else {
                toast.error(response?.message || t("Failed to save wishlist goal"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t("An error occurred while saving"));
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleDeleteWishlist = (id) => {
        swal({
            title: t("Are you sure?"),
            text: t("Do you want to delete this wishlist goal?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const response = await createDeleteRequest("/Wishlist/Delete/", id);
                    if (response?.result) {
                        toast.success(t("Goal deleted successfully"));
                        await fetchLatest();
                    } else {
                        toast.error(response?.message || t("Failed to delete goal"));
                    }
                } catch (err) {
                    toast.error(err.response?.data?.message || t("An error occurred while deleting"));
                }
            }
        });
    };

    /* ── Derived budget integrity percentages ── */
    const commitmentsPct = snapshot && snapshot.totalIncome > 0
        ? Math.round((snapshot.totalCommitments / snapshot.totalIncome) * 100)
        : 0;
    const carryOverGoalPct = snapshot && snapshot.totalIncome > 0
        ? Math.round(((snapshot.carryOverGoal ?? 0) / snapshot.totalIncome) * 100)
        : 0;
    const savingsPct = snapshot && snapshot.totalIncome > 0
        ? Math.round(((snapshot.allocatedToWishlist ?? 0) / snapshot.totalIncome) * 100)
        : 0;
    const livingPct = Math.max(0, 100 - commitmentsPct - savingsPct - carryOverGoalPct);

    const monthLabel = snapshot
        ? `${MONTH_NAMES[snapshot.month] ?? ""} ${snapshot.year}`
        : "";

    return (
        <>
            <ToastContainer position="top-right" />

            <div className="p-gutter max-w-[1750px] mx-auto w-full flex flex-col gap-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col tab-sm:flex-row justify-between items-start tab-sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-headline-lg text-headline-lg text-primary">
                            Monthly Blueprint
                        </h2>
                        <p className="text-on-surface-variant text-body-md">
                            Create your monthly spending rules, saving rules, and goal timelines
                            {snapshot ? ` for ${monthLabel}` : ""}.
                        </p>
                    </div>

                    {snapshot && !isEditing && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={startEditing}
                                className="bg-surface-container border border-outline-variant hover:border-primary text-primary px-5 py-2.5 rounded-lg text-sm font-label-caps flex items-center gap-2 transition-all active:scale-95"
                            >
                                <i className="ri-edit-line text-lg"></i>
                                {t("Edit Blueprint")}
                            </button>
                            <button
                                onClick={() => {
                                    setReplanCarryOverGoal(snapshot.carryOverGoal);
                                    setIsReplanOpen(true);
                                }}
                                className="bg-secondary text-on-secondary px-5 py-2.5 rounded-lg text-sm font-label-caps flex items-center gap-2 hover:bg-secondary/90 transition-all active:scale-95 shadow-md shadow-secondary/15"
                            >
                                <i className="ri-refresh-line text-lg"></i>
                                {t("Mid-Month Re-Plan")}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Section 1 — Blueprint Inputs / Edit Form ── */}
                {isEditing && (
                    <section className="bg-surface-container-lowest rounded-xl p-6 tab-md:p-8 shadow-[0_4px_15px_rgba(0,59,90,0.05)] border border-outline-variant/30 relative">
                        <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4">
                            <div className="flex items-center gap-2">
                                <i className="ri-settings-4-line text-secondary text-xl"></i>
                                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">
                                    {snapshot ? "Edit Plan Blueprint" : "Configure Monthly Blueprint"}
                                </h3>
                            </div>
                            {snapshot && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-on-surface-variant hover:text-primary transition-all"
                                >
                                    <i className="ri-close-line text-2xl"></i>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 tab-sm:grid-cols-2 tab-lg:grid-cols-3 gap-6 mb-8">
                            {/* Year */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    disabled={!!snapshot} // prevent changing month/year for existing blueprint
                                    value={formik.values.year}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 font-currency-table text-currency-table outline-none transition-all disabled:opacity-60"
                                    placeholder="2026"
                                />
                                {formik.touched.year && formik.errors.year && (
                                    <p className="text-error text-[11px]">{formik.errors.year}</p>
                                )}
                            </div>

                            {/* Month */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant">
                                    Month
                                </label>
                                <select
                                    name="month"
                                    disabled={!!snapshot}
                                    value={formik.values.month}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 font-currency-table text-currency-table outline-none transition-all disabled:opacity-60"
                                >
                                    <option value={0}>Select month</option>
                                    {MONTH_NAMES.slice(1).map((m, i) => (
                                        <option key={i + 1} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                {formik.touched.month && formik.errors.month && (
                                    <p className="text-error text-[11px]">{formik.errors.month}</p>
                                )}
                            </div>

                            {/* Salary */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant">
                                    Base Salary
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="salary"
                                        value={formik.values.salary}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none transition-all"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                        EGP
                                    </span>
                                </div>
                                {formik.touched.salary && formik.errors.salary && (
                                    <p className="text-error text-[11px]">{formik.errors.salary}</p>
                                )}
                            </div>

                            {/* Bonuses */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant">
                                    Bonuses / Extras
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="bonuses"
                                        value={formik.values.bonuses}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none transition-all"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                        EGP
                                    </span>
                                </div>
                            </div>

                            {/* Carry-over from previous month */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant">
                                    Carry-over from Prev. Month
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="carryOver"
                                        value={formik.values.carryOver}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none transition-all"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                        EGP
                                    </span>
                                </div>
                            </div>

                            {/* Carry-Over Goal */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant">
                                    Savings Goal (Next Month Carryover)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="carryOverGoal"
                                        value={formik.values.carryOverGoal}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none transition-all"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                        EGP
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Wishlist Allocation Calculation Mode ── */}
                        <div className="border-t border-outline-variant/30 pt-6 mb-6">
                            <h4 className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-4 font-bold">
                                Wishlist Savings Calculation Mode
                            </h4>
                            <div className="grid grid-cols-1 tab-sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer font-body-sm text-on-surface">
                                        <input
                                            type="radio"
                                            name="wishlistCalculationMode"
                                            value="percentage"
                                            checked={formik.values.wishlistCalculationMode === "percentage"}
                                            onChange={() => formik.setFieldValue("wishlistCalculationMode", "percentage")}
                                            className="text-secondary focus:ring-secondary"
                                        />
                                        Calculate as Percentage of Free Cash (20%, 50%, Custom)
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-body-sm text-on-surface">
                                        <input
                                            type="radio"
                                            name="wishlistCalculationMode"
                                            value="fixed"
                                            checked={formik.values.wishlistCalculationMode === "fixed"}
                                            onChange={() => formik.setFieldValue("wishlistCalculationMode", "fixed")}
                                            className="text-secondary focus:ring-secondary"
                                        />
                                        Set Fixed Saving Amount (EGP)
                                    </label>
                                </div>

                                <div className="flex flex-col justify-center">
                                    {formik.values.wishlistCalculationMode === "percentage" ? (
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                                Select Percentage
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => formik.setFieldValue("wishlistPercentage", 20)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold font-label-caps transition-all ${formik.values.wishlistPercentage === 20 ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"}`}
                                                >
                                                    20% Savings
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => formik.setFieldValue("wishlistPercentage", 50)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold font-label-caps transition-all ${formik.values.wishlistPercentage === 50 ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"}`}
                                                >
                                                    50% Savings
                                                </button>
                                                <div className="relative flex-1 max-w-[120px]">
                                                    <input
                                                        type="number"
                                                        name="wishlistPercentage"
                                                        value={formik.values.wishlistPercentage}
                                                        onChange={formik.handleChange}
                                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-3 py-2 text-center text-sm font-bold font-currency-table outline-none"
                                                        placeholder="Custom"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-on-surface-variant pointer-events-none">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-caps text-label-caps text-on-surface-variant">
                                                Allocated to Wishlist
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="allocatedToWishlist"
                                                    value={formik.values.allocatedToWishlist}
                                                    onChange={formik.handleChange}
                                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                                    EGP
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Custom Weekly Budget Mode ── */}
                        <div className="border-t border-outline-variant/30 pt-6 mb-8">
                            <h4 className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-4 font-bold">
                                Weekly Spending Blueprint
                            </h4>
                            <div className="grid grid-cols-1 tab-sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer font-body-sm text-on-surface">
                                        <input
                                            type="checkbox"
                                            name="customWeeklyBudgetEnabled"
                                            checked={formik.values.customWeeklyBudgetEnabled}
                                            onChange={(e) => formik.setFieldValue("customWeeklyBudgetEnabled", e.target.checked)}
                                            className="rounded text-secondary focus:ring-secondary"
                                        />
                                        Use Custom Weekly Spending Limit (Instead of split remaining cash)
                                    </label>
                                    <p className="text-xs text-outline">
                                        Checking this lets you input exactly what you plan to spend per week. The system will hold this as your baseline and recalculate your remaining savings goal carryover.
                                    </p>
                                </div>

                                {formik.values.customWeeklyBudgetEnabled && (
                                    <div className="flex flex-col gap-2 justify-center animate-fade-in">
                                        <label className="font-label-caps text-label-caps text-on-surface-variant">
                                            Custom Weekly Budget
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="customWeeklyBudget"
                                                value={formik.values.customWeeklyBudget}
                                                onChange={formik.handleChange}
                                                className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                                EGP / week
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            {snapshot && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-surface-container text-on-surface border border-outline-variant hover:border-outline px-6 py-3 rounded-xl font-label-caps text-label-caps"
                                >
                                    {t("Cancel")}
                                </button>
                            )}
                            <button
                                type="button"
                                disabled={loading || formik.isSubmitting}
                                onClick={formik.handleSubmit}
                                className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-caps text-label-caps flex items-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t("Calculating…") : snapshot ? t("Update Blueprint") : t("Create Blueprint")}
                            </button>
                        </div>
                    </section>
                )}

                {/* ── Mid-Month Replan Section/Modal ── */}
                {isReplanOpen && snapshot && (
                    <section className="bg-surface-container-lowest border-2 border-secondary rounded-xl p-6 shadow-xl animate-fade-in">
                        <div className="flex items-center gap-2.5 mb-4 border-b border-outline-variant/30 pb-3">
                            <i className="ri-refresh-line text-secondary text-2xl animate-spin-slow"></i>
                            <div>
                                <h3 className="font-headline-sm text-headline-sm text-primary">
                                    Mid-Month Re-Plan & Budget Redistribution
                                </h3>
                                <p className="text-xs text-outline mt-0.5">
                                    Recalculate remaining weeks by declaring actual cash currently in hand.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleMidMonthReplan} className="space-y-5">
                            <div className="grid grid-cols-1 tab-sm:grid-cols-3 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                        Current Cash in Hand
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            value={replanCashInHand}
                                            onChange={(e) => setReplanCashInHand(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                            EGP
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                        Adjust Next Month Savings Goal
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={replanCarryOverGoal}
                                            onChange={(e) => setReplanCarryOverGoal(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-3 pr-14 font-currency-table text-currency-table outline-none"
                                            placeholder="Keep current"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-on-surface-variant pointer-events-none">
                                            EGP
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                        Reason / Note
                                    </label>
                                    <input
                                        type="text"
                                        value={replanNote}
                                        onChange={(e) => setReplanNote(e.target.value)}
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-3 outline-none"
                                        placeholder="e.g. Critical unexpected medical issue"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReplanOpen(false)}
                                    className="bg-surface-container text-on-surface border border-outline-variant hover:border-outline px-6 py-2.5 rounded-lg text-sm font-label-caps"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={replanLoading}
                                    className="bg-secondary text-on-secondary px-7 py-2.5 rounded-lg text-sm font-label-caps flex items-center gap-2 hover:bg-secondary/90 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {replanLoading ? t("Recalculating…") : t("Redistribute Budget")}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* ── Section 2 — Results ── */}
                {initialLoading ? (
                    <div className="flex items-center justify-center py-16 text-on-surface-variant">
                        < i class="ri-loader-line animate-spin mr-2"></i>
                        <span className="text-body-md">Loading latest plan blueprint…</span>
                    </div>
                ) : snapshot ? (
                    <>
                        {/* Metrics + Budget Integrity */}
                        <div className="grid grid-cols-1 tab-lg:grid-cols-12 gap-6">

                            {/* Main Metrics */}
                            <section className="tab-lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 tab-md:p-8 shadow-[0_4px_15px_rgba(0,59,90,0.05)] border border-outline-variant/30 flex flex-col justify-between overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <i className="ri-line-chart-line text-primary text-[120px]"></i>
                                </div>

                                <div className="grid grid-cols-2 gap-y-8 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                                            Total Monthly Income
                                        </p>
                                        <p className="font-currency-display text-currency-display text-primary font-bold">
                                            {fmt(snapshot.totalIncome)}{" "}
                                            <span className="text-body-sm font-normal">EGP</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                                            Total Commitments
                                        </p>
                                        <p className="font-currency-display text-currency-display text-error font-bold">
                                            {fmt(snapshot.totalCommitments)}{" "}
                                            <span className="text-body-sm font-normal">EGP</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                                        <p className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold">
                                            Free Cash (Available)
                                        </p>
                                        <p className="font-currency-display text-currency-display text-secondary font-bold">
                                            {fmt(snapshot.freeCash)}{" "}
                                            <span className="text-body-sm font-normal">EGP</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 p-4">
                                        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                                            Allocated to Wishlist
                                        </p>
                                        <p className="font-currency-display text-currency-display text-on-surface font-bold">
                                            {fmt(snapshot.allocatedToWishlist)}{" "}
                                            <span className="text-body-sm font-normal">EGP</span>
                                            {snapshot.wishlistPercentage && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2 font-bold">
                                                    {snapshot.wishlistPercentage}%
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Carry-Over Goal metric */}
                                    {(snapshot.carryOverGoal ?? 0) > 0 && (
                                        <div className="flex flex-col gap-1 p-4 bg-tertiary-container/10 rounded-lg border border-tertiary-container/20 col-span-2">
                                            <p className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest flex items-center gap-1.5">
                                                <i className="ri-safe-2-line text-sm"></i>
                                                Savings Goal (Next Month Carryover)
                                            </p>
                                            <p className="font-currency-display text-currency-display text-tertiary font-bold">
                                                {fmt(snapshot.carryOverGoal)}{" "}
                                                <span className="text-body-sm font-normal">EGP</span>
                                            </p>
                                            <p className="text-body-sm text-on-surface-variant mt-1">
                                                This amount is reserved and deducted from your weekly spending budget.
                                            </p>
                                        </div>
                                    )}

                                    {/* Commitments Breakdown */}
                                    <div className="col-span-2 border-t border-outline-variant/30 pt-6 mt-2">
                                        <h4 className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-4 font-bold flex items-center gap-2">
                                            <i className="ri-list-check-2 text-lg"></i>
                                            Active Commitments Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Gameyas */}
                                            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/20">
                                                <div className="flex items-center gap-2 mb-3 text-secondary font-bold text-xs uppercase tracking-wider">
                                                    <i className="ri-donut-chart-line text-base"></i>
                                                    <span>Gameyas ({snapshot.gameyas?.length || 0})</span>
                                                </div>
                                                {snapshot.gameyas?.length > 0 ? (
                                                    <ul className="space-y-2.5">
                                                        {snapshot.gameyas.map(g => (
                                                            <li key={g.gameyaId} className="flex justify-between items-center text-xs border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                                                                <span className="font-semibold text-on-surface">{g.name} (Turn: {g.myTurn}/{g.totalMembers})</span>
                                                                <span className="font-currency-table text-secondary font-bold">{fmt(g.monthlyContribution)} EGP</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-[11px] text-outline italic">No active Gameyas this month</p>
                                                )}
                                            </div>

                                            {/* Installments */}
                                            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/20">
                                                <div className="flex items-center gap-2 mb-3 text-error font-bold text-xs uppercase tracking-wider">
                                                    <i className="ri-cash-line text-base"></i>
                                                    <span>Installments ({snapshot.installments?.length || 0})</span>
                                                </div>
                                                {snapshot.installments?.length > 0 ? (
                                                    <ul className="space-y-2.5">
                                                        {snapshot.installments.map(i => (
                                                            <li key={i.installmentId} className="flex justify-between items-center text-xs border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                                                                <span className="font-semibold text-on-surface">{i.name} ({i.paidMonths}/{i.totalMonths} mos)</span>
                                                                <span className="font-currency-table text-error font-bold">{fmt(i.monthlyAmount)} EGP</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-[11px] text-outline italic">No active Installments this month</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-outline-variant/50 flex items-center justify-between">
                                    <div>
                                        <p className="font-label-caps text-label-caps text-primary uppercase tracking-[0.2em] mb-1 font-bold">
                                            {snapshot.customWeeklyBudget ? "Custom Weekly Limit" : "Recommended Weekly Budget"}
                                        </p>
                                        <p className="font-headline-lg text-headline-lg text-primary font-extrabold tracking-tight">
                                            {fmt(snapshot.weeklyBudget)}{" "}
                                            <span className="font-body-md font-normal text-on-surface-variant">
                                                EGP / week
                                            </span>
                                            {snapshot.customWeeklyBudget && (
                                                <span className="text-xs bg-secondary/15 text-secondary px-2.5 py-1 rounded ml-3 font-bold uppercase tracking-wider">
                                                    Manual
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center border-2 border-surface shadow-sm text-on-primary">
                                            <i className="ri-bank-line text-lg"></i>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center border-2 border-surface shadow-sm text-on-secondary-container">
                                            <i className="ri-cash-line text-lg"></i>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Budget Integrity */}
                            <section className="tab-lg:col-span-4 bg-primary text-on-primary rounded-xl p-6 tab-md:p-8 shadow-[0_4px_15px_rgba(0,59,90,0.05)] flex flex-col gap-6">
                                <h3 className="font-headline-md text-headline-md font-bold">
                                    Budget Integrity
                                </h3>

                                <div className="flex-1 flex flex-col justify-center gap-7">
                                    {[
                                        { label: "Living Expenses", pct: livingPct, color: "bg-secondary-fixed" },
                                        { label: "Wishlist Savings", pct: savingsPct, color: "bg-on-primary-container" },
                                        { label: "Commitments", pct: commitmentsPct, color: "bg-tertiary-fixed" },
                                        { label: "Carryover Goal", pct: carryOverGoalPct, color: "bg-warning" },
                                    ].filter(({ pct }) => pct > 0)
                                        .map(({ label, pct: p, color }) => (
                                            <div key={label} className="flex flex-col gap-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="opacity-80">{label}</span>
                                                    <span className="font-currency-table text-currency-table">{p}%</span>
                                                </div>
                                                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`${color} h-full rounded-full transition-all duration-700`}
                                                        style={{ width: `${p}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                <p className="text-body-sm opacity-70 italic">
                                    "Wealth is the ability to fully experience life." — Your
                                    financial blueprint is active.
                                </p>
                            </section>
                        </div>

                        {/* Weekly Breakdown */}
                        {snapshot.weeklyBudgets?.length > 0 && (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-headline-md text-headline-md text-primary font-bold">
                                        Weekly Breakdown
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 tab-sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {snapshot.weeklyBudgets.map((week) => (
                                        <WeekCard key={week.weekBudgetId} week={week} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wishlist Goal Blueprint Timeline */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="font-headline-md text-headline-md text-primary font-bold">
                                        Wishlist Saving Timelines
                                    </h3>
                                    <p className="text-on-surface-variant text-body-sm mt-1">
                                        Goals matched against target date. The system shows if your current save percentage is enough to purchase when you need it.
                                    </p>
                                </div>
                                <button
                                    onClick={openAddWishlistModal}
                                    className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-label-caps flex items-center gap-2 hover:bg-primary/95 transition-all active:scale-95 shadow-md shadow-primary/10"
                                >
                                    <i className="ri-add-line text-lg"></i>
                                    {t("Add Goal")}
                                </button>
                            </div>

                            {snapshot.wishlistSummary?.length > 0 ? (
                                <div className="grid grid-cols-1 tab-md:grid-cols-2 gap-6">
                                    {snapshot.wishlistSummary.map((item) => {
                                        const progressPct = item.targetAmount > 0
                                            ? Math.round((item.savedAmount / item.targetAmount) * 100)
                                            : 0;

                                        const getBadgeColor = (status) => {
                                            switch (status) {
                                                case "On Track":
                                                    return "bg-green-100 text-green-800 border-green-200";
                                                case "Behind":
                                                    return "bg-amber-100 text-amber-800 border-amber-200";
                                                case "Critical":
                                                    return "bg-red-100 text-red-800 border-red-200 animate-pulse";
                                                case "Achieved":
                                                    return "bg-teal-100 text-teal-800 border-teal-200";
                                                default:
                                                    return "bg-gray-100 text-gray-800 border-gray-200";
                                            }
                                        };

                                        return (
                                            <div
                                                key={item.itemId}
                                                className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-[0_4px_15px_rgba(0,59,90,0.03)] hover:border-primary/30 transition-all duration-200 relative group"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-outline bg-surface-container px-2 py-0.5 rounded">
                                                                Priority {item.priority}
                                                            </span>
                                                            {item.isCritical && (
                                                                <span className="text-[10px] uppercase font-bold tracking-widest text-error bg-error/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                                    <i className="ri-error-warning-line"></i>
                                                                    Critical
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                                                            {item.name}
                                                        </h4>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getBadgeColor(item.statusLabel)}`}>
                                                            {item.statusLabel}
                                                        </span>
                                                        <button
                                                            onClick={() => openEditWishlistModal(item)}
                                                            className="text-on-surface-variant hover:text-secondary p-1.5 rounded-full hover:bg-surface-container transition-all"
                                                            title="Edit Goal"
                                                        >
                                                            <i className="ri-edit-line text-sm"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteWishlist(item.itemId)}
                                                            className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-surface-container transition-all"
                                                            title="Delete Goal"
                                                        >
                                                            <i className="ri-delete-bin-line text-sm"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Progress bar */}
                                                    <div>
                                                        <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-bold">
                                                            <span>Progress ({progressPct}%)</span>
                                                            <span>{fmt(item.savedAmount)} / {fmt(item.targetAmount)} EGP</span>
                                                        </div>
                                                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary rounded-full transition-all duration-500"
                                                                style={{ width: `${progressPct}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-3 border-t border-outline-variant/20 text-xs">
                                                        <div>
                                                            <p className="text-on-surface-variant font-bold">Target Date</p>
                                                            <p className="text-on-surface mt-0.5 font-currency-table font-bold">
                                                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-EG", { year: "numeric", month: "short", day: "numeric" }) : "None"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-on-surface-variant font-bold">ETA Timeline</p>
                                                            <p className="text-on-surface mt-0.5 font-bold text-secondary">
                                                                {item.etaLabel}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-on-surface-variant font-bold">Actual Saving / Mo.</p>
                                                            <p className="text-on-surface mt-0.5 font-currency-table font-bold text-success">
                                                                {fmt(item.actualMonthlySave)} EGP
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-on-surface-variant font-bold">Required to reach Goal</p>
                                                            <p className="text-on-surface mt-0.5 font-currency-table font-bold text-primary">
                                                                {fmt(item.requiredMonthlySaving)} EGP / mo.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {item.statusLabel === "Critical" && (
                                                        <div className="bg-red-50 text-red-800 text-[11px] p-2.5 rounded-lg border border-red-100 flex items-start gap-1.5 mt-2">
                                                            <i className="ri-error-warning-line text-sm flex-shrink-0 mt-0.5"></i>
                                                            <span>
                                                                <strong>Critical:</strong> Current savings rate is too low. Increase your wishlist percentage or adjust target dates to avoid falling behind.
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest/50">
                                    <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                                        <i className="ri-poker-hearts-line text-2xl"></i>
                                    </div>
                                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                        {t("No goals defined")}
                                    </p>
                                    <p className="text-body-sm text-on-surface-variant max-w-xs">
                                        Add target-date based wishes to map against monthly plan carryover savings.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="event_note" className="text-3xl text-primary" />
                        </div>
                        <p className="font-headline-sm text-headline-sm text-on-surface">
                            No blueprint calculated yet
                        </p>
                        <p className="text-body-md text-on-surface-variant max-w-sm">
                            Configure your monthly spending rules above and hit <strong>Create Blueprint</strong> to setup this month's plan.
                        </p>
                    </div>
                )}
            </div>
            {/* Wishlist Modal */}
            {isWishlistModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setIsWishlistModalOpen(false)}
                            className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-all"
                        >
                            <i className="ri-close-line text-2xl"></i>
                        </button>

                        <h3 className="font-headline-sm text-headline-sm text-primary mb-4">
                            {editingWishlistId ? t("Edit Wishlist Goal") : t("Add Wishlist Goal")}
                        </h3>

                        <form onSubmit={handleSaveWishlist} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                    Goal Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={wishlistName}
                                    onChange={(e) => setWishlistName(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-2.5 outline-none text-on-surface"
                                    placeholder="e.g. New iPhone, Car downpayment"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                    Price (Target Amount)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        value={wishlistPrice}
                                        onChange={(e) => setWishlistPrice(e.target.value)}
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-2.5 pr-14 font-currency-table outline-none text-on-surface"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">EGP</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                    Already Saved Amount
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={wishlistSavedAmount}
                                        onChange={(e) => setWishlistSavedAmount(e.target.value)}
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-2.5 pr-14 font-currency-table outline-none text-on-surface"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">EGP</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                    Target Date (When do you need it?)
                                </label>
                                <input
                                    type="date"
                                    value={wishlistDueDate}
                                    onChange={(e) => setWishlistDueDate(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-2.5 outline-none font-bold text-sm text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-label-caps text-label-caps text-on-surface-variant font-bold">
                                    Priority Order
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={wishlistPriority}
                                    onChange={(e) => setWishlistPriority(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-4 py-2.5 outline-none font-bold text-on-surface"
                                    placeholder="1"
                                />
                                <span className="text-[10px] text-outline">1 is the highest priority (funded first)</span>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="wishlistIsCritical"
                                    checked={wishlistIsCritical}
                                    onChange={(e) => setWishlistIsCritical(e.target.checked)}
                                    className="rounded text-secondary focus:ring-secondary h-4 w-4"
                                />
                                <label htmlFor="wishlistIsCritical" className="text-sm font-bold text-on-surface-variant cursor-pointer select-none flex items-center gap-1.5">
                                    <i className="ri-error-warning-line text-error text-lg"></i>
                                    Is this goal critical?
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsWishlistModalOpen(false)}
                                    className="bg-surface-container text-on-surface border border-outline-variant hover:border-outline px-5 py-2.5 rounded-lg text-sm font-label-caps"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={wishlistLoading}
                                    className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-label-caps flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {wishlistLoading ? t("Saving…") : t("Save Goal")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Page;