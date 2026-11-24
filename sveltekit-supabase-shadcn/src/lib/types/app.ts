/**
 * Application-level types shared by the two backend implementations.
 *
 * The app talks to an `AppBackend` instead of a Supabase client directly, which
 * lets it run against either Supabase or the local SQLite fallback
 * (`src/lib/server/local-db.ts`) without any route-level branching.
 */

export interface AppUser {
	id: string;
	email: string;
	user_metadata: Record<string, unknown>;
	created_at: string;
}

export interface AppSession {
	user: AppUser;
	/** Unix timestamp (seconds) at which the session expires. */
	expires_at: number;
}

/** Mirrors the `public.profiles` table (see `supabase/schema.sql`). */
export type Profile = {
	id: string;
	username: string | null;
	full_name: string | null;
	avatar_url: string | null;
	website: string | null;
	created_at: string;
	updated_at: string;
};

export type BackendMode = 'supabase' | 'local';

export interface AppBackend {
	/** Which implementation is active for this request. */
	readonly mode: BackendMode;
	/**
	 * Returns the session only after the credential has been validated
	 * server-side. Never trust an unvalidated token.
	 */
	getSession(): Promise<{ session: AppSession | null; user: AppUser | null }>;
	signInWithPassword(credentials: {
		email: string;
		password: string;
	}): Promise<{ error: { message: string } | null }>;
	signUp(input: {
		email: string;
		password: string;
		fullName?: string;
		emailRedirectTo?: string;
	}): Promise<{ session: AppSession | null; error: { message: string } | null }>;
	signOut(): Promise<void>;
	exchangeCodeForSession(code: string): Promise<{ error: { message: string } | null }>;
	getProfile(userId: string): Promise<Profile | null>;
}
