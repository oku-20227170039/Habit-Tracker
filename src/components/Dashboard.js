import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    getDocs,
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";

import HabitCard from "./HabitCard";
import BadgeList from "./BadgeList";
import "../styles/DashboardNew.css";
import { useAuth } from "../context/AuthContext";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
    const { theme, setTheme } = useAuth();
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState("");
    const [totalXp, setTotalXp] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [newBadge, setNewBadge] = useState(null); // 🎉 yeni state

    // 🔹 TEST için tarih override (istersen değiştir)
    const FORCE_DATE = null; // Örn: "2030-01-01"
    const today = FORCE_DATE || new Date().toISOString().split("T")[0];

    // 🔁 Yeni güne geçilmişse completedToday'leri sıfırla
    const resetHabitsIfNewDay = async (habitList) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
            const updates = habitList
                .map((h) => {
                    // Sadece bugün tamamlanmış görünenlere bakalım
                    if (!h.completedToday) return null;

                    // Eski alışkanlıklarda lastCompletedDate olmayabilir,
                    // onları bozmayalım, sadece alanı olanları kontrol edelim
                    if (!h.lastCompletedDate) return null;

                    // Eğer kayıtlı tarih bugünden farklıysa sıfırla
                    if (h.lastCompletedDate !== today) {
                        const hRef = doc(db, "users", uid, "habits", h.id);
                        return updateDoc(hRef, { completedToday: false });
                    }

                    return null;
                })
                .filter(Boolean);

            if (updates.length > 0) {
                await Promise.all(updates);
            }
        } catch (err) {
            console.error("Günlük sıfırlama hatası:", err);
        }
    };


    // 🌙 Tema geçişi
    useEffect(() => {
        document.body.classList.toggle("dark-mode", theme === "dark");
    }, [theme]);

    // 🔹 Kullanıcı profil fotoğrafını çek
    useEffect(() => {
        const fetchProfilePhoto = async () => {
            const userRef = doc(db, "users", auth.currentUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data().profilePhoto) {
                setProfilePhoto(snap.data().profilePhoto);
            }
        };
        fetchProfilePhoto();
    }, []);

    // 🔹 Alışkanlıkları dinle
    useEffect(() => {
        const ref = collection(db, "users", auth.currentUser.uid, "habits");
        const unsub = onSnapshot(ref, async (snapshot) => {
            const list = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));

            // 🕒 Yeni güne geçilmişse completedToday'leri sıfırla
            await resetHabitsIfNewDay(list);

            // State'i güncelle
            setHabits(list);
            const total = list.reduce((sum, item) => sum + (item.xp || 0), 0);
            setTotalXp(total);
        });
        return unsub;
    }, []);


    // 📊 Haftalık XP istatistikleri
    useEffect(() => {
        const fetchStats = async () => {
            const statsRef = collection(db, "users", auth.currentUser.uid, "stats");
            const snapshot = await getDocs(statsRef);
            const data = {};
            snapshot.forEach((doc) => (data[doc.id] = doc.data().xp || 0));

            const days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().split("T")[0];
                const labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
                const dayLabel = labels[d.getDay() === 0 ? 6 : d.getDay() - 1];
                return { day: dayLabel, xp: data[key] || 0 };
            });
            setWeeklyData(days);
        };
        fetchStats();
    }, [habits]);

    // ➕ Yeni alışkanlık ekle
    const addHabit = async () => {
        if (!newHabit.trim()) return;
        await addDoc(collection(db, "users", auth.currentUser.uid, "habits"), {
            title: newHabit,
            completedToday: false,
            streak: 0,
            xp: 0,
        });
        setNewHabit("");
    };

    // 🌙 Tema değiştirici
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.body.classList.toggle("dark-mode", newTheme === "dark");
    };

    // 🚪 Çıkış
    const handleLogout = async () => {
        await auth.signOut();
        window.location.href = "/login";
    };

    // 🎉 Yeni rozet kazanınca çalışacak
    const handleBadgeEarned = (badge) => {
        setNewBadge(badge);
    };

    const level = Math.floor(totalXp / 200);
    const streak = Math.max(...habits.map((h) => h.streak || 0), 0);

    return (
        <div className="dashboard-page">
            {/* 🔝 Üst Bar */}
            <header className="top-bar">
                <div
                    className="profile-circle clickable"
                    onClick={() => (window.location.href = "/profile")}
                    title="Profil"
                >
                    {profilePhoto ? (
                        <img src={profilePhoto} alt="Profil" className="profile-img" />
                    ) : (
                        "H"
                    )}
                </div>

                <div className="top-right-buttons">


                    <button className="logout-icon-btn" onClick={handleLogout} title="Çıkış Yap">
                        <div className="logout-icon"></div>
                    </button>
                </div>
            </header>

            {/* XP ve Streak */}
            <div className="level-info">
                <p className="level-text">Seviye {level}</p>
                <p className="streak-text">Streak {streak} gün</p>
            </div>

            <div className="xp-bar">
                <div className="xp-progress" style={{ width: `${(totalXp % 200) / 2}%` }}></div>
            </div>
            <p className="xp-value">
                {totalXp} / {200 * (level + 1)} Puan
            </p>

            {/* Alışkanlıklar */}
            <section className="habits-section">
                <h3>Alışkanlıklarım</h3>
                {habits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} onNewBadge={handleBadgeEarned} />
                ))}

                <div className="add-habit">
                    <input
                        type="text"
                        placeholder="Yeni alışkanlık ekle..."
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                    />
                    <button onClick={addHabit}>Ekle</button>
                </div>
            </section>

            {/* Rozetler */}
            <section className="badges-section">
                <BadgeList />
            </section>

            {/* Haftalık XP Grafiği */}
            <section className="summary-section">
                <h3>Haftalık XP Grafiği</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={theme === "dark" ? "#444" : "#ccc"}
                            />
                            <XAxis dataKey="day" stroke={theme === "dark" ? "#ccc" : "#666"} />
                            <YAxis stroke={theme === "dark" ? "#ccc" : "#666"} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === "dark" ? "#333" : "#fff",
                                    borderRadius: "10px",
                                    border: "1px solid #00bfa6",
                                    color: theme === "dark" ? "#fff" : "#000",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="xp"
                                stroke="#00bfa6"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 🎉 Yeni Rozet Popup */}
            {newBadge && (
                <div className="badge-popup" onClick={() => setNewBadge(null)}>
                    <div className="badge-popup-inner">
                        <h2>🎉 Yeni Rozet Kazandın!</h2>
                        <div className="badge-popup-info">
                            <span className="badge-popup-icon">{newBadge.emoji}</span>
                            <div>
                                <h3>{newBadge.name}</h3>
                                <p>{newBadge.desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
