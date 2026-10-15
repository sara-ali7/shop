"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Field, fieldProps } from "@/components/shared/field";
import { getErrorMessage } from "@/lib/api/client";
import { isEmailAvailable, registerUser } from "@/lib/api/users";
import { safeNextPath } from "@/lib/routes";
import { hasErrors, validateRegister, type FieldErrors } from "@/lib/validators";

type Errors = FieldErrors<"name" | "email" | "password" | "confirmPassword" | "role">;

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "admin" | "customer",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const found = validateRegister(values);
    setErrors(found);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      const email = values.email.trim().toLowerCase();

      if (!(await isEmailAvailable(email))) {
        setErrors({ email: "An account with this email already exists. Try logging in." });
        setSubmitting(false);
        return;
      }

      await registerUser({
        name: values.name.trim(),
        email,
        password: values.password,
        avatar: "https://api.escuelajs.co/avatar/none",
        role: values.role,
      });
      const query = new URLSearchParams({ registered: "1" });
      if (next !== "/") query.set("next", next);
      router.push(`/login?${query.toString()}`);
    } catch (error) {
      const msg = getErrorMessage(error, "We could not create your account. Please try again.");
      if (/email.*exist|already.*exist|duplicate|taken/i.test(msg)) {
        setErrors({ email: "An account with this email already exists. Try logging in." });
      } else {
        setFormError(msg);
      }
      setSubmitting(false);
    }
  }

  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Your cart is kept while you sign up.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <Field id="name" label="Name" error={errors.name}>
            <Input {...fieldProps("name", errors.name)} autoComplete="name" value={values.name} onChange={set("name")} />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <Input
              {...fieldProps("email", errors.email)}
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={values.email}
              onChange={set("email")}
            />
          </Field>
          <Field id="password" label="Password" error={errors.password} hint="At least 6 characters, with a letter and a number.">
            <PasswordInput
              {...fieldProps("password", errors.password)}
              autoComplete="new-password"
              value={values.password}
              onChange={set("password")}
            />
          </Field>
          <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
            <PasswordInput
              {...fieldProps("confirmPassword", errors.confirmPassword)}
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={set("confirmPassword")}
            />
          </Field>
          <Field id="role" label="Account type" error={errors.role}>
            <Select {...fieldProps("role", errors.role)} value={values.role} onChange={set("role")}>
              <option value="customer">User</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href={loginHref} className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
