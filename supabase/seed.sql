SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict TrliI5lvqJIXOyVz1AHqs8x5SlWHVgWahzefWlKyC9g89Gb9VDKWC1dOYHMx9Vy

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("id", "name", "slug", "status", "date", "logo_url", "primary_color", "secondary_color", "bg_type", "bg_value", "bg_gradient_from", "bg_gradient_to", "bg_pattern_bg", "bg_pattern_fg", "tv_bg_type", "tv_bg_value", "tv_bg_gradient_from", "tv_bg_gradient_to", "tv_bg_pattern_bg", "tv_bg_pattern_fg", "tv_primary_color", "tv_secondary_color", "tv_show_ranking", "owner_text", "owner_photo", "post_event_message", "summary_file_url", "app_description", "app_whatsapp", "app_instagram", "app_website", "app_logo", "comment_moderation_enabled", "has_official_photos", "upload_source", "interactions_paused", "countdown_active", "services", "custom_comments", "created_at", "updated_at", "admin_emails", "public_evaluation_weight", "juror_evaluation_weight", "exhibitors_estimation", "active_announcement_id", "announcement_trigger_at", "custom_sounds", "active", "tv_raffle_prize_id", "tv_raffle_state") VALUES
	('abfc6b20-0f01-46e7-9a69-997e880314fc', 'Feira de Ciências', 'feira-ciencias2026', 'pre', '2026-05-24 00:46:08.91+00', NULL, '#000000', '#ffffff', 'color', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, false, 'both', false, true, '[]', '[]', '2026-05-24 00:46:08.91687+00', '2026-05-24 00:46:08.91687+00', NULL, 0.40, 0.60, 0, NULL, NULL, '[]', false, NULL, NULL),
	('aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Feira de Empreendedorismo 2026', 'fe2026', 'pre', '2026-06-13 10:00:00+00', 'https://colegiojourney.com.br/wp-content/uploads/2024/07/logo-colegio-journey-colegio-particular-cristao-em-curitiba-768x176.png', '#7ecfc1', '#e7eb7c', 'pattern', 'circuit', '#0066ff', '#8f8f8f', '#9c84cf', '#cac768', 'gradient', 'diagonal', '#0a0a0a', '#ffffff', '#66e5c5', '#eceaa7', '#88ddc4', '#191a1a', false, 'Somos uma instituição de ensino que oferece educação acadêmica baseada em princípios bíblicos, que leva os educandos a refletir sobre sua identidade e a importância da intencionalidade de seu papel na comunidade.', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780579416295-pgcy7i6.png', 'Nosso sincero agradecimento a todos os pais, alunos e amigos que mais uma vez fizeram desse evento um sucesso!
Deus abençoe a todos.
', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1777113715468-gqooi4m.pdf', 'Eventify APP', '04789231353', '@cibellestebner', '', '', true, true, 'camera', false, true, '[{"id": "hmfuijx45", "bio": "Aqui o serviço do espaço!", "logo": "https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1777118262250-ecjt3z3.png", "name": "Conserto de Micro Condensadores Lunares", "photo": "https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1777118268031-sjv4yin.jfif", "message": "Valeus gurizada! ", "socials": {"website": "https://www.google.com/?gws_rd=ssl", "whatsapp": "047989231353", "instagram": "@rodolfostebner"}}]', '["Top!", "Incrível!", "Uau!"]', '2026-04-08 05:10:07.762526+00', '2026-04-08 05:10:07.762526+00', '{rodolfostebner@gmail.com,annestebner1@gmail.com}', 0.40, 0.60, 30, NULL, NULL, '[{"id": "sound-1779510128239", "url": "https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1779510126031-by5q075.mp3", "name": "introapp"}]', true, NULL, NULL);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: exhibitor_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."exhibitor_categories" ("id", "event_id", "name", "icon", "color", "order_index", "created_at") VALUES
	('1037f734-04b3-4482-b099-85450cfc1571', 'abfc6b20-0f01-46e7-9a69-997e880314fc', 'Salgados', '🍔', '#E87A5C', 0, '2026-05-24 01:38:52.586259+00'),
	('e6d97961-162e-41dd-88b3-10e3fa5a53fc', 'abfc6b20-0f01-46e7-9a69-997e880314fc', 'Doces', '🍔', '#E87A5C', 1, '2026-05-24 01:38:52.586259+00'),
	('3a6688b0-a482-4e34-9695-d8dd8fe6388f', 'abfc6b20-0f01-46e7-9a69-997e880314fc', 'Artesanato', '🎨', '#E8B85B', 2, '2026-05-24 01:38:52.586259+00'),
	('0bfb35c9-ba34-41c5-9ddb-1f20f5791823', 'abfc6b20-0f01-46e7-9a69-997e880314fc', 'Outros', '🏷️', '#94949E', 3, '2026-05-24 01:38:52.586259+00'),
	('09278224-d7b1-4a75-846d-e581b85261e7', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Artesanato', '🎨', '#E8B85B', 2, '2026-05-24 01:38:52.586259+00'),
	('e39961b8-68a7-4fbf-b15c-722ed0daa094', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Lanches', '🍔', '#3B82F6', 0, '2026-05-24 02:24:53.27346+00'),
	('8ad31900-7ad6-489d-a96a-b7f6cf0864fe', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Doces', '🍰', '#8B4513', 1, '2026-05-24 01:38:52.586259+00'),
	('11ec0744-4ca1-4d61-b3eb-3d684d0467f7', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Outros', '✨', '#B86585', 3, '2026-05-24 01:38:52.586259+00');


--
-- Data for Name: exhibitors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."exhibitors" ("id", "event_id", "number", "name", "description", "logo_url", "photo_url", "message", "final_message", "instagram_url", "whatsapp", "website_url", "status", "created_at", "updated_at", "category", "category_id", "tagline", "ano", "turma", "members") VALUES
	('1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 22, 'Ella’s café', NULL, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780778073327-x2b4qcb.jpeg', NULL, NULL, NULL, 'https://www.instagram.com/ellascafej2b?igsh=MTdpeTFvaTBnbDZ3MA==', '5541992150732', NULL, 'active', '2026-06-03 16:14:02.223804+00', '2026-06-06 20:38:29.374+00', 'Doces', NULL, 'Your comfort right here!', '2', 'A', '["Ana Beatriz", "Thalyta", "Isabelle", "Marcella"]'),
	('0cc9db9c-5c39-450e-9840-eaa28809e4a5', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 2, 'The Chernobyl coffee', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:30:17.108413+00', '2026-06-03 01:30:17.108413+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('986d6e11-6368-4835-b635-b5b10d8fcf74', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 6, 'Flor de Mel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:46:38.97599+00', '2026-06-03 01:46:38.97599+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('a72c13d3-b791-484c-aa67-6b04fd622b89', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 8, 'Nonna Florenza', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:48:23.884418+00', '2026-06-03 01:48:23.884418+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('1fc13937-67b2-4388-b4ae-f78f6b084b33', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 11, 'sweed drink', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:51:56.050793+00', '2026-06-03 01:51:56.050793+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('7ada723d-dd6e-4b38-a031-e1c27cf67202', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 12, 'Candy Glow', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:52:34.982908+00', '2026-06-03 01:52:34.982908+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('a326461d-533f-4d51-8a53-e6cc77327491', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 15, 'Espetinho do Júnior', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:54:38.835978+00', '2026-06-03 01:54:38.835978+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('8f3d917d-b741-4bfb-b6fe-90f9a83892ee', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 17, 'The potato spot', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:56:03.341299+00', '2026-06-03 01:56:03.341299+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('05fd181c-525f-415e-89b6-cb9b47ddb12d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 18, 'Waffle n roll', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:56:41.429254+00', '2026-06-03 01:56:41.429254+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('1cb5ed58-4a34-41fb-aafd-49c639aa1097', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 19, 'Vida & luz', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:57:45.104569+00', '2026-06-03 01:57:45.104569+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('e3b929c4-a72e-43d9-97c0-a23fe2e1b0fd', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 20, 'Rei do crepe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 01:58:22.204361+00', '2026-06-03 01:58:22.204361+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('f7635806-1161-4271-b998-df7f1cc39a58', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 23, 'G&L Elite Detail', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 16:14:56.234727+00', '2026-06-03 16:14:56.234727+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('f143331d-dcdf-4cbf-b9b4-7dc88e08a249', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 24, 'Brigadeiros da Manoh: Sweet Duo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 16:15:25.203085+00', '2026-06-03 16:15:25.203085+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('cedae56c-d6fa-4739-a799-d6f354ccc34f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 25, 'Capibolachas', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-03 16:16:03.114852+00', '2026-06-03 16:16:03.114852+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('fe2cbaad-b05d-4d45-b9b9-225d261eb1ca', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 27, 'Crunch cookies', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-04 00:23:58.054001+00', '2026-06-04 00:23:58.054001+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 14, 'Choribão', 'Não é sobre um pão com linguiça: é sobre uma experiência embutida em um choripan. Trazemos o melhor choripan com o sabor do braseiro, um pão tostado e o maravilhoso molho da casa. Nada menos que a 8ª maravilha do mundo.', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780776641331-gbbsc92.png', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780776782898-4eybnkm.jpeg', NULL, NULL, 'https://www.instagram.com/chori_bao.j2b/', '41 99964-6222', NULL, 'active', '2026-06-03 01:53:56.54622+00', '2026-06-06 20:22:46.023+00', 'Lanches', NULL, 'Venha Conhecer a 8ª Maravilha do Mundo', '2º', 'AM', '["Calebe de Moura Paes", "Lucca de Oliveira Stoco", "Nathan de França"]'),
	('670fbae1-d90d-480a-85b1-f02342c6bec4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 28, 'Ella’s Café', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-06 20:32:00.955472+00', '2026-06-06 20:32:00.955472+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('1d9d24c9-5d02-4294-bca4-3a362524bcce', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 21, 'Brasa Nobre', 'O Brasa Nobre é uma barraca especializada em espetinhos assados na brasa, preparados com ingredientes selecionados e muito sabor. Nosso compromisso é oferecer produtos de qualidade e um atendimento acolhedor, proporcionando uma experiência agradável a cada cliente.', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780777603184-9dxhazw.png', NULL, NULL, NULL, 'https://www.instagram.com/brasanobregrill?utm_source=qr', '+55 (41) 99289-4013', NULL, 'active', '2026-06-03 16:13:22.801631+00', '2026-06-06 20:34:31.465+00', 'Lanches', NULL, '🔥O verdadeiro sabor da brasa!', '2°', 'AM', '["Luca Nardes", "Samuel Alvares", "Thiago Ferreira Costa"]'),
	('df267b36-e4ad-4677-9e3c-e1994f43ee77', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 31, 'Coco Gourmet', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-07 00:43:41.998629+00', '2026-06-07 00:43:41.998629+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('125e9b64-e17b-438e-a456-6df38557eb91', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 33, 'G&L Elite Detail', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-07 16:04:43.929806+00', '2026-06-07 16:04:43.929806+00', 'Outros', NULL, NULL, NULL, NULL, '[]'),
	('6256cd1b-3982-479b-a19c-3a56149192af', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 7, 'Bloom', 'Nós vendemos bottons, adesivos e ecobags com o objetivo de mostrar Jesus de uma forma real, leve e bonita', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780778518045-ybabo43.jpg', NULL, NULL, NULL, 'https://www.instagram.com/bloom_j2b?igsh=dnkwbXNob2swODFp', '+55 41 9138-2305', NULL, 'active', '2026-06-03 01:47:19.616391+00', '2026-06-06 21:23:15.697+00', 'Artesanato', NULL, 'Floresça com propósito', '2°', 'AV', '["Maria Eduarda Fabris dos Santos", "Maria Julia Ribeiro Mendes Sanches"]'),
	('7ff353b2-aee9-4dea-9942-510092c189fe', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 13, 'Amor Doce', NULL, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780880347254-8m7w7am.png', NULL, NULL, NULL, '@amordocej2b', NULL, NULL, 'active', '2026-06-03 01:53:24.450717+00', '2026-06-08 01:03:04.79+00', 'Doces', NULL, 'O lugar perfeito para adoçar um romance 💕', '1° e 2°', 'B', '[]'),
	('e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 10, 'Texas Burguer', 'Forte no estilo.
Pesado no sabor. 🤠🔥', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780778923668-rpdo1rs.jpeg', NULL, NULL, NULL, 'https://www.instagram.com/texasburguer.j2b?igsh=aGlobzVrZ3B1bmps', NULL, 'https://www.colegiojourney.com.br', 'active', '2026-06-03 01:50:07.065939+00', '2026-06-07 02:10:49.531+00', 'Lanches', NULL, 'O sabor mais marcante da Journey to Business!', '1º', 'AM', '["Maria Eduarda Wahl", "Luana Depiné", "Laura Sato", "Letícia Martinelli"]'),
	('59f00dec-f2fb-4a45-9851-b1b2c6941662', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 16, 'Laercio burguer', NULL, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780796952044-tn81hgz.jpg', NULL, NULL, NULL, 'https://www.instagram.com/laercio_burguers?igsh=MWNoZjd5Y3FoanoybQ==', '554199043117', NULL, 'active', '2026-06-03 01:55:30.784863+00', '2026-06-07 01:57:44.97+00', 'Outros', NULL, 'No ponto do seu paladar 🍔🔥', '2⁰', 'B', '[]'),
	('ca9d6769-1465-4b1f-97a4-428397c4532e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 5, 'sweet layers', 'Bolos de chocolate com uma cobertura generosa e deliciosa de oreo, maracujá ou ninho em nosso cardápio também temos chocolate quente smore’s', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780859073414-6nnfi1h.jpeg', NULL, NULL, NULL, '@sweet.layers.j2b', '4198735-9224', NULL, 'active', '2026-06-03 01:44:45.105447+00', '2026-06-07 19:05:21.717+00', 'Doces', NULL, NULL, '2.º', 'A', '[]'),
	('fce0ea0c-792d-4dee-917e-93aef50e2363', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 29, '80''s vibes', NULL, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780861031187-9gvzeaq.webp', NULL, NULL, NULL, '@80vibes.j2b', '+55 41 9175-9110', NULL, 'active', '2026-06-06 21:13:56.943501+00', '2026-06-07 19:43:01.786+00', 'Lanches', NULL, NULL, '1', 'Bm', '["Bianca Banach", "Sarah negrão", "Sarah Tobias"]'),
	('450e1715-624c-4b84-8885-34507a8b032e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 30, 'Cherry glam', NULL, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780866995555-qpostq4.jpeg', NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-06-06 23:17:13.303366+00', '2026-06-07 21:20:58.712+00', 'Doces', NULL, 'Os melhores doces da feira!!', '2º', 'AM', '["Fernanda Estezi", "Giovanna Adorno"]'),
	('e81c7183-37d2-4bfe-97e0-0147c735d961', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 26, 'Subway Surfers', 'SANDUÍCHES NATURAIS, VENHA MONTAR O SEU!
aqui no Colégio Journey das 10:00 horas da manhã até ás 15:00 da tarde
NOSSO SABOR AO SEU DISPOR.', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780964088237-lbncyh6.jpg', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780964097536-kntps97.jpg', NULL, NULL, 'sbw_surf00', '5511986054300', NULL, 'active', '2026-06-04 00:23:20.716027+00', '2026-06-09 00:15:11.502+00', 'Lanches', NULL, 'SANDUÍCHES DO SEU JEITO, CORRA PARA O SABOOOOOR', '1 ANO', 'A', '[]'),
	('2e35046d-1883-42f6-a5b9-1f7cfb183031', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 3, 'GLOWEER', '✨ Bem-vindo(a) à nossa loja de velas aromáticas artesanais! ✨
Criamos velas feitas à mão com carinho e dedicação, combinando fragrâncias cuidadosamente selecionadas para proporcionar conforto, bem-estar e aconchego em cada ambiente.
Nossas velas são perfeitas para decorar, presentear ou transformar momentos simples em experiências especiais. Cada peça é produzida artesanalmente, com atenção aos detalhes e compromisso com a qualidade.', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780778365483-c5u3l1g.jpeg', 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780780258115-r1rqz0j.jpeg', NULL, NULL, 'https://www.instagram.com/gloweer.j2b?igsh=MXU4bG40b3duNWRncw==', NULL, NULL, 'active', '2026-06-03 01:32:04.409718+00', '2026-06-07 23:41:46.451+00', 'Artesanato', NULL, '✨ Velas criativas e exclusivas!', '1', 'BM', '["Duda Trizotte", "Laura Correa", "Vitória Klassen", "Isa Felix"]');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "display_name", "photo_url", "role", "created_at", "supabase_user_id", "event_id", "exhibitor_id") VALUES
	('6c07ba73-b561-4752-ba70-15715dd3328e', 'beafoltran1023@gmail.com', 'beafoltran1023@gmail.com', NULL, 'expositor', '2026-06-08 00:57:10.648546+00', '4a00729b-aa53-43c6-91a9-e8d2cf4c54a9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '7ff353b2-aee9-4dea-9942-510092c189fe'),
	('8ea1fc1c-05f0-4514-963d-94653343d30e', 'rodolfostebner@gmail.com', 'Rodolfo Stebner', 'https://lh3.googleusercontent.com/a/ACg8ocJSjX5DQUlcL1YEDxfy33VJC0LWfm6pH76AthDAoYK77IUgH1XBkA=s96-c', 'admin', '2026-04-11 07:18:44.737908+00', '151d66f9-067f-4c46-9fd1-608d520e7238', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('c80934df-f748-43d6-9dc1-e83777d36a3a', 'majusanchesof@gmail.com', 'Maria Julia Sanches', 'https://lh3.googleusercontent.com/a/ACg8ocLTF1zVmw3ejjA0MBJRqPfk1R3kAAPnvn3q8xW89GerxCIfK8TS=s96-c', 'expositor', '2026-06-06 23:53:28.123856+00', '4a6cab10-4c56-4ff2-ad1a-565de786f7a6', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af'),
	('dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', 'denisddc@gmail.com', 'Denis Douglas', 'https://lh3.googleusercontent.com/a/ACg8ocJHXLOrAq5ycTfBtN8NUprUDzwL1hOUPa3EuEkoJcoW4qMJjr0fMA=s96-c', 'admin', '2026-05-05 17:28:42.003202+00', '9e1060ae-a5f6-4ec1-96b3-eb0e65b31aff', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('0201663d-0407-4476-8412-f4c7c07bf9e9', 'alecavichia.junior@gmail.com', 'Alexandre Cesar Cavichia Junior', 'https://lh3.googleusercontent.com/a/ACg8ocLvMDu_adO8Vb9K5gib_r7CI28Uzq-EDmmQ1xibY0LG7hv_maQ=s96-c', 'participant', '2026-06-07 00:39:42.547281+00', '563710b9-833d-42bd-ab43-75383877098b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('3274637a-a873-41c5-9b60-84011dd5a27e', 'dudatrizotte@icloud.com', 'Duda Trizotte', 'https://lh3.googleusercontent.com/a/ACg8ocJpSs0i7rMBsysSBuqMcQboMkiF-0ADqAUN9F9rgtdtBRjX5yA=s96-c', 'expositor', '2026-06-06 20:34:35.989863+00', '3152acdd-0682-4d41-a17b-7361a3fee396', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031'),
	('c37917aa-9348-4bc9-a897-1f16a4482aea', 'dudawahlcg@gmail.com', 'dudawahlcg@gmail.com', NULL, 'expositor', '2026-06-06 20:47:10.7603+00', '98cb9e7e-f296-4b22-b724-5cfadca8bfac', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555'),
	('894267ed-a3b0-4582-bbd4-10dc2358fddc', 'anaelizabethac2011@gmail.com', 'Ana Elizabeth', 'https://lh3.googleusercontent.com/a/ACg8ocIUeKk3pJiFAl5cIFhkTzcT8iKBf91XupR7R-np5kufgW0gNAgpbQ=s96-c', 'admin', '2026-06-04 17:16:50.430214+00', '97350c7c-c64b-40f7-b32d-f7f555095285', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('1385ff49-5c2f-4945-98c4-7ac6f46030a5', 'cibellestebner@gmail.com', 'Cibelle Stebner', 'https://lh3.googleusercontent.com/a/ACg8ocKA7ViSKuIohn5hHafZVEZi_YK9ECQV0OtCgifVsF9LVbQ0R3Ye=s96-c', 'admin', '2026-04-25 16:58:49.15153+00', NULL, 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('f86bff5c-2dd3-4891-8ee0-42dc6e38c714', 'mariana.leite@colegiojourney.com.br', 'mariana.leite', NULL, 'admin', '2026-06-02 17:40:00.791952+00', NULL, 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('13d66f36-99ba-40ff-ac2f-9f65218e2f5c', 'defrannathan@gmail.com', 'Nathan de França', 'https://lh3.googleusercontent.com/a/ACg8ocLFwYuaP3ySFNEo8CEmWSjOExcbbPjse10M7fOy7wGZvMR08g=s96-c', 'expositor', '2026-06-06 20:10:43.070814+00', '7ed26415-4335-4033-a895-7b053793af0d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2'),
	('6a67a871-18af-4bce-aa39-84b4ea807e66', 'lucanardes.01@gmail.com', 'Luca Nardes', 'https://lh3.googleusercontent.com/a/ACg8ocLjZ3ltwrzFjZHQydaRGWvm6Z1o3W99SNu5sXTlqDfcV1vLxas=s96-c', 'expositor', '2026-06-06 20:21:32.141992+00', 'b330144c-60ce-46e4-aace-addb6e26ac51', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('3659d9a6-1a09-4e11-a1e5-92b4c4597c91', 'denisddc@icloud.com', 'denisddc@icloud.com', NULL, 'expositor', '2026-06-06 16:20:56.797895+00', '436d9341-2300-44d3-a3d0-f349209812c2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('25772fa7-486a-4de8-bb1a-7a3b737bca26', 'amandafigueiredoarantesi@gmail.com', 'Amanda Arantes', 'https://lh3.googleusercontent.com/a/ACg8ocI40qSywimpmof4XWOkOK7DN1gne8Q_Ct54CF4BpBRdMIPiZQ=s96-c', 'participant', '2026-06-07 02:55:02.590323+00', 'cd17dc1d-8d59-494f-90d4-19905cd93dc4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('8e217378-dd81-447c-9545-82686b05b3bb', 'rebecca.peters@mail.fae.edu', 'REBECCA PETERS', 'https://lh3.googleusercontent.com/a/ACg8ocJa93RKEGpX58OCqVwZGdza2AAQYMsPeoXkWsJgnnB0IuA0Aw=s96-c', 'participant', '2026-06-06 19:20:33.347821+00', '76f9af25-c222-4c2d-a40d-5528c1281d00', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('2586bafb-b501-4289-83cf-f1b73d985100', 'giovannagarndt@gmail.com', 'giovannagarndt@gmail.com', NULL, 'expositor', '2026-06-07 12:53:41.99381+00', '8ec3e7ca-fcdc-43b3-bf58-75f2c4e76077', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'f7635806-1161-4271-b998-df7f1cc39a58'),
	('e1e3b1dd-b5ad-4fc0-b233-b5fd630cbcf0', 'davivanzinmello@gmail.com', 'Davi Vanzin Mello', 'https://lh3.googleusercontent.com/a/ACg8ocKUMtWQ7a4o6NI77dZvKRio1Hkla75CA54j_Fky7PynHVhRfHRa=s96-c', 'expositor', '2026-06-07 01:48:18.917355+00', 'def9192a-4928-42c0-9db9-600564f50674', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662'),
	('6c0dc387-7179-4223-a9da-72dd88fe2c00', 'mah.antunesx@gmail.com', 'Marcella Antunes', 'https://lh3.googleusercontent.com/a/ACg8ocJPPPY9X3qj8JDUIucXX83TdjQTKWWc1ImvBTJRNVpYMv-0LIA=s96-c', 'expositor', '2026-06-06 20:20:47.278448+00', 'de909da7-c5ef-4262-a027-66871a45d93a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '670fbae1-d90d-480a-85b1-f02342c6bec4'),
	('68b24b51-3eb1-4cd3-9e22-fb4902d3087f', 'mhelouise1507@gmail.com', 'Maria Helouise Pauli de Araujo', NULL, 'expositor', '2026-06-07 19:01:48.875268+00', 'cc505216-aa0e-494b-81db-60334b72172f', NULL, 'ca9d6769-1465-4b1f-97a4-428397c4532e'),
	('3717ad4b-7310-47b7-995b-74d1f381b148', 'machadogeminl@gmail.com', 'Letícia Machado gemin', 'https://lh3.googleusercontent.com/a/ACg8ocJAXnV72YjhJQ6Cf585GeDerSTmtITiKpjvruTK1dkqgjBXkA=s96-c', 'expositor', '2026-06-07 20:59:50.731147+00', 'c3792443-b483-465a-8121-9e0e0239593f', NULL, 'a72c13d3-b791-484c-aa67-6b04fd622b89'),
	('e9bfe20b-227b-4b44-9cef-b6b1cb67881b', 'raquelalicecdemoura@gmail.com', 'Raquel Alice C. de Moura', 'https://lh3.googleusercontent.com/a/ACg8ocLyjJ4P6AqszeGT522B0XTPDOau0Ee5UUXzMRDgE0vVttA97w=s96-c', 'participant', '2026-06-07 16:30:56.704251+00', 'e8649d95-aad2-4a02-92f5-7b228f930d15', NULL, NULL),
	('055f2076-1566-4939-ba3b-4adc46fa41c2', 'vazsamararutz@gmail.com', 'vazsamararutz', NULL, 'expositor', '2026-06-03 01:31:15.399411+00', NULL, 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '0cc9db9c-5c39-450e-9840-eaa28809e4a5'),
	('015070c3-3efc-4b0d-823a-a897a16af4bd', 'rodolfostebner.app@gmail.com', 'Rodolfo Reinaldo Stebner', 'https://lh3.googleusercontent.com/a/ACg8ocJ_N_aPyxMlnrilE4g__8q68wffXUJLvcez7_6qHR7ORnW1iw=s96-c', 'participant', '2026-06-04 19:58:11.628961+00', 'c1c0350a-b128-43f5-a77c-8486ed7156dc', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('0b07ee0b-19a9-4dec-a823-45791908d1ca', 'anabeatriz22092010@gmail.com', 'anabeatriz22092010@gmail.com', NULL, 'expositor', '2026-06-06 20:34:11.838422+00', 'db9b8e5e-f02c-4122-844f-a8e6b931e0f9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f'),
	('3931a5c6-a1a2-4bde-9605-3960b2eda493', 'aldallagassa.alves@gmail.com', 'André Luis Dallagassa Alves', NULL, 'participant', '2026-06-07 01:09:24.287054+00', '38661cce-5589-4a3e-9616-4fd169ba1da6', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('92d4ff25-2021-410d-b919-6bac6da0fbd8', 'samaralenharo@gmail.com', 'Samara Lenharo', 'https://lh3.googleusercontent.com/a/ACg8ocKVjdaVkmjZtVO4W5dlm9uTQjlidAUY_8pDgJMsYXLtwyD6xRNC=s96-c', 'participant', '2026-06-06 19:22:59.452741+00', 'd7bd344a-2515-47a7-8d64-99cd63f9a875', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('2161d31a-ef84-47d0-9d5b-59adbfc89d12', 'andersenann@gmail.com', 'Mary Anne Andersen Cavalheiro', 'https://lh3.googleusercontent.com/a/ACg8ocJdzCGGwdBXsqxpdc1PdkggjPwp4_REJX9aaN-z5FJXSA3P5u98Xg=s96-c', 'participant', '2026-06-06 16:39:29.708276+00', '6be3735e-2d21-4a53-9ab3-471ae5e1f7fe', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('05ed429b-410f-40e7-98b4-2381225e983e', 'aju.marques2026@gmail.com', 'Júlia Okoinski Marques', 'https://lh3.googleusercontent.com/a/ACg8ocLJhxsvPAc762S7TLGfm34HQxIN2JdtWWtHuXZ875vNCzgudg=s96-c', 'participant', '2026-06-06 20:13:37.003388+00', '21de2bc1-f774-43af-a42b-2749d55d146a', NULL, NULL),
	('089f8b1e-9fcd-4c0a-b919-5a41aeedc76f', 'professora_mariana@journey.com.br', 'professora_mariana', NULL, 'avaliador', '2026-06-01 02:46:38.827138+00', NULL, 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('2716c405-b203-41fd-911b-e22b4dbb1022', 'rodolfostebnervideos@gmail.com', 'Rodolfo Stebner', NULL, 'expositor', '2026-06-04 02:51:52.750716+00', '4f00c6c6-a272-4385-801f-382cb2b9e13a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('4669f4f3-d403-4bb4-9a94-f3cac777272a', 'madufabris@gmail.com', 'madufabris@gmail.com', NULL, 'expositor', '2026-06-06 20:41:05.141384+00', 'fc45897d-32a7-41f1-a068-a0e225541341', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af'),
	('afacc927-8131-4a94-b0d1-0daba4ccb826', 'rodolfostebnerfoto2@gmail.com', 'Rodolfo Stebner', 'https://lh3.googleusercontent.com/a/ACg8ocJJmmvHuWdsbRWSi_PlMKjiGSzLtUNf1qz5YRfiyIbEvbJS2YAu=s96-c', 'avaliador', '2026-06-04 02:36:35.014755+00', '1f81d488-9b46-4135-b6e4-b2dcc6f3d13d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('4e98e879-87bc-4b51-aebf-8bca06d65606', 'nayllavitoriacorrea@gmail.com', 'nayllavitoriacorrea@gmail.com', NULL, 'participant', '2026-06-06 21:59:01.699522+00', '7a1bff5d-2627-4cd6-9b5e-2886a5778e3f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('fb11dd7a-da16-4652-8a4c-9b170fbedc06', 'bianca.palazon@escola.pr.gov.br', 'BIANCA BANACH PALAZON', 'https://lh3.googleusercontent.com/a/ACg8ocI5vCWRTKJ_tOo18hPBvQTYoEez4ql3AQtaX1ig4Yu1-9Vck1YP=s96-c', 'expositor', '2026-06-07 19:36:20.194453+00', '78192f54-5667-42a9-be2c-29b79d1b6525', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fce0ea0c-792d-4dee-917e-93aef50e2363'),
	('711d9f8d-23c3-4d78-90ea-398f11e9c4fb', 'fernandaestezi08@gmail.com', 'fernandaestezi08@gmail.com', NULL, 'expositor', '2026-06-07 21:14:47.432365+00', '4f4a9a63-d9c6-489f-847b-f9c2c411af6b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '450e1715-624c-4b84-8885-34507a8b032e'),
	('0b7919d4-d574-4906-8519-a711c6e51fcb', 'esnt.1910@gmail.com', 'Emilly Santos', 'https://lh3.googleusercontent.com/a/ACg8ocKsEeApdVxZdwTA2HEGu5bFGJKM_Hu3e2hkiJDASBUAQQdZjA=s96-c', 'expositor', '2026-06-09 00:00:33.494421+00', 'b75ad01b-ba5d-44ae-baa0-095f14f528ae', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e81c7183-37d2-4bfe-97e0-0147c735d961'),
	('0048ee2c-9f86-49fa-b119-eed1c61fdc03', 'nicoletakedaa@gmail.com', 'Nicole Takeda', 'https://lh3.googleusercontent.com/a/ACg8ocJv0t8cOLda3NZCJISEhb5-eC1aOg-SBLM2WFS6P8chM2Bi-A=s96-c', 'participant', '2026-06-07 02:05:35.560641+00', '69c6c5ef-e474-4ce4-bd2e-5be08693e115', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('9e825891-ffde-4fc8-8bfb-c613c19a3bc9', 'rafael.ltzgarcia@gmail.com', 'Rafael lotz Garcia', 'https://lh3.googleusercontent.com/a/ACg8ocLQ49UGxGedIrPYP7NIhWngXtolR_R-PrCjT4Vu8R-EncBSIvbG=s96-c', 'expositor', '2026-06-07 00:35:47.106247+00', '7436e70b-9790-4420-bd4f-c3ecf2695602', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'df267b36-e4ad-4677-9e3c-e1994f43ee77'),
	('7cdb9ac3-26db-436d-aa61-7ed2a03c04eb', 'viagemnafisica@outlook.com', 'Piá Da Matemática', 'https://lh3.googleusercontent.com/a/ACg8ocKD73Cqu7juaXNIHLfAVknfLo7rSvgeW1aBoTtMZaniPtzp2Lvv=s96-c', 'participant', '2026-06-07 03:09:29.667534+00', 'bfcc2837-9933-42a9-8377-698ee6d82e5e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL),
	('399873ee-02ee-4d23-9780-723785a7491d', 'annestebner1@gmail.com', 'Anne Stebner', 'https://lh3.googleusercontent.com/a/ACg8ocIcHlI0rUHnKmGbeWXqI-gE5H33jqHasdH5HNfba0KE1mkPz3k5lQ=s96-c', 'admin', '2026-04-25 16:12:13.482384+00', '1c9ae7f4-f787-49ce-bc86-79eb7ed651f8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', NULL);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."audit_logs" ("id", "event_id", "user_id", "user_name", "user_email", "action", "changes", "created_at") VALUES
	('ae37e1ca-ab6d-463a-8117-8629288e34b8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', 'Denis Douglas', 'denisddc@gmail.com', 'update_event', '{"date": {"after": "2026-06-13T10:00", "before": "2026-06-13T08:30:00+00:00"}}', '2026-06-06 17:11:20.051071+00'),
	('7aec74e1-b44d-4c5c-9b47-d96c32ff419a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', 'Denis Douglas', 'denisddc@gmail.com', 'update_event', '{"exhibitors_estimation": {"after": 30, "before": 25}}', '2026-06-07 01:00:59.814863+00');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contact_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: evaluation_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."evaluation_categories" ("id", "event_id", "name", "weight", "order_index", "created_at") VALUES
	('a0abaf34-c3d7-4512-815d-f261b57e373c', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Apresentação (Stand e pessoal)', 1.00, 1, '2026-05-22 19:06:46.73874+00'),
	('54d9f19c-3a07-42a1-8f34-fb326b65e2e4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Produto', 1.00, 2, '2026-05-22 19:07:24.843028+00'),
	('a6f3057a-8f58-418c-a297-1dd73eed5a47', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Inovação e Criatividade', 1.00, 3, '2026-05-22 19:07:57.93854+00'),
	('8770e3b0-8e2b-4891-a72a-5f086fb78ccd', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Trabalho em Equipe', 1.00, 4, '2026-05-22 19:11:13.050638+00'),
	('bc958e6c-5625-49ab-a991-96938d6eff32', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Vendas', 2.00, 5, '2026-05-26 00:18:07.249569+00');


--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: juror_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "exhibitor_id", "name", "description", "price", "photos", "active", "created_at", "updated_at") VALUES
	('aed7146f-15d5-4456-8916-6da8533ed856', '2e35046d-1883-42f6-a5b9-1f7cfb183031', 'Vela G', 'Pote de 265 ml 
Vela de flor', 25.00, '{https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780778335100-9vk1s4t.jpeg,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780779729267-24jlcnb.jpeg,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780779766181-1pfr6hr.jpeg}', true, '2026-06-06 20:39:01.668915+00', '2026-06-08 23:11:57.685+00'),
	('08cfaf69-034a-4cf7-acdb-4a9390aa60ce', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', '2 Choripan Regular', 'Duas metades de pão d’água tostadas ao fogo com queijo mussarela derretido e uma generosa camada de massa de linguiça especial — tudo na churrasqueira e com direito ao molho da casa em cima dos dois choripans.

Ingredientes: pão d’água, queijo mussarela, massa de linguiça especial e molho da casa.', 14.90, '{https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780777601777-wngx66d.jpeg}', true, '2026-06-06 20:27:12.301174+00', '2026-06-06 20:27:12.301174+00'),
	('5668b153-9194-4363-827a-62aac6574101', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', '2 Choripan Fit', 'Duas metades de pão d’água fresquinho com uma massa de linguiça especial — tudo montado na hora, preparado ao sabor do braseiro e servido com direito ao molho da casa.

Ingredientes: pão d’água, massa de linguiça especial e molho da casa.', 14.90, '{https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780777643622-haoao0r.jpeg}', true, '2026-06-06 20:27:54.952925+00', '2026-06-06 20:27:54.952925+00');


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."partners" ("id", "event_id", "name", "description", "photos", "instagram_url", "whatsapp", "website_url", "order_index", "active", "created_at", "updated_at", "type", "sponsorship_value", "show_on_tv", "show_on_feed", "logo_url", "tiktok_url", "youtube_url", "email", "phone") VALUES
	('faffe438-c10d-4af2-8fe7-070343c5c811', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Venezianas Paraná', 'Venezianas e persianas sob medida, motorização e manutenção com agilidade e compromisso.', '{}', NULL, '(41) 9541-1644', 'https://venezianasparana.com.br/', 2, false, '2026-05-30 13:30:07.189888+00', '2026-05-30 13:35:43.023+00', 'patrocinador', 70.00, true, true, NULL, NULL, NULL, NULL, NULL),
	('5b54f368-a885-4c58-bf12-4a2d96c0fc91', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Almanaque Militar', NULL, '{https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1779242231247-bi4ggzw.png}', 'almanaquemilitar', '4199538873', 'https://linktr.ee/almanaquemilitar', 1, false, '2026-05-20 01:42:27.905465+00', '2026-05-21 15:00:27.309+00', 'apoiador', NULL, true, true, NULL, NULL, NULL, NULL, NULL),
	('24353e3e-431a-406b-a6ca-758cd4c4b4db', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Almanaque Militar', 'O Almanaque Militar é um projeto educacional com enfoque histórico e informativo. Em suas respectivas mídias, o almanaque apresenta eventos impactantes e relevantes para a história, além de biografias e experiências pontuais, singulares, para o desenvolvimento humano.', '{https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780973046958-od1alag.png,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780973057836-dk4h5p2.png,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780973065388-mv5ju9n.png}', 'https://www.instagram.com/almanaquemilitar/', NULL, 'https://academia.almanaquemilitar.com.br/', 2, true, '2026-06-07 01:42:46.637303+00', '2026-06-09 02:45:22.619+00', 'patrocinador', NULL, true, true, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780971350837-1trx33q.png', NULL, 'https://www.youtube.com/c/AlmanaqueMilitarOficial', 'almanaquemilitar@gmail.com', NULL),
	('6f688bd2-17a0-43c5-b2d2-bd83493cef62', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Drum Station', NULL, '{}', NULL, NULL, NULL, 3, true, '2026-06-09 17:00:00.680047+00', '2026-06-09 17:00:00.680047+00', 'patrocinador', NULL, true, true, NULL, NULL, NULL, NULL, NULL),
	('3e6b699b-a04b-4731-b994-1b2a22af3800', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Venezianas Paraná', 'Venezianas e persianas sob medida, motorização e manutenção com agilidade e compromisso.', '{https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1779160444460-mpq0afi.jpg,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1779160453591-3n4by66.jpg,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1779160498513-dsyi67n.jpg}', 'mapersianas01', '(41) 9541-1644', 'https://venezianasparana.com.br/', 0, true, '2026-05-19 03:16:11.522296+00', '2026-06-07 00:53:24.623+00', 'patrocinador', 70.00, true, true, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780793513127-vcq63ms.jpeg', NULL, NULL, NULL, NULL),
	('3c534e3d-2734-4f3e-8aee-a1a3a3755d42', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'Piá da Matemática', '"A Matemática é a linguagem universal que conecta mentes e desvenda os segredos do universo." - Malba Tahan

 Olá pessoal, venha comigo desvendar os segredos do universo através da Matemática, e vamos descobrir juntos que ela não é um monstro de 7 cabeças!', '{https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780974324831-iatc350.png,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780974456325-peczppd.png,https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780974709182-bo46ziy.png}', '@piadamatematica', NULL, NULL, 1, true, '2026-05-30 13:39:57.888511+00', '2026-06-09 03:20:57.662+00', 'patrocinador', 70.00, true, true, 'https://pub-1516365c685b4c02b3d5dd2f7726080b.r2.dev/1780974307076-wyql4ad.png', '@piadamatematica', '@piadamatematica', NULL, NULL);


--
-- Data for Name: photo_views; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: print_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: print_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: raffle_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: raffle_prizes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_email_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_email_roles" ("email", "role", "event_id", "exhibitor_id", "created_at") VALUES
	('lauracorrea.14.12.11@gmail.com', 'expositor', NULL, '2e35046d-1883-42f6-a5b9-1f7cfb183031', '2026-06-03 01:32:26.439529+00'),
	('sarah.rcreis09@gmail.com', 'expositor', NULL, '986d6e11-6368-4835-b635-b5b10d8fcf74', '2026-06-03 01:46:56.866007+00'),
	('bell4.leao@gmail.com', 'expositor', NULL, '1fc13937-67b2-4388-b4ae-f78f6b084b33', '2026-06-03 01:52:10.919086+00'),
	('fersch2010@gmail.com', 'expositor', NULL, '7ada723d-dd6e-4b38-a031-e1c27cf67202', '2026-06-03 01:53:06.928064+00'),
	('viniciusvascao54@gmail.com', 'expositor', NULL, 'a326461d-533f-4d51-8a53-e6cc77327491', '2026-06-03 01:55:00.099907+00'),
	('alvzju@icloud.com', 'expositor', NULL, '8f3d917d-b741-4bfb-b6fe-90f9a83892ee', '2026-06-03 01:56:17.305109+00'),
	('pedro.pschera', 'expositor', NULL, '05fd181c-525f-415e-89b6-cb9b47ddb12d', '2026-06-03 01:57:03.710851+00'),
	('esterloyolagomes@gmail.com', 'expositor', NULL, '1cb5ed58-4a34-41fb-aafd-49c639aa1097', '2026-06-03 01:58:04.267669+00'),
	('davirocha22375@gmail.com', 'expositor', NULL, 'e3b929c4-a72e-43d9-97c0-a23fe2e1b0fd', '2026-06-03 01:58:39.647027+00'),
	('manoelamansano2010@gmail.com', 'expositor', NULL, 'f143331d-dcdf-4cbf-b9b4-7dc88e08a249', '2026-06-03 16:15:41.19841+00'),
	('emanuelleovr@gmail.com', 'expositor', NULL, 'cedae56c-d6fa-4739-a799-d6f354ccc34f', '2026-06-03 16:16:22.921843+00'),
	('bearibas7969@gmail.com', 'expositor', NULL, 'fe2cbaad-b05d-4d45-b9b9-225d261eb1ca', '2026-06-04 00:24:20.283824+00');


--
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."visits" ("id", "event_id", "exhibitor_id", "product_id", "user_id", "session_id", "action", "created_at", "event_status") VALUES
	('18ee0031-87f7-42dd-875b-c00272b1ce90', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'f143331d-dcdf-4cbf-b9b4-7dc88e08a249', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '3686db51-2f39-4b66-9266-7104a8d44e95', 'view_stand', '2026-06-06 15:34:18.989779+00', 'pre'),
	('22887334-91d7-492b-b3d8-3578cc285d62', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1fc13937-67b2-4388-b4ae-f78f6b084b33', NULL, NULL, '1672a1de-bf78-4377-8c77-3d44f2cbd414', 'view_stand', '2026-06-06 17:57:42.157905+00', 'pre'),
	('cc044e84-0364-465d-b154-3c8f9d3d3c57', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '92d4ff25-2021-410d-b919-6bac6da0fbd8', 'b4d6f12d-341d-4943-9369-d2951beec43e', 'view_stand', '2026-06-06 19:23:56.522109+00', 'pre'),
	('8e0efe2a-63d5-4a11-a2be-2d74210e995d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '8e217378-dd81-447c-9545-82686b05b3bb', 'c4efd355-b147-48ff-84ec-2f07cc10ac1d', 'view_stand', '2026-06-06 19:24:01.16211+00', 'pre'),
	('6971eae4-2b9f-4b6b-8732-65f5e156d21c', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, 'fe537ac7-f294-45f6-8210-07bb5fdd322b', 'view_stand', '2026-06-06 20:05:13.106989+00', 'pre'),
	('4c3c4330-1472-4081-9e12-96b55ff73e9e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e81c7183-37d2-4bfe-97e0-0147c735d961', NULL, NULL, '944bed9f-e41d-4f4c-b9e9-0a8c18ad78ac', 'view_stand', '2026-06-06 20:05:15.851551+00', 'pre'),
	('e27eeb0e-d9ca-4176-acbb-eca09b4c21d7', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'a326461d-533f-4d51-8a53-e6cc77327491', NULL, NULL, 'a106c02d-78d2-4360-ba1e-a34bad8def0a', 'view_stand', '2026-06-06 20:09:25.076358+00', 'pre'),
	('bbba9316-8262-481a-8702-941b51d4a9eb', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, '9bf46b7c-90a6-4c1b-bd65-9cdbdc851732', 'view_stand', '2026-06-06 20:19:16.133683+00', 'pre'),
	('2a8469f7-774e-44b2-b223-3b2db251a70e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '6c0dc387-7179-4223-a9da-72dd88fe2c00', 'f10a2d01-efad-456d-a45e-1852742c5915', 'view_stand', '2026-06-06 20:21:31.657516+00', 'pre'),
	('c38f297d-9669-4709-847e-bad4b009956b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '13d66f36-99ba-40ff-ac2f-9f65218e2f5c', '4227f90b-50be-48f7-b70e-ec3c859c79e9', 'view_stand', '2026-06-06 20:28:26.139019+00', 'pre'),
	('df664841-6155-43ae-8c0d-16afe4796d79', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', '36db048f-66b9-4917-941a-c416d525f2bc', 'view_stand', '2026-06-06 20:29:03.935941+00', 'pre'),
	('84be7398-0b0b-41c5-ba39-966fc4f84401', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '13d66f36-99ba-40ff-ac2f-9f65218e2f5c', '4227f90b-50be-48f7-b70e-ec3c859c79e9', 'view_stand', '2026-06-06 20:29:16.546364+00', 'pre'),
	('e478ab39-53c6-45fe-b814-302555b0d462', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', '36db048f-66b9-4917-941a-c416d525f2bc', 'click_instagram', '2026-06-06 20:29:17.542+00', 'pre'),
	('c14d3590-4836-4b02-8dd1-78d56209ab46', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 20:30:40.895744+00', 'pre'),
	('bb6f6bf8-cc56-451a-bda8-2d323868ad88', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 20:44:37.497083+00', 'post'),
	('2860a11e-5503-4509-bf13-800403aae6a1', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 20:44:45.469689+00', 'post'),
	('84941531-4413-4105-a811-5b7df099333d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fe2cbaad-b05d-4d45-b9b9-225d261eb1ca', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 20:45:19.412774+00', 'post'),
	('13e897bd-222e-4379-ad42-305a735cd7e9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 20:45:35.551744+00', 'post'),
	('a0e624e4-2f5b-45fb-86a5-0171937a10eb', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, NULL, '4e0a41d0-e182-4382-bf51-a6af7ddcc6aa', 'view_stand', '2026-06-06 20:46:00.390971+00', 'post'),
	('5edd6aaf-edd1-44fe-8e42-b444211c6984', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, 'c37917aa-9348-4bc9-a897-1f16a4482aea', '4e0a41d0-e182-4382-bf51-a6af7ddcc6aa', 'click_website', '2026-06-06 20:52:19.193526+00', 'post'),
	('27189b56-904d-4482-a8de-8024ca1aab33', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, 'c37917aa-9348-4bc9-a897-1f16a4482aea', '4e0a41d0-e182-4382-bf51-a6af7ddcc6aa', 'click_instagram', '2026-06-06 20:52:25.871156+00', 'post'),
	('f342e83e-1271-4993-830a-639d826cfb8c', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 20:58:08.557792+00', 'post'),
	('350c96e2-43a6-4e0e-998a-b10900896208', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 21:03:19.836961+00', 'pre'),
	('0f814716-6509-45f4-ac65-374757c39517', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', 'aed7146f-15d5-4456-8916-6da8533ed856', '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_product', '2026-06-06 21:03:26.912816+00', 'pre'),
	('3ab4f6c7-24a5-4546-82c7-efc6ce87655d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'dde9d379-2e57-434e-88b5-929c1cd93362', 'view_stand', '2026-06-06 21:03:31.633272+00', 'pre'),
	('d0e2f121-7f47-483e-bdd9-d255100f012e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 21:04:12.349675+00', 'pre'),
	('38736d20-116a-4ab4-b052-bb3ca4384df4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'f7635806-1161-4271-b998-df7f1cc39a58', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 21:05:40.410104+00', 'pre'),
	('5b572e75-112a-49ee-97dd-875b97890a08', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'click_instagram', '2026-06-06 21:08:04.146526+00', 'pre'),
	('0762b10f-14ab-4351-9b0b-08100592629f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 21:11:28.176796+00', 'pre'),
	('2c3b82c4-3339-463c-b313-6ce0fa264b5a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 21:15:02.429196+00', 'pre'),
	('6aada360-24dd-4012-982b-5212754ad897', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-06 21:16:35.887156+00', 'pre'),
	('34da2e0e-86de-4fec-b6c6-cb01a6228d4b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '336f5839-6e00-43d7-91ec-9d23e1fd8af1', 'click_instagram', '2026-06-06 21:22:10.49263+00', 'pre'),
	('6ab5bc97-7e8b-4cb2-8bdf-aeb265702732', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '336f5839-6e00-43d7-91ec-9d23e1fd8af1', 'click_whatsapp', '2026-06-06 21:22:16.03105+00', 'pre'),
	('0570ee6b-8446-4448-828a-81545407a731', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '336f5839-6e00-43d7-91ec-9d23e1fd8af1', 'click_whatsapp', '2026-06-06 21:22:24.351863+00', 'pre'),
	('545443a6-573e-4d03-8be8-c552b64bf83e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '336f5839-6e00-43d7-91ec-9d23e1fd8af1', 'click_whatsapp', '2026-06-06 21:23:35.321031+00', 'pre'),
	('f0143882-e99f-45b7-9e61-c6999dd04e11', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '336f5839-6e00-43d7-91ec-9d23e1fd8af1', 'click_whatsapp', '2026-06-06 21:26:47.308863+00', 'pre'),
	('8b2cafd2-dc68-4897-b4d1-2c4ed80509cd', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '336f5839-6e00-43d7-91ec-9d23e1fd8af1', 'click_instagram', '2026-06-06 21:26:51.721878+00', 'pre'),
	('f3924057-baed-46e4-8a96-2e80269f8152', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '670fbae1-d90d-480a-85b1-f02342c6bec4', NULL, '6c0dc387-7179-4223-a9da-72dd88fe2c00', 'f10a2d01-efad-456d-a45e-1852742c5915', 'view_stand', '2026-06-06 21:30:21.772625+00', 'pre'),
	('56f4ee69-6ad3-457c-ba2d-12080b80df89', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '6c0dc387-7179-4223-a9da-72dd88fe2c00', 'f10a2d01-efad-456d-a45e-1852742c5915', 'view_stand', '2026-06-06 21:30:41.840027+00', 'pre'),
	('8c2fa62c-6315-4e7c-b100-cc6446f7c687', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '6c0dc387-7179-4223-a9da-72dd88fe2c00', 'f10a2d01-efad-456d-a45e-1852742c5915', 'click_instagram', '2026-06-06 21:30:47.440923+00', 'pre'),
	('f10930f5-595e-4204-a198-d4734b2390a0', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '6c0dc387-7179-4223-a9da-72dd88fe2c00', 'f10a2d01-efad-456d-a45e-1852742c5915', 'view_stand', '2026-06-06 21:31:19.168864+00', 'pre'),
	('cdd9e484-cd71-42b9-9ce0-a369b7f9f7b5', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '6c0dc387-7179-4223-a9da-72dd88fe2c00', 'f10a2d01-efad-456d-a45e-1852742c5915', 'view_stand', '2026-06-06 21:32:09.663511+00', 'pre'),
	('0b273e55-9075-49b5-bb38-dcc3c4ca0ae6', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'click_website', '2026-06-06 21:36:39.609204+00', 'pre'),
	('b73f4211-43ec-47f6-b5c2-7926211694f8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'view_stand', '2026-06-06 21:37:14.533709+00', 'pre'),
	('dacdf4ca-16ae-46a6-ae0e-a1b4d784d8dd', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'view_stand', '2026-06-06 21:38:09.039936+00', 'pre'),
	('74f52826-b32f-495d-a91a-cff198637a65', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'click_whatsapp', '2026-06-06 21:38:47.334074+00', 'pre'),
	('08436779-3fb0-4e08-b23a-249892a17677', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'click_whatsapp', '2026-06-06 21:39:02.029192+00', 'pre'),
	('6d3309df-17c5-4b44-b146-f3b58b617661', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'view_stand', '2026-06-06 21:39:48.037206+00', 'pre'),
	('5ac10337-ae21-455e-94bb-934ff9cab66b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, NULL, '51a7a2c8-6d1a-4d9c-a9f6-4d9e930c7296', 'view_stand', '2026-06-06 21:39:52.388463+00', 'pre'),
	('ee65da10-94c7-4988-995e-0a7ac6531c8d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'view_stand', '2026-06-06 21:39:54.82618+00', 'pre'),
	('218afce0-b561-4f7a-b4e8-62b3b4156f5f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'view_stand', '2026-06-06 21:40:23.507423+00', 'pre'),
	('a964d96a-3d6f-42f7-9ac2-88f1da40daf3', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'f143331d-dcdf-4cbf-b9b4-7dc88e08a249', NULL, NULL, '479f7ff0-9d82-43e2-ac58-cdbdb6ea36a4', 'view_stand', '2026-06-06 21:40:56.859166+00', 'pre'),
	('1e00ea2f-779b-4bd0-8e5a-4c4ff9fbe887', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '6fbb301a-db34-4b4c-a0c6-d1f3fb0c332f', 'view_stand', '2026-06-06 21:43:47.886181+00', 'pre'),
	('2b3fb72e-db31-415b-ad51-076ab09e82e6', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '4669f4f3-d403-4bb4-9a94-f3cac777272a', '6fbb301a-db34-4b4c-a0c6-d1f3fb0c332f', 'click_instagram', '2026-06-06 21:43:52.553983+00', 'pre'),
	('74e495e3-f728-49b0-a0cf-ffad44969351', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '4e98e879-87bc-4b51-aebf-8bca06d65606', '0c30ce70-5446-4e2e-8412-0a44c8fa0ed2', 'view_stand', '2026-06-06 22:02:02.901734+00', 'pre'),
	('5fc5ca88-c5b5-47de-a1e2-7b6753b29a34', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '311020f6-97df-4c6e-866f-e5fd95841cf3', 'view_stand', '2026-06-06 22:42:48.028373+00', 'pre'),
	('0e20c1eb-6540-4a8a-89d9-7de4f8800827', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '311020f6-97df-4c6e-866f-e5fd95841cf3', 'view_stand', '2026-06-06 22:43:52.447602+00', 'pre'),
	('9bae19be-3c13-4b32-9d1f-f2595e5611e1', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '311020f6-97df-4c6e-866f-e5fd95841cf3', 'view_stand', '2026-06-06 22:44:08.501293+00', 'pre'),
	('d3065753-2b93-47d9-b25a-362a31734bbe', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '311020f6-97df-4c6e-866f-e5fd95841cf3', 'view_stand', '2026-06-06 22:44:28.128542+00', 'pre'),
	('74fc465c-45d5-48b9-b79b-0ac9fcaad453', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '311020f6-97df-4c6e-866f-e5fd95841cf3', 'view_stand', '2026-06-06 22:44:47.62347+00', 'pre'),
	('80be69ed-8237-46c8-a785-01d02b269a38', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '311020f6-97df-4c6e-866f-e5fd95841cf3', 'view_stand', '2026-06-06 22:45:00.830984+00', 'pre'),
	('191a3616-5811-44f5-9e94-9422e0a03f8d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '311020f6-97df-4c6e-866f-e5fd95841cf3', 'view_stand', '2026-06-06 22:45:03.336839+00', 'pre'),
	('b584bcc5-0985-447c-a31c-ad73df7d775f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '015070c3-3efc-4b0d-823a-a897a16af4bd', '0b5722d4-6be5-4e80-a6d9-d6131bdf0957', 'view_stand', '2026-06-06 23:27:57.451047+00', 'pre'),
	('082fb0e8-f783-4383-bf4d-d40334bf078c', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, 'b7fcbe24-be76-49a2-9eab-dd4f7ce53394', 'view_stand', '2026-06-06 23:33:47.751855+00', 'pre'),
	('7e6f3d46-b16f-4197-aeaf-247843bdf524', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, 'b7fcbe24-be76-49a2-9eab-dd4f7ce53394', 'click_instagram', '2026-06-06 23:34:19.263241+00', 'pre'),
	('7bbdc3f1-b639-4f0b-8a42-78cc0e7af475', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, 'b7fcbe24-be76-49a2-9eab-dd4f7ce53394', 'view_stand', '2026-06-06 23:34:27.616451+00', 'pre'),
	('17c7fc1f-51f4-43b9-acb7-743f5349bc3f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '670fbae1-d90d-480a-85b1-f02342c6bec4', NULL, NULL, '2b5ebcc1-e1da-4e31-bdd9-6a0f2992df52', 'view_stand', '2026-06-06 23:35:13.377907+00', 'pre'),
	('9d0f6774-3d79-48e5-9ee1-ee1bff80897a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'd20aabab-5db0-4e4d-b139-ea9d9bb8755e', 'view_stand', '2026-06-06 23:45:37.534012+00', 'pre'),
	('201e68ab-bdc2-4f62-b456-2806822447d9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'd20aabab-5db0-4e4d-b139-ea9d9bb8755e', 'click_instagram', '2026-06-06 23:45:41.129127+00', 'pre'),
	('957aa97d-b784-4456-aad7-de1a21fba685', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'd20aabab-5db0-4e4d-b139-ea9d9bb8755e', 'click_website', '2026-06-06 23:45:45.111336+00', 'pre'),
	('13f53bc1-dfef-4c80-88d6-b5fc57f57869', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'd20aabab-5db0-4e4d-b139-ea9d9bb8755e', 'click_whatsapp', '2026-06-06 23:45:56.310732+00', 'pre'),
	('e2401ab6-18b7-44f3-82a1-70c49e189199', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, 'd05c35b2-2658-4423-8939-7d62a6bc1293', 'view_stand', '2026-06-07 00:11:47.771335+00', 'pre'),
	('ce14d81f-0a1a-4358-bbef-501eaa7521c2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, NULL, '7bf7c2f2-1f21-4192-8d30-02241657bfd7', 'view_stand', '2026-06-07 00:12:14.041767+00', 'pre'),
	('3418385a-e6b5-415c-b722-720febe3e4dd', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, NULL, '7bf7c2f2-1f21-4192-8d30-02241657bfd7', 'view_stand', '2026-06-07 00:12:37.683604+00', 'pre'),
	('048851af-e9d2-4f4f-91f9-c3fdd4f50e26', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'd20aabab-5db0-4e4d-b139-ea9d9bb8755e', 'view_stand', '2026-06-07 00:46:58.683294+00', 'pre'),
	('0936ce99-0f54-4266-a2cf-3d9a98d5d8e6', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'd20aabab-5db0-4e4d-b139-ea9d9bb8755e', 'view_stand', '2026-06-07 00:47:22.90472+00', 'pre'),
	('2ae878b5-e8ae-4a23-afaf-f00c804338cc', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'a326461d-533f-4d51-8a53-e6cc77327491', NULL, NULL, '43974aa8-8547-4cff-8df6-36dc12f9c546', 'view_stand', '2026-06-07 00:53:29.996231+00', 'pre'),
	('56e70980-3ffc-4dca-bad7-1447da78bef7', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, NULL, '43974aa8-8547-4cff-8df6-36dc12f9c546', 'view_stand', '2026-06-07 00:53:35.175225+00', 'pre'),
	('39cd7de1-c6c4-4150-9e39-0199d4851dd9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, NULL, '43974aa8-8547-4cff-8df6-36dc12f9c546', 'view_stand', '2026-06-07 00:53:55.761763+00', 'pre'),
	('ad74eed7-d16c-43e3-9aec-7e591816bfb2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, '43974aa8-8547-4cff-8df6-36dc12f9c546', 'view_stand', '2026-06-07 00:54:07.078827+00', 'pre'),
	('4c372998-bdbd-47f3-8a38-054d2e540316', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fce0ea0c-792d-4dee-917e-93aef50e2363', NULL, NULL, '43974aa8-8547-4cff-8df6-36dc12f9c546', 'view_stand', '2026-06-07 00:54:55.607541+00', 'pre'),
	('e1f0a2d6-3e66-4907-abea-594052cf6647', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, '43974aa8-8547-4cff-8df6-36dc12f9c546', 'view_stand', '2026-06-07 00:54:59.780389+00', 'pre'),
	('bf964056-242c-44d3-a14c-4eeedb1449b7', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, '7206c42c-9249-4b30-b897-7202ea8fea18', 'view_stand', '2026-06-07 00:59:27.105023+00', 'pre'),
	('37beb094-b886-4a7c-8051-9e31ee9bea04', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, '7206c42c-9249-4b30-b897-7202ea8fea18', 'click_instagram', '2026-06-07 00:59:29.389632+00', 'pre'),
	('a2d18be8-2425-4b33-aec9-7c32a000e227', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, '2c48a876-6b4a-4672-8589-1fc91ae74f7b', 'view_stand', '2026-06-07 01:09:02.633583+00', 'pre'),
	('de605677-e677-4244-9863-251e846c3012', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, NULL, '2c48a876-6b4a-4672-8589-1fc91ae74f7b', 'view_stand', '2026-06-07 01:09:08.528755+00', 'pre'),
	('27ebd59c-e787-43fe-81d6-527adeff41be', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '0201663d-0407-4476-8412-f4c7c07bf9e9', 'd33e20c3-3f4f-449f-b649-a58a5ec65ac7', 'view_stand', '2026-06-07 01:12:44.771435+00', 'pre'),
	('88a8eef5-5c89-430a-a4b9-e843651d055a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '0201663d-0407-4476-8412-f4c7c07bf9e9', 'd33e20c3-3f4f-449f-b649-a58a5ec65ac7', 'view_stand', '2026-06-07 01:13:27.221017+00', 'pre'),
	('87a1fde1-0851-48ac-ac10-1061b12657c2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '0201663d-0407-4476-8412-f4c7c07bf9e9', 'd33e20c3-3f4f-449f-b649-a58a5ec65ac7', 'view_stand', '2026-06-07 01:13:41.403729+00', 'pre'),
	('5eae5b9a-cb1b-4f98-afa0-beb608bf2a54', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '0201663d-0407-4476-8412-f4c7c07bf9e9', 'd33e20c3-3f4f-449f-b649-a58a5ec65ac7', 'view_stand', '2026-06-07 01:13:57.929617+00', 'pre'),
	('64032f00-c8f9-4655-a7a2-405346aa5f0f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, NULL, '7d297ee3-c076-4bbe-ab7f-16b444085c39', 'view_stand', '2026-06-07 01:46:51.276932+00', 'pre'),
	('0f83b750-b66c-4f23-a9d2-f05cbe6751e2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, NULL, '6c6105e4-b9ac-4a07-ab8b-d1bb07ddb6b0', 'view_stand', '2026-06-07 02:04:22.109184+00', 'pre'),
	('6a394e8b-bef2-4693-9d21-b78fb4980581', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '0201663d-0407-4476-8412-f4c7c07bf9e9', 'cd8792bb-9a89-4ab7-8d0c-7d5cd70c1617', 'view_stand', '2026-06-07 02:07:31.886177+00', 'pre'),
	('5a2d66b0-fbd6-405e-ba4f-07079a4fc5d9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '0201663d-0407-4476-8412-f4c7c07bf9e9', 'cd8792bb-9a89-4ab7-8d0c-7d5cd70c1617', 'click_whatsapp', '2026-06-07 02:07:39.169429+00', 'pre'),
	('1d060c0b-abea-4ca5-833a-549e69b5ed87', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'view_stand', '2026-06-07 02:10:32.133016+00', 'pre'),
	('7a5bb1ee-d605-430a-be99-b004dae82904', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'view_stand', '2026-06-07 02:10:54.524899+00', 'pre'),
	('af9ad324-957b-494a-a707-0d3bea48a4e3', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'click_instagram', '2026-06-07 02:10:58.014688+00', 'pre'),
	('5c61596a-2c3b-4fdb-9d75-f17218b15ec4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, NULL, '6c6105e4-b9ac-4a07-ab8b-d1bb07ddb6b0', 'view_stand', '2026-06-07 02:11:21.397379+00', 'pre'),
	('59f2e711-8063-41ca-8be3-9ca654dbbd1c', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, 'c37917aa-9348-4bc9-a897-1f16a4482aea', 'a27c7a8f-b95e-477e-a29f-6209fe0cc0d2', 'view_stand', '2026-06-07 02:12:38.024766+00', 'pre'),
	('5fed7392-8a66-4d67-a6c6-cc00c4dacc03', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, NULL, '6c6105e4-b9ac-4a07-ab8b-d1bb07ddb6b0', 'view_stand', '2026-06-07 02:12:49.551617+00', 'pre'),
	('9e3105a5-3d9d-4588-8691-21f305129af6', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, 'c37917aa-9348-4bc9-a897-1f16a4482aea', 'a27c7a8f-b95e-477e-a29f-6209fe0cc0d2', 'view_stand', '2026-06-07 02:14:26.591278+00', 'pre'),
	('6e9c74e2-083d-40bd-b85d-9e76f90d139f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'view_stand', '2026-06-07 02:18:55.410585+00', 'pre'),
	('fc92fc3a-8ae7-4986-8c6d-41bc50b6804e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'click_instagram', '2026-06-07 02:19:41.009008+00', 'pre'),
	('12e8ad44-b2fa-47ed-956f-8c8d1597619b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', 'eb5e9b3f-9a23-47e1-a5cd-66c7c089e7fe', 'view_stand', '2026-06-07 02:25:07.546415+00', 'pre'),
	('ca2ca423-7bc0-4e9f-b170-95cd83db87a4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', 'eb5e9b3f-9a23-47e1-a5cd-66c7c089e7fe', 'view_stand', '2026-06-07 02:25:33.261135+00', 'pre'),
	('7c439987-a4b8-400a-8014-92bfe953442d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', 'eb5e9b3f-9a23-47e1-a5cd-66c7c089e7fe', 'view_stand', '2026-06-07 02:25:44.437841+00', 'pre'),
	('daaec177-2838-4a0d-9e71-ded6ab2f9365', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', 'eb5e9b3f-9a23-47e1-a5cd-66c7c089e7fe', 'view_stand', '2026-06-07 02:25:56.716498+00', 'pre'),
	('cc2ccf6f-e7ce-442e-b5ad-b941a2f4efc5', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'view_stand', '2026-06-07 02:26:21.27743+00', 'pre'),
	('ac0dc06b-6b44-4701-8b33-2326040ecbcf', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'click_instagram', '2026-06-07 02:26:28.534666+00', 'pre'),
	('709e8c5a-ad84-4887-a40b-d4922fb98f18', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'view_stand', '2026-06-07 02:27:22.37903+00', 'pre'),
	('cf8ac002-0873-4896-a154-918a61d93ce9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'click_instagram', '2026-06-07 02:27:30.611888+00', 'pre'),
	('1e387e63-8982-49b5-b1eb-0ba7913ddeac', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '638ac400-42c0-4171-a013-1537ab8a2ed8', 'click_instagram', '2026-06-07 02:29:33.984684+00', 'pre'),
	('bf913d41-08e2-4c99-afc4-1ab71535a996', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'a473f052-c7fd-4915-ab11-31a1e99d1615', 'view_stand', '2026-06-07 02:34:45.353842+00', 'pre'),
	('78e929f9-0183-46db-8657-f6d27eec6423', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'a473f052-c7fd-4915-ab11-31a1e99d1615', 'click_instagram', '2026-06-07 02:34:48.417223+00', 'pre'),
	('1540e43f-926a-4f63-bbdc-2d16a46ff4bc', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fce0ea0c-792d-4dee-917e-93aef50e2363', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:55:24.877549+00', 'pre'),
	('b7c14142-410e-4263-ae67-c0f8f2b04409', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '670fbae1-d90d-480a-85b1-f02342c6bec4', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:55:29.435155+00', 'pre'),
	('30827524-f3c7-400c-b8ab-ac2a78034cd1', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '450e1715-624c-4b84-8885-34507a8b032e', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:55:33.353251+00', 'pre'),
	('2979db53-e867-481a-8132-3bcd8ad8234d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:55:49.438329+00', 'pre'),
	('e01e7134-b800-4cd8-8308-265cdd2d9609', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:56:17.639666+00', 'pre'),
	('32530022-8edc-4607-9b1b-ecc7b33dbd72', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:56:26.755686+00', 'pre'),
	('4951c857-6d73-4b75-ac5c-87fc1bc19e40', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:56:32.654811+00', 'pre'),
	('b82c4cba-94e8-4d05-ad63-deeda5b9297d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:56:39.985858+00', 'pre'),
	('f4810532-7cad-475f-85ae-3a98d16d9129', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:57:02.817399+00', 'pre'),
	('a3558254-7024-4540-94ac-bd9847c10a17', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '25772fa7-486a-4de8-bb1a-7a3b737bca26', 'fbbcd31e-80f2-41e3-b079-ffa0e4e6be9b', 'view_stand', '2026-06-07 02:57:09.961397+00', 'pre'),
	('451952d6-98de-445e-9d5e-d9e1592c6b2a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, NULL, 'fa33f3ff-4d86-4800-bdfe-c4eb79fb0ad1', 'view_stand', '2026-06-07 03:06:32.836705+00', 'pre'),
	('1e13a787-2c4f-4e6f-a29d-8589a93060fa', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '7cdb9ac3-26db-436d-aa61-7ed2a03c04eb', 'fa33f3ff-4d86-4800-bdfe-c4eb79fb0ad1', 'click_instagram', '2026-06-07 03:09:51.523997+00', 'pre'),
	('4459c5ca-dd49-414c-a777-08e7addb0ac8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '7cdb9ac3-26db-436d-aa61-7ed2a03c04eb', 'fa33f3ff-4d86-4800-bdfe-c4eb79fb0ad1', 'click_whatsapp', '2026-06-07 03:10:14.628377+00', 'pre'),
	('40e91ccc-c87f-43e1-a0b4-2f9cf1664936', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '7cdb9ac3-26db-436d-aa61-7ed2a03c04eb', 'fa33f3ff-4d86-4800-bdfe-c4eb79fb0ad1', 'view_stand', '2026-06-07 03:10:19.792807+00', 'pre'),
	('0908d976-c1ee-4a40-b823-e9db7ed85d5d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'ff11e314-e7e9-42de-8254-4340be08d5c3', 'view_stand', '2026-06-07 12:02:33.351654+00', 'pre'),
	('bd27f10f-5cec-4068-876f-07805065a8c4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'ff11e314-e7e9-42de-8254-4340be08d5c3', 'view_stand', '2026-06-07 12:02:50.845264+00', 'pre'),
	('35871aeb-24e9-46c5-9eee-76a474c7a7af', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'ff11e314-e7e9-42de-8254-4340be08d5c3', 'view_stand', '2026-06-07 12:04:33.710955+00', 'pre'),
	('0d0d66fd-2569-4fa3-bcf0-ea839c382fdd', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '0bdafcc9-6671-4364-ac30-77a38207f03a', 'view_stand', '2026-06-07 15:43:09.411773+00', 'pre'),
	('3b17cbcc-c36d-4c04-822f-efb347d8ec4a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'b81fb5aa-bbc5-428b-9348-69e200f0a766', 'view_stand', '2026-06-07 16:07:22.246293+00', 'pre'),
	('1c9405e9-2f59-4bda-993c-4189d73f8919', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'b81fb5aa-bbc5-428b-9348-69e200f0a766', 'click_instagram', '2026-06-07 16:07:24.294298+00', 'pre'),
	('a77d0e1a-fb6e-4f24-91f3-83fee1e8bf58', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'cd0f669c-6550-46dd-869b-25e8d180092f', 'view_stand', '2026-06-07 17:08:46.739897+00', 'pre'),
	('eeaf5ba1-ba2d-4d7b-af5b-4bdc62011a8e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'a326461d-533f-4d51-8a53-e6cc77327491', NULL, NULL, '194f6257-64cc-450c-8f5a-e86bd862c07d', 'view_stand', '2026-06-07 17:09:03.093013+00', 'pre'),
	('47dc72d2-1bc6-4e45-9cf2-6f0946dcdeaf', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, NULL, '194f6257-64cc-450c-8f5a-e86bd862c07d', 'click_whatsapp', '2026-06-07 17:09:41.308423+00', 'pre'),
	('cfa30478-234e-4d88-979f-be93acb6f620', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, NULL, '194f6257-64cc-450c-8f5a-e86bd862c07d', 'click_whatsapp', '2026-06-07 17:10:14.479235+00', 'pre'),
	('30929765-d65e-45e1-b5ce-37ca7caa2c9f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'f7635806-1161-4271-b998-df7f1cc39a58', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '40c2e178-c9b5-4497-b6ed-ecc4c5e5d32e', 'view_stand', '2026-06-07 18:10:15.767811+00', 'pre'),
	('d6f3d60e-2c77-4744-b171-68a66bea41c2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', '40c2e178-c9b5-4497-b6ed-ecc4c5e5d32e', 'click_instagram', '2026-06-07 18:10:52.708612+00', 'pre'),
	('b736862c-dc0f-4f98-ab48-17ef5467c6c2', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fce0ea0c-792d-4dee-917e-93aef50e2363', NULL, NULL, 'd95d62c8-f362-4e90-ad20-0f25bca93566', 'view_stand', '2026-06-07 18:52:04.861774+00', 'pre'),
	('280a83cd-bd8e-44ed-95cb-e40186cc289b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, NULL, 'cf5ece57-469e-4a5a-8e55-581bb9b37fb0', 'view_stand', '2026-06-07 20:09:06.058385+00', 'pre'),
	('29db0bd3-e311-48af-a2ba-59dd8a2d6821', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'a72c13d3-b791-484c-aa67-6b04fd622b89', NULL, NULL, '6d562253-981e-4eae-8b51-18fa98218fa3', 'view_stand', '2026-06-07 20:59:00.459907+00', 'pre'),
	('63dcfe26-1ed1-4818-b359-c43ae2781ed8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '450e1715-624c-4b84-8885-34507a8b032e', NULL, '711d9f8d-23c3-4d78-90ea-398f11e9c4fb', 'b550eb40-5887-46a7-8773-ad0556ba45f9', 'view_stand', '2026-06-07 21:14:57.570876+00', 'pre'),
	('2e27feed-e522-4101-8e7a-72745bfd2118', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '450e1715-624c-4b84-8885-34507a8b032e', NULL, '711d9f8d-23c3-4d78-90ea-398f11e9c4fb', 'b550eb40-5887-46a7-8773-ad0556ba45f9', 'view_stand', '2026-06-07 21:15:01.319329+00', 'pre'),
	('df7ce7e2-c88c-4c29-8d70-229ad09f697c', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '450e1715-624c-4b84-8885-34507a8b032e', NULL, '711d9f8d-23c3-4d78-90ea-398f11e9c4fb', 'b550eb40-5887-46a7-8773-ad0556ba45f9', 'view_stand', '2026-06-07 21:21:24.920099+00', 'pre'),
	('4bb88593-20bc-4b90-aa95-ad974dc036d1', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:04:46.992845+00', 'live'),
	('a3965910-1634-43cb-a37e-8cc25bfc5ea3', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:04:47.001188+00', 'live'),
	('8f5e5b39-61b9-4a82-8332-dacd0ec61013', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:05:01.885929+00', 'live'),
	('0f306c25-0dcd-49d4-89ca-a8e27b0383c8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:05:01.889752+00', 'live'),
	('973ea509-95b6-4c7c-90e8-dbeb411e0d8f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:05:25.21387+00', 'live'),
	('60d4000b-adc1-4f40-847c-f6717abc36e9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:05:25.209256+00', 'live'),
	('89d4a708-6da4-417a-859b-a3f1abedb5ab', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:07:42.558656+00', 'live'),
	('849419cf-7280-4ca7-8244-f30fc015ffa7', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:07:42.560952+00', 'live'),
	('60d2ab16-ee50-45ab-8ddc-b9dfcdbdbac6', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:07:54.774191+00', 'live'),
	('9bce1373-0153-4e4d-b9cd-663a24024a68', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 's_mq4by6qc_3hpzeyx6', 'view_stand', '2026-06-07 22:07:54.777732+00', 'live'),
	('1dfbeefd-02b6-4a6d-8570-70c00972d8b9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'ca9d6769-1465-4b1f-97a4-428397c4532e', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-07 22:12:11.765275+00', 'pre'),
	('cff8666b-58b5-478e-80d4-119a55d14eb0', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, NULL, '483ff2c6-2595-416d-8ce1-09fe6271c928', 'view_stand', '2026-06-07 22:24:57.530795+00', 'pre'),
	('8ae9b465-ea01-437b-8f89-42a0ec08b0ff', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, NULL, '483ff2c6-2595-416d-8ce1-09fe6271c928', 'view_stand', '2026-06-07 22:25:20.372516+00', 'pre'),
	('028f9e8f-b641-4654-97e1-002670db982a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fce0ea0c-792d-4dee-917e-93aef50e2363', NULL, '399873ee-02ee-4d23-9780-723785a7491d', '41222324-850b-4b2c-beb4-beca233cfd58', 'view_stand', '2026-06-07 22:34:42.231832+00', 'pre'),
	('af5e2d66-4a2d-4302-99aa-40cbeae6580a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-07 23:39:44.182036+00', 'pre'),
	('6ee55b78-4a46-43cd-9d29-c0a6c4d158af', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', 'aed7146f-15d5-4456-8916-6da8533ed856', '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_product', '2026-06-07 23:39:52.477782+00', 'pre'),
	('47add7cf-dd5b-4ae0-aa32-bbe5ad7ab637', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-07 23:40:36.43329+00', 'pre'),
	('6bdddfae-489a-4c7c-a474-6bb8f963b877', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fce0ea0c-792d-4dee-917e-93aef50e2363', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-07 23:41:59.418362+00', 'pre'),
	('9eca674b-3905-45bd-adb7-296ab5036cdb', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'fce0ea0c-792d-4dee-917e-93aef50e2363', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'click_instagram', '2026-06-07 23:42:12.583527+00', 'pre'),
	('56abef7a-242e-4f38-aebb-4d327e21167e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-07 23:42:31.736361+00', 'pre'),
	('4e13de70-3848-44b4-9122-8595335e3f20', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'a45a98eb-e14b-4ed5-bc6b-d4e58ad5b668', 'view_stand', '2026-06-07 23:49:30.146153+00', 'pre'),
	('f9cc0b2c-2c6b-4bb2-b2eb-01a4a5ddb632', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'a45a98eb-e14b-4ed5-bc6b-d4e58ad5b668', 'view_stand', '2026-06-07 23:49:34.758388+00', 'pre'),
	('fd9eb111-3066-470c-aa08-41dcf787f6bb', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', '08cfaf69-034a-4cf7-acdb-4a9390aa60ce', '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'a45a98eb-e14b-4ed5-bc6b-d4e58ad5b668', 'view_product', '2026-06-07 23:49:41.707892+00', 'pre'),
	('4148e400-e44a-48d2-8855-450e44b5ec36', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'a45a98eb-e14b-4ed5-bc6b-d4e58ad5b668', 'click_instagram', '2026-06-07 23:49:45.390923+00', 'pre'),
	('d78652ae-d84e-44e8-ab98-2ce6b4a89073', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'ee33af04-8af0-48ec-b50e-38cb7eeffd64', 'view_stand', '2026-06-08 00:01:20.566582+00', 'pre'),
	('1d0077e4-f508-45b7-b2c7-c91f6aebd265', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'ee33af04-8af0-48ec-b50e-38cb7eeffd64', 'view_stand', '2026-06-08 00:01:28.603655+00', 'pre'),
	('b11d1928-c7d4-4b15-909a-3056fefa1ff4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', 'aed7146f-15d5-4456-8916-6da8533ed856', '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'ee33af04-8af0-48ec-b50e-38cb7eeffd64', 'view_product', '2026-06-08 00:01:32.620904+00', 'pre'),
	('744ce7c0-16ca-432d-b827-b1f138e3eb05', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '7ff353b2-aee9-4dea-9942-510092c189fe', NULL, '6c07ba73-b561-4752-ba70-15715dd3328e', '2af69999-4950-4c7f-a8e7-5f988c1d998a', 'view_stand', '2026-06-08 00:57:17.602811+00', 'pre'),
	('bdcce21e-02d1-4ccf-a17f-9d0578dc5c22', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '7ff353b2-aee9-4dea-9942-510092c189fe', NULL, '6c07ba73-b561-4752-ba70-15715dd3328e', '2af69999-4950-4c7f-a8e7-5f988c1d998a', 'view_stand', '2026-06-08 00:57:33.893668+00', 'pre'),
	('b84cc615-5049-4a66-9610-18675a727865', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '6c07ba73-b561-4752-ba70-15715dd3328e', '2af69999-4950-4c7f-a8e7-5f988c1d998a', 'view_stand', '2026-06-08 01:03:28.871093+00', 'pre'),
	('f5b62c1d-cd04-46f9-82a8-4a667dae1daf', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '7ff353b2-aee9-4dea-9942-510092c189fe', NULL, '6c07ba73-b561-4752-ba70-15715dd3328e', '2af69999-4950-4c7f-a8e7-5f988c1d998a', 'view_stand', '2026-06-08 01:03:50.292775+00', 'pre'),
	('086c837b-1296-4d7b-9428-6c09dc7c0175', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '6c07ba73-b561-4752-ba70-15715dd3328e', '2af69999-4950-4c7f-a8e7-5f988c1d998a', 'view_stand', '2026-06-08 01:04:01.753753+00', 'pre'),
	('6671a305-b233-4038-846d-e7498195a5d9', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '0201663d-0407-4476-8412-f4c7c07bf9e9', 'b99d170e-5a9e-4c6e-a6d4-0bb9929d3e6b', 'view_stand', '2026-06-08 01:39:09.538389+00', 'pre'),
	('42fd3eb1-4288-44a7-ab0d-f41bf43195b8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '7ff353b2-aee9-4dea-9942-510092c189fe', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'f1b62040-6e39-45d9-ae84-4164c830e25d', 'view_stand', '2026-06-08 02:26:40.071811+00', 'pre'),
	('426a27d1-33a1-4d24-a334-edfcb2fa559b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'f1b62040-6e39-45d9-ae84-4164c830e25d', 'view_stand', '2026-06-08 02:26:51.584635+00', 'pre'),
	('cd18325f-61b9-4c98-94b8-633baa4fe2c7', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, 'bfcd86a4-f045-4e96-b5bf-424a0b786fd0', 'view_stand', '2026-06-08 11:14:40.376282+00', 'pre'),
	('dac619d8-56e7-446c-ac3a-d60c3da3973b', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'e61e2a7d-67a8-401a-8dec-10d15df6171a', 'view_stand', '2026-06-08 18:58:22.30699+00', 'pre'),
	('822513a4-67b3-44cb-ae27-ca24e57cb596', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'e61e2a7d-67a8-401a-8dec-10d15df6171a', 'view_stand', '2026-06-08 18:58:27.477107+00', 'pre'),
	('df467429-c93c-481e-ac17-c3ee4233daf5', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '894267ed-a3b0-4582-bbd4-10dc2358fddc', 'e61e2a7d-67a8-401a-8dec-10d15df6171a', 'view_stand', '2026-06-08 18:59:06.887506+00', 'pre'),
	('49667230-b147-42f2-aa3c-e59afb43a920', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '59f00dec-f2fb-4a45-9851-b1b2c6941662', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-08 23:12:22.144559+00', 'pre'),
	('dceda078-d298-4f33-8fe3-3a6d763cb19a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '7ff353b2-aee9-4dea-9942-510092c189fe', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-08 23:13:00.749015+00', 'pre'),
	('73a7a5c4-55ae-4d9b-a2ab-e7a08187afb8', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-08 23:13:40.68933+00', 'pre'),
	('4cfdb04c-fc79-4e52-a4e1-ebf5e1dcbe45', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e3b929c4-a72e-43d9-97c0-a23fe2e1b0fd', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-08 23:14:20.191759+00', 'pre'),
	('8fd03030-c195-4932-884f-2d0ed6677472', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1cb5ed58-4a34-41fb-aafd-49c639aa1097', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-08 23:14:25.308993+00', 'pre'),
	('455fd4cb-af29-4914-9572-85586ff990ee', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-08 23:14:32.496693+00', 'pre'),
	('d44c4cca-14e8-4af5-b208-da99651bce43', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '3274637a-a873-41c5-9b60-84011dd5a27e', '6fe21120-00e4-43f5-8538-c18fe24898eb', 'view_stand', '2026-06-08 23:15:21.549658+00', 'pre'),
	('8307ab1b-1a0c-433e-9885-ffe3d8ec1e5c', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e81c7183-37d2-4bfe-97e0-0147c735d961', NULL, '0b7919d4-d574-4906-8519-a711c6e51fcb', '3c3e054a-4cde-4116-877e-936db3b1201e', 'view_stand', '2026-06-09 00:15:00.600467+00', 'pre'),
	('d386e4c5-391e-4abb-8a9d-acabdf6c2a78', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, NULL, '7e40fe0f-9b33-4eb0-b430-397178ab5f8a', 'view_stand', '2026-06-09 00:31:33.142908+00', 'pre'),
	('41757f74-5721-4676-97da-3b7e1d14769f', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'ca9d6769-1465-4b1f-97a4-428397c4532e', NULL, NULL, '7e40fe0f-9b33-4eb0-b430-397178ab5f8a', 'view_stand', '2026-06-09 00:31:54.090385+00', 'pre'),
	('b8476915-3a8c-4bed-8370-6728d89a108a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'bcd5378c-10e6-463b-95f5-b1ea3989d100', 'view_stand', '2026-06-09 02:04:10.96516+00', 'live'),
	('492b98d3-3e2b-43e4-b38f-60ceab823d29', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '8ea1fc1c-05f0-4514-963d-94653343d30e', 'bcd5378c-10e6-463b-95f5-b1ea3989d100', 'view_stand', '2026-06-09 02:04:10.961245+00', 'live'),
	('359bbbef-d2cd-40f6-8715-e5fa35cad2cf', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, NULL, '893e8e2c-7d20-4ab0-b048-83b757a10a38', 'view_stand', '2026-06-09 11:33:40.90473+00', 'pre'),
	('e555463f-129a-476b-b7b6-ff68a52e04bd', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, '893e8e2c-7d20-4ab0-b048-83b757a10a38', 'view_stand', '2026-06-09 11:33:50.48382+00', 'pre'),
	('1c52a8e5-b8e3-4e11-8a80-01005199ffc3', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '6256cd1b-3982-479b-a19c-3a56149192af', NULL, NULL, '893e8e2c-7d20-4ab0-b048-83b757a10a38', 'view_stand', '2026-06-09 11:34:03.413783+00', 'pre'),
	('04c369c6-eaeb-4e6b-91d6-6195b4b04461', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, NULL, '893e8e2c-7d20-4ab0-b048-83b757a10a38', 'view_stand', '2026-06-09 11:34:11.574047+00', 'pre'),
	('095256dd-bda9-4637-b0ee-8b828be83ef4', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '7ff353b2-aee9-4dea-9942-510092c189fe', NULL, NULL, '893e8e2c-7d20-4ab0-b048-83b757a10a38', 'view_stand', '2026-06-09 11:34:23.698736+00', 'pre'),
	('e4939f9c-89ab-4adf-a2a6-3e6f9a0f68eb', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1dd6ffc4-5108-49a5-be6b-0f8258f2e01f', NULL, NULL, '893e8e2c-7d20-4ab0-b048-83b757a10a38', 'view_stand', '2026-06-09 11:34:26.590527+00', 'pre'),
	('60069ee9-d3bf-4061-87dc-cb008255a96d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, NULL, '893e8e2c-7d20-4ab0-b048-83b757a10a38', 'click_instagram', '2026-06-09 11:34:39.997602+00', 'pre'),
	('75286dc2-90ab-48c5-bbd1-90ae88600efa', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '2e35046d-1883-42f6-a5b9-1f7cfb183031', NULL, 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', '34578261-4b25-49e0-be0e-189fd9fec075', 'view_stand', '2026-06-09 12:32:47.481953+00', 'pre'),
	('312b09c9-372a-4e03-a245-e61553ff1c1d', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e81c7183-37d2-4bfe-97e0-0147c735d961', NULL, 'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3', '34578261-4b25-49e0-be0e-189fd9fec075', 'view_stand', '2026-06-09 12:33:05.841677+00', 'pre'),
	('6034b59c-1b36-4e8e-a8a5-db3f07aefe7a', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', 'e9dc9ccd-c85b-4e63-bd5d-93a2c2d76555', NULL, '3931a5c6-a1a2-4bde-9605-3960b2eda493', '7ddf2dbe-9d75-467b-9a69-23c1b0a52a20', 'view_stand', '2026-06-09 14:21:57.750467+00', 'pre'),
	('a1de3219-3b4d-4ba4-999f-60489b86882e', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '72eb87f5-b47e-4d39-b401-ec3d6bbeafe2', NULL, '3931a5c6-a1a2-4bde-9605-3960b2eda493', '7ddf2dbe-9d75-467b-9a69-23c1b0a52a20', 'view_stand', '2026-06-09 14:22:04.804727+00', 'pre'),
	('a386d64b-fb45-494a-b26a-7b763b892ad3', 'aaba4ed3-e2e0-48be-84cc-3e695cdec759', '1d9d24c9-5d02-4294-bca4-3a362524bcce', NULL, '3931a5c6-a1a2-4bde-9605-3960b2eda493', '7ddf2dbe-9d75-467b-9a69-23c1b0a52a20', 'view_stand', '2026-06-09 14:22:14.370789+00', 'pre');


--
-- PostgreSQL database dump complete
--

-- \unrestrict TrliI5lvqJIXOyVz1AHqs8x5SlWHVgWahzefWlKyC9g89Gb9VDKWC1dOYHMx9Vy

RESET ALL;
