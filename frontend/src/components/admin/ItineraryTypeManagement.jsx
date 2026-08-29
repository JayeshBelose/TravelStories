import { memo, useCallback, useMemo, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Plus, Tag, X } from "lucide-react";
import {
    addItineraryTypeService,
    deleteItineraryTypeService,
} from "@/services/adminService";
import { ui } from "@/styles/uiPrimitives";
import { toast } from "react-toastify";
import ConfirmToast from "../common/ConfirmToast";

function ItineraryTypeManagement({
    types,
    typeError,
    loadingTypes,
    fetchTypes,
}) {
    const [newType, setNewType] = useState("");

    const sortedTypes = useMemo(() => {
        return [...types].sort((a, b) =>
            a.name
                .trim()
                .toLowerCase()
                .localeCompare(b.name.trim().toLowerCase(), undefined, {
                    sensitivity: "base",
                }),
        );
    }, [types]);

    const deleteType = useCallback(
        async (typeId) => {
            const result = await deleteItineraryTypeService({
                typeId,
            });

            if (result.success) {
                toast.success("Type deleted.");
                fetchTypes();
            } else {
                toast.error(result.message);
            }
        },
        [fetchTypes],
    );

    // Add and delete functions for itinerary types
    const addType = useCallback(async () => {
        if (!newType.trim()) {
            toast.error("Type name cannot be empty");
            return;
        }

        if (
            types.some(
                (t) => t.name.toLowerCase() === newType.trim().toLowerCase(),
            )
        ) {
            toast.error("Type already exists");
            return;
        }

        const result = await addItineraryTypeService({
            typeName: newType.trim(),
        });

        if (result.success) {
            toast.success("Type added.");
            setNewType("");
            fetchTypes();
        } else {
            toast.error(result.message);
        }
    }, [newType, types, fetchTypes]);

    // Itinerary type deletion confirmation
    const confirmDeleteType = useCallback(
        (typeId) => {
            toast(
                ({ closeToast }) => (
                    <ConfirmToast
                        message="Delete this itinerary type? This cannot be undone."
                        confirmLabel="Delete"
                        onConfirm={async () => {
                            await deleteType(typeId);
                            closeToast();
                        }}
                        onCancel={closeToast}
                    />
                ),
                { autoClose: false },
            );
        },
        [deleteType],
    );

    return (
        <div className="border-t border-gray-100 pt-10">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                    Itinerary Types
                </h2>
                <p className="text-sm text-gray-400">
                    Add or remove itinerary categories
                </p>
            </div>

            {/* Type management state */}
            {loadingTypes ? (
                <div className="flex flex-wrap gap-2 mb-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-8 w-24 rounded-full"
                        />
                    ))}
                </div>
            ) : typeError ? (
                <div className="mb-5 text-sm text-gray-500">
                    <p className="mb-2">{typeError}</p>

                    <button
                        type="button"
                        onClick={fetchTypes}
                        className="font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2 cursor-pointer"
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <>
                    {/* Type chips */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {sortedTypes.map((type) => (
                            <div
                                key={type.typeId}
                                className="group inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm hover:border-gray-300 transition-colors"
                            >
                                <Tag size={12} className="text-gray-400" />

                                {type.name}

                                <button
                                    type="button"
                                    onClick={() =>
                                        confirmDeleteType(type.typeId)
                                    }
                                    aria-label={`Delete itinerary type ${type.name}`}
                                    className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add type input */}
                    <div className="flex items-center gap-2 max-w-sm">
                        <div
                            className={`${ui.searchContainer} flex-1 flex items-center gap-2.5`}
                        >
                            <Tag
                                size={14}
                                className="text-gray-300 flex-shrink-0"
                                aria-hidden="true"
                            />

                            <input
                                type="text"
                                value={newType}
                                placeholder="New type name…"
                                aria-label="New itinerary type name"
                                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                                onChange={(e) => setNewType(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addType();
                                    }
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={addType}
                            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                        >
                            <Plus size={14} aria-hidden="true" />
                            Add
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default memo(ItineraryTypeManagement);
