/**
 * TextInput
 * A styled <input> used inside modal forms.
 *
 * Props:
 *   disabled {bool}          – renders a read-only greyed-out style
 *   error    {string|false}  – when truthy, renders a red border
 *   ...rest                  – forwarded directly to <input>
 */
export default function TextInput({ disabled, error, ...props }) {
  return (
    <input
      {...props}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all outline-none
        ${disabled
          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
          : error
            ? 'bg-white border-red-400 text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'bg-white border-gray-300 text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
        }`}
    />
  );
}
