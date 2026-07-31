import { supabase, withFallback, resolveImageUrl } from '@/lib/images';
import type { Product } from '@/types';
import { demoProducts } from '@/data/content';

export interface ProductWithImage extends Product {
  image: string;
}

export type ProductInput = {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  category_id?: string | null;
  image_path?: string | null;
  available: boolean;
  featured: boolean;
  published: boolean;
};

function decorate(product: Product): ProductWithImage {
  return { ...product, image: resolveImageUrl(product.image_path) };
}

function demoList(): ProductWithImage[] {
  return demoProducts.map(decorate);
}

function demoBySlug(slug: string): ProductWithImage | null {
  const found = demoProducts.find((p) => p.slug === slug);
  return found ? decorate(found) : null;
}

export async function fetchProducts(): Promise<ProductWithImage[]> {
  return withFallback(
    async () =>
      supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    [] as ProductWithImage[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'name' in rows[0]) {
      return (rows as Product[]).map(decorate);
    }
    return demoList();
  });
}

export async function fetchProductBySlug(slug: string): Promise<ProductWithImage | null> {
  return withFallback(
    async () =>
      supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .is('deleted_at', null)
        .maybeSingle(),
    null as ProductWithImage | null,
  ).then((row) => {
    if (row && 'name' in row && (row as Product).id) {
      return decorate(row as Product);
    }
    return demoBySlug(slug);
  });
}

export async function fetchAdminProducts(): Promise<ProductWithImage[]> {
  return withFallback(
    async () =>
      supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    [] as ProductWithImage[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'name' in rows[0]) {
      return (rows as Product[]).map(decorate);
    }
    return demoList();
  });
}

export async function createProduct(input: ProductInput): Promise<Product | null> {
  const { data, error } = await supabase.from('products').insert(input).select().single();
  if (error) throw new Error('Não foi possível cadastrar o produto.');
  return data as Product;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product | null> {
  const { data, error } = await supabase.from('products').update(input).eq('id', id).select().single();
  if (error) throw new Error('Não foi possível atualizar o produto.');
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error('Não foi possível excluir o produto.');
}
