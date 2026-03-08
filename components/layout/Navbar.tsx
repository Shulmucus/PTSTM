"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavbarClientProps {
    companyName: string;
    logoUrl: string | null;
}

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact Us" },
] as const;

export default function Navbar({
    companyName,
    logoUrl,
}: NavbarClientProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > 10);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Close mobile menu on route change-like behavior
    const closeMobile = () => setMobileOpen(false);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-shadow duration-200 bg-primary ${scrolled ? "shadow-card" : ""
                }`}
        >
            <nav
                className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
                aria-label="Main navigation"
            >
                {/* Logo + Company Name */}
                <Link
                    href="/"
                    className="flex items-center gap-3 min-w-0"
                    onClick={closeMobile}
                >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                            src={logoUrl || "/placeholder-logo.svg"}
                            alt={`${companyName} logo`}
                            fill
                            className="object-contain"
                            sizes="40px"
                            priority
                        />
                    </div>
                    <span className="text-base sm:text-lg font-bold font-heading text-secondary whitespace-normal break-words">
                        {companyName}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="relative px-4 py-2 text-sm font-medium text-secondary transition-colors duration-200 hover:text-accent rounded-lg hover:bg-secondary/5 focus-visible:outline-2 focus-visible:outline-secondary"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-accent transition-all duration-200 group-hover:w-3/4" />
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Mobile Hamburger Button */}
                <button
                    type="button"
                    className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-secondary hover:bg-secondary/5 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        {mobileOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        )}
                    </svg>
                </button>
            </nav>

            {/* Mobile Slide-in Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 md:hidden"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Slide-in Panel */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-72 bg-primary shadow-elevated transform transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-lg font-bold font-heading text-secondary">
                        Menu
                    </span>
                    <button
                        type="button"
                        className="flex items-center justify-center w-11 h-11 rounded-lg text-secondary hover:bg-secondary/5"
                        onClick={closeMobile}
                        aria-label="Close menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <ul className="flex flex-col p-4 gap-1">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                onClick={closeMobile}
                                className="flex items-center px-4 py-3 text-base font-medium text-secondary rounded-lg hover:bg-secondary/5 hover:text-accent transition-colors"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}
