import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ContentMap, SiteContent } from "@/types";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});


async function getLayoutContent(): Promise<ContentMap> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", [
        "company_name",
        "contact_phone",
        "contact_email",
        "location_address",
        "logo_url",
        "theme_color_primary",
        "theme_color_secondary",
        "theme_color_secondary_light",
        "theme_color_secondary_dark",
        "theme_color_accent",
        "theme_color_accent_light",
        "theme_color_accent_dark",
        "theme_color_background",
        "theme_color_background_off",
        "theme_color_foreground",
        "theme_color_foreground_muted",
        "theme_color_border",
      ]);

    if (error || !data) return {};

    const contentMap: ContentMap = {};
    (data as Pick<SiteContent, "key" | "value">[]).forEach((item) => {
      contentMap[item.key as keyof ContentMap] = item.value ?? undefined;
    });

    // Multi-entry contact info (public read). If table doesn't exist yet, ignore.
    try {
      const { data: contactData, error: contactError } = await supabase
        .from("contact_info_entries")
        .select("type, value, label, sort_order, created_at")
        .order("type", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!contactError && contactData && contactData.length > 0) {
        contentMap.contact_info_entries_json = JSON.stringify(
          contactData.map((e) => ({ type: e.type, value: e.value, label: e.label ?? null }))
        );
      }
    } catch {
      // ignore
    }

    return contentMap;
  } catch {
    // Supabase not configured yet — return defaults
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLayoutContent();
  const logoUrl = content.logo_url || "/favicon.ico";

  return {
    title: {
      default: "PT Swadaya Teknik Mandiri",
      template: "%s | PT Swadaya Teknik Mandiri",
    },
    description:
      "PT Swadaya Teknik Mandiri — Professional engineering and technical solutions.",
    icons: {
      icon: logoUrl,
      apple: logoUrl,
    },
    openGraph: {
      title: "PT Swadaya Teknik Mandiri",
      description:
        "Professional engineering and technical solutions by PT Swadaya Teknik Mandiri.",
      type: "website",
      locale: "en_US",
      url: "https://example.com",
      siteName: "PT Swadaya Teknik Mandiri",
    },
    twitter: {
      card: "summary_large_image",
      title: "PT Swadaya Teknik Mandiri",
      description:
        "Professional engineering and technical solutions by PT Swadaya Teknik Mandiri.",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getLayoutContent();

  const themeStyle: React.CSSProperties = {
    ...(content.theme_color_primary ? { ["--color-primary" as any]: content.theme_color_primary } : null),
    ...(content.theme_color_secondary ? { ["--color-secondary" as any]: content.theme_color_secondary } : null),
    ...(content.theme_color_secondary_light ? { ["--color-secondary-light" as any]: content.theme_color_secondary_light } : null),
    ...(content.theme_color_secondary_dark ? { ["--color-secondary-dark" as any]: content.theme_color_secondary_dark } : null),
    ...(content.theme_color_accent ? { ["--color-accent" as any]: content.theme_color_accent } : null),
    ...(content.theme_color_accent_light ? { ["--color-accent-light" as any]: content.theme_color_accent_light } : null),
    ...(content.theme_color_accent_dark ? { ["--color-accent-dark" as any]: content.theme_color_accent_dark } : null),
    ...(content.theme_color_background ? { ["--color-background" as any]: content.theme_color_background } : null),
    ...(content.theme_color_background_off ? { ["--color-background-off" as any]: content.theme_color_background_off } : null),
    ...(content.theme_color_foreground ? { ["--color-foreground" as any]: content.theme_color_foreground } : null),
    ...(content.theme_color_foreground_muted ? { ["--color-foreground-muted" as any]: content.theme_color_foreground_muted } : null),
    ...(content.theme_color_border ? { ["--color-border" as any]: content.theme_color_border } : null),
  };

  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`} style={themeStyle}>
      <body className="min-h-screen flex flex-col">
        <Navbar
          companyName={content.company_name || "PT Swadaya Teknik Mandiri"}
          logoUrl={content.logo_url || null}
        />
        <main className="flex-1">{children}</main>
        <Footer content={content} />
      </body>
    </html>
  );
}
