<script lang="ts">
	import BoxesIcon from '@lucide/svelte/icons/boxes';

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-border">
	<div
		class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6"
	>
		<div class="flex items-center gap-2 font-medium text-foreground">
			<BoxesIcon class="size-4" />
			<span>SvelteKit Starter</span>
		</div>
		<p>&copy; {year} SvelteKit Starter. Built with Svelte 5 &amp; Supabase.</p>
		<nav class="flex items-center gap-4">
			<a href="#features" class="transition-colors hover:text-foreground">Features</a>
			<a href="/login" class="transition-colors hover:text-foreground">Sign in</a>
		</nav>
	</div>
</footer>
