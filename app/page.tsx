import type { Metadata } from "next";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ContentMap, SiteContent } from "@/types";
import HeroSection from "@/components/home/HeroSection";
import InfoBoxes from "@/components/home/InfoBoxes";
import HoverCards from "@/components/home/HoverCards";
import FloatingHeroCards from "@/components/home/FloatingHeroCards";

export const metadata: Metadata = {
  title: "Home | PT Swadaya Teknik Mandiri",
  description:
    "PT Swadaya Teknik Mandiri — Professional engineering and technical solutions. Explore our services and expertise.",
  openGraph: {
    title: "PT Swadaya Teknik Mandiri",
    description:
      "Professional engineering and technical solutions. Explore our services and expertise.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PT Swadaya Teknik Mandiri",
    description: "Professional engineering and technical solutions.",
  },
};

async function getHomeContent(): Promise<ContentMap> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value");

    if (error || !data) return {};

    const contentMap: ContentMap = {};
    (data as Pick<SiteContent, "key" | "value">[]).forEach((item) => {
      contentMap[item.key as keyof ContentMap] = item.value ?? undefined;
    });

    // Hero background images (public read). If table doesn't exist yet, ignore.
    try {
      const { data: heroBgData, error: heroBgError } = await supabase
        .from("hero_background_images")
        .select("id, image_url, rotation_deg, sort_order, created_at")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!heroBgError && heroBgData && heroBgData.length > 0) {
        contentMap.hero_background_images_json = JSON.stringify(heroBgData);
      }
    } catch {
      // ignore
    }

    // Hero Base Background (single)
    try {
      const { data: baseBgData, error: baseBgError } = await supabase
        .from("hero_base_background")
        .select("image_url")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!baseBgError && baseBgData) {
        contentMap.hero_background_url = baseBgData.image_url;
      }
    } catch {
      // ignore
    }

    return contentMap;
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <>
      <section className="relative w-full min-h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={content.hero_background_url || "/images/hero-bg.png"}
            alt="Industrial Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dimmer & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/70 to-secondary/95" />
        </div>

        <FloatingHeroCards content={content} />
        <div className="relative z-10">
          <HeroSection content={content} />
          <InfoBoxes content={content} />
        </div>
      </section>
      <HoverCards content={content} />
    </>
  );
}
