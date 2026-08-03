"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
import { completePhoneOnboardingAction } from "@/features/account/actions/account.actions";
import { phoneOnlySchema, type PhoneOnlyInput } from "@/features/account/schemas/account.schemas";

export function PhoneOnboardingForm({ next }: { next: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<PhoneOnlyInput>({
    resolver: zodResolver(phoneOnlySchema),
    defaultValues: { phone: "" }
  });

  function onSubmit(values: PhoneOnlyInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await completePhoneOnboardingAction(values);
      if (result?.error) {
        setFormError(result.error);
        return;
      }
      router.push(next);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" placeholder="e.g. 080XXXXXXXX" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                We&apos;ll use this as your default contact number on listings — buyers reach you
                here over WhatsApp.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving…" : "Continue"}
        </Button>
      </form>
    </Form>
  );
}
