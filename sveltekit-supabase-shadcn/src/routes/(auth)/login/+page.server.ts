import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export type LoginFormData = {
	email: string;
	error?: string;
	errors?: Record<string, string[] | undefined>;
};

/**
 * Only allow same-origin, relative redirect targets so a crafted
 * `?redirectTo=` value cannot be used for an open redirect.
 */
const safeRedirect = (value: string | null) =>
	value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';

const loginSchema = z.object({
	email: z.email('Enter a valid email address'),
	password: z.string().min(1, 'Password is required')
});

export const load: PageServerLoad = async ({ url }) => {
	return {
		redirectTo: safeRedirect(url.searchParams.get('redirectTo')),
		message: url.searchParams.get('message')
	};
};

export const actions: Actions = {
	default: async ({ request, locals: { backend }, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');
		const redirectTo = safeRedirect(
			String(formData.get('redirectTo') ?? '') || url.searchParams.get('redirectTo')
		);

		const parsed = loginSchema.safeParse({ email, password });
		if (!parsed.success) {
			const data: LoginFormData = {
				email,
				error: 'Please fix the highlighted fields and try again.',
				errors: z.flattenError(parsed.error).fieldErrors
			};
			return fail(400, data);
		}

		const { error } = await backend.signInWithPassword(parsed.data);
		if (error) {
			const data: LoginFormData = { email, error: error.message };
			return fail(400, data);
		}

		redirect(303, redirectTo);
	}
};
