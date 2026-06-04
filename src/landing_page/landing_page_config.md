# Documento de Especificação e Configuração - Landing Page Eventify (Integrada)

Este documento orienta como gerenciar, customizar e configurar a Landing Page Premium integrada ao ecossistema React do aplicativo **Eventify**.

---

## 1. Onde fica a Configuração?

Todas as configurações de textos, links de tutoriais, termos de uso e a **chave Pix** para doações estão localizadas no arquivo TypeScript centralizado:

📌 Path: [src/features/landing/landingConfig.ts](file:///d:/OneDrive%20-%20wizardblumenau.com.br/APP%20PROJECTS/KOALAS/eventify-connect-&-print/eventify-connect---print/src/features/landing/landingConfig.ts)

### Estrutura de Edição:
```typescript
export const landingConfig: LandingConfig = {
  // 1. Quantidade de telas de mockup exibidas no celular da dobra Hero (Tela1.jpeg, Tela2.jpeg, etc.)
  mockupScreensCount: 4,

  // 2. Quantidade de fotos exibidas no feed horizontal (foto1.jpg, foto2.jpg, etc.)
  feedPhotosCount: 4,

  // 3. Comentários associados a cada foto do feed
  comments: {
    "foto1.jpg": "Conexão incrível na feira de tecnologia!",
    "foto2.jpg": "Apresentação escolar de robótica lotada.",
    "foto3.jpg": "Stand B2B de sustentabilidade arrebentando.",
    "foto4.jpg": "Curadoria de fotos sensacional na tela!",
  },

  // 4. Links externos (vídeos de tutoriais, termos e chave Pix)
  links: {
    tutoriais: {
      expositor: "https://www.youtube.com/watch?v=exemplo_expositor",
      administrador: "https://www.youtube.com/watch?v=exemplo_admin",
      geral: "https://www.youtube.com/watch?v=exemplo_geral",
    },
    termoDeUso: "https://seudominio.com/termos-de-uso",
    pixKey: "suachavepix@dominio.com", // ☕ Altere aqui a chave Pix de recebimento de café!
  },
};
```

---

## 2. Onde ficam as Imagens (Assets)?

Todas as imagens da landing page integrada ficam na pasta `/public/landing/`. Desta forma, o Vite as serve estaticamente de forma otimizada:

📌 Path: `public/landing/`

### Como substituir as imagens:
- **Logos do Koala:** Substitua os arquivos `Logo0.png` (light mode) e `Logo5.png` (dark mode) na raiz da pasta `public/landing/`.
- **Telas do Celular (Mockup):** Substitua os arquivos na pasta `public/landing/telas/` com os nomes `Tela1.jpeg`, `Tela2.jpeg`, `Tela3.jpeg`, etc. Se adicionar mais telas, lembre-se de atualizar o `mockupScreensCount` em `landingConfig.ts`.
- **Fotos do Feed Gallery:** Substitua os arquivos na pasta `public/landing/feed/` com os nomes `foto1.jpg`, `foto2.jpg`, `foto3.jpg`, etc. Se alterar a quantidade, lembre-se de atualizar o `feedPhotosCount` em `landingConfig.ts`.
- **Fundo do Modal de Login:** Caso queira alterar os backgrounds do login glassmorphic, atualize os arquivos:
  - `public/landing/telas/login-bg-desktop.jpg` (Light Desktop)
  - `public/landing/telas/login-bg-mobile.jpg` (Light Mobile)
  - `public/landing/telas/login-bg-desktop-dark.jpg` (Dark Desktop)
  - `public/landing/telas/login-bg-mobile-dark.jpg` (Dark Mobile)
