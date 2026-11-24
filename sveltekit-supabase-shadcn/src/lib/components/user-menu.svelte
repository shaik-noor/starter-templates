<script lang="ts">
	import { enhance } from '$app/forms';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { Avatar, AvatarFallback, AvatarImage } from '#lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import type { AppUser } from '#lib/types/app.js';

	let { user }: { user: AppUser | null } = $props();

	let signoutForm = $state<HTMLFormElement | null>(null);

	const email = $derived(user?.email ?? '');
	const name = $derived(
		(user?.user_metadata?.full_name as string | undefined) ?? email.split('@')[0] ?? 'Account'
	);
	const avatarUrl = $derived(
		(user?.user_metadata?.avatar_url as string | undefined) ?? undefined
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
</script>

<!-- Hidden form so the sign-out is a progressive-enhanced server action. -->
<form
	method="POST"
	action="?/signout"
	bind:this={signoutForm}
	use:enhance
	class="hidden"
	aria-hidden="true"
></form>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				class="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				aria-label="Open user menu"
			>
				<Avatar>
					<AvatarImage src={avatarUrl} alt={name} />
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
			</button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-56">
		<DropdownMenu.Label>
			<span class="flex flex-col gap-0.5">
				<span class="truncate text-sm font-medium text-foreground">{name}</span>
				<span class="truncate text-xs font-normal">{email}</span>
			</span>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onSelect={() => signoutForm?.requestSubmit()}>
			<LogOutIcon />
			Sign out
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
