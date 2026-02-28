import type { ContentMap } from "@/types";
import Image from "next/image";

interface HeroSectionProps {
    content: ContentMap;
}

export default function HeroSection({ content }: HeroSectionProps) {
    const headline = content.hero_headline || "Your Powerful Headline Here";
    const subheadline =
        content.hero_subheadline ||
        "A compelling subheadline that supports your message.";

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

    return (
        <section className="relative w-full bg-secondary overflow-hidden">
            {heroBackgrounds.length > 0 ? (
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-40">
                        {heroBackgrounds.slice(0, 4).map((img, idx) => {
                            const rotation = Number(img.rotation_deg ?? 0);
                            const positions = [
                                "top-10 left-6 sm:left-10",
                                "top-24 right-6 sm:right-16",
                                "bottom-16 left-10 sm:left-24",
                                "bottom-10 right-10 sm:right-24",
                            ];
                            return (
                                <div
                                    key={img.id ?? `${img.image_url}-${idx}`}
                                    className={`absolute ${positions[idx] ?? "top-10 left-10"} w-56 h-36 sm:w-72 sm:h-44 lg:w-80 lg:h-52 rounded-2xl overflow-hidden shadow-elevated border border-primary/10`}
                                    style={{ transform: `rotate(${rotation}deg)` }}
                                >
                                    <Image
                                        src={img.image_url}
                                        alt="Hero background"
                                        fill
                                        className="object-cover"
                                        priority={idx === 0}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="absolute inset-0 bg-secondary/70" />
                </div>
            ) : null}

            <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
                <h1 className="text-4xl font-heading font-extrabold text-primary sm:text-5xl lg:text-6xl leading-tight tracking-tight">
                    {headline}
                </h1>
                <p className="mt-6 text-lg text-primary/85 sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
                    {subheadline}
                </p>
            </div>
        </section>
    );
}
