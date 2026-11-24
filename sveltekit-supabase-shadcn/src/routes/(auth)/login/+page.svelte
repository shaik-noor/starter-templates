<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-xl">Welcome back</Card.Title>
		<Card.Description>Sign in to your account to continue.</Card.Description>
	</Card.Header>

	<Card.Content>
		{#if data.message}
			<p class="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{data.message}</p>
		{/if}
		{#if form?.error}
			<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{form.error}</p>
		{/if}

		<form
			method="POST"
			class="flex flex-col gap-4"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					submitting = false;
					if (result.type === 'failure' && typeof result.data?.error === 'string') {
						toast.error(result.data.error);
					}
					await update();
				};
			}}
		>
			<input type="hidden" name="redirectTo" value={data.redirectTo} />

			<div class="flex flex-col gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					placeholder="you@example.com"
					value={form?.email ?? ''}
					required
				/>
				{#if form?.errors?.email}
					<p class="text-xs text-destructive">{form.errors.email[0]}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
				{#if form?.errors?.password}
					<p class="text-xs text-destructive">{form.errors.password[0]}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Signing in…' : 'Sign in'}
			</Button>
		</form>
	</Card.Content>

	<Card.Footer class="justify-center text-sm text-muted-foreground">
		Don&rsquo;t have an account?
		<a href="/register" class="ms-1 font-medium text-foreground underline-offset-4 hover:underline">
			Sign up
		</a>
	</Card.Footer>
</Card.Root>
