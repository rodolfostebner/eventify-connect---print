import { useEffect, useState } from "react";
import { fetchPosts, subscribeToPosts } from "../services/posts";
import type { PhotoData } from "../types";

export function usePosts(eventId: string) {
    const [posts, setPosts] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadPosts() {
        try {
            const data = await fetchPosts(eventId);
            setPosts(data);
        } catch (error) {
            console.error("[usePosts] Error loading posts:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!eventId) return;

        loadPosts();

        const unsubscribe = subscribeToPosts(eventId, () => {
            // 🔥 solução segura: sempre refetch completo
            loadPosts();
        });

        return () => {
            unsubscribe();
        };
    }, [eventId]);

    return {
        posts,
        loading,
        refresh: loadPosts,
    };
}