export const uploadToCloudinary = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "habit-tracker"); // 🔹 preset adın

        const res = await fetch("https://api.cloudinary.com/v1_1/dvgiazvxa/image/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Cloudinary hatası: ${text}`);
        }

        const data = await res.json();
        console.log("Yükleme başarılı:", data);
        return data.secure_url;
    } catch (err) {
        console.error("Cloudinary upload hatası:", err);
        alert("Yükleme başarısız: " + err.message);
        return null;
    }
};
