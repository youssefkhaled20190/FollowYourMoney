/**
 * FormRow
 * A reusable field wrapper used inside modal forms.
 * Renders: label → children (input / dropdown) → error message
 *
 * Props:
 *   label    {string}  – field label text
 *   required {bool}    – show red asterisk next to label
 *   colSpan  {1|2}     – grid column span (1 = normal, 2 = full-width in 2-col grid)
 *   error    {string|false} – error message; renders a red <p> when truthy
 *   children {node}    – the actual input / dropdown element
 */
export default function FormRow({ label, children, colSpan = 1, error, required }) {
  return (
    <div
      className={`flex flex-col gap-1 ${colSpan === 2 ? 'col-span-1 md:col-span-2' : 'col-span-1'
        }`}
    >
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
}
