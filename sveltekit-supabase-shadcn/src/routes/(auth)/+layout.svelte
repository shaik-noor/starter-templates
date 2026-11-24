<script lang="ts">
	import BoxesIcon from '@lucide/svelte/icons/boxes';
	import ThemeToggle from '#lib/components/theme-toggle.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="relative flex min-h-svh flex-col">
	<div class="absolute inset-x-0 top-0 flex h-16 items-center justify-between px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2 font-semibold tracking-tight">
			<BoxesIcon class="size-5" />
			<span>SvelteKit Starter</span>
		</a>
		<ThemeToggle />
	</div>

	<main class="flex flex-1 items-center justify-center p-4">
		<div class="w-full max-w-sm">
			{@render children()}
		</div>
	</main>
</div>
