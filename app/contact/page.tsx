"use client";

import { useEffect } from "react";

export default function ContactPage() {
    useEffect(() => {
        // Auto-scroll to the footer on mount
        const footer = document.getElementById("footer");
        if (footer) {
            footer.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    return (
        <section className="w-full bg-primary">
            <div className="mx-auto max-w-4xl px-4 py-32 text-center sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8 text-secondary"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-secondary sm:text-4xl">
                        Contact Us
                    </h1>
                    <p className="text-lg text-foreground-muted">
                        Get in touch with us below ↓
                    </p>
                </div>
            </div>
        </section>
    );
}
