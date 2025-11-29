import React, { useEffect, useState } from "react";
import "../styles/XpBar.css";

export default function XpBar({ xp }) {
    const [level, setLevel] = useState(0);
    const [progress, setProgress] = useState(0);
    const [glow, setGlow] = useState(false);

    useEffect(() => {
        const newLevel = Math.floor(xp / 100);
        const newProgress = xp % 100;

        // Seviye artınca kısa süreli ışıldama
        if (newLevel > level) {
            setGlow(true);
            setTimeout(() => setGlow(false), 3000);
        }

        setLevel(newLevel);
        setProgress(newProgress);
    }, [xp]);

    return (
        <div className="xp-container">
            <p className={glow ? "level-up" : ""}>
                <strong>Seviye:</strong> {level} &nbsp;|&nbsp; <strong>XP:</strong> {xp}
            </p>

            <div className="xp-bar">
                <div
                    className={`xp-fill ${glow ? "glow" : ""}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}
