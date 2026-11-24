<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import MailIcon from '@lucide/svelte/icons/mail';
	import UserIcon from '@lucide/svelte/icons/user';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const email = $derived(data.user?.email ?? '—');
	const name = $derived(
		data.profile?.full_name ||
			(data.user?.user_metadata?.full_name as string | undefined) ||
			email.split('@')[0] ||
			'—'
	);
	const initials = $derived(
		name
			.split(' ')
			.filter(Boolean)
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
	const joined = $derived(
		data.profile?.created_at
			? new Date(data.profile.created_at).toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: '—'
	);
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
		<p class="text-sm text-muted-foreground">
			Welcome back, {name}. Here&rsquo;s a quick look at your account.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Description>Signed in as</Card.Description>
				<Card.Title class="text-lg">{name}</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3 text-sm">
				<div class="flex items-center gap-2 text-muted-foreground">
					<MailIcon class="size-4 shrink-0" />
					<span class="truncate">{email}</span>
				</div>
				<div class="flex items-center gap-2 text-muted-foreground">
					<UserIcon class="size-4 shrink-0" />
					<span class="truncate">{initials}</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Description>Profile</Card.Description>
				<Card.Title class="text-lg">@{data.profile?.username ?? 'unset'}</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3 text-sm">
				<div class="flex items-center gap-2 text-muted-foreground">
					<GlobeIcon class="size-4 shrink-0" />
					{#if data.profile?.website}
						<a
							href={data.profile.website}
							target="_blank"
							rel="noreferrer"
							class="truncate underline-offset-4 hover:underline"
						>
							{data.profile.website}
						</a>
					{:else}
						<span>No website set</span>
					{/if}
				</div>
				<div class="flex items-center gap-2 text-muted-foreground">
					<CalendarIcon class="size-4 shrink-0" />
					<span>Joined {joined}</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-lg">Next steps</Card.Title>
			<Card.Description>
				{#if data.mode === 'local'}
					Running on the local SQLite fallback. Connect a Supabase project whenever you&rsquo;re ready.
				{:else}
					Your Supabase project is wired up. Start building on top of this template.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.mode === 'local'}
				<ul class="flex flex-col gap-2 text-sm text-muted-foreground">
					<li>Data lives in <code class="rounded bg-muted px-1.5 py-0.5 text-xs">.local/dev.db</code> — delete that folder to reset.</li>
					<li>Set <code class="rounded bg-muted px-1.5 py-0.5 text-xs">PUBLIC_SUPABASE_URL</code> and <code class="rounded bg-muted px-1.5 py-0.5 text-xs">PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code class="rounded bg-muted px-1.5 py-0.5 text-xs">.env</code> to switch to Supabase.</li>
				</ul>
			{:else}
				<ul class="flex flex-col gap-2 text-sm text-muted-foreground">
					<li>Run <code class="rounded bg-muted px-1.5 py-0.5 text-xs">supabase/schema.sql</code> to create the profiles table and RLS policies.</li>
					<li>Regenerate types with <code class="rounded bg-muted px-1.5 py-0.5 text-xs">npm run gen:types</code>.</li>
					<li>Add your own tables and follow the same RLS pattern.</li>
				</ul>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
