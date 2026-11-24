import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { backend, safeGetSession } }) => {
	const { user } = await safeGetSession();

	if (!user) {
		redirect(303, '/login');
	}

	const profile = await backend.getProfile(user.id);

	return { profile, mode: backend.mode };
};

export const actions: Actions = {
	signout: async ({ locals: { backend } }) => {
		await backend.signOut();
		redirect(303, '/login');
	}
};
