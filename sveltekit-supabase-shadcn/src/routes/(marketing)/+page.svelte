<script lang="ts">
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import LockIcon from '@lucide/svelte/icons/lock';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';

	const features = [
		{
			icon: ZapIcon,
			title: 'Svelte 5 runes',
			description:
				'Reactive by default with $state, $derived, $props and $effect — no stores boilerplate.'
		},
		{
			icon: ShieldCheckIcon,
			title: 'Secure auth',
			description:
				'Cookie-based SSR sessions via @supabase/ssr with JWT validation on every request.'
		},
		{
			icon: DatabaseIcon,
			title: 'Typed database',
			description: 'Row Level Security policies and a generated Database type for end-to-end safety.'
		},
		{
			icon: PaletteIcon,
			title: 'Beautiful UI',
			description: 'shadcn-svelte components on Tailwind CSS v4 with dark mode out of the box.'
		},
		{
			icon: LockIcon,
			title: 'Server-side guard',
			description: 'Route protection and guest-only redirects handled in a single hooks file.'
		}
	];

	const stack = [
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'Tailwind CSS',
		'shadcn-svelte',
		'Supabase',
		'zod'
	];

	const faqs = [
		{
			q: 'Is this really self-contained?',
			a: 'Yes. Everything ships in this repo: hooks, layouts, form actions, SQL schema and types.'
		},
		{
			q: 'Do I need an ORM?',
			a: 'No. Queries run through the Supabase client directly, typed by a generated Database interface.'
		},
		{
			q: 'How do I connect my project?',
			a: 'Copy .env.example to .env, drop in your Supabase URL and publishable key, then run the schema.'
		}
	];
</script>

<!-- Hero -->
<section class="relative overflow-hidden">
	<div
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-muted),transparent)]"
	></div>
	<div class="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
		<span
			class="mb-6 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
		>
			SvelteKit + Supabase starter
		</span>
		<h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
			Ship your next app in minutes, not weeks
		</h1>
		<p class="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
			A production-ready SvelteKit template with Supabase Auth, Row Level Security and a polished
			shadcn-svelte UI — wired up and ready to deploy.
		</p>
		<div class="mt-10 flex flex-col items-center gap-3 sm:flex-row">
			<Button href="/register" size="lg">
				Get started
				<ArrowRightIcon />
			</Button>
			<Button href="/login" variant="outline" size="lg">Sign in</Button>
		</div>
	</div>
</section>

<!-- Features -->
<section id="features" class="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
	<div class="mb-10 max-w-2xl">
		<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Everything you need</h2>
		<p class="mt-3 text-muted-foreground">
			Opinionated defaults so you can focus on your product instead of plumbing.
		</p>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each features as feature (feature.title)}
			{@const Icon = feature.icon}
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<span class="flex size-8 items-center justify-center rounded-md bg-muted">
							<Icon class="size-4" />
						</span>
						{feature.title}
					</Card.Title>
					<Card.Description>{feature.description}</Card.Description>
				</Card.Header>
			</Card.Root>
		{/each}
	</div>
</section>

<!-- Stack -->
<section id="stack" class="scroll-mt-20 border-y border-border bg-muted/30">
	<div class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
		<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Powered by a modern stack</h2>
		<div class="mt-8 flex flex-wrap gap-3">
			{#each stack as item (item)}
				<span
					class="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground"
				>
					{item}
				</span>
			{/each}
		</div>
	</div>
</section>

<!-- FAQ -->
<section id="faq" class="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
	<h2 class="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">Frequently asked questions</h2>
	<div class="divide-y divide-border rounded-xl border border-border">
		{#each faqs as faq (faq.q)}
			<details class="group px-6 py-4">
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none"
				>
					{faq.q}
					<span class="text-muted-foreground transition-transform group-open:rotate-45">+</span>
				</summary>
				<p class="mt-3 text-sm text-muted-foreground">{faq.a}</p>
			</details>
		{/each}
	</div>
</section>

<!-- CTA -->
<section class="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
	<div
		class="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-8 py-14 text-center"
	>
		<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to build?</h2>
		<p class="max-w-md text-muted-foreground">
			Create an account and explore the protected dashboard to see the full auth flow in action.
		</p>
		<Button href="/register" size="lg">
			Create your account
			<ArrowRightIcon />
		</Button>
	</div>
</section>
