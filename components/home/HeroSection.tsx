import type { ContentMap } from "@/types";

interface HeroSectionProps {
    content: ContentMap;
}

export default function HeroSection({ content }: HeroSectionProps) {
    const headline = content.hero_headline || "Your Powerful Headline Here";
    const subheadline =
        content.hero_subheadline ||
        "A compelling subheadline that supports your message.";

    return (
        <section
            className="relative w-full overflow-hidden"
        >
            <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
                <h1 className="text-3xl font-heading font-extrabold text-primary sm:text-5xl lg:text-7xl xl:text-8xl leading-tight tracking-tight break-words">
                    {headline}
                </h1>
                <p className="mt-6 text-lg text-primary/85 sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
                    {subheadline}
                </p>
            </div>
        </section>
    );
}
