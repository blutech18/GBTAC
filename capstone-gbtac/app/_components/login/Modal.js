"use client";

// Reusable Modal Component
export default function Modal({
  title,
  onClose,
  email,
  emailHandlerFunc,
  handleForgotSubmit,
  children,
}) {
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
        {children ? (
          children
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your SAIT email"
              value={email}
              onChange={emailHandlerFunc}
              className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
            />
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 mt-2 w-full"
              onClick={handleForgotSubmit}
            >
              Send
            </button>
          </>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
