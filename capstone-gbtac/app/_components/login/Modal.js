/**
 * Modal component
 *
 * A reusable modal dialog with a title, content area, and action buttons.
 * Displays a backdrop overlay and centers the modal on screen.
 *
 * @param {string} title - Modal title displayed at the top
 * @param {Function} onClose - Called when the user clicks "Cancel"
 * @param {Function} onSubmit - Called when the user clicks the submit button
 * @param {string} [submitText="Send"] - Label for the submit button
 * @param {boolean} [submitDisabled=false] - Disables the submit button when true
 * @param {React.ReactNode} children - Content rendered inside the modal body
 *
 * Notes:
 * - Parent controls visibility; this component always renders when mounted
 * - Clicking outside the modal does NOT close it; onClose must be triggered via the Cancel button
 * - Click events on the overlay bubble to the parent; add stopPropagation if needed
 * - Designed for simple forms or confirmations
 *
 * @returns A centered modal dialog with backdrop
 *
 * @author Cintya Lara Flores
 */
export default function Modal({
  title,
  onClose,
  onSubmit,
  submitText = "Send",
  submitDisabled = false,
  children,
}) {
  return (
    // Full-screen backdrop with semi-transparent overlay
    <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50">
      {/* stopPropagation prevents overlay click handlers on the parent from firing */}
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4 w-full"
        // onClick={(e) => e.stopPropagation()}// Uncomment if you want to prevent clicks inside the modal from closing it when the parent has an onClick handler on the overlay
      >
        <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">
          {/* Modal title, centered and styled for prominence */}
          {title}
        </h3>
        {/* Slot for form fields, confirmation text, or any other content */}
        {children}
        <div className="flex justify-between gap-2 mt-4">
          {/* Cancel button, styled as a secondary action with border and hover effect */}
          <button
            className="flex-1 px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* Submit button, styled as a primary action with blue background and disabled state */}
          <button
            className="flex-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={onSubmit}
            disabled={submitDisabled}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
