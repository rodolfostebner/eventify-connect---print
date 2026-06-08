/**
 * landingConfig.ts
 *
 * Configuração centralizada da Landing Page do Eventify-MemoriesHub.
 * Equivalente tipado do antigo feed/config.js — todas as customizações
 * (imagens, textos, links, chave Pix) ficam aqui.
 *
 * Para alterar qualquer conteúdo da landing page, edite apenas este arquivo.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface LandingConfig {
  /** Quantidade de telas de mockup do celular na pasta public/landing/telas/ (Tela1.jpeg, Tela2.jpeg, etc.) */
  mockupScreensCount: number;

  /** Quantidade de fotos no carrossel de feed na pasta public/landing/feed/ (foto1.jpg, foto2.jpg, etc.) */
  feedPhotosCount: number;

  /** Logos dos patrocinadores na pasta public/landing/telas/ (Patrocinador1.png, Patrocinador2.jpg, etc.) */
  sponsors: string[];

  /** Legendas associadas a cada foto do carrossel. Chave = nome do arquivo (ex: "foto1.jpg") */
  comments: Record<string, string>;

  /** Links configuráveis de tutoriais, termos de uso, privacidade e chave Pix */
  links: {
    tutoriais: {
      expositor: string;
      administrador: string;
      geral: string;
    };
    termoDeUso: string;
    /** Política de Privacidade (HTML estático em public/privacy/) */
    privacidade: string;
    /** Chave Pix para doação (E-mail, CPF, celular ou aleatória) */
    pixKey: string;
  };
}

// ─── Configuração ativa ───────────────────────────────────────────────────────

export const landingConfig: LandingConfig = {
  // 1. TELAS DO MOCKUP DO CELULAR
  // Quantidade de imagens na pasta public/landing/telas/ (Tela1.jpeg, Tela2.jpeg, etc.)
  // Limite sugerido: até 10 telas.
  mockupScreensCount: 7,

  // 2. FOTOS E COMENTÁRIOS DO FEED (Carrossel infinito)
  // Quantidade de fotos na pasta public/landing/feed/ (foto1.jpg, foto2.jpg, etc.)
  // Limite sugerido: até 10 fotos.
  feedPhotosCount: 4,

  // 2.5 LOGOS DOS PATROCINADORES (Carrossel de patrocinadores)
  sponsors: [
    "Patrocinador1.png",
    "Patrocinador2.jpg",
    "Patrocinador3.png"
  ],

  // Legendas que aparecem abaixo de cada foto no carrossel:
  comments: {
    "foto1.jpg": "Conexão incrível na feira de tecnologia!",
    "foto2.jpg": "Apresentação escolar de robótica lotada.",
    "foto3.jpg": "Stand B2B de sustentabilidade arrebentando.",
    "foto4.jpg": "Curadoria de fotos sensacional na tela!",
    "foto5.jpg": "Momento interativo com a TV Wall.",
    "foto6.jpg": "Premiação dos melhores stands da feira.",
    "foto7.jpg": "Jurados avaliando as apresentações phygital.",
    "foto8.jpg": "Sorteio automático ao vivo para os participantes.",
    "foto9.jpg": "Público engajado compartilhando fotos.",
    "foto10.jpg": "Encerramento do evento com chave de ouro!",
  },

  // 3. HIPERLINKS CONFIGURÁVEIS
  links: {
    tutoriais: {
      expositor: "https://www.youtube.com/watch?v=exemplo_expositor",
      administrador: "https://www.youtube.com/watch?v=exemplo_admin",
      geral: "https://www.youtube.com/watch?v=exemplo_geral",
    },
    termoDeUso: "/privacy/termos",
    privacidade: "/privacy",
    // Insira sua chave Pix aqui (E-mail, CPF, celular ou aleatória)
    pixKey: "memorieshub@googlegroups.com",
  },
};
