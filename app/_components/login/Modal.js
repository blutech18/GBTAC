export default function Modal({
  title,
  onClose,
  onSubmit,
  submitText = "Send",
  submitDisabled = false,
  children,
}) {
  return (
    <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">
          {title}
        </h3>

        {children}

        <div className="flex flex-row-reverse justify-between gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={onSubmit}
            disabled={submitDisabled}
          >
            {submitText}
          </button>

          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 flex-1"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
