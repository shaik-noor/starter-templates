import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	// Defensive guard: keeps the whole `(app)` group protected even if a new
	// route is added without being listed in the hook's protected routes.
	if (!user) {
		redirect(303, '/login');
	}

	return { session, user };
};
