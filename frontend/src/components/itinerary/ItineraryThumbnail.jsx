import { useState, useMemo, memo, useEffect, useCallback } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Renders an itinerary thumbnail image with a stable-size loading skeleton
 * and a graceful fallback if the image fails to load.
 *
 * Fills its parent container (intended to be used inside an already-sized
 * wrapper, e.g. `<div className="h-48 w-full overflow-hidden">`).
 */
function ItineraryThumbnail({ itineraryId, alt, className, imgClassName }) {
    const [status, setStatus] = useState("loading"); // loading | loaded | error

    useEffect(() => {
        setStatus("loading");
    }, [itineraryId]);

    const src = useMemo(
        () =>
            `${import.meta.env.VITE_API_BASE_URL}/itineraries/${itineraryId}/thumbnail`,
        [itineraryId],
    );

    const handleLoad = useCallback(() => {
        setStatus("loaded");
    }, []);

    const handleError = useCallback(() => {
        setStatus("error");
    }, []);

    return (
        <div
            className={cn(
                "relative h-full w-full overflow-hidden bg-gray-100",
                className,
            )}
        >
            {status === "loading" && (
                <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
            )}

            {status !== "error" && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        "h-full w-full object-cover transition-opacity duration-300",
                        status === "loaded" ? "opacity-100" : "opacity-0",
                        imgClassName,
                    )}
                />
            )}

            {status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <ImageOff size={20} aria-hidden="true" />
                </div>
            )}
        </div>
    );
}

export default memo(ItineraryThumbnail);
