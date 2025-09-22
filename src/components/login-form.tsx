"use client";

import { AlertCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type FormData = {
  email: string;
  password: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    register,
    handleSubmit,
  } = useForm<FormData>();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
    },
    onSuccess: () => {
      router.push("/manage/dashboard");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            required
            {...register("email", { required: "Email is required" })}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="******"
            required
            {...register("password", { required: "Password is required" })}
          />
        </div>
        {mutation.isError && <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Unable to sign in.</AlertTitle>
          <AlertDescription>
            <p>Please verify your credentials and try again.</p>
          </AlertDescription>
        </Alert>}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging in..." : "Login"}
        </Button>

      </div>
    </form>
  );
}
