<script lang="ts">
	import { page } from '$app/state';
	import BoxesIcon from '@lucide/svelte/icons/boxes';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import ThemeToggle from '#lib/components/theme-toggle.svelte';
	import UserMenu from '#lib/components/user-menu.svelte';
	import { cn } from '#lib/utils.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const nav = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon }];
</script>

{#snippet navItems()}
	{#each nav as item (item.href)}
		{@const Icon = item.icon}
		{@const active = page.url.pathname === item.href}
		<a
			href={item.href}
			class={cn(
				'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				active
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
			)}
		>
			<Icon class="size-4" />
			{item.label}
		</a>
	{/each}
{/snippet}

<div class="min-h-svh md:grid md:grid-cols-[240px_1fr]">
	<aside class="hidden bg-sidebar md:block md:border-r md:border-border">
		<div class="flex h-14 items-center gap-2 px-4 font-semibold tracking-tight">
			<BoxesIcon class="size-5" />
			<span>SvelteKit Starter</span>
		</div>
		<nav class="flex flex-col gap-1 p-3">
			{@render navItems()}
		</nav>
	</aside>

	<div class="flex min-h-svh flex-col md:min-h-0">
		<header
			class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur"
		>
			<a href="/" class="flex items-center gap-2 font-semibold tracking-tight md:hidden">
				<BoxesIcon class="size-5" />
				<span>SvelteKit Starter</span>
			</a>

			<nav class="flex items-center gap-1 md:hidden">
				{@render navItems()}
			</nav>

			<div class="ms-auto flex items-center gap-2">
				<ThemeToggle />
				<UserMenu user={data.user} />
			</div>
		</header>

		<main class="flex-1 p-4 sm:p-6">
			<div class="mx-auto w-full max-w-4xl">
				{@render children()}
			</div>
		</main>
	</div>
</div>
