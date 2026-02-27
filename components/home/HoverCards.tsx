"use client";

import { useState } from "react";
import type { ContentMap, ServiceCardPayload } from "@/types";

interface HoverCardsProps {
    content: ContentMap;
}

interface CardData {
    title: string;
    description: string;
    imageUrl: string;
}

function getCardData(content: ContentMap): CardData[] {
    const cards: CardData[] = [];

    // 1. Try reading the dynamic JSON array first
    if (content["services_cards"]) {
        try {
            const dynamicCards = JSON.parse(content["services_cards"]) as ServiceCardPayload[];
            if (Array.isArray(dynamicCards) && dynamicCards.length > 0) {
                dynamicCards.forEach((card) => {
                    cards.push({
                        title: card.title || "Service",
                        description: card.description || "Discover our professional solutions.",
                        imageUrl: card.image_url || "https://picsum.photos/seed/card1/600/400",
                    });
                });
                return cards;
            }
        } catch (e) {
            console.error("Failed to parse dynamic services_cards", e);
        }
    }

    // 2. Fallback to older hardcoded 6 fields logic
    for (let i = 1; i <= 6; i++) {
        const titleKey = `card_${i}_title` as keyof ContentMap;
        const descKey = `card_${i}_description` as keyof ContentMap;
        const imgKey = `card_${i}_image_url` as keyof ContentMap;

        // Skip adding the fallback card if it really has no content set for it
        if (!content[titleKey] && !content[descKey] && !content[imgKey]) {
            continue;
        }

        cards.push({
            title: content[titleKey] || `Service ${i}`,
            description:
                content[descKey] ||
                "Discover our professional solutions tailored to meet your specific needs.",
            imageUrl:
                content[imgKey] || `https://picsum.photos/seed/card${i}/600/400`,
        });
    }

    // If completely empty, just return 1 default card or an empty array
    if (cards.length === 0) {
        cards.push({
            title: "Default Service",
            description: "Discover our professional solutions tailored to meet your specific needs.",
            imageUrl: "https://picsum.photos/seed/card1/600/400",
        });
    }

    return cards;
}

function HoverCard({ card, index }: { card: CardData; index: number }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <div
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border-2 border-border hover:border-accent transition-colors duration-300 shadow-card hover:shadow-card-hover w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] flex-shrink-0 flex-grow-0"
            onClick={() => setRevealed(!revealed)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setRevealed(!revealed);
                }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={revealed}
            aria-label={`${card.title} - ${revealed ? "Hide" : "Show"} details`}
        >
            {/* Background image — appears on hover (desktop) or tap (mobile) */}
            <div
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${revealed
                    ? "opacity-100"
                    : "opacity-0 md:group-hover:opacity-100"
                    }`}
                style={{ backgroundImage: `url(${card.imageUrl})` }}
            >
                {/* Red tint overlay */}
                <div className="absolute inset-0 bg-accent/70" />
            </div>

            {/* Default state — card title */}
            <div
                className={`absolute inset-0 flex items-center justify-center p-6 bg-primary transition-opacity duration-500 ${revealed
                    ? "opacity-0"
                    : "opacity-100 md:group-hover:opacity-0"
                    }`}
            >
                <h3 className="text-xl font-heading font-bold text-secondary text-center">
                    {card.title}
                </h3>
            </div>

            {/* Revealed state — description on image */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-primary transition-opacity duration-500 ${revealed
                    ? "opacity-100"
                    : "opacity-0 md:group-hover:opacity-100"
                    }`}
            >
                <h3 className="text-lg font-heading font-bold mb-2 text-center">
                    {card.title}
                </h3>
                <p className="text-sm text-primary/90 text-center leading-relaxed">
                    {card.description}
                </p>
            </div>

            {/* Card number badge */}
            <span className={`absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-primary text-xs font-bold z-10 transition-opacity duration-500 ${revealed ? "opacity-0" : "opacity-100 md:group-hover:opacity-0"
                }`}>
                {index + 1}
            </span>
        </div>
    );
}

export default function HoverCards({ content }: HoverCardsProps) {
    const cards = getCardData(content);

    return (
        <section className="w-full bg-primary">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                <h2 className="text-3xl font-heading font-bold text-secondary text-center mb-12 sm:text-4xl">
                    Our Services
                </h2>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    {cards.map((card, index) => (
                        <HoverCard key={index} card={card} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
