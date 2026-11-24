import { createServerClient } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import { isSupabaseConfigured } from '#lib/supabase/config.js';
import { toAppSession, toAppUser } from '#lib/supabase/map.js';
import type { Database } from '#lib/types/database.types.js';
import { createLocalBackend } from '#lib/server/local-db.js';
import type { AppBackend } from '#lib/types/app.js';

/**
 * Builds the request-scoped backend.
 *
 * Supabase is used whenever a project is configured; otherwise the app falls
 * back to the local SQLite implementation so it still runs full-stack.
 */
export const createBackend = (cookies: Cookies): AppBackend =>
	isSupabaseConfigured()
		? createSupabaseBackend(
				createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
					cookies: {
						getAll: () => cookies.getAll(),
						/**
						 * SvelteKit's `cookies.set` requires `path` to be set explicitly.
						 */
						setAll: (cookiesToSet) => {
							cookiesToSet.forEach(({ name, value, options }) => {
								cookies.set(name, value, { ...options, path: '/' });
							});
						}
					}
				})
			)
		: createLocalBackend(cookies);

function createSupabaseBackend(supabase: SupabaseClient<Database>): AppBackend {
	return {
		mode: 'supabase',

		async getSession() {
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (!session) {
				return { session: null, user: null };
			}

			// Unlike `getSession()`, which returns the session _without_ validating
			// the JWT, `getUser()` checks it against the Auth server first.
			const {
				data: { user },
				error
			} = await supabase.auth.getUser();

			if (error || !user) {
				return { session: null, user: null };
			}

			return { session: toAppSession(session), user: toAppUser(user) };
		},

		async signInWithPassword({ email, password }) {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			return { error: error ? { message: error.message } : null };
		},

		async signUp({ email, password, fullName, emailRedirectTo }) {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					// Picked up by the `handle_new_user` trigger in supabase/schema.sql.
					data: fullName ? { full_name: fullName } : undefined,
					emailRedirectTo
				}
			});

			if (error) {
				return { session: null, error: { message: error.message } };
			}

			return { session: data.session ? toAppSession(data.session) : null, error: null };
		},

		async signOut() {
			await supabase.auth.signOut();
		},

		async exchangeCodeForSession(code) {
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			return { error: error ? { message: error.message } : null };
		},

		async getProfile(userId) {
			const { data } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.maybeSingle();

			return data ?? null;
		}
	};
}
