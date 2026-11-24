import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export type RegisterFormData = {
	fullName: string;
	email: string;
	error?: string;
	success?: string;
	errors?: Record<string, string[] | undefined>;
};

const registerSchema = z.object({
	fullName: z.string().trim().min(1, 'Please enter your name'),
	email: z.email('Enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals: { backend }, url }) => {
		const formData = await request.formData();
		const fullName = String(formData.get('fullName') ?? '');
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');

		const parsed = registerSchema.safeParse({ fullName, email, password });
		if (!parsed.success) {
			const data: RegisterFormData = {
				fullName,
				email,
				error: 'Please fix the highlighted fields and try again.',
				errors: z.flattenError(parsed.error).fieldErrors
			};
			return fail(400, data);
		}

		const { session, error } = await backend.signUp({
			email: parsed.data.email,
			password: parsed.data.password,
			fullName: parsed.data.fullName,
			emailRedirectTo: `${url.origin}/auth/callback`
		});

		if (error) {
			const data: RegisterFormData = { fullName, email, error: error.message };
			return fail(400, data);
		}

		// When email confirmation is disabled (and always in local fallback mode)
		// a session is returned and the user is signed in immediately.
		if (session) {
			redirect(303, '/dashboard');
		}

		const data: RegisterFormData = {
			fullName,
			email,
			success: 'Check your inbox to confirm your email address.'
		};
		return data;
	}
};
