import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState("light");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const ref = doc(db, "users", currentUser.uid);
                    const snap = await getDoc(ref);
                    if (snap.exists()) {
                        const data = snap.data();
                        const userTheme = data.theme || "light";
                        setTheme(userTheme);
                        document.body.classList.toggle("dark-mode", userTheme === "dark");
                    }
                } catch (err) {
                    console.error("Kullanıcı verisi alınamadı:", err);
                }
            } else {
                document.body.classList.remove("dark-mode");
                setTheme("light");
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, theme, setTheme, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
