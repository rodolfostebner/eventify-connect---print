import { supabase } from "../lib/supabase/client"

export async function createUserIfNotExists(user: any) {
    console.log("USER LOGIN:", user)

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", user.uid)

    if (error) {
        console.error("Erro ao buscar usuário:", error)
        return
    }

    if (!data || data.length === 0) {
        console.log("Criando usuário...")

        const { error: insertError } = await supabase.from("users").insert([
            {
                firebase_uid: user.uid,
                email: user.email,
                display_name: user.displayName,
                photo_url: user.photoURL,
            },
        ])

        if (insertError) {
            console.error("Erro ao criar usuário:", insertError)
        } else {
            console.log("Usuário criado com sucesso")
        }
    } else {
        console.log("Usuário já existe")
    }
}