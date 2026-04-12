"use client";

/**
 * ConfirmModal
 *
 * Reusable confirmation dialog that prompts the user before performing a
 * destructive or significant action. Renders a blurred backdrop with a
 * centred modal box containing a title, message, and confirm/cancel buttons.
 *
 * @param {string} title - Heading displayed at the top of the modal
 * @param {string} message - Body text describing the action to confirm
 * @param {string} [confirmText="Confirm"] - Label for the confirm button
 * @param {string} [cancelText="Cancel"] - Label for the cancel button
 * @param {string} [variant="primary"] - Button colour scheme: "danger" for red, "primary" for blue
 * @param {Function} onConfirm - Called when the user clicks the confirm button or the backdrop
 * @param {Function} onCancel - Called when the user clicks the cancel button
 * @param {boolean} [disableBackdropClose=false] - When true, clicking the backdrop does not trigger onConfirm
 *
 * Notes:
 * - Clicking the backdrop calls onConfirm, not onCancel — set disableBackdropClose to true
 *   to prevent any action on backdrop click
 * - Click propagation from the modal box to the backdrop is stopped to prevent accidental confirmation
 * @author Temi Bankole
 */

export default function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
  disableBackdropClose = false
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
      onClick={() => {
        if (!disableBackdropClose) {
          onConfirm?.();
        }
      }}
    >
      {/* Modal box — stopPropagation prevents backdrop click from firing on inner clicks */}
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{ fontFamily: "var(--font-titillium)" }}
          className="text-xl font-semibold text-gray-900 mb-2"
        >
          {title}
        </h2>

        <p className="text-gray-500 mb-6 text-sm">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded font-semibold text-gray-600 border border-gray-300 hover:bg-gray-100 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded font-semibold text-white transition ${
              variant === "danger"
                ? "bg-[#912932] hover:bg-red-700"
                : "bg-[#005EB8] hover:bg-[#004080]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}