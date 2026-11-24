import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
	// `safeGetSession` validates the JWT with `getUser()` before trusting it.
	const { session, user } = await safeGetSession();

	return {
		session,
		user,
		// Pass the request cookies through so the universal layout can build a
		// server client during SSR.
		cookies: cookies.getAll()
	};
};
