/**
 * Minimal, no-op auth surface used by browser code when no Supabase project is
 * configured.
 *
 * In fallback mode every auth change goes through a server action followed by a
 * full navigation, so the browser has nothing to observe — the layout simply
 * re-runs its load functions.
 */
export const createLocalAuthClient = () => ({
	auth: {
		onAuthStateChange: () => ({
			data: { subscription: { unsubscribe: () => {} } }
		}),
		getSession: async () => ({ data: { session: null } })
	}
});
