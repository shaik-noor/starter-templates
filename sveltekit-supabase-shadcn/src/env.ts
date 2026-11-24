import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Environment variables are declared explicitly in SvelteKit.
 * Variables marked `public` are importable from `$app/env/public` in both
 * server and client code.
 *
 * Both Supabase variables are optional. When they are left empty the app runs
 * against the local SQLite fallback instead, so it can be developed and tested
 * without a Supabase project — see `src/lib/server/local-db.ts`.
 *
 * @see https://svelte.dev/docs/kit/environment-variables
 */
export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		static: true,
		schema: (value) => value ?? '',
		description: 'Your Supabase project URL. Leave empty to use the local SQLite fallback.'
	},
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
		public: true,
		static: true,
		schema: (value) => value ?? '',
		description:
			'Supabase publishable (anon) key — safe to expose to the browser. Leave empty to use the local SQLite fallback.'
	}
});
