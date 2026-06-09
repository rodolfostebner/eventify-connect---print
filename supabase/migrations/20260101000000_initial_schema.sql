


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."get_exhibitor_visit_summary"("p_exhibitor_id" "uuid") RETURNS TABLE("action" "text", "count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT action, COUNT(*) AS count
  FROM visits
  WHERE exhibitor_id = p_exhibitor_id
  GROUP BY action;
$$;


ALTER FUNCTION "public"."get_exhibitor_visit_summary"("p_exhibitor_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "bg_color" "text" DEFAULT '#ef4444'::"text",
    "text_color" "text" DEFAULT '#ffffff'::"text",
    "icon" "text" DEFAULT 'megaphone'::"text",
    "image_url" "text",
    "audio_url" "text",
    "show_duration_sec" integer DEFAULT 15,
    "target_tv" boolean DEFAULT true NOT NULL,
    "target_app_popup" boolean DEFAULT false NOT NULL,
    "target_push" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "user_id" "text",
    "user_name" "text",
    "user_email" "text",
    "action" "text" NOT NULL,
    "changes" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid",
    "user_id" "text",
    "text" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "is_predefined" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "event_name" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluation_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "weight" numeric(3,2) DEFAULT 1.00 NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."evaluation_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "exhibitor_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL,
    "stars" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "comment_status" "text" DEFAULT 'approved'::"text" NOT NULL,
    CONSTRAINT "evaluations_comment_status_check" CHECK (("comment_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "evaluations_stars_check" CHECK ((("stars" >= 1) AND ("stars" <= 5)))
);


ALTER TABLE "public"."evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "status" "text" DEFAULT 'pre'::"text" NOT NULL,
    "date" timestamp with time zone,
    "logo_url" "text",
    "primary_color" "text" DEFAULT '#000000'::"text",
    "secondary_color" "text" DEFAULT '#ffffff'::"text",
    "bg_type" "text" DEFAULT 'color'::"text",
    "bg_value" "text",
    "bg_gradient_from" "text",
    "bg_gradient_to" "text",
    "bg_pattern_bg" "text",
    "bg_pattern_fg" "text",
    "tv_bg_type" "text",
    "tv_bg_value" "text",
    "tv_bg_gradient_from" "text",
    "tv_bg_gradient_to" "text",
    "tv_bg_pattern_bg" "text",
    "tv_bg_pattern_fg" "text",
    "tv_primary_color" "text",
    "tv_secondary_color" "text",
    "tv_show_ranking" boolean DEFAULT true,
    "owner_text" "text",
    "owner_photo" "text",
    "post_event_message" "text",
    "summary_file_url" "text",
    "app_description" "text",
    "app_whatsapp" "text",
    "app_instagram" "text",
    "app_website" "text",
    "app_logo" "text",
    "comment_moderation_enabled" boolean DEFAULT true,
    "has_official_photos" boolean DEFAULT false,
    "upload_source" "text" DEFAULT 'both'::"text",
    "interactions_paused" boolean DEFAULT false,
    "countdown_active" boolean DEFAULT false,
    "services" "jsonb" DEFAULT '[]'::"jsonb",
    "custom_comments" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "admin_emails" "text"[],
    "public_evaluation_weight" numeric(3,2) DEFAULT 0.40 NOT NULL,
    "juror_evaluation_weight" numeric(3,2) DEFAULT 0.60 NOT NULL,
    "exhibitors_estimation" integer DEFAULT 0 NOT NULL,
    "active_announcement_id" "uuid",
    "announcement_trigger_at" timestamp with time zone,
    "custom_sounds" "jsonb" DEFAULT '[]'::"jsonb",
    "active" boolean DEFAULT true NOT NULL,
    "tv_raffle_prize_id" "uuid",
    "tv_raffle_state" "text" DEFAULT 'idle'::"text",
    CONSTRAINT "events_status_check" CHECK (("status" = ANY (ARRAY['pre'::"text", 'live'::"text", 'post'::"text"]))),
    CONSTRAINT "events_tv_raffle_state_check" CHECK (("tv_raffle_state" = ANY (ARRAY['idle'::"text", 'showing_prize'::"text", 'showing_winner'::"text"])))
);

ALTER TABLE ONLY "public"."events" REPLICA IDENTITY FULL;


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exhibitor_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "icon" "text" DEFAULT '🏷️'::"text" NOT NULL,
    "color" "text" DEFAULT '#94949E'::"text" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."exhibitor_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exhibitors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "number" integer DEFAULT 1 NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "photo_url" "text",
    "message" "text",
    "final_message" "text",
    "instagram_url" "text",
    "whatsapp" "text",
    "website_url" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "category" "text" DEFAULT 'Outros'::"text" NOT NULL,
    "category_id" "uuid",
    "tagline" "text",
    "ano" "text",
    "turma" "text",
    "members" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    CONSTRAINT "exhibitors_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"]))),
    CONSTRAINT "exhibitors_tagline_check" CHECK (("char_length"("tagline") <= 50))
);


