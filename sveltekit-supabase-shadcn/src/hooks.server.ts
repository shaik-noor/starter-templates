import { redirect } from '@sveltejs/kit';
import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { createBackend } from '#lib/server/backend.js';
import { DEMO_CREDENTIALS } from '#lib/server/local-db.js';

const PROTECTED_ROUTES = ['/dashboard'];
const GUEST_ONLY_ROUTES = ['/login', '/register'];

let warnedAboutFallback = false;

function warnAboutFallback() {
	if (warnedAboutFallback) return;
	warnedAboutFallback = true;

	console.warn(
		[
			'',
			'[auth] No Supabase project configured — using the local SQLite fallback.',
			`       Database: .local/dev.db`,
			`       Demo login: ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`,
			'       Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env to use Supabase.',
			''
		].join('\n')
	);
}

/**
 * Creates a request-scoped backend — Supabase when configured, the local
 * SQLite fallback otherwise — and exposes a `safeGetSession()` helper that
 * validates the session before trusting it.
 */
const backendHandle: Handle = async ({ event, resolve }) => {
	const backend = createBackend(event.cookies);

	if (backend.mode === 'local') {
		warnAboutFallback();
	}

	event.locals.backend = backend;
	event.locals.safeGetSession = () => backend.getSession();

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass them through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const path = event.url.pathname;
	const isProtected = PROTECTED_ROUTES.some((route) => path.startsWith(route));
	const isGuestOnly = GUEST_ONLY_ROUTES.includes(path);

	if (!user && isProtected) {
		const redirectTo = path + event.url.search;
		redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	if (user && isGuestOnly) {
		redirect(303, '/dashboard');
	}

	return resolve(event);
};

export const handle: Handle = sequence(backendHandle, authGuard);
