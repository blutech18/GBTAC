//This component is a reusable confirm modal that is for confirmation for the user when about to perform an action.

"use client";

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
    // Backdrop - click outside to close
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
      onClick={() => {
        if (!disableBackdropClose) {
          onConfirm?.(); 
        }
      }}
    >
      {/* Modal box - stop click from bubbling to backdrop */}
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