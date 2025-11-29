import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import { AuthProvider, useAuth } from "./context/AuthContext";

// 🔒 Giriş yapılmamışsa erişimi engelleyen koruma bileşeni
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: "100px" }}>Yükleniyor...</div>;
    }

    return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

// 🔹 Tüm uygulama AuthProvider ile sarılmış olmalı
export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}
