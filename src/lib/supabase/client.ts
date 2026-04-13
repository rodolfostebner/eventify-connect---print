/**
 * supabase.ts
 *
 * Supabase client stub.
 *
 * The package `@supabase/supabase-js` is already installed.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
 * to activate a real Supabase connection.
 *
 * Currently the app uses mockFirestore for all data. When you are
 * ready to migrate:
 *   1. Fill in .env with your Supabase project credentials.
 *   2. Replace service function bodies in src/services/ with
 *      Supabase equivalents using this `supabase` client.
 *   3. No changes needed in pages or components.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client instance.
 * Will be `null` if env variables are not configured — the app
 * will continue using the mock layer in that case.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (supabase) {
  console.log('[Supabase] Client initialized — real backend is ACTIVE.');
} else {
  console.log('[Supabase] Env vars not set — running with mock data layer.');
}
