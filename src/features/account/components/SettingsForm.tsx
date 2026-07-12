"use client";

import { useState, useTransition } from "react";

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
import { updateProfileAction } from "@/features/account/actions/account.actions";
import { profileSchema, type ProfileInput } from "@/features/account/schemas/account.schemas";

interface SettingsFormProps {
  defaultFullName: string;
  defaultPhone: string;
}

export function SettingsForm({ defaultFullName, defaultPhone }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: defaultFullName, phone: defaultPhone }
  });

  function onSubmit(values: ProfileInput) {
    setFormError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number (WhatsApp)</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                This is the default contact number for new listings — you can still override it
                per-listing when posting.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        {saved ? <p className="text-sm text-[#1B1F3B]">Saved!</p> : null}

        <Button
          type="submit"
          disabled={isPending}
          className="w-fit bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]"
        >
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
