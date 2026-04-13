import { supabase } from "../lib/supabase/client"

export async function uploadImage(file: File) {
    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
        .from("photos")
        .upload(fileName, file)

    if (error) {
        console.error("Erro no upload:", error)
        throw error
    }

    const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName)

    return publicUrlData.publicUrl
}