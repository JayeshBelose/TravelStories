import { useState } from "react";
import { X, Plus, Trash } from "lucide-react";

export default function CreateItineraryOverlay({ open, onClose }) {
    const [thumbnail, setThumbnail] = useState(null);
    const [itineraryDescription, setItineraryDescription] = useState("");
    const [days, setDays] = useState([]);
    const [title, setTitle] = useState("");
    const [place, setPlace] = useState("");
    const [type, setType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dateError, setDateError] = useState("");

    const [memberSearch, setMemberSearch] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Dummy following list
    const followingList = [
        { id: 1, username: "Riya Sharma", profilePic: "https://i.pravatar.cc/150?img=1" },
        { id: 2, username: "Aman Verma", profilePic: "https://i.pravatar.cc/150?img=2" },
        {
            id: 3,
            username: "Carlos Rivera",
            profilePic: "https://i.pravatar.cc/150?img=3",
        },
        { id: 4, username: "Yuki Tanaka", profilePic: "https://i.pravatar.cc/150?img=4" },
    ];

    if (!open) return null;

    /* ---------------- THUMBNAIL ---------------- */
    const handleThumbnailChange = e => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(URL.createObjectURL(file));
        }
    };

    /* ---------------- DAYS ---------------- */
    const addDay = () => {
        setDays([...days, { description: "", locations: [] }]);
    };

    const removeDay = dayIndex => {
        setDays(days.filter((_, i) => i !== dayIndex));
    };

    const updateDayDescription = (dayIndex, value) => {
        const updated = [...days];
        updated[dayIndex].description = value;
        setDays(updated);
    };

    /* ---------------- LOCATIONS ---------------- */
    const addLocation = dayIndex => {
        const updated = [...days];
        updated[dayIndex].locations.push({
            name: "",
            address: "",
            images: [],
        });
        setDays(updated);
    };

    const removeLocation = (dayIndex, locationIndex) => {
        const updated = [...days];
        updated[dayIndex].locations = updated[dayIndex].locations.filter(
            (_, i) => i !== locationIndex,
        );
        setDays(updated);
    };

    const updateLocationField = (dayIndex, locationIndex, field, value) => {
        const updated = [...days];
        updated[dayIndex].locations[locationIndex][field] = value;
        setDays(updated);
    };

    const handleLocationImages = (e, dayIndex, locationIndex) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));

        const updated = [...days];
        updated[dayIndex].locations[locationIndex].images.push(...imageUrls);
        setDays(updated);
    };

    const removeLocationImage = (dayIndex, locationIndex, imageIndex) => {
        const updated = [...days];
        updated[dayIndex].locations[locationIndex].images = updated[dayIndex].locations[
            locationIndex
        ].images.filter((_, i) => i !== imageIndex);
        setDays(updated);
    };

    const filteredMembers = followingList.filter(
        user =>
            user.username.toLowerCase().includes(memberSearch.toLowerCase()) &&
            !selectedMembers.find(m => m.id === user.id),
    );

    const handleSave = () => {
        if (!title || !place || !type || !startDate || !endDate) {
            alert("Please fill all required fields");
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            setDateError("End date must be after start date");
            return;
        }

        console.log({
            title,
            place,
            type,
            startDate,
            endDate,
            thumbnail,
            itineraryDescription,
            members: selectedMembers,
            days,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center overflow-y-auto p-6 z-50">
            <div className="bg-white w-11/12 max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto relative">
                {/* HEADER */}
                <div className="flex justify-between items-center p-4 border-b bg-primary sticky top-0 z-10">
                    <h2 className="text-3xl font-bold font-primary text-white">
                        Create Itinerary
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white hover:bg-secondary cursor-pointer transition">
                        <X size={22} />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                    {/* Thumbnail */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Thumbnail</h3>

                        <label className="w-48 h-48 mb-10 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-gray-400 transition">
                            {thumbnail ? (
                                <img
                                    src={thumbnail}
                                    alt="thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 border rounded-2xl w-full p-10 text-center text-sm">
                                    Upload Image
                                </span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailChange}
                            />
                        </label>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Basic Information</h3>

                        <input
                            type="text"
                            placeholder="Itinerary Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        />

                        <input
                            type="text"
                            placeholder="Place (e.g., Barcelona, Spain)"
                            value={place}
                            onChange={e => setPlace(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        />

                        {/* Type Dropdown */}
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none">
                            <option value="">Select Itinerary Type</option>
                            <option value="Leisure">Leisure</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Business">Business</option>
                            <option value="Educational">Educational</option>
                            <option value="Cultural">Cultural</option>
                        </select>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />

                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>

                        {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
                    </div>

                    {/* Itinerary Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            Itinerary Description
                        </h3>
                        <textarea
                            value={itineraryDescription}
                            onChange={e => setItineraryDescription(e.target.value)}
                            placeholder="Describe your trip..."
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            rows={4}
                        />
                    </div>

                    {/* Days */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Day-by-Day Plan</h3>
                            <button
                                onClick={addDay}
                                className="flex items-center gap-2 p-4 rounded-full hover:bg-gray-100 transition">
                                <Plus size={16} />
                                Add Day
                            </button>
                        </div>

                        {days.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className="bg-gray-50 border rounded-2xl p-8 mb-10 space-y-6">
                                {/* Day Header */}
                                <div className="flex mb-6 justify-between items-center">
                                    <h4 className="text-xl font-semibold">
                                        Day {dayIndex + 1}
                                    </h4>
                                    <Trash
                                        size={18}
                                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                                        onClick={() => removeDay(dayIndex)}
                                    />
                                </div>

                                {/* Day Description */}
                                <textarea
                                    placeholder="Describe this day..."
                                    value={day.description}
                                    onChange={e =>
                                        updateDayDescription(dayIndex, e.target.value)
                                    }
                                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                    rows={3}
                                />

                                {/* Locations */}
                                <div className="space-y-6">
                                    {day.locations.map((loc, locationIndex) => (
                                        <div
                                            key={locationIndex}
                                            className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
                                            <div className="flex justify-between items-center">
                                                <h5 className="font-medium">
                                                    Location {locationIndex + 1}
                                                </h5>
                                                <Trash
                                                    size={16}
                                                    className="text-red-500 cursor-pointer hover:scale-110 transition"
                                                    onClick={() =>
                                                        removeLocation(
                                                            dayIndex,
                                                            locationIndex,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Location Name"
                                                value={loc.name}
                                                onChange={e =>
                                                    updateLocationField(
                                                        dayIndex,
                                                        locationIndex,
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                            />

                                            <input
                                                type="text"
                                                placeholder="Address"
                                                value={loc.address}
                                                onChange={e =>
                                                    updateLocationField(
                                                        dayIndex,
                                                        locationIndex,
                                                        "address",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                            />

                                            <label className="text-sm text-primary font-medium cursor-pointer hover:underline">
                                                + Upload Images
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e =>
                                                        handleLocationImages(
                                                            e,
                                                            dayIndex,
                                                            locationIndex,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <div className="p-2 flex gap-3 flex-wrap">
                                                {loc.images.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt="location"
                                                        onClick={() =>
                                                            removeLocationImage(
                                                                dayIndex,
                                                                locationIndex,
                                                                i,
                                                            )
                                                        }
                                                        className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Members Section */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">
                                        Add Members
                                    </h3>

                                    {/* Selected Members */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {selectedMembers.map(member => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                                                <img
                                                    src={member.profilePic}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                                <span className="text-sm">
                                                    {member.username}
                                                </span>
                                                <X
                                                    size={14}
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedMembers(
                                                            selectedMembers.filter(
                                                                m => m.id !== member.id,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Search Input */}
                                    <input
                                        type="text"
                                        placeholder="Search from following..."
                                        value={memberSearch}
                                        onChange={e => setMemberSearch(e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                    />

                                    {/* Search Results */}
                                    {memberSearch && (
                                        <div className="border rounded-xl mt-2 max-h-40 overflow-y-auto bg-white shadow">
                                            {filteredMembers.length > 0 ? (
                                                filteredMembers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => {
                                                            setSelectedMembers([
                                                                ...selectedMembers,
                                                                user,
                                                            ]);
                                                            setMemberSearch("");
                                                        }}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer">
                                                        <img
                                                            src={user.profilePic}
                                                            alt=""
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                        <span>{user.username}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="p-3 text-sm text-gray-500">
                                                    No matching users
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => addLocation(dayIndex)}
                                    className="text-primary mt-10 text-sm font-medium hover:underline">
                                    + Add Location
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-10 border-t bg-white flex justify-center items-center">
                    <button
                        onClick={handleSave}
                        className="bg-primary text-white px-8 py-3 rounded-full shadow-lg hover:opacity-90 transition">
                        Save Itinerary
                    </button>
                </div>
            </div>
        </div>
    );
}
