/**
 * SectionDivider
 * A decorative section header used inside modal forms to group related fields.
 *
 * Props:
 *   label {string} – section title displayed on the left
 *
 * Note: spans full width (col-span-2) when placed inside a 2-column grid form.
 */
export default function SectionDivider({ label }) {
  return (
    <div className="col-span-1 md:col-span-2 flex items-center gap-3 pt-1">
      <span className="text-xs font-bold uppercase tracking-widest text-primary-500 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-primary-200 to-transparent" />
    </div>
  );
}
