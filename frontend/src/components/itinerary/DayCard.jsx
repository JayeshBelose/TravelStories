import { memo } from "react";
import { Trash, Plus } from "lucide-react";
import LocationCard from "./LocationCard";
import { ui } from "@/styles/uiPrimitives";

const DayCard = memo(function DayCard({
    day,
    dayIndex,
    saving,
    removeDay,
    removeLocation,
    removeImage,
    setDays,
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Day {dayIndex + 1}
                </span>

                <button
                    type="button"
                    onClick={() => removeDay(dayIndex)}
                    disabled={saving}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50"
                >
                    <Trash size={12} />
                </button>
            </div>

            <div className="p-4 space-y-3">
                <textarea
                    value={day.description}
                    placeholder="Notes for this day…"
                    rows={2}
                    onChange={(e) => {
                        setDays((prev) =>
                            prev.map((item, index) =>
                                index === dayIndex
                                    ? {
                                          ...item,
                                          description: e.target.value,
                                      }
                                    : item,
                            ),
                        );
                    }}
                    className={`${ui.textarea} resize-none`}
                    disabled={saving}
                />

                {day.locationsLoadError && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600"
                    >
                        Some locations could not be loaded. You can continue
                        editing the itinerary, but those locations may need to
                        be added again.
                    </div>
                )}
                <div className="space-y-2">
                    {day.locations?.map((loc, locIndex) => (
                        <LocationCard
                            key={loc.locationId ?? `loc-${locIndex}`}
                            loc={loc}
                            dayIndex={dayIndex}
                            locIndex={locIndex}
                            saving={saving}
                            removeLocation={removeLocation}
                            removeImage={removeImage}
                            setDays={setDays}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setDays((prev) =>
                            prev.map((item, index) =>
                                index === dayIndex
                                    ? {
                                          ...item,
                                          locations: [
                                              ...(item.locations || []),
                                              {
                                                  name: "",
                                                  address: "",
                                                  images: [],
                                              },
                                          ],
                                      }
                                    : item,
                            ),
                        );
                    }}
                    disabled={saving}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
                >
                    <Plus size={11} />
                    Add location
                </button>
            </div>
        </div>
    );
});

export default DayCard;
