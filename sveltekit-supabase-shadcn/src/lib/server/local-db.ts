import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { Cookies } from '@sveltejs/kit';
import type { AppBackend, AppSession, AppUser, Profile } from '#lib/types/app.js';

/**
 * Local development fallback backend.
 *
 * It implements the small slice of the Supabase API the app uses on top of a
 * plain SQLite file (via the built-in `node:sqlite`), so the template can be
 * run end-to-end without a Supabase project. It is intentionally simple: it is
 * a development convenience, not a drop-in auth server.
 */

const DB_PATH = resolve(process.cwd(), '.local/dev.db');
const SESSION_COOKIE = 'local-session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

/** Seeded on first run so the app is testable straight away. */
export const DEMO_CREDENTIALS = { email: 'demo@example.com', password: 'password123' };

interface UserRow {
	id: string;
	email: string;
	password_hash: string;
	full_name: string | null;
	created_at: string;
}

interface SessionRow {
	expires_at: number;
	id: string;
	email: string;
	full_name: string | null;
	created_at: string;
}

const globalForDb = globalThis as typeof globalThis & { __localDb?: DatabaseSync };

/** Opens (and initialises) the SQLite database, reusing it across HMR reloads. */
const openDatabase = (): DatabaseSync => {
	if (globalForDb.__localDb) {
		return globalForDb.__localDb;
	}

	mkdirSync(dirname(DB_PATH), { recursive: true });
	const database = new DatabaseSync(DB_PATH);

	database.exec(`
		create table if not exists users (
			id text primary key,
			email text not null unique,
			password_hash text not null,
			full_name text,
			created_at text not null
		);

		create table if not exists profiles (
			id text primary key references users (id) on delete cascade,
			username text unique,
			full_name text,
			avatar_url text,
			website text,
			created_at text not null,
			updated_at text not null
		);

		create table if not exists sessions (
			token text primary key,
			user_id text not null references users (id) on delete cascade,
			expires_at integer not null
		);
	`);

	seedDemoUser(database);

	globalForDb.__localDb = database;
	return database;
};

function seedDemoUser(database: DatabaseSync) {
	const { count } = database.prepare('select count(*) as count from users').get() as {
		count: number;
	};
	if (count > 0) return;

	const id = randomUUID();
	const now = new Date().toISOString();

	database
		.prepare(
			'insert into users (id, email, password_hash, full_name, created_at) values (?, ?, ?, ?, ?)'
		)
		.run(id, DEMO_CREDENTIALS.email, hashPassword(DEMO_CREDENTIALS.password), 'Ada Lovelace', now);

	// Mirrors the `handle_new_user` trigger from supabase/schema.sql.
	database
		.prepare(
			'insert into profiles (id, username, full_name, created_at, updated_at) values (?, ?, ?, ?, ?)'
		)
		.run(id, 'ada', 'Ada Lovelace', now, now);
}

const hashPassword = (password: string) => {
	const salt = randomBytes(16).toString('hex');
	return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};

const verifyPassword = (password: string, stored: string) => {
	const [salt, hash] = stored.split(':');
	if (!salt || !hash) return false;

	const candidate = scryptSync(password, salt, 64);
	const expected = Buffer.from(hash, 'hex');

	return candidate.length === expected.length && timingSafeEqual(candidate, expected);
};

const now = () => Math.floor(Date.now() / 1000);

export const createLocalBackend = (cookies: Cookies): AppBackend => {
	const database = openDatabase();

	const setSessionCookie = (token: string, maxAge: number) => {
		cookies.set(SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge
		});
	};

	const startSession = (userId: string) => {
		const token = randomBytes(32).toString('hex');
		const expiresAt = now() + SESSION_TTL_SECONDS;

		database
			.prepare('insert into sessions (token, user_id, expires_at) values (?, ?, ?)')
			.run(token, userId, expiresAt);

		setSessionCookie(token, SESSION_TTL_SECONDS);

		return expiresAt;
	};

	/** Reads the session cookie and returns the matching, non-expired user. */
	const readSession = (): { session: AppSession; user: AppUser } | null => {
		const token = cookies.get(SESSION_COOKIE);
		if (!token) return null;

		const row = database
			.prepare(
				`select s.expires_at as expires_at, u.id as id, u.email as email,
				        u.full_name as full_name, u.created_at as created_at
				 from sessions s
				 join users u on u.id = s.user_id
				 where s.token = ?`
			)
			.get(token) as SessionRow | undefined;

		if (!row) return null;

		if (row.expires_at < now()) {
			database.prepare('delete from sessions where token = ?').run(token);
			return null;
		}

		const user: AppUser = {
			id: row.id,
			email: row.email,
			user_metadata: row.full_name ? { full_name: row.full_name } : {},
			created_at: row.created_at
		};

		return { session: { user, expires_at: row.expires_at }, user };
	};

	return {
		mode: 'local',

		async getSession() {
			const current = readSession();
			return current
				? { session: current.session, user: current.user }
				: { session: null, user: null };
		},

		async signInWithPassword({ email, password }) {
			const row = database
				.prepare('select * from users where email = ?')
				.get(email.trim().toLowerCase()) as UserRow | undefined;

			if (!row || !verifyPassword(password, row.password_hash)) {
				return { error: { message: 'Invalid login credentials' } };
			}

			startSession(row.id);
			return { error: null };
		},

		async signUp({ email, password, fullName }) {
			const normalized = email.trim().toLowerCase();
			const existing = database.prepare('select id from users where email = ?').get(normalized);

			if (existing) {
				return { session: null, error: { message: 'User already registered' } };
			}

			const id = randomUUID();
			const timestamp = new Date().toISOString();

			database
				.prepare(
					'insert into users (id, email, password_hash, full_name, created_at) values (?, ?, ?, ?, ?)'
				)
				.run(id, normalized, hashPassword(password), fullName ?? null, timestamp);

			// Mirrors the `handle_new_user` trigger from supabase/schema.sql.
			database
				.prepare(
					'insert into profiles (id, full_name, created_at, updated_at) values (?, ?, ?, ?)'
				)
				.run(id, fullName ?? null, timestamp, timestamp);

			const user: AppUser = {
				id,
				email: normalized,
				user_metadata: fullName ? { full_name: fullName } : {},
				created_at: timestamp
			};

			const expiresAt = startSession(id);

			return { session: { user, expires_at: expiresAt }, error: null };
		},

		async signOut() {
			const token = cookies.get(SESSION_COOKIE);
			if (token) {
				database.prepare('delete from sessions where token = ?').run(token);
			}
			cookies.delete(SESSION_COOKIE, { path: '/' });
		},

		async exchangeCodeForSession() {
			return {
				error: {
					message: 'Email confirmation is not available in local fallback mode.'
				}
			};
		},

		async getProfile(userId) {
			const row = database
				.prepare('select * from profiles where id = ?')
				.get(userId) as Profile | undefined;

			return row ?? null;
		}
	};
};
