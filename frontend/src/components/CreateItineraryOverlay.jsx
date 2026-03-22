import { useState, useEffect } from "react";
import { X, Plus, Trash, Upload } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";

export default function CreateItineraryOverlay({
    open,
    onClose,
    existingItinerary = null,
    onSaved,
}) {
    const user = JSON.parse(localStorage.getItem("user"));

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

    const [deletedDays, setDeletedDays] = useState([]);
    const [deletedLocations, setDeletedLocations] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    useEffect(() => {
        if (!open) return;

        const loadData = async () => {
            try {
                const typeRes = await api.get("/users/itineraries/types");
                setTypes(typeRes.data);

                const followingRes = await api.get(
                    `/users/community/${user.userId}/following`,
                );
                setFollowingList(followingRes.data);

                if (isEditMode && existingItinerary) {
                    const id = existingItinerary.itineraryId;
                    setItineraryId(id);

                    const itineraryRes = await api.get(`/itineraries/${id}`);
                    const itinerary = itineraryRes.data;

                    setTitle(itinerary.title);
                    setPlace(itinerary.place);
                    setType(itinerary.type);
                    setStartDate(itinerary.startDate);
                    setEndDate(itinerary.endDate);
                    setDescription(itinerary.description);
                    setIsPublic(itinerary.public);
                    setMembers(itinerary.members || []);

                    const daysRes = await api.get(`/itineraries/${id}/days`);
                    const loadedDays = [];

                    for (let day of daysRes.data) {
                        const locRes = await api.get(
                            `/itineraries/days/${day.dayId}/locations`,
                        );

                        const loadedLocations = [];

                        for (let loc of locRes.data) {
                            const imgRes = await api.get(
                                `/itineraries/days/locations/${loc.locationId}/images`,
                            );

                            loadedLocations.push({
                                ...loc,
                                name: loc.locationName || "",
                                address: loc.locationAddress || "",
                                images: imgRes.data.map(img => ({
                                    ...img,
                                    isNew: false,
                                    file: null,
                                })),
                            });
                        }

                        loadedDays.push({
                            ...day,
                            locations: loadedLocations,
                        });
                    }

                    setDays(loadedDays);
                } else {
                    resetForm();
                }
            } catch (err) {
                console.error(err);
            }
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

    // Create/Update logic
    const createOrUpdateItinerary = async () => {
        if (!title || !place || !type || !startDate || !endDate) {
            toast.error("Please fill all required fields!");
            return;
        }

        try {
            let response;

            if (isEditMode && isCreator) {
                response = await api.put(`/itineraries/${itineraryId}`, {
                    title,
                    place,
                    type,
                    startDate,
                    endDate,
                    description,
                    public: isPublic,
                });
            } else {
                response = await api.post(`/itineraries/users/${user.userId}`, {
                    title,
                    place,
                    type,
                    startDate,
                    endDate,
                    description,
                    public: isPublic,
                });
                setItineraryId(response.data.itineraryId);
            }

            const id = response?.data?.itineraryId || itineraryId;

            if (onSaved) onSaved(response.data);

            // Delete
            for (let imageId of deletedImages) {
                await api.delete(`/itineraries/days/locations/images/${imageId}`);
            }

            for (let locationId of deletedLocations) {
                await api.delete(`/itineraries/days/locations/${locationId}`);
            }

            for (let dayId of deletedDays) {
                await api.delete(`/itineraries/${id}/days/${dayId}`);
            }

            // Thumbnail
            if (thumbnailFile) {
                const formData = new FormData();
                formData.append("file", thumbnailFile);
                await api.post(`/itineraries/${id}/thumbnail`, formData);
            }

            // Days & Locations
            for (let day of days) {
                let dayId = day.dayId;

                if (!dayId) {
                    const dayRes = await api.post(`/itineraries/${id}/days`, {
                        description: day.description,
                    });
                    dayId = dayRes.data.dayId;
                } else {
                    await api.put(`/itineraries/${id}/days/${dayId}`, {
                        description: day.description,
                    });
                }

                for (let loc of day.locations) {
                    let locationId = loc.locationId;

                    if (!locationId) {
                        const locRes = await api.post(
                            `/itineraries/days/${dayId}/locations`,
                            {
                                locationName: loc.name,
                                locationAddress: loc.address,
                            },
                        );
                        locationId = locRes.data.locationId;
                    } else {
                        await api.put(
                            `/itineraries/days/${dayId}/locations/${locationId}`,
                            {
                                locationName: loc.name,
                                locationAddress: loc.address,
                            },
                        );
                    }

                    // Images
                    for (let image of loc.images) {
                        if (image.isNew && image.file) {
                            const imgForm = new FormData();
                            imgForm.append("file", image.file);
                            await api.post(
                                `/itineraries/days/locations/${locationId}/images`,
                                imgForm,
                            );
                        }
                    }
                }
            }

            // Members
            const existingMembers = existingItinerary?.members || [];

            for (let m of existingMembers) {
                if (!members.find(sel => sel.userId === m.userId)) {
                    await api.delete(`/itineraries/members/${id}/${m.userId}`);
                }
            }

            for (let m of members) {
                if (!existingMembers.find(em => em.userId === m.userId)) {
                    await api.post(`/itineraries/members/${id}/${m.userId}`);
                }
            }

            toast.success(isEditMode ? "Itinerary Updated!" : "Itinerary Created!");

            setDeletedDays([]);
            setDeletedLocations([]);
            setDeletedImages([]);

            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        }
    };

    // Remove functions
    const removeDay = index => {
        const day = days[index];
        if (day.dayId) setDeletedDays(prev => [...prev, day.dayId]);

        const updated = [...days];
        updated.splice(index, 1);
        setDays(updated);
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

    // Search logic to add members
    const filteredMembers =
        memberSearch.trim().length === 0
            ? []
            : followingList.filter(
                  u =>
                      u.username.toLowerCase().includes(memberSearch.toLowerCase()) &&
                      !members.find(m => m.userId === u.userId),
              );

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start p-6 z-50 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl ml-64">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-primary text-white rounded-t-2xl">
                    <h2 className="text-2xl font-semibold font-primary">
                        {isEditMode ? "Update Itinerary" : "Create Itinerary"}
                    </h2>
                    <X onClick={onClose} className="cursor-pointer" />
                </div>

                <div className="p-8 space-y-6">
                    <div className="p-8 space-y-8">
                        {/* Thumbnail */}
                        <div>
                            <h3 className="font-semibold font-primary text-xl mb-2">
                                Thumbnail
                            </h3>

                            <label className="flex items-center gap-2 cursor-pointer w-fit bg-primary/10 p-3 rounded-2xl shadow-sm hover:shadow-md">
                                <Upload size={16} />
                                {thumbnailFile
                                    ? `Selected: ${thumbnailFile.name}`
                                    : "Upload Thumbnail"}

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

                            {/* Existing thumbnail (Edit mode) */}
                            {isEditMode &&
                                !thumbnailPreview &&
                                existingItinerary?.thumbnailUrl && (
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itineraryId}/thumbnail`}
                                        className="w-40 mt-4 rounded-xl"
                                    />
                                )}

                            {/* New preview */}
                            {thumbnailPreview && (
                                <img
                                    src={thumbnailPreview}
                                    className="w-40 mt-4 rounded-xl"
                                />
                            )}
                        </div>

                        {/* Basic Info */}
                        <div>
                            <label className="font-semibold font-primary text-xl">
                                Title
                            </label>
                            <input
                                value={title}
                                placeholder="Itinerary Title"
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border p-3 rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="font-semibold font-primary text-xl">
                                Place
                            </label>
                            <input
                                value={place}
                                placeholder="Itinerary Place"
                                onChange={e => setPlace(e.target.value)}
                                className="w-full border p-3 rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="font-semibold font-primary text-xl">
                                Type
                            </label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full border p-3 rounded-xl">
                                <option value="">Select Type</option>
                                {types.map(t => (
                                    <option key={t.typeId} value={t.name}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="font-semibold font-primary text-xl">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full border p-3 rounded-xl"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="font-semibold font-primary text-xl">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full border p-3 rounded-xl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold font-primary text-xl">
                                Description
                            </label>
                            <textarea
                                value={description}
                                placeholder="Itinerary Description"
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border p-3 rounded-xl"
                            />
                        </div>

                        {/* Members */}
                        <div>
                            <label className="font-semibold font-primary text-xl">
                                Add Members
                            </label>

                            <input
                                placeholder="Search following..."
                                value={memberSearch}
                                onChange={e => setMemberSearch(e.target.value)}
                                className="w-full border p-3 rounded-xl"
                            />

                            {memberSearch.trim().length > 0 &&
                                filteredMembers.map(member => (
                                    <div
                                        key={member.userId}
                                        onClick={() => setMembers([...members, member])}
                                        className="cursor-pointer hover:bg-gray-100 p-2">
                                        {member.username}
                                    </div>
                                ))}

                            <div className="flex flex-wrap gap-2 mt-3">
                                {members.map(member => (
                                    <div
                                        key={member.userId}
                                        className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full">
                                        <span>{member.username}</span>
                                        <X
                                            size={14}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setMembers(
                                                    members.filter(
                                                        m => m.userId !== member.userId,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Days */}
                        <div>
                            <button
                                onClick={() =>
                                    setDays([...days, { description: "", locations: [] }])
                                }
                                className="text-primary font-primary hover:bg-gray-100 p-2 rounded-full flex items-center gap-2 text-xl font-semibold">
                                <Plus size={16} /> Add Day
                            </button>

                            {days.map((day, dayIndex) => (
                                <div
                                    key={day.dayId ?? `day-${dayIndex}`}
                                    className="border p-6 rounded-xl mt-4 space-y-4">
                                    {/* Day Description */}
                                    <div className="flex justify-between">
                                        <textarea
                                            value={day.description}
                                            placeholder="Day Description"
                                            onChange={e => {
                                                const updated = [...days];
                                                updated[dayIndex].description =
                                                    e.target.value;
                                                setDays(updated);
                                            }}
                                            className="w-full border p-2 rounded-lg"
                                        />
                                        <Trash
                                            className="ml-3 hover:scale-110 cursor-pointer text-red-500"
                                            onClick={() => removeDay(dayIndex)}
                                        />
                                    </div>

                                    {/* Add Location */}
                                    <button
                                        onClick={() => {
                                            const updated = [...days];
                                            updated[dayIndex].locations.push({
                                                name: "",
                                                address: "",
                                                images: [],
                                                newImages: [],
                                            });
                                            setDays(updated);
                                        }}
                                        className="text-m font-primary text-primary hover:bg-gray-100 rounded-full p-2 font-semibold">
                                        + Add Location
                                    </button>

                                    {/* Locations */}
                                    {day.locations?.map((loc, locIndex) => (
                                        <div
                                            key={loc.locationId ?? `location-${locIndex}`}
                                            className="border p-4 rounded-lg space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Location Name"
                                                    value={loc.name || ""}
                                                    onChange={e => {
                                                        const updated = [...days];
                                                        updated[dayIndex].locations[
                                                            locIndex
                                                        ].name = e.target.value;
                                                        setDays(updated);
                                                    }}
                                                    className="border p-2 w-full rounded flex-6"
                                                />

                                                <input
                                                    placeholder="Address"
                                                    value={loc.address || ""}
                                                    onChange={e => {
                                                        const updated = [...days];
                                                        updated[dayIndex].locations[
                                                            locIndex
                                                        ].address = e.target.value;
                                                        setDays(updated);
                                                    }}
                                                    className="border p-2 w-full rounded flex-6"
                                                />

                                                <Trash
                                                    className="cursor-pointer text-red-500 flex-1 hover:scale-110"
                                                    onClick={() =>
                                                        removeLocation(dayIndex, locIndex)
                                                    }
                                                />
                                            </div>

                                            {/* Images Preview */}
                                            <div className="flex gap-3 flex-wrap">
                                                {loc.images?.map((img, imgIndex) => (
                                                    <div
                                                        key={
                                                            img.imageId ??
                                                            `new-${imgIndex}`
                                                        }
                                                        className="relative">
                                                        <img
                                                            src={
                                                                img.isNew
                                                                    ? URL.createObjectURL(
                                                                          img.file,
                                                                      )
                                                                    : `${import.meta.env.VITE_API_BASE_URL}/itineraries/days/locations/images/${img.imageId}`
                                                            }
                                                            className="w-20 h-20 object-cover rounded"
                                                            alt=""
                                                        />
                                                        <Trash
                                                            size={22}
                                                            className="absolute top-1 right-1 text-red-500 bg-white p-1 rounded-full cursor-pointer hover:scale-110"
                                                            onClick={() =>
                                                                removeImage(
                                                                    dayIndex,
                                                                    locIndex,
                                                                    imgIndex,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Image One By One */}
                                            <label className="flex items-center gap-2 cursor-pointer w-fit bg-primary/10 p-3 rounded-2xl shadow-sm hover:shadow-md">
                                                <Upload size={16} />
                                                Upload Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        const updated = [...days];
                                                        updated[dayIndex].locations[
                                                            locIndex
                                                        ].images.push({
                                                            isNew: true,
                                                            file: file,
                                                        });
                                                        setDays(updated);

                                                        e.target.value = "";
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end gap-4">
                    <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`border-2 p-2 rounded-full text-m hover:bg-gray-100 ${isPublic ? "border-red-500 text-red-500" : "border-green-500 text-green-500"}`}>
                        {isPublic ? "Set Private" : "Set Public"}
                    </button>

                    <button
                        onClick={createOrUpdateItinerary}
                        className="bg-primary/90 hover:bg-primary text-white px-8 py-3 rounded-full">
                        {isEditMode ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
