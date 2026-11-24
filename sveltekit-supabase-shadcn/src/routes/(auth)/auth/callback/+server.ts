import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * PKCE callback used by OAuth providers and email confirmation links.
 * Exchanges the `code` query parameter for a session cookie.
 */
export const GET: RequestHandler = async ({ url, locals: { backend } }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';
	const redirectTo = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

	if (code) {
		const { error } = await backend.exchangeCodeForSession(code);
		if (!error) {
			redirect(303, redirectTo);
		}
	}

	redirect(
		303,
		`/login?message=${encodeURIComponent('Unable to authenticate. The link may have expired.')}`
	);
};
