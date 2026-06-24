// Baixa várias imagens do R2 e entrega um único arquivo .zip no navegador.
//
// Estratégia: as fotos são públicas no R2 e já estão em resolução reduzida, então
// montamos o ZIP no cliente (sem servidor). Buscamos cada imagem como blob com
// concorrência limitada (não martelar o R2 nem estourar memória), adicionamos ao
// ZIP sem recompressão — JPEG já é comprimido, DEFLATE só gastaria CPU — e geramos
// um Blob para download. Imagens que falharem (CORS/404) são puladas e reportadas;
// o ZIP é gerado com o que deu certo.
//
// O JSZip entra por import dinâmico (igual ao jspdf na aba Relatórios) para não
// pesar no bundle de quem não usa o download.

export interface ZipItem {
  url: string;
  /** Nome base do arquivo dentro do ZIP, sem extensão (a extensão vem do blob). */
  name: string;
}

export interface ZipProgress {
  /** Quantos itens já foram processados (sucesso ou falha). */
  done: number;
  /** Total de itens. */
  total: number;
  /** Fase atual: baixando imagens ou compactando o arquivo final. */
  phase: 'fetching' | 'zipping';
}

export interface ZipResult {
  /** Quantas imagens entraram no ZIP. */
  added: number;
  /** Quantas falharam (CORS, 404, etc.). */
  failed: number;
}

// Sanitiza para um nome de arquivo seguro (sem acentos/caracteres especiais).
function safeName(base: string): string {
  return (
    base
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'imagem'
  );
}

// Extensão a partir do content-type da resposta (image/jpeg -> jpg, image/svg+xml -> svg).
function extFromContentType(contentType: string | null): string {
  return ((contentType || '').split(';')[0].split('/')[1] || 'jpg').split('+')[0].replace('jpeg', 'jpg');
}

/**
 * Gera e dispara o download de um ZIP com as imagens informadas.
 *
 * @param items     lista de { url, name }
 * @param zipName   nome do arquivo .zip (com ou sem extensão)
 * @param onProgress callback opcional de progresso
 * @param concurrency número de downloads simultâneos (default 6)
 */
export async function downloadImagesAsZip(
  items: ZipItem[],
  zipName: string,
  onProgress?: (p: ZipProgress) => void,
  concurrency = 6,
): Promise<ZipResult> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  const total = items.length;
  let done = 0;
  let added = 0;
  let failed = 0;
  const usedNames = new Set<string>();

  // Garante nome único dentro do ZIP (evita sobrescrita silenciosa em nomes iguais).
  const uniqueName = (base: string, ext: string): string => {
    let candidate = `${base}.${ext}`;
    let i = 2;
    while (usedNames.has(candidate)) candidate = `${base}-${i++}.${ext}`;
    usedNames.add(candidate);
    return candidate;
  };

  // Pool de concorrência: índice compartilhado consumido por N workers.
  let cursor = 0;
  const worker = async () => {
    while (cursor < total) {
      const i = cursor++;
      const { url, name } = items[i];
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // ArrayBuffer (não Blob): o JSZip lê ArrayBuffer de forma universal; com
        // Blob ele pode gerar entradas vazias em alguns runtimes ("zip vazio").
        const buf = await res.arrayBuffer();
        zip.file(uniqueName(safeName(name), extFromContentType(res.headers.get('content-type'))), buf);
        added++;
      } catch {
        failed++;
      } finally {
        done++;
        onProgress?.({ done, total, phase: 'fetching' });
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, worker));

  onProgress?.({ done, total, phase: 'zipping' });

  // STORE = sem recompressão (JPEG já é comprimido); mais rápido e leve.
  const out = await zip.generateAsync({ type: 'blob', compression: 'STORE' });

  const finalName = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(out);
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);

  return { added, failed };
}
