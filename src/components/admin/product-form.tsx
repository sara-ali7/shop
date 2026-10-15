"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, fieldProps } from "@/components/shared/field";
import { useAsync } from "@/hooks/use-async";
import { getCategories } from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/client";
import { createProduct, updateProduct } from "@/lib/api/products";
import { isOwned, markOwned } from "@/lib/owned-records";
import { hasErrors, parseImageLines, validateProductForm, type FieldErrors } from "@/lib/validators";
import type { Product } from "@/types";

type Errors = FieldErrors<"title" | "price" | "description" | "categoryId" | "images">;

export function ProductForm({ product }: { product?: Product }) {
  const editing = !!product;
  const categories = useAsync(getCategories, []);

  const [values, setValues] = useState({
    title: product?.title ?? "",
    price: product ? String(product.price) : "",
    description: product?.description ?? "",
    categoryId: product && product.category.id ? String(product.category.id) : "",
    images: product ? product.images.join("\n") : "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const sharedRecord = editing && !isOwned("product", product.id);

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setSavedId(null);
      setValues((v) => ({ ...v, [key]: e.target.value }));
    };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    setSavedId(null);

    const found = validateProductForm(values);
    setErrors(found);
    if (hasErrors(found)) return;
    if (sharedRecord && !acknowledged) {
      setFormError("Please confirm that you intend to edit this shared record.");
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        title: values.title.trim(),
        price: Number(values.price),
        description: values.description.trim(),
        categoryId: Number(values.categoryId),
        images: parseImageLines(values.images),
      };
      if (editing) {
        await updateProduct(product.id, input);
        setSavedId(product.id);
      } else {
        const id = await createProduct(input);
        markOwned("product", id);
        setSavedId(id);
        setValues({ title: "", price: "", description: "", categoryId: "", images: "" });
      }
    } catch (error) {
      setFormError(getErrorMessage(error, "The product could not be saved."));
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
              <p>You did not create this product in this browser. Other students may depend on it.</p>
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
            <AlertTitle>{editing ? "Product updated" : "Product created"}</AlertTitle>
            <AlertDescription>
              <Link href={`/admin/products/${savedId}`} className="underline underline-offset-4">
                View product #{savedId}
              </Link>
            </AlertDescription>
          </Alert>
        )}
        {categories.error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between gap-3">
              Could not load categories: {getErrorMessage(categories.error)}
              <Button type="button" size="sm" variant="outline" onClick={categories.reload}>Retry</Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <Field id="title" label="Title" error={errors.title}>
            <Input {...fieldProps("title", errors.title)} value={values.title} onChange={set("title")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="price" label="Price (USD)" error={errors.price}>
              <Input {...fieldProps("price", errors.price)} type="number" inputMode="decimal" min={0} step="0.01" value={values.price} onChange={set("price")} />
            </Field>
            <Field id="categoryId" label="Category" error={errors.categoryId}>
              <Select {...fieldProps("categoryId", errors.categoryId)} value={values.categoryId} onChange={set("categoryId")} disabled={categories.loading}>
                <option value="">{categories.loading ? "Loading categories…" : "Select a category"}</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field id="description" label="Description" error={errors.description}>
            <Textarea {...fieldProps("description", errors.description)} value={values.description} onChange={set("description")} />
          </Field>
          <Field id="images" label="Image URLs" error={errors.images} hint="One URL per line (http or https).">
            <Textarea {...fieldProps("images", errors.images)} value={values.images} onChange={set("images")} placeholder="https://example.com/image.jpg" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Save changes" : "Create product"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={editing ? `/admin/products/${product.id}` : "/admin/products"}>Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
