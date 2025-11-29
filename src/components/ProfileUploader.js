import React, { useState } from "react";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfileUploader() {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");

    const handleUpload = async () => {
        if (!file) return alert("Dosya seçilmedi!");
        const uploadedUrl = await uploadToCloudinary(file);
        setUrl(uploadedUrl);

        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { profilePhoto: uploadedUrl });
        alert("Profil fotoğrafı yüklendi!");
    };

    return (
        <div style={{ textAlign: "center" }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Yükle</button>
            {url && (
                <img
                    src={url}
                    alt="profil"
                    width="120"
                    style={{ marginTop: "10px", borderRadius: "10px" }}
                />
            )}
        </div>
    );
}
