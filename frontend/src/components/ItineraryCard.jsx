import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";

export default function ItineraryCard({ itinerary, onClick }) {
    const [likes, setLikes] = useState(itinerary.likeCount);
    const [saves, setSaves] = useState(itinerary.saveCount);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleLike = e => {
        e.stopPropagation(); // prevent overlay open
        setLiked(!liked);
        setLikes(prev => (liked ? prev - 1 : prev + 1));
    };

    const handleSave = e => {
        e.stopPropagation(); // prevent overlay open
        setSaved(!saved);
        setSaves(prev => (saved ? prev - 1 : prev + 1));
    };

    return (
        <div
            onClick={() => onClick(itinerary)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md transition duration-300">
            <img
                src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                alt={itinerary.title}
                className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition" />

            {/* Text Content */}
            <div className="absolute group-hover:bg-black/10 bottom-5 left-5 right-5 text-white">
                <h3 className="text-xl font-semibold font-primary">{itinerary.title}</h3>

                <p className="text-sm opacity-90">{itinerary.place}</p>

                {/* Creator */}
                <p className="text-xs mt-1 opacity-80">
                    By {itinerary.createdBy || "Anonymous"}
                </p>

                {/* Like & Save Section */}
                <div className="flex items-center gap-6 mt-3 text-sm">
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-1 hover:scale-105 transition">
                        <Heart
                            size={16}
                            className={liked ? "fill-red-500 text-red-500" : ""}
                        />
                        {likes}
                    </button>

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-1 hover:scale-105 transition">
                        <Bookmark
                            size={16}
                            className={saved ? "fill-yellow-400 text-yellow-400" : ""}
                        />
                        {saves}
                    </button>
                </div>
            </div>
        </div>
    );
}
