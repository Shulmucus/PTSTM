/* ─── Site Content ─── */
export interface SiteContent {
    id: string;
    key: string;
    value: string | null;
    updated_at: string;
}

/** All known site_content keys for type-safe queries */
export type SiteContentKey =
    | "hero_headline"
    | "hero_subheadline"
    | "company_name"
    | "info_box_1_title"
    | "info_box_1_body"
    | "info_box_2_title"
    | "info_box_2_body"
    | "card_1_title"
    | "card_1_description"
    | "card_1_image_url"
    | "card_2_title"
    | "card_2_description"
    | "card_2_image_url"
    | "card_3_title"
    | "card_3_description"
    | "card_3_image_url"
    | "card_4_title"
    | "card_4_description"
    | "card_4_image_url"
    | "card_5_title"
    | "card_5_description"
    | "card_5_image_url"
    | "card_6_title"
    | "card_6_description"
    | "card_6_image_url"
    | "contact_phone"
    | "contact_email"
    | "location_address"
    | "logo_url"
    | "services_cards";

/* ─── Service Cards ─── */
export interface ServiceCardPayload {
    id: string; // for React keys and management
    title: string;
    description: string;
    image_url: string;
}

/* ─── Gallery Item ─── */
export interface GalleryItem {
    id: string;
    title: string;
    image_url: string;
    created_at: string;
}

/* ─── Admin User ─── */
export interface AdminUser {
    id: string;
    email: string;
    created_at: string;
}

/* ─── Content Map (key-value lookup) ─── */
export type ContentMap = Partial<Record<SiteContentKey, string>>;
