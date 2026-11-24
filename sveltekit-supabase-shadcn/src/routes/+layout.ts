import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import { isSupabaseConfigured } from '#lib/supabase/config.js';
import { createLocalAuthClient } from '#lib/supabase/local-client.js';
import { toAppSession } from '#lib/supabase/map.js';
import type { Database } from '#lib/types/database.types.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	// Tells SvelteKit this data depends on the Supabase auth state so that
	// `invalidate('supabase:auth')` re-runs these load functions.
	depends('supabase:auth');

	// Fallback mode: there is no Supabase project, so auth is handled entirely by
	// the local backend and the browser only needs a no-op auth surface.
	if (!isSupabaseConfigured()) {
		return {
			supabase: createLocalAuthClient() as unknown as SupabaseClient<Database>,
			session: null,
			user: data.user
		};
	}

	const supabase = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch }
			})
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch },
				cookies: {
					// Read-only: writing happens in `hooks.server.ts`.
					getAll: () => data.cookies
				}
			});

	const {
		data: { session }
	} = await supabase.auth.getSession();

	// `user` comes from the server layout load (validated with `getUser()`); it is
	// re-exposed here so every route receives it via the root layout data.
	return {
		supabase,
		session: session ? toAppSession(session) : null,
		user: data.user
	};
};
