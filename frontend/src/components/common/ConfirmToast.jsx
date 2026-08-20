import { Loader2 } from "lucide-react";

export default function ConfirmToast({
    message,
    confirmLabel,
    loadingLabel = "Processing...",
    loading = false,
    onConfirm,
    onCancel,
}) {
    return (
        <div>
            <p className="text-sm text-gray-700 mb-3">{message}</p>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="min-w-[76px] bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                >
                    {loading ? (
                        <>
                            <Loader2 size={12} className="animate-spin" />
                            {loadingLabel}
                        </>
                    ) : (
                        confirmLabel
                    )}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="min-w-[64px] bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
