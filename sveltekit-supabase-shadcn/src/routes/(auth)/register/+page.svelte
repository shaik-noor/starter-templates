<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let submitting = $state(false);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-xl">Create an account</Card.Title>
		<Card.Description>Enter your details to get started.</Card.Description>
	</Card.Header>

	<Card.Content>
		{#if form?.success}
			<p class="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{form.success}</p>
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
					} else if (result.type === 'success' && typeof result.data?.success === 'string') {
						toast.success(result.data.success);
					}
					await update();
				};
			}}
		>
			<div class="flex flex-col gap-2">
				<Label for="fullName">Name</Label>
				<Input
					id="fullName"
					name="fullName"
					type="text"
					autocomplete="name"
					placeholder="Ada Lovelace"
					value={form?.fullName ?? ''}
					required
				/>
				{#if form?.errors?.fullName}
					<p class="text-xs text-destructive">{form.errors.fullName[0]}</p>
				{/if}
			</div>

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
					autocomplete="new-password"
					placeholder="At least 8 characters"
					required
				/>
				{#if form?.errors?.password}
					<p class="text-xs text-destructive">{form.errors.password[0]}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Creating account…' : 'Create account'}
			</Button>
		</form>
	</Card.Content>

	<Card.Footer class="justify-center text-sm text-muted-foreground">
		Already have an account?
		<a href="/login" class="ms-1 font-medium text-foreground underline-offset-4 hover:underline">
			Sign in
		</a>
	</Card.Footer>
</Card.Root>
