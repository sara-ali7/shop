import type { CheckoutFormData } from "@/types";

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (v: string) => EMAIL_RE.test(v.trim());

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const parseImageLines = (text: string): string[] =>
  text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;

export function validateLogin(v: { email: string; password: string }) {
  const errors: FieldErrors<"email" | "password"> = {};
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!isEmail(v.email)) errors.email = "Enter a valid email address.";
  if (!v.password) errors.password = "Enter your password.";
  return errors;
}

export function validateRegister(v: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}) {
  const errors: FieldErrors<"name" | "email" | "password" | "confirmPassword" | "role"> = {};
  if (v.name.trim().length < 2) errors.name = "Enter your name (at least 2 characters).";
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!isEmail(v.email)) errors.email = "Enter a valid email address.";
  if (v.password.length < 6) errors.password = "Use at least 6 characters.";
  else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password))
    errors.password = "Include at least one letter and one number.";
  if (!v.confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (v.confirmPassword !== v.password) errors.confirmPassword = "Passwords do not match.";
  if (v.role !== "admin" && v.role !== "customer") errors.role = "Choose an account type.";
  return errors;
}

export function validateCheckout(v: CheckoutFormData) {
  const errors: FieldErrors<keyof CheckoutFormData> = {};
  if (v.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!isEmail(v.email)) errors.email = "Enter a valid email address.";
  const digits = v.phone.replace(/\D/g, "");
  if (!v.phone.trim()) errors.phone = "Enter your phone number.";
  else if (!/^[+\d\s().-]+$/.test(v.phone) || digits.length < 7 || digits.length > 15)
    errors.phone = "Enter a valid phone number (7–15 digits).";
  if (v.address.trim().length < 5) errors.address = "Enter your delivery address.";
  if (v.city.trim().length < 2) errors.city = "Enter your city.";
  return errors;
}

export function validateProductForm(v: {
  title: string;
  price: string;
  description: string;
  categoryId: string;
  images: string;
}) {
  const errors: FieldErrors<"title" | "price" | "description" | "categoryId" | "images"> = {};
  if (v.title.trim().length < 3) errors.title = "Title must be at least 3 characters.";
  const price = Number(v.price);
  if (!v.price.trim() || !Number.isFinite(price) || price <= 0)
    errors.price = "Enter a price greater than 0.";
  if (v.description.trim().length < 10)
    errors.description = "Description must be at least 10 characters.";
  if (!v.categoryId) errors.categoryId = "Choose a category.";
  const urls = parseImageLines(v.images);
  if (urls.length === 0) errors.images = "Add at least one image URL.";
  else if (urls.some((u) => !isHttpUrl(u))) errors.images = "Every image must be a valid http(s) URL.";
  return errors;
}

export function validateCategoryForm(v: { name: string; image: string }) {
  const errors: FieldErrors<"name" | "image"> = {};
  if (v.name.trim().length < 3) errors.name = "Name must be at least 3 characters.";
  if (!v.image.trim()) errors.image = "Enter an image URL.";
  else if (!isHttpUrl(v.image)) errors.image = "Enter a valid http(s) URL.";
  return errors;
}
