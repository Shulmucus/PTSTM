import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ContentMap, SiteContent } from "@/types";
import HeroSection from "@/components/home/HeroSection";
import InfoBoxes from "@/components/home/InfoBoxes";
import HoverCards from "@/components/home/HoverCards";

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
    return contentMap;
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <>
      <HeroSection content={content} />
      <InfoBoxes content={content} />
      <HoverCards content={content} />
    </>
  );
}
