import { useAuth } from "../hooks/useAuth"
import { createPost } from "../services/posts"
import { uploadImage } from "../services/storageService.ts"

export default function UploadTest() {
    const { user } = useAuth()

    const handleUpload = async (e: any) => {
        const file = e.target.files[0]

        if (!file || !user) return

        // cria URL temporária (browser)
        const imageUrl = await uploadImage(file)

        console.log("ENVIANDO POST...")

        await createPost({
            eventId: "fe2026", // ✅ correto
            url: imageUrl,
            user_name: user.displayName || "Anônimo",
            firebase_uid: user.uid, // ✅ corrigido
            likes: 0,
            reactions: {},
            reacted_users: [],
            comments: [],
            status: "pending",
            is_official: false
        })
        console.log("POST ENVIADO")
    }

    return (
        <div>
            <input type="file" onChange={handleUpload} />
        </div>
    )
}