ALTER TABLE "public"."exhibitors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."juror_evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "exhibitor_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "score" numeric(3,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "juror_evaluations_score_check" CHECK ((("score" >= 0.00) AND ("score" <= 5.00)))
);


ALTER TABLE "public"."juror_evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "exhibitor_id" "uuid" NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_phone" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'novo'::"text" NOT NULL,
    CONSTRAINT "leads_status_check" CHECK (("status" = ANY (ARRAY['novo'::"text", 'atendido'::"text", 'pago'::"text", 'retirado'::"text"])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "link" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "photos" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "instagram_url" "text",
    "whatsapp" "text",
    "website_url" "text",
    "order_index" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "type" "text" DEFAULT 'patrocinador'::"text" NOT NULL,
    "sponsorship_value" numeric(12,2),
    "show_on_tv" boolean DEFAULT true NOT NULL,
    "show_on_feed" boolean DEFAULT true NOT NULL,
    "logo_url" "text",
    "tiktok_url" "text",
    "youtube_url" "text",
    "email" "text",
    "phone" "text",
    CONSTRAINT "partners_type_check" CHECK (("type" = ANY (ARRAY['patrocinador'::"text", 'apoiador'::"text", 'servico'::"text"])))
);


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photo_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid",
    "user_id" "text",
    "image_url" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "is_official" boolean DEFAULT false,
    "printed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."print_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "print_order_id" "uuid",
    "post_id" "uuid"
);


ALTER TABLE "public"."print_order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."print_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "user_email" "text",
    "option" "text" DEFAULT 'photos_only'::"text" NOT NULL,
    "photo_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "print_orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."print_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exhibitor_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2),
    "photos" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."raffle_prizes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "order_index" integer DEFAULT 0 NOT NULL,
    "winner_ticket_id" "uuid",
    "drawn_at" timestamp with time zone,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."raffle_prizes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."raffle_tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."raffle_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid",
    "user_id" "text",
    "type" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_email_roles" (
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "event_id" "uuid",
    "exhibitor_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_email_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'event_admin'::"text", 'avaliador'::"text", 'expositor'::"text", 'participant'::"text"])))
);


ALTER TABLE "public"."user_email_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "display_name" "text",
    "photo_url" "text",
    "role" "text" DEFAULT 'participant'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "supabase_user_id" "uuid",
    "event_id" "uuid",
    "exhibitor_id" "uuid",
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'event_admin'::"text", 'avaliador'::"text", 'expositor'::"text", 'participant'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_exhibitor_rankings" WITH ("security_invoker"='true') AS
 WITH "public_scores" AS (
         SELECT "evaluations"."exhibitor_id",
            ("avg"("evaluations"."stars"))::numeric(3,2) AS "avg_public_stars",
            "count"("evaluations"."id") AS "total_public_votes"
           FROM "public"."evaluations"
          GROUP BY "evaluations"."exhibitor_id"
        ), "juror_scores" AS (
         SELECT "je"."exhibitor_id",
                CASE
                    WHEN ("sum"("ec"."weight") > (0)::numeric) THEN (("sum"(("je"."score" * "ec"."weight")) / "sum"("ec"."weight")))::numeric(3,2)
                    ELSE 0.00
                END AS "avg_juror_score",
            "count"(DISTINCT "je"."user_id") AS "total_jurors_voted"
           FROM ("public"."juror_evaluations" "je"
             JOIN "public"."evaluation_categories" "ec" ON (("ec"."id" = "je"."category_id")))
          GROUP BY "je"."exhibitor_id"
        )
 SELECT "ex"."id" AS "exhibitor_id",
    "ex"."name" AS "exhibitor_name",
    "ex"."number" AS "exhibitor_number",
    "ex"."event_id",
    COALESCE("p"."avg_public_stars", 0.00) AS "public_score",
    COALESCE("j"."avg_juror_score", 0.00) AS "juror_score",
    (((COALESCE("p"."avg_public_stars", 0.00) * "ev"."public_evaluation_weight") + (COALESCE("j"."avg_juror_score", 0.00) * "ev"."juror_evaluation_weight")))::numeric(3,2) AS "final_score",
    COALESCE("p"."total_public_votes", (0)::bigint) AS "public_votes_count",
    COALESCE("j"."total_jurors_voted", (0)::bigint) AS "jurors_voted_count"
   FROM ((("public"."exhibitors" "ex"
     JOIN "public"."events" "ev" ON (("ev"."id" = "ex"."event_id")))
     LEFT JOIN "public_scores" "p" ON (("p"."exhibitor_id" = "ex"."id")))
     LEFT JOIN "juror_scores" "j" ON (("j"."exhibitor_id" = "ex"."id")))
  WHERE ("ex"."status" = 'active'::"text")
  ORDER BY ((((COALESCE("p"."avg_public_stars", 0.00) * "ev"."public_evaluation_weight") + (COALESCE("j"."avg_juror_score", 0.00) * "ev"."juror_evaluation_weight")))::numeric(3,2)) DESC, "ex"."number";


