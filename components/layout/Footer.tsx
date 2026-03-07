import type { ContentMap } from "@/types";

interface FooterProps {
    content: ContentMap;
}

export default function Footer({ content }: FooterProps) {
    let phones: string[] = [];
    let emails: string[] = [];
    let locations: Array<{ value: string; label: string | null }> = [];

    if (content.contact_info_entries_json) {
        try {
            const parsed = JSON.parse(content.contact_info_entries_json) as Array<{ type: string; value: string; label?: string | null }>;
            phones = parsed.filter((e) => e.type === "phone").map((e) => e.value).filter(Boolean);
            emails = parsed.filter((e) => e.type === "email").map((e) => e.value).filter(Boolean);
            locations = parsed
                .filter((e) => e.type === "location")
                .map((e) => ({ value: e.value, label: e.label ?? null }))
                .filter((e) => Boolean(e.value));
        } catch {
            // fall back
        }
    }

    if (phones.length === 0) phones = [content.contact_phone || "+1 (555) 000-0000"];
    if (emails.length === 0) emails = [content.contact_email || "hello@company.com"];
    if (locations.length === 0) locations = [{ value: content.location_address || "123 Main St, City, Country", label: null }];

    const phone = phones[0];
    const email = emails[0];
    const address = locations[0]?.value;
    const companyName = content.company_name || "PT Swadaya Teknik Mandiri";

    const getEmbedSrcForLocation = (loc: string) => {
        const q = encodeURIComponent(loc);
        return `https://www.google.com/maps?q=${q}&output=embed`;
    };

    const getViewLargerMapHref = (loc: string) => {
        const q = encodeURIComponent(loc);
        return `https://www.google.com/maps/search/?api=1&query=${q}`;
    };

    return (
        <footer id="footer" className="bg-secondary text-primary">
            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Contact Info — Left Side */}
                    <div className="flex flex-col justify-center gap-6">
                        <h2 className="text-2xl font-heading font-bold">Get in Touch</h2>

                        <div className="flex flex-col gap-4">
                            {/* Phone */}
                            {phones.map((p) => {
                                const waNumber = p.replace(/[^\d+]/g, ""); // Keep only digits and '+'
                                return (
                                    <a
                                        key={p}
                                        href={`https://wa.me/${waNumber.startsWith('+') ? waNumber.substring(1) : waNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-fit items-center gap-3 rounded-xl bg-[#25D366] px-5 py-3 text-white hover:bg-[#20b858] transition-colors shadow-sm"
                                    >
                                        <span className="flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </span>
                                        <span className="text-base font-semibold">{p}</span>
                                    </a>
                                );
                            })}

                            {/* Email */}
                            {emails.map((em) => (
                                <a
                                    key={em}
                                    href={`mailto:${em}`}
                                    className="flex items-center gap-3 text-primary/90 hover:text-primary transition-colors group"
                                >
                                    <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </span>
                                    <span className="text-base">{em}</span>
                                </a>
                            ))}

                            {/* Address — visible on mobile only */}
                            {locations.map((loc) => (
                                <div key={loc.value} className="flex items-center gap-3 text-primary/90 lg:hidden">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                    </span>
                                    <div className="flex flex-col">
                                        {loc.label ? <span className="text-base">📍 {loc.label}</span> : <span className="text-base">📍 Location</span>}
                                        <span className="text-sm text-primary/70">{loc.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Google Maps — Right Side */}
                    <div>
                        <div className={locations.length > 1 ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "grid grid-cols-1 gap-4"}>
                            {locations.map((loc, index) => (
                                <div key={`${loc.value}-${index}`} className="overflow-hidden rounded-xl border border-primary/10 bg-primary/5">
                                    <div className="relative w-full overflow-hidden" style={{ height: locations.length > 1 ? "220px" : "280px" }}>
                                        <iframe
                                            title={`Company Location ${index + 1}`}
                                            src={getEmbedSrcForLocation(loc.value)}
                                            className="absolute inset-0 w-full h-full border-0"
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>

                                    <div className="p-3">
                                        {loc.label ? (
                                            <div>
                                                <p className="text-sm font-semibold text-primary/90">{loc.label}</p>
                                                <p className="text-sm text-primary/70">{loc.value}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-primary/90">{loc.value}</p>
                                        )}
                                        <a
                                            href={getViewLargerMapHref(loc.value)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 inline-block text-sm text-primary/80 hover:text-primary underline"
                                        >
                                            View larger map
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-primary/20">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-primary/70">
                        © {new Date().getFullYear()} {companyName}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
