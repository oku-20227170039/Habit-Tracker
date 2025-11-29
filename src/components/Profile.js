import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    deleteDoc,
    setDoc,          // 🔹 BUNU EKLE
} from "firebase/firestore";

import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [userData, setUserData] = useState({});
    const [file, setFile] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [habits, setHabits] = useState([]); // 🔹 alışkanlık listesi
    const { setTheme } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;
            const ref = doc(db, "users", auth.currentUser.uid);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                setUserData(data);
                setDarkMode(data.theme === "dark");
                setNotifications(data.notifications || false);
            }

            // 🔹 Kullanıcının alışkanlıklarını çek
            const habitsRef = collection(db, "users", auth.currentUser.uid, "habits");
            const habitSnap = await getDocs(habitsRef);
            const list = habitSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setHabits(list);
        };
        fetchData();
    }, []);

    const handleUpload = async () => {
        if (!file) return alert("Bir fotoğraf seç!");
        const url = await uploadToCloudinary(file);
        if (!url) return;
        await updateDoc(doc(db, "users", auth.currentUser.uid), { profilePhoto: url });
        setUserData({ ...userData, profilePhoto: url });
        alert("Profil fotoğrafı güncellendi!");
    };

    const toggleDarkMode = async () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.body.classList.toggle("dark-mode", newMode);
        setTheme(newMode ? "dark" : "light");

        const userRef = doc(db, "users", auth.currentUser.uid);

        // 🔹 Doküman yoksa bile oluşturup sadece 'theme' alanını günceller
        await setDoc(
            userRef,
            { theme: newMode ? "dark" : "light" },
            { merge: true }
        );
    };


    const toggleNotifications = async () => {
        const newVal = !notifications;
        setNotifications(newVal);

        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
            userRef,
            { notifications: newVal },
            { merge: true }
        );
    };


    const logout = async () => {
        await auth.signOut();
        window.location.href = "/login";
    };

    // 🔴 Alışkanlık silme işlemi
    const handleDeleteHabit = async (id, title) => {
        const confirmDelete = window.confirm(`"${title}" adlı alışkanlığı silmek istediğine emin misin?`);
        if (!confirmDelete) return;

        await deleteDoc(doc(db, "users", auth.currentUser.uid, "habits", id));
        setHabits(habits.filter((h) => h.id !== id));
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                {/* 🔙 Modern, daire içinde geri butonu */}
                <button className="back-btn" onClick={() => navigate("/")} aria-label="Geri">
                    <span className="triangle-left" />
                </button>

                <div className="profile-avatar">
                    <img
                        src={
                            userData.profilePhoto ||
                            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                        }
                        alt="Profil"
                    />
                </div>
                <h2>Profilim</h2>
                <p>{auth.currentUser?.email}</p>

                <div className="upload-section">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <button onClick={handleUpload}>Fotoğrafı Güncelle</button>
                </div>
            </div>

            {/* ⚙️ Ayarlar */}
            <div className="settings-section">
                <div className="setting-item">
                    <span>🌙 Karanlık Tema</span>
                    <label className="switch">
                        <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
                        <span className="slider round"></span>
                    </label>
                </div>


            </div>

            {/* 🗂️ Alışkanlık Silme Paneli */}
            <div className="habit-delete-section">
                <h3>🗂️ Alışkanlıklarım</h3>
                {habits.length === 0 ? (
                    <p className="no-habits">Henüz bir alışkanlık eklemedin.</p>
                ) : (
                    <ul className="habit-list">
                        {habits.map((habit) => (
                            <li key={habit.id}>
                                <span>{habit.title}</span>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteHabit(habit.id, habit.title)}
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button className="logout-btn" onClick={logout}>
                Çıkış Yap
            </button>
        </div>
    );
}
