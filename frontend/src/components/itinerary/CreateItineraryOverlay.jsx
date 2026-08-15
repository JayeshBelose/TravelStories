import { useState, useEffect } from "react";
import {
    X,
    Plus,
    Trash,
    Upload,
    Globe,
    Lock,
    MapPin,
    Users,
    ImageIcon,
    ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import ErrorState from "@/components/common/ErrorState";
import {
    addMemberService,
    createItineraryService,
    getItineraryDetailsService,
    getItineraryTypesService,
    removeMemberService,
    updateItineraryService,
    uploadThumbnailService,
} from "@/services/itineraryService";
import { getFollowingService, getFollowersService } from "@/services/userService";
import {
    createDayService,
    deleteDayService,
    getItineraryDaysService,
    updateDayService,
} from "@/services/dayService";
import {
    createLocationService,
    deleteLocationService,
    getDayLocationsService,
    updateLocationService,
} from "@/services/locationService";
import {
    deleteLocationImageService,
    getLocationImagesService,
    uploadLocationImageService,
} from "@/services/imageService";

// Custom Tailwind CSS tags
function SectionLabel({ children }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {children}
        </p>
    );
}

function FieldLabel({ children, required }) {
    return (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {children}
            {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
    );
}

const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

export default function CreateItineraryOverlay({
    open,
    onClose,
    existingItinerary = null,
    onSaved,
}) {
    const user = JSON.parse(sessionStorage.getItem("user"));

    // Allowing edit mode to both creator and Admin
    const isEditMode = !!existingItinerary || user?.role === "admin";

    const isCreator =
        existingItinerary?.createdBy === user?.username || user?.role === "admin";

    const [itineraryId, setItineraryId] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [place, setPlace] = useState("");
    const [type, setType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [days, setDays] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [followersList, setFollowersList] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [types, setTypes] = useState([]);
    const [saving, setSaving] = useState(false);

    const [loadingData, setLoadingData] = useState(open);
    const [loadError, setLoadError] = useState(null);
    const [loadAttempt, setLoadAttempt] = useState(0);

    const [deletedDays, setDeletedDays] = useState([]);
    const [deletedLocations, setDeletedLocations] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    /*
     * Cleanup thumbnail preview URL whenever it changes or
     * when the component unmounts.
     */
    useEffect(() => {
        return () => {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);

    /*
     * Fetch itinerary data if in edit mode.
     */
    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const loadData = async () => {
            setLoadingData(true);
            setLoadError(null);

            try {
                const [typesResult, followingResult, followersResult] = await Promise.all(
                    [
                        getItineraryTypesService(),
                        getFollowingService({
                            userId: user.userId,
                        }),
                        getFollowersService({
                            userId: user.userId,
                        }),
                    ],
                );

                if (cancelled) return;

                /*
                 * Itinerary types are required for the form.
                 * Without them, the user cannot reliably select the
                 * itinerary type.
                 */
                if (!typesResult.success) {
                    setLoadError({
                        title: "Unable to load itinerary types",
                        message:
                            typesResult.message ||
                            "We couldn't load the available itinerary types. Please try again.",
                    });

                    return;
                }

                setTypes(typesResult.data);

                /*
                 * Following users are optional.
                 * A failure here should not prevent the user from
                 * creating or editing the itinerary.
                 */
                if (followingResult.success) {
                    setFollowingList(followingResult.data);
                } else {
                    console.error(
                        "Failed to load following users:",
                        followingResult.message,
                    );
                    setFollowingList([]);
                }

                if (followersResult.success) {
                    setFollowersList(followersResult.data);
                } else {
                    console.error("Failed to load followers:", followersResult.message);
                    setFollowersList([]);
                }

                /*
                 * Create mode does not require any additional API data.
                 */
                if (!isEditMode || !existingItinerary) {
                    resetForm();
                    return;
                }

                const id = existingItinerary.itineraryId;

                setItineraryId(id);

                /*
                 * Edit mode requires both the itinerary itself and
                 * its days before the form can be populated safely.
                 */
                const [itineraryResult, daysResult] = await Promise.all([
                    getItineraryDetailsService({
                        itineraryId: id,
                    }),
                    getItineraryDaysService({
                        itineraryId: id,
                    }),
                ]);

                if (cancelled) return;

                if (!itineraryResult.success) {
                    setLoadError({
                        title: "Unable to load itinerary",
                        message:
                            itineraryResult.message ||
                            "We couldn't load this itinerary. Please try again.",
                    });

                    return;
                }

                if (!daysResult.success) {
                    setLoadError({
                        title: "Unable to load itinerary days",
                        message:
                            daysResult.message ||
                            "We couldn't load the itinerary days. Please try again.",
                    });

                    return;
                }

                const itinerary = itineraryResult.data;

                setTitle(itinerary.title);
                setPlace(itinerary.place);
                setType(itinerary.type);
                setStartDate(itinerary.startDate);
                setEndDate(itinerary.endDate);
                setDescription(itinerary.description);
                setIsPublic(itinerary.public);
                setMembers(itinerary.members || []);

                /*
                 * Locations and images are secondary resources.
                 * Their failures should not prevent the main itinerary
                 * from being displayed/edited.
                 */
                const loadedDays = await Promise.all(
                    daysResult.data.map(async day => {
                        const locationsResult = await getDayLocationsService({
                            dayId: day.dayId,
                        });

                        if (cancelled) return null;

                        if (!locationsResult.success) {
                            console.error(
                                `Failed to load locations for day ${day.dayId}:`,
                                locationsResult.message,
                            );

                            return {
                                ...day,
                                locations: [],
                                locationsLoadError: true,
                            };
                        }

                        const loadedLocations = await Promise.all(
                            locationsResult.data.map(async location => {
                                const imagesResult = await getLocationImagesService({
                                    locationId: location.locationId,
                                });

                                if (cancelled) return null;

                                if (!imagesResult.success) {
                                    console.error(
                                        `Failed to load images for location ${location.locationId}:`,
                                        imagesResult.message,
                                    );

                                    return {
                                        ...location,
                                        name: location.locationName || "",
                                        address: location.locationAddress || "",
                                        images: [],
                                        imagesLoadError: true,
                                    };
                                }

                                return {
                                    ...location,
                                    name: location.locationName || "",
                                    address: location.locationAddress || "",
                                    images: imagesResult.data.map(image => ({
                                        ...image,
                                        isNew: false,
                                        file: null,
                                    })),
                                };
                            }),
                        );

                        if (cancelled) return null;

                        return {
                            ...day,
                            locations: loadedLocations.filter(Boolean),
                        };
                    }),
                );

                if (cancelled) return;

                setDays(loadedDays.filter(Boolean));
            } finally {
                if (!cancelled) {
                    setLoadingData(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [open, existingItinerary, loadAttempt]);

    const resetForm = () => {
        setItineraryId(null);
        setTitle("");
        setPlace("");
        setType("");
        setStartDate("");
        setEndDate("");
        setDescription("");
        setIsPublic(true);
        setDays([]);
        setMembers([]);
        setMemberSearch("");
        setThumbnailFile(null);

        /*
         * Revoke the currently active thumbnail preview before
         * clearing the state reference.
         */
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }

        setThumbnailPreview(null);
        setDeletedDays([]);
        setDeletedLocations([]);
        setDeletedImages([]);
    };

    if (!open) return null;

    if (loadingData || loadError) {
        return (
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50"
                onClick={onClose}>
                <div
                    className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                        <h2 className="text-base font-semibold text-gray-900 font-primary">
                            {isEditMode ? "Edit Itinerary" : "New Itinerary"}
                        </h2>

                        <button
                            onClick={onClose}
                            disabled={saving || loadingData}
                            aria-label="Close"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        {loadingData ? (
                            <div
                                className="flex flex-col items-center justify-center text-center px-6"
                                role="status"
                                aria-live="polite">
                                <div
                                    className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"
                                    aria-hidden="true"
                                />

                                <p className="mt-4 text-sm font-medium text-gray-700">
                                    {isEditMode
                                        ? "Loading itinerary..."
                                        : "Preparing itinerary form..."}
                                </p>
                            </div>
                        ) : (
                            <ErrorState
                                title={loadError.title}
                                message={loadError.message}
                                onRetry={() => {
                                    setLoadError(null);
                                    setLoadAttempt(prev => prev + 1);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const createOrUpdateItinerary = async () => {
        if (!title || !place || !type || !startDate || !endDate) {
            toast.error("Please fill all required fields.");
            return;
        }

        if (endDate < startDate) {
            toast.error("End date cannot be before start date.");
            return;
        }

        if (saving) return;

        setSaving(true);

        try {
            const itinerary = {
                title,
                place,
                type,
                startDate,
                endDate,
                description,
                public: isPublic,
            };

            let result;

            /*
             * Create or update the itinerary itself.
             */
            if (isEditMode && isCreator) {
                result = await updateItineraryService({
                    itineraryId,
                    itinerary,
                });
            } else {
                result = await createItineraryService({
                    userId: user.userId,
                    itinerary,
                });
            }

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            const id = result.data.itineraryId;

            setItineraryId(id);

            /*
             * Delete resources that were removed from the editor.
             */
            await Promise.all([
                ...deletedImages.map(imageId =>
                    deleteLocationImageService({
                        imageId,
                    }),
                ),

                ...deletedLocations.map(locationId =>
                    deleteLocationService({
                        locationId,
                    }),
                ),

                ...deletedDays.map(dayId =>
                    deleteDayService({
                        itineraryId: id,
                        dayId,
                    }),
                ),
            ]);

            /*
             * Upload the itinerary thumbnail if a new one was selected.
             */
            if (thumbnailFile) {
                const formData = new FormData();
                formData.append("file", thumbnailFile);

                const thumbnailResult = await uploadThumbnailService({
                    itineraryId: id,
                    formData,
                });

                if (!thumbnailResult.success) {
                    toast.error(thumbnailResult.message);
                    return;
                }
            }

            /*
             * Create/update days, locations and images.
             *
             * These operations remain sequential because later
             * operations depend on IDs created by earlier operations.
             */
            for (const day of days) {
                let dayId = day.dayId;

                /*
                 * Create or update day.
                 */
                if (!dayId) {
                    const dayResult = await createDayService({
                        itineraryId: id,
                        day: {
                            description: day.description,
                        },
                    });

                    if (!dayResult.success) {
                        toast.error(dayResult.message);
                        return;
                    }

                    dayId = dayResult.data.dayId;
                } else {
                    const dayResult = await updateDayService({
                        itineraryId: id,
                        dayId,
                        day: {
                            description: day.description,
                        },
                    });

                    if (!dayResult.success) {
                        toast.error(dayResult.message);
                        return;
                    }
                }

                /*
                 * Create/update locations belonging to this day.
                 */
                for (const location of day.locations || []) {
                    let locationId = location.locationId;

                    if (!locationId) {
                        const locationResult = await createLocationService({
                            dayId,
                            location: {
                                locationName: location.name,
                                locationAddress: location.address,
                            },
                        });

                        if (!locationResult.success) {
                            toast.error(locationResult.message);
                            return;
                        }

                        locationId = locationResult.data.locationId;
                    } else {
                        const locationResult = await updateLocationService({
                            dayId,
                            locationId,
                            location: {
                                locationName: location.name,
                                locationAddress: location.address,
                            },
                        });

                        if (!locationResult.success) {
                            toast.error(locationResult.message);
                            return;
                        }
                    }

                    /*
                     * Upload newly-added location images.
                     */
                    for (const image of location.images || []) {
                        if (!image.isNew || !image.file) continue;

                        const formData = new FormData();
                        formData.append("file", image.file);

                        const imageResult = await uploadLocationImageService({
                            locationId,
                            formData,
                        });

                        if (!imageResult.success) {
                            toast.error(imageResult.message);
                            return;
                        }
                    }
                }
            }

            /*
             * Synchronize itinerary members.
             */
            const existingMembers = existingItinerary?.members || [];

            await Promise.all([
                ...existingMembers
                    .filter(
                        member =>
                            !members.some(selected => selected.userId === member.userId),
                    )
                    .map(member =>
                        removeMemberService({
                            itineraryId: id,
                            userId: member.userId,
                        }),
                    ),

                ...members
                    .filter(
                        member =>
                            !existingMembers.some(
                                existing => existing.userId === member.userId,
                            ),
                    )
                    .map(member =>
                        addMemberService({
                            itineraryId: id,
                            userId: member.userId,
                        }),
                    ),
            ]);

            /*
             * All mutations succeeded.
             *
             * Only now notify the parent component.
             */
            onSaved?.(result.data);

            /*
             * Clear mutation tracking after successful save.
             */
            setDeletedDays([]);
            setDeletedLocations([]);
            setDeletedImages([]);

            toast.success(isEditMode ? "Itinerary updated!" : "Itinerary created!");

            onClose();
        } catch (err) {
            console.error("Failed to save itinerary:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Remove functions
    const removeDay = index => {
        const day = days[index];

        if (day.dayId) {
            setDeletedDays(prev => [...prev, day.dayId]);
        }

        setDays(prev => prev.filter((_, i) => i !== index));
    };

    const removeLocation = (dayIndex, locIndex) => {
        const loc = days[dayIndex].locations[locIndex];

        if (loc.locationId) {
            setDeletedLocations(prev => [...prev, loc.locationId]);
        }

        const updated = [...days];

        updated[dayIndex].locations = updated[dayIndex].locations.filter(
            (_, index) => index !== locIndex,
        );

        setDays(updated);
    };

    const removeImage = (dayIndex, locIndex, imgIndex) => {
        const updated = [...days];

        const img = updated[dayIndex].locations[locIndex].images[imgIndex];

        if (!img.isNew && img.imageId) {
            setDeletedImages(prev => [...prev, img.imageId]);
        }

        /*
         * If this is a newly-selected local file, no server deletion
         * is necessary. Its object URL is generated only during render
         * and does not need to be stored.
         */
        updated[dayIndex].locations[locIndex].images = updated[dayIndex].locations[
            locIndex
        ].images.filter((_, index) => index !== imgIndex);

        setDays(updated);
    };

    // Filter to get friends only
    const friendsList = followingList.filter(user =>
        followersList.some(follower => follower.userId === user.userId),
    );

    // Searching for members
    const filteredMembers =
        memberSearch.trim().length === 0
            ? []
            : friendsList.filter(
                  user =>
                      user.username.toLowerCase().includes(memberSearch.toLowerCase()) &&
                      !members.some(member => member.userId === user.userId),
              );

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50"
            onClick={onClose}>
            <div
                className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-base font-semibold text-gray-900 font-primary">
                        {isEditMode ? "Edit Itinerary" : "New Itinerary"}
                    </h2>

                    <button
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Thumbnail */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                        {(thumbnailPreview || (isEditMode && existingItinerary)) && (
                            <div className="relative h-36 w-full">
                                <img
                                    src={
                                        thumbnailPreview ||
                                        `${import.meta.env.VITE_API_BASE_URL}/itineraries/${itineraryId}/thumbnail`
                                    }
                                    alt="Itinerary thumbnail"
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        )}

                        <label className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Upload size={14} className="text-gray-400" />

                            <span className="text-sm text-gray-500 truncate">
                                {thumbnailFile ? thumbnailFile.name : "Upload thumbnail"}
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={saving}
                                onChange={e => {
                                    const file = e.target.files?.[0];

                                    if (!file) return;

                                    /*
                                     * Revoke the previous preview before
                                     * replacing it.
                                     */
                                    if (thumbnailPreview) {
                                        URL.revokeObjectURL(thumbnailPreview);
                                    }

                                    setThumbnailFile(file);
                                    setThumbnailPreview(URL.createObjectURL(file));

                                    /*
                                     * Allows selecting the same file again.
                                     */
                                    e.target.value = "";
                                }}
                            />
                        </label>
                    </div>

                    {/* Itinerary Info */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                        <SectionLabel>Basic Info</SectionLabel>

                        <div>
                            <FieldLabel required>Title</FieldLabel>

                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Summer in Tokyo"
                                className={inputClass}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <FieldLabel required>Place</FieldLabel>

                            <div className="relative">
                                <MapPin
                                    size={14}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                                />

                                <input
                                    value={place}
                                    onChange={e => setPlace(e.target.value)}
                                    placeholder="City, Country"
                                    className={`${inputClass} pl-9`}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div>
                            <FieldLabel required>Type</FieldLabel>

                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    disabled={saving}
                                    className={`${inputClass} appearance-none pr-8`}>
                                    <option value="">Select a type</option>

                                    {[...types]
                                        .sort((a, b) =>
                                            a.name
                                                .trim()
                                                .toLowerCase()
                                                .localeCompare(
                                                    b.name.trim().toLowerCase(),
                                                    undefined,
                                                    {
                                                        sensitivity: "base",
                                                    },
                                                ),
                                        )
                                        .map(t => (
                                            <option key={t.typeId} value={t.name}>
                                                {t.name}
                                            </option>
                                        ))}
                                </select>

                                <ChevronDown
                                    size={14}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                                <FieldLabel required>Start Date</FieldLabel>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className={inputClass}
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <FieldLabel required>End Date</FieldLabel>

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className={inputClass}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div>
                            <FieldLabel>Description</FieldLabel>

                            <textarea
                                value={description}
                                rows={3}
                                placeholder="What's this trip about?"
                                onChange={e => setDescription(e.target.value)}
                                className={`${inputClass} resize-none`}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Members */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <SectionLabel>Members</SectionLabel>

                        <div className="relative">
                            <Users
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />

                            <input
                                placeholder="Search friends to add..."
                                value={memberSearch}
                                onChange={e => setMemberSearch(e.target.value)}
                                className={`${inputClass} pl-9`}
                                disabled={saving}
                            />
                        </div>

                        {filteredMembers.length > 0 && (
                            <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
                                {filteredMembers.map(member => (
                                    <button
                                        key={member.userId}
                                        type="button"
                                        onClick={() => {
                                            setMembers([...members, member]);
                                            setMemberSearch("");
                                        }}
                                        disabled={saving}
                                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                            <img
                                                src={`${import.meta.env.VITE_API_BASE_URL}/users/${member.userId}/profilePicture`}
                                                alt={member.username}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {member.username}
                                    </button>
                                ))}
                            </div>
                        )}

                        {members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {members.map(member => (
                                    <span
                                        key={member.userId}
                                        className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                        {member.username}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMembers(
                                                    members.filter(
                                                        m => m.userId !== member.userId,
                                                    ),
                                                )
                                            }
                                            disabled={saving}
                                            aria-label={`Remove ${member.username}`}
                                            className="text-gray-400 hover:text-gray-700 cursor-pointer disabled:cursor-not-allowed">
                                            <X size={11} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Days */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <SectionLabel>Itinerary Days</SectionLabel>

                            <button
                                type="button"
                                onClick={() =>
                                    setDays([
                                        ...days,
                                        {
                                            description: "",
                                            locations: [],
                                        },
                                    ])
                                }
                                disabled={saving}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                <Plus size={12} />
                                Add Day
                            </button>
                        </div>

                        <div className="space-y-3">
                            {days.map((day, dayIndex) => (
                                <div
                                    key={day.dayId ?? `day-${dayIndex}`}
                                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                                    {/* Day header */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                            Day {dayIndex + 1}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => removeDay(dayIndex)}
                                            disabled={saving}
                                            aria-label={`Remove day ${dayIndex + 1}`}
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                            <Trash size={12} />
                                        </button>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <textarea
                                            value={day.description}
                                            placeholder="Notes for this day…"
                                            rows={2}
                                            onChange={e => {
                                                const updated = [...days];

                                                updated[dayIndex] = {
                                                    ...updated[dayIndex],
                                                    description: e.target.value,
                                                };

                                                setDays(updated);
                                            }}
                                            className={`${inputClass} resize-none`}
                                            disabled={saving}
                                        />

                                        {/* Locations */}
                                        <div className="space-y-2">
                                            {day.locationsLoadError && (
                                                <div
                                                    role="alert"
                                                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                                                    Some locations could not be loaded.
                                                    You can continue editing the
                                                    itinerary, but those locations may
                                                    need to be added again.
                                                </div>
                                            )}
                                            {day.locations?.map((loc, locIndex) => (
                                                <div
                                                    key={
                                                        loc.locationId ??
                                                        `loc-${locIndex}`
                                                    }
                                                    className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                                                    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                                            {locIndex + 1}
                                                        </span>

                                                        <input
                                                            placeholder="Location name"
                                                            value={loc.name || ""}
                                                            onChange={e => {
                                                                const updated = [...days];

                                                                updated[
                                                                    dayIndex
                                                                ].locations = updated[
                                                                    dayIndex
                                                                ].locations.map(
                                                                    (item, index) =>
                                                                        index === locIndex
                                                                            ? {
                                                                                  ...item,
                                                                                  name: e
                                                                                      .target
                                                                                      .value,
                                                                              }
                                                                            : item,
                                                                );

                                                                setDays(updated);
                                                            }}
                                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
                                                            disabled={saving}
                                                        />

                                                        <input
                                                            placeholder="Address"
                                                            value={loc.address || ""}
                                                            onChange={e => {
                                                                const updated = [...days];

                                                                updated[
                                                                    dayIndex
                                                                ].locations = updated[
                                                                    dayIndex
                                                                ].locations.map(
                                                                    (item, index) =>
                                                                        index === locIndex
                                                                            ? {
                                                                                  ...item,
                                                                                  address:
                                                                                      e
                                                                                          .target
                                                                                          .value,
                                                                              }
                                                                            : item,
                                                                );

                                                                setDays(updated);
                                                            }}
                                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
                                                            disabled={saving}
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeLocation(
                                                                    dayIndex,
                                                                    locIndex,
                                                                )
                                                            }
                                                            disabled={saving}
                                                            aria-label={`Remove ${loc.name || "location"}`}
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                                            <Trash size={11} />
                                                        </button>
                                                    </div>

                                                    {/* Image previews */}
                                                    {(loc.images?.length > 0 ||
                                                        loc.imagesLoadError) && (
                                                        <div className="space-y-2 pt-1">
                                                            {loc.imagesLoadError && (
                                                                <div
                                                                    role="alert"
                                                                    className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                                                                    Some images could not
                                                                    be loaded. You can
                                                                    continue editing this
                                                                    location.
                                                                </div>
                                                            )}

                                                            {loc.images?.length > 0 && (
                                                                <div className="flex gap-2 flex-wrap">
                                                                    {loc.images.map(
                                                                        (
                                                                            img,
                                                                            imgIndex,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    img.imageId ??
                                                                                    `new-${imgIndex}`
                                                                                }
                                                                                className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 group">
                                                                                <img
                                                                                    src={
                                                                                        img.isNew
                                                                                            ? URL.createObjectURL(
                                                                                                  img.file,
                                                                                              )
                                                                                            : `${import.meta.env.VITE_API_BASE_URL}/itineraries/days/locations/images/${img.imageId}`
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
                                                                                    disabled={
                                                                                        saving
                                                                                    }
                                                                                    aria-label="Remove image"
                                                                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed">
                                                                                    <Trash
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                        className="text-white"
                                                                                    />
                                                                                </button>
                                                                            </div>
                                                                        ),
                                                                    )}
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
                                                            onChange={e => {
                                                                const file =
                                                                    e.target.files?.[0];

                                                                if (!file) return;

                                                                const updated = [...days];

                                                                updated[
                                                                    dayIndex
                                                                ].locations[
                                                                    locIndex
                                                                ].images = [
                                                                    ...updated[dayIndex]
                                                                        .locations[
                                                                        locIndex
                                                                    ].images,
                                                                    {
                                                                        isNew: true,
                                                                        file,
                                                                    },
                                                                ];

                                                                setDays(updated);

                                                                e.target.value = "";
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = [...days];

                                                updated[dayIndex].locations = [
                                                    ...(updated[dayIndex].locations ||
                                                        []),
                                                    {
                                                        name: "",
                                                        address: "",
                                                        images: [],
                                                    },
                                                ];

                                                setDays(updated);
                                            }}
                                            disabled={saving}
                                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer pt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <Plus size={11} />
                                            Add location
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
                    {/* Visibility toggle */}
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        disabled={saving}
                        className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                            ${
                                isPublic
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
                            }`}>
                        {isPublic ? (
                            <>
                                <Globe size={12} />
                                Public
                            </>
                        ) : (
                            <>
                                <Lock size={12} />
                                Private
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={createOrUpdateItinerary}
                            disabled={saving}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            {saving ? "Saving…" : isEditMode ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
