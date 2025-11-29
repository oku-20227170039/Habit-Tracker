import React, { useState } from "react";
import { useNavigate } from "react-router-dom";   // 🔹 ekle
import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import "../styles/Login.css";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();   // 🔹 ekle

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                // 🔐 Giriş
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // 🆕 Kayıt
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
                const user = userCredential.user;

                // 🔹 Firestore'da users/{uid} dokümanı oluştur
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    theme: "light",
                    notifications: false,
                    badges: [],
                    profilePhoto: null,
                    createdAt: new Date().toISOString(),
                });
            }

            navigate("/"); // ✅ Giriş / kayıt başarılıysa Dashboard'a git
        } catch (err) {
            alert("Hata: " + err.message);
        }
    };


    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">H</div>
                <h2>Hoş Geldin!</h2>
                <p>Alışkanlıklarını takip etmeye başla</p>

                <form onSubmit={handleSubmit}>
                    <label>E-posta</label>
                    <input
                        type="email"
                        placeholder="ornek@mail.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label>Şifre</label>
                    <input
                        type="password"
                        placeholder="********"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="login-options">
                        <label>
                            <input type="checkbox" /> Beni hatırla
                        </label>
                        <a href="/">Şifremi unuttum</a>
                    </div>

                    <button type="submit" className="login-btn">
                        {isLogin ? "Giriş Yap" : "Kayıt Ol"}
                    </button>
                </form>

                <p className="toggle-auth">
                    {isLogin ? (
                        <>
                            Hesabın yok mu?{" "}
                            <span onClick={() => setIsLogin(false)}>Kayıt Ol</span>
                        </>
                    ) : (
                        <>
                            Hesabın var mı?{" "}
                            <span onClick={() => setIsLogin(true)}>Giriş Yap</span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
