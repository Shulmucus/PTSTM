import React from "react";

/**
 * Full-page fixed watermark overlay.
 * Renders two parallel lines with "HEXAL" text centered between them,
 * rotated diagonally. Non-interactive (pointer-events: none).
 */
export default function Watermark() {
    return (
        <div
            className="watermark-overlay"
            aria-hidden="true"
            role="presentation"
        >
            <div className="watermark-content">
                <span className="watermark-line" />
                <span className="watermark-text">HEXAL</span>
                <span className="watermark-line" />
            </div>
        </div>
    );
}
