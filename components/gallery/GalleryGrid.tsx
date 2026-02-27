"use client";

import Image from "next/image";
import type { GalleryItem } from "@/types";

interface GalleryGridProps {
    items: GalleryItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 mb-4 opacity-40"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                </svg>
                <p className="text-lg font-medium">No gallery items yet</p>
                <p className="text-sm mt-1">Check back soon for updates!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl bg-primary border border-border shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                    <div className="relative aspect-[4/3] overflow-hidden bg-background-off">
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
                        />
                    </div>
                    <div className="px-5 py-4">
                        <h3 className="text-base font-heading font-semibold text-secondary truncate">
                            {item.title}
                        </h3>
                    </div>
                </article>
            ))}
        </div>
    );
}
