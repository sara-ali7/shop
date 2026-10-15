"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, fieldProps } from "@/components/shared/field";
import { SafeImage } from "@/components/shared/safe-image";
import { getErrorMessage } from "@/lib/api/client";
import { createCategory, updateCategory } from "@/lib/api/categories";
import { isOwned, markOwned } from "@/lib/owned-records";
import { hasErrors, isHttpUrl, validateCategoryForm, type FieldErrors } from "@/lib/validators";
import type { Category } from "@/types";

export function CategoryForm({ category }: { category?: Category }) {
  const editing = !!category;
  const [values, setValues] = useState({ name: category?.name ?? "", image: category?.image ?? "" });
  const [errors, setErrors] = useState<FieldErrors<"name" | "image">>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const sharedRecord = editing && !isOwned("category", category.id);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSavedId(null);
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    setSavedId(null);

    const found = validateCategoryForm(values);
    setErrors(found);
    if (hasErrors(found)) return;
    if (sharedRecord && !acknowledged) {
      setFormError("Please confirm that you intend to edit this shared record.");
      return;
    }

    setSubmitting(true);
    try {
      const input = { name: values.name.trim(), image: values.image.trim() };
      if (editing) {
        await updateCategory(category.id, input);
        setSavedId(category.id);
      } else {
        const id = await createCategory(input);
        markOwned("category", id);
        setSavedId(id);
        setValues({ name: "", image: "" });
      }
    } catch (error) {
      setFormError(getErrorMessage(error, "The category could not be saved."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-4 p-4 sm:p-6">
        {sharedRecord && (
          <Alert>
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>This is a shared record</AlertTitle>
            <AlertDescription>
              <p>Products from other students may belong to this category.</p>
              <label className="mt-2 flex items-center gap-2">
                <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="size-4" />
                I understand and still want to edit it.
              </label>
            </AlertDescription>
          </Alert>
        )}
        {formError && (
          <Alert variant="destructive">
            <AlertTitle>Could not save</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        {savedId !== null && (
          <Alert variant="success">
            <CheckCircle2 aria-hidden="true" />
            <AlertTitle>{editing ? "Category updated" : "Category created"}</AlertTitle>
            <AlertDescription>
              <Link href="/admin/categories" className="underline underline-offset-4">
                Back to categories
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <Field id="name" label="Name" error={errors.name}>
            <Input {...fieldProps("name", errors.name)} value={values.name} onChange={set("name")} />
          </Field>
          <Field id="image" label="Image URL" error={errors.image}>
            <Input {...fieldProps("image", errors.image)} type="url" inputMode="url" value={values.image} onChange={set("image")} placeholder="https://example.com/category.jpg" />
          </Field>
          {values.image && isHttpUrl(values.image) && (
            <SafeImage src={values.image} alt="Category image preview" className="aspect-[4/3] w-40 rounded-md border" />
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Save changes" : "Create category"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/categories">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
