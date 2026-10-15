"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, fieldProps } from "@/components/shared/field";
import { getErrorMessage } from "@/lib/api/client";
import { LOGIN_MESSAGES, safeNextPath } from "@/lib/routes";
import { hasErrors, validateLogin, type FieldErrors } from "@/lib/validators";
import { useAuth } from "@/providers/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, status } = useAuth();

  const next = safeNextPath(params.get("next"));
  const reason = params.get("reason");
  const notice = reason ? LOGIN_MESSAGES[reason] : undefined;
  const justRegistered = params.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"email" | "password">>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    if (status === "authenticated" && !submitting) router.replace(next);
  }, [status, next, router, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; 
    setFormError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const found = validateLogin({ email: normalizedEmail, password });
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await login({ email: normalizedEmail, password });
      router.replace(next);
    } catch (error) {
      setFormError(getErrorMessage(error, "We could not log you in. Please try again."));
      setSubmitting(false);
    }
  }

  const fillDemo = () => {
    setEmail("john@mail.com");
    setPassword("changeme");
    setErrors({});
    setFormError(null);
  };

  const registerHref = next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Log in</CardTitle>
        <CardDescription>Use your account email and password.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notice && (
          <Alert>
            <Info aria-hidden="true" />
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}
        {justRegistered && (
          <Alert variant="success">
            <CheckCircle2 aria-hidden="true" />
            <AlertDescription>Account created. Log in to continue.</AlertDescription>
          </Alert>
        )}
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <Field id="email" label="Email" error={errors.email}>
            <Input
              {...fieldProps("email", errors.email)}
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field id="password" label="Password" error={errors.password}>
            <PasswordInput
              {...fieldProps("password", errors.password)}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href={registerHref} className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
