import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { GalleryItem } from "@/types";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
    title: "Gallery",
    description:
        "Browse our project gallery showcasing the work and solutions delivered by PT Swadaya Teknik Mandiri.",
    openGraph: {
        title: "Gallery | PT Swadaya Teknik Mandiri",
        description:
            "Browse our project gallery showcasing our work and solutions.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Gallery | PT Swadaya Teknik Mandiri",
        description: "Browse our project gallery.",
    },
};

async function getGalleryItems(): Promise<GalleryItem[]> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("gallery_items")
            .select("*")
            .order("title", { ascending: true });

        if (error || !data) return [];
        return data as GalleryItem[];
    } catch {
        return [];
    }
}

export default async function GalleryPage() {
    const items = await getGalleryItems();

    return (
        <section className="w-full bg-primary">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-heading font-bold text-secondary sm:text-4xl lg:text-5xl">
                        Our Gallery
                    </h1>
                    <p className="mt-4 text-foreground-muted text-lg max-w-2xl mx-auto">
                        Explore our portfolio of projects and technical solutions.
                    </p>
                </div>

                <GalleryGrid items={items} />
            </div>
        </section>
    );
}
