//This component is used as a notification for various actions throughout the web application
//It displays a message and an okay button used for success and error notifications.
"use client";

export default function NotificationModal({
  title,
  message,
  buttonText = "OK",
  variant = "success",
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "var(--font-titillium)" }} className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded font-semibold text-white transition ${
              variant === "error"
                ? "bg-[#912932] hover:bg-red-700"
                : "bg-[#005EB8] hover:bg-[#004080]"
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
