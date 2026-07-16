import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Auth pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ResetPassword from "./pages/Auth/ResetPassword";

// User pages
import Explore from "./pages/User/Explore";
import Community from "./pages/User/Community";
import MyItineraries from "./pages/User/MyItineraries";
import Profile from "./pages/User/Profile";

// Admin pages
import Dashboard from "./pages/Admin/Dashboard";
import UserManagement from "./pages/Admin/UserManagement";
import ItineraryManagement from "./pages/Admin/ItineraryManagement";

import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Router />
            </AuthProvider>
        </BrowserRouter>
    );
}

function Router() {
    const { user, loading } = useAuth();

    if (loading) return null; // wait until sessionStorage is checked

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Root route redirects based on role */}
                <Route
                    path="/"
                    element={
                        user ? (
                            user.role === "admin" ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <Navigate to="/user" replace />
                            )
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* User routes */}
                <Route element={<ProtectedRoute role="user" />}>
                    <Route path="/user" element={<MainLayout />}>
                        <Route index element={<Explore />} />
                        <Route path="community" element={<Community />} />
                        <Route path="itineraries" element={<MyItineraries />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute role="admin" />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="user-management" element={<UserManagement />} />
                        <Route
                            path="itinerary-management"
                            element={<ItineraryManagement />}
                        />
                    </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
