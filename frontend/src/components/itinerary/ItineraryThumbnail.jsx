import { useState, memo } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ItineraryThumbnail({ itineraryId, alt, className, imgClassName }) {
    const [status, setStatus] = useState("loading");

    const src = `${import.meta.env.VITE_API_BASE_URL}/itineraries/${itineraryId}/thumbnail`;

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
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setStatus("loaded")}
                    onError={() => setStatus("error")}
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
