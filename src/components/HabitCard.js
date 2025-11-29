import React, { useEffect } from "react";

import { db, auth } from "../firebase";
import {
    doc,
    updateDoc,
    increment,
    setDoc,
    getDoc,
    getDocs,
    collection,
} from "firebase/firestore";
import "../styles/HabitCard.css";

export default function HabitCard({ habit, onNewBadge }) {
    // 🔹 İstersen TEST için burayı değiştir
    const FORCE_DATE = null; // Örn: "2030-01-01" yazarsan tüm kartlar için o gün sayılır
    const today = FORCE_DATE || new Date().toISOString().split("T")[0];

    const habitRef = doc(db, "users", auth.currentUser.uid, "habits", habit.id);
    const statsRef = doc(db, "users", auth.currentUser.uid, "stats", today);
    const userRef = doc(db, "users", auth.currentUser.uid);

    // ❗ Tamamlandı bilgisini GÜNE bağlı hesapla
    const isCompletedToday =
        habit.completedToday && habit.lastCompletedDate === today;
    // 🧹 Eğer completedToday = true ama tarihi bugünden eskiyse Firestore'da sıfırla
    useEffect(() => {
        if (
            habit.completedToday &&
            habit.lastCompletedDate &&
            habit.lastCompletedDate !== today
        ) {
            updateDoc(habitRef, { completedToday: false }).catch((err) =>
                console.error("Günlük sıfırlama hatası:", err)
            );
        }
    }, [habit.completedToday, habit.lastCompletedDate, today]);

    // 🔹 Rozetleri kontrol et ve yenisi varsa bildir
    const checkAndAssignBadges = async () => {
        const userSnap = await getDoc(userRef);
        const habitsRef = collection(db, "users", auth.currentUser.uid, "habits");
        const allHabits = await getDocs(habitsRef);

        const habits = allHabits.docs.map((doc) => doc.data());
        const totalXp = habits.reduce((sum, h) => sum + (h.xp || 0), 0);
        const streak = Math.max(...habits.map((h) => h.streak || 0), 0);
        const habitsCount = habits.length;

        if (!userSnap.exists()) return;
        const data = userSnap.data();
        const badges = data.badges || [];
        const newBadges = [...badges];

        const badgeDetails = [
            ["🌱", "Yeni Başlangıç", "İlk alışkanlığını oluşturdun!"],
            ["💪", "Kararlı", "3 gün üst üste tamamladın."],
            ["🔥", "Azimli", "7 gün aralıksız devam ettin!"],
            ["🌙", "Devamlı", "30 gün boyunca bırakmadın!"],
            ["🏆", "Efsane", "100 gün istikrarla ilerledin!"],
            ["⚡", "Hızlı Başlangıç", "200 XP kazandın!"],
            ["💎", "Usta", "1000 XP seviyesine ulaştın!"],
            ["🧠", "Bilge", "5000 XP’ye ulaştın!"],
            ["🪶", "Düzenli", "5 farklı alışkanlık oluşturdun!"],
            ["🌈", "Çeşitlilik Ustası", "10 farklı alışkanlık oluşturdun!"],
            ["💫", "Günlük Şampiyon", "Bugün tüm alışkanlıklarını tamamladın!"],
        ];

        let newlyEarned = null;

        for (const [emoji, name, desc] of badgeDetails) {
            let condition = false;
            if (emoji === "🌱" && habitsCount >= 1) condition = true;
            if (emoji === "💪" && streak >= 3) condition = true;
            if (emoji === "🔥" && streak >= 7) condition = true;
            if (emoji === "🌙" && streak >= 30) condition = true;
            if (emoji === "🏆" && streak >= 100) condition = true;
            if (emoji === "⚡" && totalXp >= 200) condition = true;
            if (emoji === "💎" && totalXp >= 1000) condition = true;
            if (emoji === "🧠" && totalXp >= 5000) condition = true;
            if (emoji === "🪶" && habitsCount >= 5) condition = true;
            if (emoji === "🌈" && habitsCount >= 10) condition = true;
            if (emoji === "💫" && habits.every((h) => h.completedToday)) condition = true;

            if (condition && !badges.includes(emoji)) {
                newBadges.push(emoji);
                newlyEarned = { emoji, name, desc };
            }
        }

        if (newBadges.length !== badges.length) {
            await updateDoc(userRef, { badges: newBadges });
            if (newlyEarned && onNewBadge) onNewBadge(newlyEarned);
        }
    };

    const handleComplete = async () => {
        // Bugün için zaten tamamlanmışsa bir daha XP yazma
        if (isCompletedToday) return;

        await updateDoc(habitRef, {
            completedToday: true,
            xp: increment(50),
            streak: (habit.streak || 0) + 1,
            lastCompletedDate: today, // 🔹 tamamlandığı günü kaydet
        });

        await setDoc(statsRef, { xp: increment(50) }, { merge: true });
        await checkAndAssignBadges();
    };

    const handleUndo = async () => {
        // Bugün tamamlanmış değilse geri alma mantıksız
        if (!isCompletedToday) return;

        await updateDoc(habitRef, {
            completedToday: false,
            xp: Math.max(0, (habit.xp || 0) - 50),
            streak: Math.max(0, (habit.streak || 1) - 1),
        });

        await setDoc(statsRef, { xp: increment(-50) }, { merge: true });
    };


    return (
        <div className={`habit-card ${isCompletedToday ? "completed" : ""}`}>
            <div className="habit-info">
                <h4>{habit.title}</h4>
                <p>{habit.xp || 0} XP</p>
            </div>

            <div className="habit-actions">
                {!isCompletedToday ? (
                    <button className="complete-btn" onClick={handleComplete}>
                        Tamamla
                    </button>
                ) : (
                    <button className="undo-btn" onClick={handleUndo}>
                        ↩️ İptal Et
                    </button>
                )}
            </div>
        </div>
    );

}
