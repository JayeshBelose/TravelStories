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
import {
    addMemberService,
    createItineraryService,
    getItineraryDetailsService,
    getItineraryTypesService,
    removeMemberService,
    updateItineraryService,
    uploadThumbnailService,
} from "@/services/itineraryService";
import { getFollowingService } from "@/services/userService";
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

    // Allowing edit mode to both creator and the Admin
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
    const [members, setMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [types, setTypes] = useState([]);
    const [saving, setSaving] = useState(false);

    const [deletedDays, setDeletedDays] = useState([]);
    const [deletedLocations, setDeletedLocations] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    // Fetch itinerary data if in edit mode
    useEffect(() => {
        if (!open) return;

        const loadData = async () => {
            const [typesResult, followingResult] = await Promise.all([
                getItineraryTypesService(),
                getFollowingService({
                    userId: user.userId,
                }),
            ]);

            if (typesResult.success) {
                setTypes(typesResult.data);
            }

            if (followingResult.success) {
                setFollowingList(followingResult.data);
            }

            if (!isEditMode || !existingItinerary) {
                resetForm();
                return;
            }

            const itineraryId = existingItinerary.itineraryId;
            setItineraryId(itineraryId);

            const [itineraryResult, daysResult] = await Promise.all([
                getItineraryDetailsService({ itineraryId }),
                getItineraryDaysService({ itineraryId }),
            ]);

            if (!itineraryResult.success) {
                console.error(itineraryResult.message);
                return;
            }

            if (!daysResult.success) {
                console.error(daysResult.message);
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

            const loadedDays = await Promise.all(
                daysResult.data.map(async day => {
                    const locationsResult = await getDayLocationsService({
                        dayId: day.dayId,
                    });

                    if (!locationsResult.success) {
                        console.error(locationsResult.message);
                        return {
                            ...day,
                            locations: [],
                        };
                    }

                    const loadedLocations = await Promise.all(
                        locationsResult.data.map(async location => {
                            const imagesResult = await getLocationImagesService({
                                locationId: location.locationId,
                            });

                            if (!imagesResult.success) {
                                console.error(imagesResult.message);

                                return {
                                    ...location,
                                    name: location.locationName || "",
                                    address: location.locationAddress || "",
                                    images: [],
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

                    return {
                        ...day,
                        locations: loadedLocations,
                    };
                }),
            );

            setDays(loadedDays);
        };

        loadData();
    }, [open, existingItinerary]);

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
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setDeletedDays([]);
        setDeletedLocations([]);
        setDeletedImages([]);
    };

    if (!open) return null;

    const createOrUpdateItinerary = async () => {
        if (!title || !place || !type || !startDate || !endDate) {
            toast.error("Please fill all required fields.");
            return;
        }

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

            onSaved?.(result.data);

            await Promise.all([
                ...deletedImages.map(imageId => deleteLocationImageService({ imageId })),
                ...deletedLocations.map(locationId =>
                    deleteLocationService({ locationId }),
                ),
                ...deletedDays.map(dayId =>
                    deleteDayService({
                        itineraryId: id,
                        dayId,
                    }),
                ),
            ]);

            if (thumbnailFile) {
                const formData = new FormData();
                formData.append("file", thumbnailFile);

                await uploadThumbnailService({
                    itineraryId: id,
                    formData,
                });
            }

            for (const day of days) {
                let dayId = day.dayId;

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

                for (const location of day.locations) {
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

                    for (const image of location.images) {
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

            toast.success(isEditMode ? "Itinerary updated!" : "Itinerary created!");

            setDeletedDays([]);
            setDeletedLocations([]);
            setDeletedImages([]);

            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Remove functions
    const removeDay = index => {
        const day = days[index];
        if (day.dayId) setDeletedDays(prev => [...prev, day.dayId]);
        setDays(prev => prev.filter((_, i) => i !== index));
    };

    const removeLocation = (dayIndex, locIndex) => {
        const loc = days[dayIndex].locations[locIndex];
        if (loc.locationId) setDeletedLocations(prev => [...prev, loc.locationId]);
        const updated = [...days];
        updated[dayIndex].locations.splice(locIndex, 1);
        setDays(updated);
    };

    const removeImage = (dayIndex, locIndex, imgIndex) => {
        const updated = [...days];
        const img = updated[dayIndex].locations[locIndex].images[imgIndex];
        if (!img.isNew && img.imageId) setDeletedImages(prev => [...prev, img.imageId]);
        updated[dayIndex].locations[locIndex].images.splice(imgIndex, 1);
        setDays(updated);
    };

    // Searching for members
    const filteredMembers =
        memberSearch.trim().length === 0
            ? []
            : followingList.filter(
                  u =>
                      u.username.toLowerCase().includes(memberSearch.toLowerCase()) &&
                      !members.find(m => m.userId === u.userId),
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
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
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
                                    alt="thumbnail"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        )}
                        <label className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Upload size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-500">
                                {thumbnailFile ? thumbnailFile.name : "Upload thumbnail"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setThumbnailFile(file);
                                    setThumbnailPreview(URL.createObjectURL(file));
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
                                />
                            </div>
                        </div>

                        <div>
                            <FieldLabel required>Type</FieldLabel>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
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

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <FieldLabel required>Start Date</FieldLabel>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <FieldLabel required>End Date</FieldLabel>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className={inputClass}
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
                                placeholder="Search people you follow…"
                                value={memberSearch}
                                onChange={e => setMemberSearch(e.target.value)}
                                className={`${inputClass} pl-9`}
                            />
                        </div>

                        {filteredMembers.length > 0 && (
                            <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
                                {filteredMembers.map(member => (
                                    <button
                                        key={member.userId}
                                        onClick={() => {
                                            setMembers([...members, member]);
                                            setMemberSearch("");
                                        }}
                                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left">
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
                                            onClick={() =>
                                                setMembers(
                                                    members.filter(
                                                        m => m.userId !== member.userId,
                                                    ),
                                                )
                                            }
                                            className="text-gray-400 hover:text-gray-700 cursor-pointer">
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
                                onClick={() =>
                                    setDays([...days, { description: "", locations: [] }])
                                }
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                <Plus size={12} /> Add Day
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
                                            onClick={() => removeDay(dayIndex)}
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors cursor-pointer">
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
                                                updated[dayIndex].description =
                                                    e.target.value;
                                                setDays(updated);
                                            }}
                                            className={`${inputClass} resize-none`}
                                        />

                                        {/* Locations */}
                                        <div className="space-y-2">
                                            {day.locations?.map((loc, locIndex) => (
                                                <div
                                                    key={
                                                        loc.locationId ??
                                                        `loc-${locIndex}`
                                                    }
                                                    className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                                                    <div className="flex items-center gap-2">
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
                                                                ].locations[
                                                                    locIndex
                                                                ].name = e.target.value;
                                                                setDays(updated);
                                                            }}
                                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
                                                        />
                                                        <input
                                                            placeholder="Address"
                                                            value={loc.address || ""}
                                                            onChange={e => {
                                                                const updated = [...days];
                                                                updated[
                                                                    dayIndex
                                                                ].locations[
                                                                    locIndex
                                                                ].address =
                                                                    e.target.value;
                                                                setDays(updated);
                                                            }}
                                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                removeLocation(
                                                                    dayIndex,
                                                                    locIndex,
                                                                )
                                                            }
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 flex-shrink-0 cursor-pointer">
                                                            <Trash size={11} />
                                                        </button>
                                                    </div>

                                                    {/* Image previews */}
                                                    {loc.images?.length > 0 && (
                                                        <div className="flex gap-2 flex-wrap pt-1">
                                                            {loc.images.map(
                                                                (img, imgIndex) => (
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
                                                                            onClick={() =>
                                                                                removeImage(
                                                                                    dayIndex,
                                                                                    locIndex,
                                                                                    imgIndex,
                                                                                )
                                                                            }
                                                                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                                            <Trash
                                                                                size={12}
                                                                                className="text-white"
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                ),
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
                                                            onChange={e => {
                                                                const file =
                                                                    e.target.files[0];
                                                                if (!file) return;
                                                                const updated = [...days];
                                                                updated[
                                                                    dayIndex
                                                                ].locations[
                                                                    locIndex
                                                                ].images.push({
                                                                    isNew: true,
                                                                    file,
                                                                });
                                                                setDays(updated);
                                                                e.target.value = "";
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => {
                                                const updated = [...days];
                                                updated[dayIndex].locations.push({
                                                    name: "",
                                                    address: "",
                                                    images: [],
                                                });
                                                setDays(updated);
                                            }}
                                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer pt-1">
                                            <Plus size={11} /> Add location
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
                    {/* Visibility toggle */}
                    <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border transition-colors cursor-pointer
                            ${
                                isPublic
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
                            }`}>
                        {isPublic ? (
                            <>
                                <Globe size={12} /> Public
                            </>
                        ) : (
                            <>
                                <Lock size={12} /> Private
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button
                            onClick={createOrUpdateItinerary}
                            disabled={saving}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                            {saving ? "Saving…" : isEditMode ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
