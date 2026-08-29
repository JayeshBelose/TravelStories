import { memo } from "react";
import { ui } from "@/styles/uiPrimitives";
import { Skeleton } from "../ui/skeleton";

function StatCard({ title, value, icon: Icon, color, loading, error }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
                <p className={`${ui.sectionLabel} mb-1`}>{title}</p>

                {loading ? (
                    <Skeleton
                        className="h-7 w-16"
                        aria-label={`Loading ${title}`}
                    />
                ) : error ? (
                    <p className="text-xs font-medium text-red-400">
                        Unavailable
                    </p>
                ) : (
                    <p className="text-2xl font-bold text-gray-900">
                        {value.toLocaleString()}
                    </p>
                )}
            </div>

            <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
                aria-hidden="true"
            >
                <Icon size={18} />
            </div>
        </div>
    );
}

export default memo(StatCard);
