import type { ContentMap } from "@/types";

interface FooterProps {
    content: ContentMap;
}

export default function Footer({ content }: FooterProps) {
    const phone = content.contact_phone || "+1 (555) 000-0000";
    const email = content.contact_email || "hello@company.com";
    const address = content.location_address || "123 Main St, City, Country";
    const companyName = content.company_name || "PT Swadaya Teknik Mandiri";

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
                            <a
                                href={`tel:${phone.replace(/\s/g, "")}`}
                                className="flex items-center gap-3 text-primary/90 hover:text-primary transition-colors group"
                            >
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                </span>
                                <span className="text-base">{phone}</span>
                            </a>

                            {/* Email */}
                            <a
                                href={`mailto:${email}`}
                                className="flex items-center gap-3 text-primary/90 hover:text-primary transition-colors group"
                            >
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </span>
                                <span className="text-base">{email}</span>
                            </a>

                            {/* Address — visible on mobile only */}
                            <div className="flex items-center gap-3 text-primary/90 lg:hidden">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </span>
                                <span className="text-base">📍 {address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Google Maps — Right Side (desktop only) */}
                    <div className="hidden lg:block">
                        <div className="relative w-full overflow-hidden rounded-xl" style={{ height: "70%", minHeight: "280px" }}>
                            <iframe
                                title="Company Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMDAuMCJTIDEwNsKwNDgnMDAuMCJF!5e0!3m2!1sen!2sid!4v1600000000000"
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
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
