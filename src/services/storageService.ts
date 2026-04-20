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

        // 3. Monta a URL pública (usando a var de ambiente do Vite se disponível, ou o publicUrl retornado pela edge function)
        const publicUrlBase = import.meta.env.VITE_R2_PUBLIC_URL || data.publicUrlBase;
        
        if (!publicUrlBase) {
            console.warn("VITE_R2_PUBLIC_URL não está configurada no .env. Imagens podem não carregar corretamente.");
        }

        // Formata a url garantindo que não há barras duplas ou falta de barras
        const cleanBase = publicUrlBase ? publicUrlBase.replace(/\/$/, '') : '';
        const finalUrl = `${cleanBase}/${fileName}`;

        return finalUrl;

    } catch (err) {
        console.error("Erro geral no uploadImage:", err);
        throw err;
    }
}