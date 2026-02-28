import type { ContentMap } from "@/types";

interface InfoBoxesProps {
    content: ContentMap;
}

export default function InfoBoxes({ content }: InfoBoxesProps) {
    const boxes = [
        {
            title: content.info_box_1_title || "Our Mission",
            body:
                content.info_box_1_body ||
                "We are committed to delivering exceptional engineering solutions that drive progress and innovation.",
        },
        {
            title: content.info_box_2_title || "Our Advantages",
            body:
                content.info_box_2_body ||
                "To be the leading provider of technical services, recognized for quality, reliability, and customer satisfaction.",
        },
    ];

    return (
        <section className="w-full">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                    {boxes.map((box, index) => (
                        <div
                            key={index}
                            className="rounded-2xl bg-primary p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 sm:p-10"
                        >
                            <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
                                {box.title}
                            </h2>
                            <p className="text-foreground-muted leading-relaxed text-base">
                                {box.body}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
