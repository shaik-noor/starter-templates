import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';

/**
 * Whether a Supabase project is configured.
 *
 * When this is `false` the app falls back to the local SQLite backend so it can
 * be developed and tested end-to-end without any cloud setup.
 */
export const isSupabaseConfigured = (): boolean =>
	Boolean(PUBLIC_SUPABASE_URL.trim() && PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim());
