import { memo } from "react";
import { Trash, ImageIcon } from "lucide-react";

const LocationCard = memo(function LocationCard({
    loc,
    locIndex,
    dayIndex,
    saving,
    removeLocation,
    removeImage,
    setDays,
}) {
    const imageUrl = (imageId) =>
        `${import.meta.env.VITE_API_BASE_URL}/itineraries/days/locations/images/${imageId}`;

    return (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {locIndex + 1}
                </span>

                <input
                    placeholder="Location name"
                    value={loc.name || ""}
                    onChange={(e) => {
                        setDays((prev) =>
                            prev.map((day, dIndex) =>
                                dIndex === dayIndex
                                    ? {
                                          ...day,
                                          locations: day.locations.map(
                                              (item, index) =>
                                                  index === locIndex
                                                      ? {
                                                            ...item,
                                                            name: e.target
                                                                .value,
                                                        }
                                                      : item,
                                          ),
                                      }
                                    : day,
                            ),
                        );
                    }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
                    disabled={saving}
                />

                <input
                    placeholder="Address"
                    value={loc.address || ""}
                    onChange={(e) => {
                        setDays((prev) =>
                            prev.map((day, dIndex) =>
                                dIndex === dayIndex
                                    ? {
                                          ...day,
                                          locations: day.locations.map(
                                              (item, index) =>
                                                  index === locIndex
                                                      ? {
                                                            ...item,
                                                            address:
                                                                e.target.value,
                                                        }
                                                      : item,
                                          ),
                                      }
                                    : day,
                            ),
                        );
                    }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
                    disabled={saving}
                />

                <button
                    type="button"
                    onClick={() => removeLocation(dayIndex, locIndex)}
                    disabled={saving}
                    aria-label={`Remove ${loc.name || "location"}`}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Trash size={11} />
                </button>
            </div>

            {/* Image previews */}
            {(loc.images?.length > 0 || loc.imagesLoadError) && (
                <div className="space-y-2 pt-1">
                    {loc.imagesLoadError && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600"
                        >
                            Some images could not be loaded. You can continue
                            editing this location.
                        </div>
                    )}

                    {loc.images?.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {loc.images.map((img, imgIndex) => (
                                <div
                                    key={img.imageId ?? `new-${imgIndex}`}
                                    className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 group"
                                >
                                    <img
                                        src={
                                            img.isNew
                                                ? img.previewUrl
                                                : imageUrl(img.imageId)
                                        }
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(
                                                dayIndex,
                                                locIndex,
                                                imgIndex,
                                            )
                                        }
                                        disabled={saving}
                                        aria-label="Remove image"
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <Trash
                                            size={12}
                                            className="text-white"
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Upload image */}
            <label className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 cursor-pointer transition-colors">
                <ImageIcon size={12} />
                Add photo
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={saving}
                    onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        setDays((prev) =>
                            prev.map((day, dIndex) =>
                                dIndex === dayIndex
                                    ? {
                                          ...day,
                                          locations: day.locations.map(
                                              (location, lIndex) =>
                                                  lIndex === locIndex
                                                      ? {
                                                            ...location,
                                                            images: [
                                                                ...location.images,
                                                                {
                                                                    isNew: true,
                                                                    file,
                                                                    previewUrl:
                                                                        URL.createObjectURL(
                                                                            file,
                                                                        ),
                                                                },
                                                            ],
                                                        }
                                                      : location,
                                          ),
                                      }
                                    : day,
                            ),
                        );

                        e.target.value = "";
                    }}
                />
            </label>
        </div>
    );
});

export default LocationCard;
