import type { Session, User } from '@supabase/supabase-js';
import type { AppSession, AppUser } from '#lib/types/app.js';

/** Narrows a Supabase user down to the fields the app actually relies on. */
export const toAppUser = (user: User): AppUser => ({
	id: user.id,
	email: user.email ?? '',
	user_metadata: user.user_metadata ?? {},
	created_at: user.created_at ?? new Date().toISOString()
});

export const toAppSession = (session: Session): AppSession => ({
	user: toAppUser(session.user),
	expires_at: session.expires_at ?? 0
});
