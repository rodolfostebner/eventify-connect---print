// Download forçado de imagem hospedada no R2 (outro domínio).
// O atributo <a download> é ignorado em links cross-origin, então buscamos a
// imagem como blob e baixamos via URL local, com nome de arquivo amigável.
// Se o fetch falhar (ex: CORS bloqueado), abre em nova aba como fallback —
// lá o "salvar como" do navegador funciona normalmente.
export async function downloadImage(url: string, baseName: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();

    // Extensão a partir do content-type real (image/jpeg -> jpg, image/svg+xml -> svg)
    const ext = (blob.type.split('/')[1] || 'jpg').split('+')[0].replace('jpeg', 'jpg');

    // Nome do arquivo sem acentos/caracteres especiais
    const slug = baseName
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'imagem';

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${slug}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}
