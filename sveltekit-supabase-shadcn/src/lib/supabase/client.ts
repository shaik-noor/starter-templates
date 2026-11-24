import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import { isSupabaseConfigured } from '#lib/supabase/config.js';
import { createLocalAuthClient } from '#lib/supabase/local-client.js';
import type { Database } from '#lib/types/database.types.js';

/**
 * Creates a Supabase client for use in the browser.
 *
 * Auth is cookie-based: `@supabase/ssr` reads and writes the session cookies
 * that the server created, so the browser and server stay in sync.
 */
export const createClient = (): SupabaseClient<Database> =>
	isSupabaseConfigured()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY)
		: (createLocalAuthClient() as unknown as SupabaseClient<Database>);
