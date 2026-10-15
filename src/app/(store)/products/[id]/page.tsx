import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { Container } from "@/components/layout/container";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductNotFound } from "@/components/product/product-not-found";
import { RelatedProducts } from "@/components/product/related-products";
import { isMissingRecord } from "@/lib/api/client";
import { getProduct, getProductBySlug } from "@/lib/api/products";
import { truncate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const loadProduct = cache(async (idOrSlug: string) => {
  try {
    return /^\d+$/.test(idOrSlug) ? await getProduct(idOrSlug) : await getProductBySlug(idOrSlug);
  } catch (error) {
    if (isMissingRecord(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await loadProduct(id);
    if (!product) return { title: "Product not found" };
    return {
      title: product.title,
      description: truncate(product.description || `Buy ${product.title}.`, 160),
      openGraph: { title: product.title, images: product.images.slice(0, 1) },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return <ProductNotFound />;

  return (
    <Container className="py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link href="/products" className="hover:underline">
          ← All products
        </Link>
      </nav>
      <ProductDetail product={product} />
      <RelatedProducts productId={product.id} />
    </Container>
  );
}
