
export const DATABASE_MOCK = {
  events: [
    {
      id: "evt_2026_wedding",
      name: "Casamento João e Maria",
      slug: "casamento-joao-maria",
      status: "live",
      date: "2026-04-05T18:00:00.000Z",
      primary_color: "#000000",
      secondary_color: "#ffffff",
      bg_type: "gradient",
      bg_value: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      comment_moderation_enabled: true,
      has_official_photos: false,
      exhibitors: [
        { 
          id: "exh_1",
          name: "Buffet Alpha", 
          bio: "Gastronomia fina", 
          photo: "https://picsum.photos/seed/buffet/200",
          whatsapp: "5511999999999",
          insta: "@buffetalpha"
        }
      ],
      sponsors: [],
      services: [],
      upload_source: "both",
      interactions_paused: false,
      tv_show_ranking: true
    }
  ],
  photos: [
    {
      id: "photo_98765",
      eventId: "evt_2026_wedding",
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
      user_name: "Rodolfo Stebner",
      user_id: "user_abc123",
      likes: 12,
      reactions: { "❤️": 8, "🔥": 4 },
      reacted_users: ["user_abc123"],
      comments: [
        { 
          id: "c1", 
          user: "Maria", 
          uid: "user_xyz", 
          text: "Que foto linda!", 
          status: "approved", 
          timestamp: "2026-04-05T21:00:00Z" 
        }
      ],
      status: "approved",
      is_official: false,
      timestamp: "2026-04-05T21:05:00Z"
    }
  ],
  print_orders: [
    {
      id: "order_5544",
      eventId: "evt_2026_wedding",
      userId: "user_abc123",
      userName: "Rodolfo Stebner",
      option: "photos_album_stickers",
      photoIds: ["photo_98765"],
      status: "pending",
      createdAt: "2026-04-05T21:10:00Z"
    }
  ],
  notifications: [
    {
      id: "notif_1122",
      userId: "user_abc123",
      title: "Foto Aprovada!",
      body: "Sua foto já está disponível na galeria do evento.",
      read: false,
      link: "/evento/casamento-joao-maria",
      timestamp: "2026-04-05T21:06:00Z"
    }
  ],
  users: [
    {
      id: "user_abc123",
      email: "rodolfostebner@gmail.com",
      displayName: "Rodolfo Stebner",
      role: "admin",
      photoURL: "https://ui-avatars.com/api/?name=Rodolfo+Stebner&background=random"
    }
  ]
};
