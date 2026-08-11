import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load this information. Please try again.",
    onRetry,
    retryLabel = "Try again",
    compact = false,
}) {
    return (
        <div
            role="alert"
            aria-live="polite"
            className={`flex flex-col items-center justify-center text-center ${
                compact ? "py-10 px-4" : "py-20 px-6"
            }`}>
            <div
                className={`flex items-center justify-center rounded-full bg-red-50 ${
                    compact ? "w-10 h-10" : "w-12 h-12"
                }`}>
                <AlertCircle
                    size={compact ? 18 : 22}
                    className="text-red-400"
                    aria-hidden="true"
                />
            </div>

            <h2
                className={`font-semibold text-gray-700 ${
                    compact ? "text-sm mt-3" : "text-sm mt-4"
                }`}>
                {title}
            </h2>

            <p
                className={`max-w-md text-gray-400 ${
                    compact ? "text-xs mt-1.5" : "text-xs mt-2"
                }`}>
                {message}
            </p>

            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 cursor-pointer">
                    <RefreshCw size={13} aria-hidden="true" />
                    {retryLabel}
                </button>
            )}
        </div>
    );
}
