import { supabase } from "../lib/supabase/client"

export async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    try {
        // 1. Solicita a Pre-Signed URL para a Edge Function do Supabase
        const { data, error } = await supabase.functions.invoke('get-r2-upload-url', {
            body: { 
                fileName, 
                contentType: file.type || 'image/jpeg' 
            }
        });

        if (error || !data?.url) {
            console.error("Erro ao solicitar URL do R2:", error || data);
            throw new Error(error?.message || "Falha ao gerar link de upload.");
        }

        const { url: uploadUrl } = data;

        // 2. Faz o upload direto do navegador para o Cloudflare R2
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type || 'image/jpeg',
            },
        });

        if (!uploadResponse.ok) {
            console.error("Erro no upload direto para R2:", uploadResponse.statusText);
            throw new Error(`Falha no upload para o Storage: ${uploadResponse.statusText}`);
        }

        // 3. Monta a URL pública
        let finalUrl = data.publicUrl;
        
        if (!finalUrl) {
            // Fallback: se a edge function não retornar publicUrl, tenta montar no cliente
            // Usa a variável de ambiente se existir, senão usa a URL conhecida do projeto Koalas
            const fallbackBase = "https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev";
            const publicUrlBase = import.meta.env.VITE_R2_PUBLIC_URL || data.publicUrlBase || fallbackBase;
            
            const cleanBase = publicUrlBase.replace(/\/$/, '');
            finalUrl = `${cleanBase}/${fileName}`;
        }

        return finalUrl;

    } catch (err) {
        console.error("Erro geral no uploadImage:", err);
        throw err;
    }
}