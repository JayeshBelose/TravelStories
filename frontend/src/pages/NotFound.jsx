import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <main
            className="min-h-screen flex items-center justify-center px-6 bg-gray-50"
            aria-labelledby="not-found-title">
            <div className="text-center max-w-md">
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                    404
                </p>

                <h1
                    id="not-found-title"
                    className="mt-2 text-3xl font-bold text-gray-900 font-primary">
                    Page not found
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                    The page you're looking for doesn't exist or may have been moved.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center mt-6 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
                    Go to home
                </Link>
            </div>
        </main>
    );
}
