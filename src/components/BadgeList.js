import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "../styles/BadgeList.css";

export default function BadgeList() {
    const [badges, setBadges] = useState([]);

    // 🎯 Firestore'dan canlı olarak rozetleri dinle
    useEffect(() => {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const unsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setBadges(data.badges || []);
            }
        });
        return unsub;
    }, []);

    // 🎖️ Rozet tanımları (emoji, ad, açıklama)
    const badgeDetails = {
        "🌱": { name: "Yeni Başlangıç", desc: "İlk alışkanlığını oluşturdun!" },
        "💪": { name: "Kararlı", desc: "3 gün üst üste tamamladın." },
        "🔥": { name: "Azimli", desc: "7 gün aralıksız devam ettin!" },
        "🌙": { name: "Devamlı", desc: "30 gün boyunca bırakmadın!" },
        "🏆": { name: "Efsane", desc: "100 gün istikrarla ilerledin!" },
        "⚡": { name: "Hızlı Başlangıç", desc: "200 XP kazandın!" },
        "💎": { name: "Usta", desc: "1000 XP seviyesine ulaştın!" },
        "🧠": { name: "Bilge", desc: "5000 XP’ye ulaştın!" },
        "🪶": { name: "Düzenli", desc: "5 farklı alışkanlık oluşturdun!" },
        "🌈": { name: "Çeşitlilik Ustası", desc: "10 farklı alışkanlık oluşturdun!" },
        "💫": { name: "Günlük Şampiyon", desc: "Bugün tüm alışkanlıklarını tamamladın!" },
    };

    return (
        <div className="badge-list">
            <h3>🏅 Rozetlerim</h3>

            {badges.length === 0 ? (
                <p className="no-badges">Henüz rozetin yok. Hadi bir alışkanlığı 7 gün sürdür!</p>
            ) : (
                <div className="badges-grid">
                    {badges.map((badge, i) => {
                        const info = badgeDetails[badge] || {
                            name: "Bilinmeyen Rozet",
                            desc: "Yeni bir başarı keşfettin!",
                        };

                        return (
                            <div key={i} className="badge-card">
                                <div className="badge-icon">{badge}</div>
                                <div className="badge-text">
                                    <h4>{info.name}</h4>
                                    <p>{info.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
