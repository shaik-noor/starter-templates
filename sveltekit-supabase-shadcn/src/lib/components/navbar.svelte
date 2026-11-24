<script lang="ts">
	import BoxesIcon from '@lucide/svelte/icons/boxes';
	import { Button } from '#lib/components/ui/button/index.js';
	import ThemeToggle from '#lib/components/theme-toggle.svelte';
	import type { AppUser } from '#lib/types/app.js';

	let { user }: { user: AppUser | null } = $props();

	const links = [
		{ href: '#features', label: 'Features' },
		{ href: '#stack', label: 'Stack' },
		{ href: '#faq', label: 'FAQ' }
	];
</script>

<header class="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
	<div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2 font-semibold tracking-tight">
			<BoxesIcon class="size-5" />
			<span>SvelteKit Starter</span>
		</a>

		<nav class="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
			{#each links as link (link.href)}
				<a href={link.href} class="transition-colors hover:text-foreground">{link.label}</a>
			{/each}
		</nav>

		<div class="ms-auto flex items-center gap-2">
			<ThemeToggle />
			{#if user}
				<Button href="/dashboard" size="sm">Dashboard</Button>
			{:else}
				<Button href="/login" variant="ghost" size="sm" class="hidden sm:inline-flex">
					Sign in
				</Button>
				<Button href="/register" size="sm">Get started</Button>
			{/if}
		</div>
	</div>
</header>
