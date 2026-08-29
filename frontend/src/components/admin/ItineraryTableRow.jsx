import { Globe, Pencil, Tag, Trash } from "lucide-react";
import { memo } from "react";

function ItineraryTableRow({
    itinerary,
    handleView,
    handleEdit,
    confirmDelete,
}) {
    return (
        <tr
            key={itinerary.itineraryId}
            className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
        >
            {/* Title */}
            <td className="px-4 py-3">
                <button
                    onClick={(e) => handleView(e, itinerary)}
                    className="text-sm font-semibold text-gray-900 hover:underline underline-offset-2 cursor-pointer text-left font-primary"
                >
                    {itinerary.title}
                </button>
            </td>

            {/* Place */}
            <td className="px-4 py-3 text-sm text-gray-500">
                {itinerary.place}
            </td>

            {/* Creator */}
            <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                {itinerary.createdBy}
            </td>

            {/* Type */}
            <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full capitalize">
                    <Tag size={9} /> {itinerary.type || "—"}
                </span>
            </td>

            {/* Visibility */}
            <td className="px-4 py-3">
                <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border
                                        ${
                                            itinerary.public
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                                : "bg-red-50 border-red-200 text-red-500"
                                        }`}
                >
                    {itinerary.public ? (
                        <>
                            <Globe size={9} /> Public
                        </>
                    ) : (
                        <>
                            <Lock size={9} /> Private
                        </>
                    )}
                </span>
            </td>

            {/* Date */}
            <td className="px-4 py-3 text-sm text-gray-400">
                {new Date(itinerary.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </td>

            {/* Likes */}
            <td className="px-4 py-3 text-sm text-gray-600 text-center">
                {itinerary.likeCount}
            </td>

            {/* Saves */}
            <td className="px-4 py-3 text-sm text-gray-600 text-center">
                {itinerary.saveCount}
            </td>

            {/* Actions */}
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                    <button
                        type="button"
                        onClick={(e) => handleEdit(e, itinerary)}
                        aria-label={`Edit itinerary ${itinerary.title}`}
                        className="w-9 h-9 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                        <Pencil size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() => confirmDelete(itinerary.itineraryId)}
                        aria-label={`Delete itinerary ${itinerary.title}`}
                        className="w-9 h-9 rounded-full inline-flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                        <Trash size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default memo(ItineraryTableRow);
