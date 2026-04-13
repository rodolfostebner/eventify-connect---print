import { createUserIfNotExists } from "../services/userService"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth"
import { auth, googleProvider } from "../lib/firebase/client"

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u)
            setLoading(false)

            if (u) {
                await createUserIfNotExists(u)
            }
        })

        return () => unsub()
    }, [])

    const login = async () => {
        await signInWithPopup(auth, googleProvider)
    }

    const logout = async () => {
        await signOut(auth)
    }

    return { user, loading, login, logout }
}