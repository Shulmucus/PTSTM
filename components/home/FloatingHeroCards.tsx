import type { ContentMap } from "@/types";
import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "./HeroSection.module.css";

interface FloatingHeroCardsProps {
  content: ContentMap;
}

export default function FloatingHeroCards({ content }: FloatingHeroCardsProps) {
  let heroBackgrounds: Array<{ id?: string; image_url: string; rotation_deg?: number }> = [];
  if (content.hero_background_images_json) {
    try {
      heroBackgrounds = JSON.parse(content.hero_background_images_json) as Array<{
        id?: string;
        image_url: string;
        rotation_deg?: number;
      }>;
    } catch {
      heroBackgrounds = [];
    }
  }

  const slides = heroBackgrounds.filter((img) => Boolean(img?.image_url));
  const durationSeconds = Math.max(16, slides.length * 5);

  if (slides.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <div className="absolute inset-0 opacity-40">
        {slides.map((img, idx) => {
          const lane = idx % 4;
          const lanes = [
            "left-6 sm:left-10",
            "right-6 sm:right-16",
            "left-10 sm:left-24",
            "right-10 sm:right-24",
          ];

          const rotation = Number(img.rotation_deg ?? 0);
          const spacing = durationSeconds / Math.max(1, slides.length);
          const delaySeconds = -(idx * spacing);

          return (
            <div
              key={img.id ?? `${img.image_url}-${idx}`}
              className="absolute inset-0"
              style={
                {
                  ["--hero-card-rot" as any]: `${rotation}deg`,
                } as CSSProperties
              }
            >
              <div
                className={`${styles.floatingCard} ${lanes[lane] ?? "left-10"} w-56 h-36 sm:w-72 sm:h-44 lg:w-80 lg:h-52 rounded-2xl overflow-hidden shadow-elevated border border-primary/10`}
                style={
                  {
                    ["--hero-float-duration" as any]: `${durationSeconds}s`,
                    ["--hero-float-delay" as any]: `${delaySeconds}s`,
                  } as CSSProperties
                }
              >
                <Image
                  src={img.image_url}
                  alt="Hero background"
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
