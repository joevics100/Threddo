"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@/ui";
import { requestPasswordResetAction } from "@/features/auth/actions/auth.actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput
} from "@/features/auth/schemas/auth.schemas";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      await requestPasswordResetAction(values);
      // Always show the same success state, whether or not an account
      // exists for this email — never confirm/deny account existence.
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="grid gap-4 text-center">
        <p className="text-sm text-black/70">
          If an account exists for that email, we&apos;ve sent a link to reset your password. Check
          your inbox (and spam folder).
        </p>
        <Link href="/login" className="text-sm font-medium text-[#E8543D] hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Sending…" : "Send reset link"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to log in
          </Link>
        </p>
      </form>
    </Form>
  );
}
