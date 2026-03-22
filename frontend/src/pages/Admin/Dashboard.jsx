import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";
import { Users, Map, Image, Trash } from "lucide-react";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const [openView, setOpenView] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [stats, setStats] = useState({
        users: 0,
        itineraries: 0,
        images: 0,
    });

    const [recentItineraries, setRecentItineraries] = useState([]);
    const [activity, setActivity] = useState([]);

    const confirmDelete = itineraryId => {
        toast(
            ({ closeToast }) => (
                <div>
                    <p className="mb-2">
                        Are you sure you want to delete this itinerary? This action cannot
                        be undone.
                    </p>

                    <div className="flex gap-2">
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => {
                                handleDelete(itineraryId);
                                closeToast();
                            }}>
                            Delete
                        </button>

                        <button
                            className="bg-gray-300 px-3 py-1 rounded"
                            onClick={closeToast}>
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false },
        );
    };

    // Wait for user token and fetch dashboard data
    useEffect(() => {
        if (!loading && user) {
            fetchDashboard();
        }
    }, [loading, user]);

    const fetchDashboard = async () => {
        try {
            const [statsRes, itineraryRes, activityRes] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/admin/itineraries/recent"),
                api.get("/admin/activity/weekly"),
            ]);

            setStats(statsRes.data);
            setRecentItineraries(itineraryRes.data);
            setActivity(activityRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async id => {
        try {
            await api.delete(`/admin/itineraries/${id}`);
            setRecentItineraries(prev => prev.filter(i => i.id !== id));
            toast.success("Itinerary deleted successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete itinerary.");
        }
    };

    const handleOpenItinerary = itinerary => {
        setSelectedItinerary(itinerary);
        setOpenView(true);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-2 text-primary font-primary">
                Dashboard
            </h1>
            <p className="text-gray-500 pb-6">Overview of Travel Stories platform</p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card
                    title="Total Users"
                    value={stats.users}
                    icon={<Users size={20} />}
                />
                <Card
                    title="Total Itineraries"
                    value={stats.itineraries}
                    icon={<Map size={20} />}
                />
                <Card
                    title="Total Images"
                    value={stats.images}
                    icon={<Image size={20} />}
                />
            </div>

            {/* Activity */}
            <div className="bg-primary/5 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold font-primary mb-4">
                    Weekly Activity
                </h2>
                <ul className="space-y-2">
                    {activity.map((a, index) => (
                        <li key={index} className="flex justify-between text-sm">
                            <span>{a.date}</span>
                            <span>
                                {a.newUsers}{" "}
                                <span className="opacity-60">new users joined</span> |{" "}
                                {a.newItineraries}{" "}
                                <span className="opacity-60">
                                    new itineraries created
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Recent Itineraries */}
            <div className="bg-gray-100 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 font-primary">
                    Recently Added Itineraries
                </h2>

                <div className="space-y-4">
                    {recentItineraries.map(itinerary => (
                        <div
                            key={itinerary.itineraryId}
                            className="flex items-center justify-between bg-white p-3 rounded-xl hover:shadow">
                            <div
                                onClick={e => {
                                    if (e.target.closest(".action-btn")) return;
                                    handleOpenItinerary(itinerary);
                                }}
                                className="flex items-center gap-4 cursor-pointer">
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                                    alt=""
                                    className="w-14 h-14 rounded-lg object-cover"
                                />
                                <div>
                                    <h3 className="font-semibold font-primary">
                                        {itinerary.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {itinerary.place} • by {itinerary.createdBy}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                        itinerary.public
                                            ? "bg-white border border-green-500 text-green-500"
                                            : "bg-white border border-red-500 text-red-500"
                                    }`}>
                                    {itinerary.public ? "Public" : "Private"}
                                </span>

                                <button
                                    onClick={e => {
                                        confirmDelete(itinerary.itineraryId);
                                    }}
                                    className="bg-gray-100 p-2 rounded-full cursor-pointer text-red-500 text-sm hover:scale-110 transform shadow">
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {openView && (
                <ItineraryOverlay
                    itinerary={selectedItinerary}
                    onClose={() => {
                        setOpenView(false);
                        setSelectedItinerary(null);
                    }}
                />
            )}
        </div>
    );
}

function Card({ title, value, icon }) {
    return (
        <div className="bg-gray-50 rounded-xl shadow-md p-6 flex items-center justify-between">
            <div>
                <p className="text-gray-600 mb-1 font-primary">{title}</p>
                <h2 className="text-2xl font-semibold">{value}</h2>
            </div>
            <div className="bg-primary text-white p-3 rounded-xl">{icon}</div>
        </div>
    );
}
