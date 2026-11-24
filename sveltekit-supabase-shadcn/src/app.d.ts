// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AppBackend, AppSession, AppUser } from '#lib/types/app.js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			backend: AppBackend;
			safeGetSession: () => Promise<{ session: AppSession | null; user: AppUser | null }>;
			session: AppSession | null;
			user: AppUser | null;
		}
		interface PageData {
			session: AppSession | null;
			user: AppUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