ALTER VIEW "public"."view_exhibitor_rankings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "exhibitor_id" "uuid",
    "product_id" "uuid",
    "user_id" "text",
    "session_id" "text",
    "action" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "event_status" "text",
    CONSTRAINT "visits_action_check" CHECK (("action" = ANY (ARRAY['view_stand'::"text", 'view_product'::"text", 'click_lead'::"text", 'click_instagram'::"text", 'click_whatsapp'::"text", 'click_website'::"text", 'share'::"text"]))),
    CONSTRAINT "visits_event_status_check" CHECK (("event_status" = ANY (ARRAY['pre'::"text", 'live'::"text", 'post'::"text"])))
);


ALTER TABLE "public"."visits" OWNER TO "postgres";


ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_leads"
    ADD CONSTRAINT "contact_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_categories"
    ADD CONSTRAINT "evaluation_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_exhibitor_id_user_id_key" UNIQUE ("exhibitor_id", "user_id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."exhibitor_categories"
    ADD CONSTRAINT "exhibitor_categories_event_id_name_key" UNIQUE ("event_id", "name");



ALTER TABLE ONLY "public"."exhibitor_categories"
    ADD CONSTRAINT "exhibitor_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exhibitors"
    ADD CONSTRAINT "exhibitors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."juror_evaluations"
    ADD CONSTRAINT "juror_evaluations_exhibitor_id_user_id_category_id_key" UNIQUE ("exhibitor_id", "user_id", "category_id");



ALTER TABLE ONLY "public"."juror_evaluations"
    ADD CONSTRAINT "juror_evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_views"
    ADD CONSTRAINT "photo_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_views"
    ADD CONSTRAINT "photo_views_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."print_order_items"
    ADD CONSTRAINT "print_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."print_orders"
    ADD CONSTRAINT "print_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."raffle_prizes"
    ADD CONSTRAINT "raffle_prizes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."raffle_tickets"
    ADD CONSTRAINT "raffle_tickets_event_id_user_id_key" UNIQUE ("event_id", "user_id");



ALTER TABLE ONLY "public"."raffle_tickets"
    ADD CONSTRAINT "raffle_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_post_id_user_id_type_key" UNIQUE ("post_id", "user_id", "type");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_email_roles"
    ADD CONSTRAINT "user_email_roles_pkey" PRIMARY KEY ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_supabase_user_id_key" UNIQUE ("supabase_user_id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("id");



CREATE INDEX "announcements_event_id_idx" ON "public"."announcements" USING "btree" ("event_id");



CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs" USING "btree" ("created_at");



CREATE INDEX "audit_logs_event_idx" ON "public"."audit_logs" USING "btree" ("event_id");



CREATE INDEX "eval_categories_event_idx" ON "public"."evaluation_categories" USING "btree" ("event_id");



CREATE INDEX "evaluations_event_idx" ON "public"."evaluations" USING "btree" ("event_id");



CREATE INDEX "evaluations_exhibitor_idx" ON "public"."evaluations" USING "btree" ("exhibitor_id");



CREATE INDEX "evaluations_user_idx" ON "public"."evaluations" USING "btree" ("user_id");



CREATE INDEX "exhibitors_category_idx" ON "public"."exhibitors" USING "btree" ("category");



CREATE INDEX "exhibitors_event_id_idx" ON "public"."exhibitors" USING "btree" ("event_id");



CREATE INDEX "exhibitors_status_idx" ON "public"."exhibitors" USING "btree" ("status");



CREATE INDEX "idx_comments_post" ON "public"."comments" USING "btree" ("post_id");



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("user_id", "read");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_posts_event" ON "public"."posts" USING "btree" ("event_id");



CREATE INDEX "idx_posts_status" ON "public"."posts" USING "btree" ("status");



CREATE INDEX "idx_print_orders_event_id" ON "public"."print_orders" USING "btree" ("event_id");



CREATE INDEX "idx_print_orders_status" ON "public"."print_orders" USING "btree" ("status");



CREATE INDEX "idx_reactions_post" ON "public"."reactions" USING "btree" ("post_id");



CREATE INDEX "juror_evals_category_idx" ON "public"."juror_evaluations" USING "btree" ("category_id");



CREATE INDEX "juror_evals_event_idx" ON "public"."juror_evaluations" USING "btree" ("event_id");



CREATE INDEX "juror_evals_exhibitor_idx" ON "public"."juror_evaluations" USING "btree" ("exhibitor_id");



CREATE INDEX "juror_evals_user_idx" ON "public"."juror_evaluations" USING "btree" ("user_id");



CREATE INDEX "leads_exhibitor_idx" ON "public"."leads" USING "btree" ("exhibitor_id");



CREATE INDEX "leads_product_idx" ON "public"."leads" USING "btree" ("product_id");



CREATE INDEX "leads_status_idx" ON "public"."leads" USING "btree" ("status");



CREATE INDEX "partners_active_idx" ON "public"."partners" USING "btree" ("active");



CREATE INDEX "partners_event_id_idx" ON "public"."partners" USING "btree" ("event_id");



CREATE INDEX "partners_type_idx" ON "public"."partners" USING "btree" ("type");



CREATE INDEX "products_active_idx" ON "public"."products" USING "btree" ("active");



CREATE INDEX "products_exhibitor_idx" ON "public"."products" USING "btree" ("exhibitor_id");



CREATE INDEX "raffle_tickets_event_idx" ON "public"."raffle_tickets" USING "btree" ("event_id");



CREATE INDEX "raffle_tickets_user_idx" ON "public"."raffle_tickets" USING "btree" ("user_id");



CREATE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");



CREATE INDEX "users_event_id_idx" ON "public"."users" USING "btree" ("event_id");



CREATE INDEX "users_exhibitor_id_idx" ON "public"."users" USING "btree" ("exhibitor_id");



CREATE INDEX "users_role_idx" ON "public"."users" USING "btree" ("role");



CREATE INDEX "users_supabase_user_id_idx" ON "public"."users" USING "btree" ("supabase_user_id");



CREATE INDEX "visits_action_idx" ON "public"."visits" USING "btree" ("action");



CREATE INDEX "visits_created_at_idx" ON "public"."visits" USING "btree" ("created_at");



CREATE INDEX "visits_event_idx" ON "public"."visits" USING "btree" ("event_id");



CREATE INDEX "visits_event_status_idx" ON "public"."visits" USING "btree" ("event_status");



CREATE INDEX "visits_exhibitor_idx" ON "public"."visits" USING "btree" ("exhibitor_id");



CREATE INDEX "visits_product_idx" ON "public"."visits" USING "btree" ("product_id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluation_categories"
    ADD CONSTRAINT "evaluation_categories_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."exhibitors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_active_announcement_id_fkey" FOREIGN KEY ("active_announcement_id") REFERENCES "public"."announcements"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_tv_raffle_prize_id_fkey" FOREIGN KEY ("tv_raffle_prize_id") REFERENCES "public"."raffle_prizes"("id");



ALTER TABLE ONLY "public"."exhibitor_categories"
    ADD CONSTRAINT "exhibitor_categories_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exhibitors"
    ADD CONSTRAINT "exhibitors_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."exhibitor_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."exhibitors"
    ADD CONSTRAINT "exhibitors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."juror_evaluations"
    ADD CONSTRAINT "juror_evaluations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."evaluation_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."juror_evaluations"
    ADD CONSTRAINT "juror_evaluations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."juror_evaluations"
    ADD CONSTRAINT "juror_evaluations_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."exhibitors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."juror_evaluations"
    ADD CONSTRAINT "juror_evaluations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."exhibitors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_views"
    ADD CONSTRAINT "photo_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_views"
    ADD CONSTRAINT "photo_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."print_order_items"
    ADD CONSTRAINT "print_order_items_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");



ALTER TABLE ONLY "public"."print_order_items"
    ADD CONSTRAINT "print_order_items_print_order_id_fkey" FOREIGN KEY ("print_order_id") REFERENCES "public"."print_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."exhibitors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."raffle_prizes"
    ADD CONSTRAINT "raffle_prizes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."raffle_prizes"
    ADD CONSTRAINT "raffle_prizes_winner_ticket_id_fkey" FOREIGN KEY ("winner_ticket_id") REFERENCES "public"."raffle_tickets"("id");



ALTER TABLE ONLY "public"."raffle_tickets"
    ADD CONSTRAINT "raffle_tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."raffle_tickets"
    ADD CONSTRAINT "raffle_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_email_roles"
    ADD CONSTRAINT "user_email_roles_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_email_roles"
    ADD CONSTRAINT "user_email_roles_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."exhibitors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."exhibitors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_supabase_user_id_fkey" FOREIGN KEY ("supabase_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."exhibitors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Allow all" ON "public"."users" USING (true) WITH CHECK (true);



CREATE POLICY "Allow anyone to delete comments" ON "public"."comments" FOR DELETE USING (true);



CREATE POLICY "Allow anyone to delete events" ON "public"."events" FOR DELETE USING (true);



CREATE POLICY "Allow anyone to delete posts" ON "public"."posts" FOR DELETE USING (true);



CREATE POLICY "Allow anyone to insert comments" ON "public"."comments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anyone to insert posts" ON "public"."posts" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anyone to manage reactions" ON "public"."reactions" USING (true);



CREATE POLICY "Allow anyone to update comments" ON "public"."comments" FOR UPDATE USING (true);



CREATE POLICY "Allow anyone to update events" ON "public"."events" FOR UPDATE USING (true);



CREATE POLICY "Allow anyone to update posts" ON "public"."posts" FOR UPDATE USING (true);



CREATE POLICY "Allow anyone to view all comments" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Allow anyone to view all posts" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Allow anyone to view events" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Allow anyone to view reactions" ON "public"."reactions" FOR SELECT USING (true);



CREATE POLICY "Allow insert for authenticated users" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow select for authenticated users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public can view users" ON "public"."users" FOR SELECT USING (true);



ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "announcements_all" ON "public"."announcements" USING (true) WITH CHECK (true);



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_logs_all" ON "public"."audit_logs" USING (true) WITH CHECK (true);



CREATE POLICY "comments_all" ON "public"."comments" USING (true) WITH CHECK (true);



ALTER TABLE "public"."contact_leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contact_leads_all" ON "public"."contact_leads" USING (true) WITH CHECK (true);



CREATE POLICY "eval_categories_all" ON "public"."evaluation_categories" USING (true) WITH CHECK (true);



ALTER TABLE "public"."evaluation_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "evaluations_all" ON "public"."evaluations" USING (true) WITH CHECK (true);



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_all" ON "public"."events" TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "events_insert_authenticated" ON "public"."events" FOR INSERT WITH CHECK (true);



CREATE POLICY "events_public_select" ON "public"."events" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "events_select_public" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "events_update_authenticated" ON "public"."events" FOR UPDATE USING (true);



ALTER TABLE "public"."exhibitor_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exhibitor_categories: acesso total" ON "public"."exhibitor_categories" USING (true) WITH CHECK (true);



ALTER TABLE "public"."exhibitors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exhibitors_all" ON "public"."exhibitors" USING (true) WITH CHECK (true);



CREATE POLICY "juror_evals_all" ON "public"."juror_evaluations" USING (true) WITH CHECK (true);



ALTER TABLE "public"."juror_evaluations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_all" ON "public"."leads" USING (true) WITH CHECK (true);



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_insert_any" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "notifications_select_any" ON "public"."notifications" FOR SELECT USING (true);



CREATE POLICY "notifications_update_any" ON "public"."notifications" FOR UPDATE USING (true);



ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "partners_all" ON "public"."partners" USING (true) WITH CHECK (true);



CREATE POLICY "photo_views_all" ON "public"."photo_views" USING (true) WITH CHECK (true);



ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "posts_all" ON "public"."posts" USING (true) WITH CHECK (true);



ALTER TABLE "public"."print_order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."print_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "print_orders_delete_any" ON "public"."print_orders" FOR DELETE USING (true);



CREATE POLICY "print_orders_insert_any" ON "public"."print_orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "print_orders_select_any" ON "public"."print_orders" FOR SELECT USING (true);



CREATE POLICY "print_orders_update_any" ON "public"."print_orders" FOR UPDATE USING (true);



ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "products_all" ON "public"."products" USING (true) WITH CHECK (true);



ALTER TABLE "public"."raffle_prizes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "raffle_prizes_delete" ON "public"."raffle_prizes" FOR DELETE USING (true);



CREATE POLICY "raffle_prizes_insert" ON "public"."raffle_prizes" FOR INSERT WITH CHECK (true);



CREATE POLICY "raffle_prizes_select" ON "public"."raffle_prizes" FOR SELECT USING (true);



CREATE POLICY "raffle_prizes_update" ON "public"."raffle_prizes" FOR UPDATE USING (true);



ALTER TABLE "public"."raffle_tickets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "raffle_tickets_all" ON "public"."raffle_tickets" USING (true) WITH CHECK (true);



CREATE POLICY "reactions_all" ON "public"."reactions" USING (true) WITH CHECK (true);



ALTER TABLE "public"."user_email_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_email_roles_all" ON "public"."user_email_roles" USING (true) WITH CHECK (true);



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_all" ON "public"."users" USING (true) WITH CHECK (true);



CREATE POLICY "users_select_public" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "users_update_any" ON "public"."users" FOR UPDATE USING (true);



CREATE POLICY "users_upsert_any" ON "public"."users" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."visits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "visits_all" ON "public"."visits" USING (true) WITH CHECK (true);



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_exhibitor_visit_summary"("p_exhibitor_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_exhibitor_visit_summary"("p_exhibitor_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_exhibitor_visit_summary"("p_exhibitor_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."contact_leads" TO "anon";
GRANT ALL ON TABLE "public"."contact_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_leads" TO "service_role";



GRANT ALL ON TABLE "public"."evaluation_categories" TO "anon";
GRANT ALL ON TABLE "public"."evaluation_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluation_categories" TO "service_role";



GRANT ALL ON TABLE "public"."evaluations" TO "anon";
GRANT ALL ON TABLE "public"."evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."exhibitor_categories" TO "anon";
GRANT ALL ON TABLE "public"."exhibitor_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."exhibitor_categories" TO "service_role";



GRANT ALL ON TABLE "public"."exhibitors" TO "anon";
GRANT ALL ON TABLE "public"."exhibitors" TO "authenticated";
GRANT ALL ON TABLE "public"."exhibitors" TO "service_role";



GRANT ALL ON TABLE "public"."juror_evaluations" TO "anon";
GRANT ALL ON TABLE "public"."juror_evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."juror_evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."partners" TO "anon";
GRANT ALL ON TABLE "public"."partners" TO "authenticated";
GRANT ALL ON TABLE "public"."partners" TO "service_role";



GRANT ALL ON TABLE "public"."photo_views" TO "anon";
GRANT ALL ON TABLE "public"."photo_views" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_views" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."print_order_items" TO "anon";
GRANT ALL ON TABLE "public"."print_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."print_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."print_orders" TO "anon";
GRANT ALL ON TABLE "public"."print_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."print_orders" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."raffle_prizes" TO "anon";
GRANT ALL ON TABLE "public"."raffle_prizes" TO "authenticated";
GRANT ALL ON TABLE "public"."raffle_prizes" TO "service_role";



GRANT ALL ON TABLE "public"."raffle_tickets" TO "anon";
GRANT ALL ON TABLE "public"."raffle_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."raffle_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."reactions" TO "anon";
GRANT ALL ON TABLE "public"."reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."reactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_email_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_email_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_email_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."view_exhibitor_rankings" TO "anon";
GRANT ALL ON TABLE "public"."view_exhibitor_rankings" TO "authenticated";
GRANT ALL ON TABLE "public"."view_exhibitor_rankings" TO "service_role";



GRANT ALL ON TABLE "public"."visits" TO "anon";
GRANT ALL ON TABLE "public"."visits" TO "authenticated";
GRANT ALL ON TABLE "public"."visits" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







