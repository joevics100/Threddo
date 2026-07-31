import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PostListingForm } from "@/features/listings";
import type { ListingFormInput } from "@/features/listings/schemas/listing.schemas";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit listing",
  robots: { index: false, follow: false }
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listings/${id}/edit`);
  }

  const [{ data: listing }, { data: categories }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name, slug, parent_id").order("name")
  ]);

  if (!listing) {
    notFound();
  }

  // Owners only — anyone else (including a direct link) gets bounced back.
  if (listing.user_id !== user.id) {
    redirect("/dashboard/listings");
  }

  const isSubcategory = categories?.some(
    (category) => category.id === listing.category_id && category.parent_id !== null
  );
  const parentCategoryId = isSubcategory
    ? (categories?.find((category) => category.id === listing.category_id)?.parent_id ?? "")
    : listing.category_id;

  const initialValues: ListingFormInput = {
    title: listing.title,
    description: listing.description ?? "",
    price: listing.price !== null ? String(listing.price) : "",
    isFree: listing.is_free,
    isNegotiable: listing.is_negotiable,
    quantity: listing.quantity,
    categoryId: parentCategoryId,
    subcategoryId: isSubcategory ? listing.category_id : null,
    suitableFor: listing.suitable_for ?? ("unisex" as const),
    brand: listing.brand ?? "",
    condition: listing.condition,
    size: listing.size ?? "",
    color: listing.color ?? "",
    material: listing.material ?? null,
    state: listing.state ?? "",
    lga: listing.lga ?? "",
    town: listing.town ?? "",
    deliveryMethod: listing.delivery_method ?? ("pickup" as const),
    whatsappNumber: listing.whatsapp_number ?? "",
    allowCalls: listing.allow_calls,
    termsAccepted: true
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">Edit listing</h1>
      <p className="mt-1 text-black/60">
        Changes are reviewed again before your listing goes back live.
      </p>

      <div className="mt-8">
        <PostListingForm
          categories={categories ?? []}
          defaultWhatsappNumber={listing.whatsapp_number ?? ""}
          mode="edit"
          listingId={listing.id}
          initialValues={initialValues}
          initialImageUrls={listing.images ?? []}
        />
      </div>
    </main>
  );
}
