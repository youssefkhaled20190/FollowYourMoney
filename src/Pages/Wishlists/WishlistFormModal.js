import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createPostRequest,
  createUpdateRequest,
} from "../../Hooks/Services/Requests";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  targetAmount: Yup.number()
    .typeError("Must be a number")
    .positive("Must be positive")
    .required("Required"),
  savedAmount: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .required("Required"),
  priority: Yup.number()
    .typeError("Must be a number")
    .integer()
    .min(1, "Priority must be at least 1")
    .required("Required"),
  dueDate: Yup.date().nullable(),
  isCritical: Yup.boolean(),
});

/* ─── Reusable Input Field ─────────────────────────────── */
const FormField = ({ label, name, formik, type = "text", isMonospace = false, placeholder = "" }) => (
  <div>
    <label className="font-label-caps text-[10px] tracking-wider text-outline mb-1.5 block">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 text-on-surface ${
        isMonospace ? "font-currency-table text-currency-table" : "font-body-md text-body-md"
      } ${
        formik.touched[name] && formik.errors[name]
          ? "border-error ring-1 ring-error/20"
          : ""
      }`}
    />
    {formik.touched[name] && formik.errors[name] && (
      <p className="text-error font-body-sm text-[12px] mt-1 flex items-center gap-1">
        <i className="ri-error-warning-line text-[14px]"></i>
        {formik.errors[name]}
      </p>
    )}
  </div>
);

const WishlistFormModal = ({ initialData, onClose, onSuccess }) => {
  const isEdit = Boolean(initialData?.itemId);

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      targetAmount: initialData?.targetAmount || "",
      savedAmount: initialData?.savedAmount ?? 0,
      priority: initialData?.priority || 1,
      dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : "",
      isCritical: initialData?.isCritical || false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const payload = {
          name: values.name,
          targetAmount: Number(values.targetAmount),
          savedAmount: Number(values.savedAmount || 0),
          priority: Number(values.priority),
          dueDate: values.dueDate || null,
          isCritical: Boolean(values.isCritical),
          savePercentage: 0,
        };

        if (isEdit) {
          await createUpdateRequest("/Wishlist/Update", {
            itemId: initialData.itemId,
            ...payload,
          });
        } else {
          await createPostRequest("/Wishlist/Add", payload);
        }

        onSuccess();
        onClose();
      } catch (err) {
        setStatus("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,59,90,0.15)] w-full max-w-md overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEdit ? "bg-secondary" : "bg-primary"
              }`}>
                <i className={`${isEdit ? "ri-edit-line" : "ri-add-line"} text-on-primary text-lg`}></i>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {isEdit ? "Edit Wishlist Item" : "Add Wishlist Item"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* ─── Form ────────────────────────────────────────── */}
        <form
          onSubmit={formik.handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
        >
          <FormField
            label="GOAL / ITEM NAME"
            name="name"
            formik={formik}
            placeholder="e.g. New Laptop, Travel to Tokyo"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="TARGET AMOUNT (EGP)"
              name="targetAmount"
              formik={formik}
              isMonospace
              placeholder="10,000"
            />
            <FormField
              label="ALREADY SAVED (EGP)"
              name="savedAmount"
              formik={formik}
              isMonospace
              placeholder="1,500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="PRIORITY (1 = HIGH)"
              name="priority"
              formik={formik}
              type="number"
              placeholder="1"
            />
            <FormField
              label="TARGET DATE (OPTIONAL)"
              name="dueDate"
              formik={formik}
              type="date"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="isCritical"
              name="isCritical"
              checked={formik.values.isCritical}
              onChange={formik.handleChange}
              className="w-5 h-5 rounded border-outline-variant/50 text-secondary focus:ring-secondary cursor-pointer"
            />
            <label htmlFor="isCritical" className="font-body-md text-body-md text-on-surface cursor-pointer select-none">
              Mark as Critical Goal
            </label>
          </div>

          {/* ─── Computed Preview ───────────────────────────── */}
          {formik.values.targetAmount && (
            <div className="bg-primary-fixed/30 rounded-xl p-3.5 flex items-center gap-3 border border-primary-fixed">
              <i className="ri-money-dollar-circle-line text-primary text-xl"></i>
              <div>
                <p className="text-[10px] font-label-caps tracking-wider text-on-primary-fixed-variant">
                  REMAINING TO SAVE
                </p>
                <p className="font-currency-display text-[18px] text-primary leading-6">
                  {Number(
                    Math.max(0, formik.values.targetAmount - (formik.values.savedAmount || 0))
                  ).toLocaleString("en-EG")}{" "}
                  <span className="text-[12px] font-body-sm text-outline">EGP</span>
                </p>
              </div>
            </div>
          )}

          {formik.status && (
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-3 flex items-center gap-2">
              <i className="ri-error-warning-line text-error"></i>
              <p className="text-error font-body-sm text-[13px]">
                {formik.status}
              </p>
            </div>
          )}
        </form>

        {/* ─── Footer Actions ──────────────────────────────── */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            CANCEL
          </button>
          <button
            type="submit"
            onClick={formik.handleSubmit}
            disabled={formik.isSubmitting}
            className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:shadow-lg hover:shadow-secondary/15 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {formik.isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-on-secondary border-t-transparent animate-spin"></div>
                SAVING…
              </>
            ) : (
              <>
                <i className={`${isEdit ? "ri-check-line" : "ri-add-line"} text-sm`}></i>
                {isEdit ? "UPDATE" : "ADD WISHLIST ITEM"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistFormModal;