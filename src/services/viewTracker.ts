import { supabase } from '../lib/supabase/client';

interface BufferedView {
  post_id: string;
  user_id: string;
}

class ViewTracker {
  private sessionViewedPhotos = new Set<string>();
  private viewBuffer: BufferedView[] = [];
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    // Inicializa o temporizador recorrente de 5 segundos
    if (typeof window !== 'undefined') {
      this.timer = setInterval(() => {
        void this.flushBuffer();
      }, 5000);
    }
  }

  /**
   * Registra a visualização de uma foto por ações explícitas do participante.
   * Filtra visualizações duplicadas na mesma sessão.
   */
  public trackView(postId: string, userId: string | undefined): void {
    if (!postId || !userId || !supabase) return;

    // Chave única para controle de sessão em memória
    const sessionKey = `${userId}_${postId}`;
    if (this.sessionViewedPhotos.has(sessionKey)) {
      return; // Já contabilizado nesta sessão
    }

    // Adiciona ao registro de sessão
    this.sessionViewedPhotos.add(sessionKey);

    // Adiciona ao buffer local para envio em lote
    this.viewBuffer.push({ post_id: postId, user_id: userId });

    console.log(`[ViewTracker] View registrada para a foto ${postId}. Buffer acumulado: ${this.viewBuffer.length}/5`);

    // Dispara imediatamente se atingir o lote de 5 visualizações
    if (this.viewBuffer.length >= 5) {
      void this.flushBuffer();
    }
  }

  /**
   * Transmite as visualizações acumuladas em lote (batch) para o banco de dados.
   */
  public async flushBuffer(): Promise<void> {
    if (!supabase || this.viewBuffer.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    
    // Captura o lote atual e limpa o buffer
    const batchToFlush = [...this.viewBuffer];
    this.viewBuffer = [];

    console.log(`[ViewTracker] Enviando lote de ${batchToFlush.length} visualizações para o Supabase...`);

    try {
      const { error } = await supabase
        .from('photo_views')
        .upsert(batchToFlush, { onConflict: 'post_id,user_id' });

      if (error) {
        console.error('[ViewTracker] Erro ao enviar visualizações em lote:', error);
        // Em caso de erro na rede/banco, reacumulamos os itens para a próxima tentativa
        this.viewBuffer = [...batchToFlush, ...this.viewBuffer];
      } else {
        console.log(`[ViewTracker] Lote de ${batchToFlush.length} visualizações gravado com sucesso.`);
      }
    } catch (err) {
      console.error('[ViewTracker] Exceção inesperada ao sincronizar visualizações:', err);
      // Reacumula em caso de falha catastrófica
      this.viewBuffer = [...batchToFlush, ...this.viewBuffer];
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Remove o temporizador (usado principalmente no hot reload ou encerramento)
   */
  public destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// Exporta como instância única (Singleton)
export const viewTracker = new ViewTracker();
window.addEventListener('beforeunload', () => {
  void viewTracker.flushBuffer();
});
