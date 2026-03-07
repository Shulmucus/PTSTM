"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import AdminPasswordReset from "@/components/admin/AdminPasswordReset";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import type { ContentMap, ContactInfoEntry, GalleryItem, HeroBackgroundImage, SiteContentKey, ServiceCardPayload } from "@/types";

/* ─── Content field definitions for the admin editor ─── */
const CONTENT_SECTIONS = [
  {
    label: "General",
    fields: [
      { key: "company_name" as SiteContentKey, label: "Company Name", type: "text" as const },
    ],
  },
  {
    label: "Hero Section",
    fields: [
      { key: "hero_headline" as SiteContentKey, label: "Headline", type: "text" as const },
      { key: "hero_subheadline" as SiteContentKey, label: "Subheadline", type: "textarea" as const },
      { key: "hero_background_url" as SiteContentKey, label: "Background Image URL", type: "text" as const },
    ],
  },
  {
    label: "Info Box 1",
    fields: [
      { key: "info_box_1_title" as SiteContentKey, label: "Title", type: "text" as const },
      { key: "info_box_1_body" as SiteContentKey, label: "Body", type: "textarea" as const },
    ],
  },
  {
    label: "Info Box 2",
    fields: [
      { key: "info_box_2_title" as SiteContentKey, label: "Title", type: "text" as const },
      { key: "info_box_2_body" as SiteContentKey, label: "Body", type: "textarea" as const },
    ],
  },
  // The old Cards 1-6 are removed. They are replaced by the dynamic tab.
] as const;

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentMap>({});
  const contentHasInitialized = useRef(false);
  const galleryHasInitialized = useRef(false);
  const skipDraftSave = useRef(true); // Prevent overwriting draft with empty state on initial mount

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "hero" | "contact" | "services" | "gallery" | "logo" | "theme" | "settings">("content");

  const [contactInfo, setContactInfo] = useState<ContactInfoEntry[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [newContactType, setNewContactType] = useState<ContactInfoEntry["type"]>("phone");
  const [newContactLabel, setNewContactLabel] = useState("");
  const [newContactValue, setNewContactValue] = useState("");
  const [newContactPhoneCode, setNewContactPhoneCode] = useState("+62");

  const [heroBackgroundImages, setHeroBackgroundImages] = useState<HeroBackgroundImage[]>([]);
  const [heroBgLoading, setHeroBgLoading] = useState(false);
  const [newHeroBgFile, setNewHeroBgFile] = useState<File | null>(null);
  const [newHeroBgRotation, setNewHeroBgRotation] = useState("0");
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);

  // Dynamic Service Cards State
  const [services, setServices] = useState<ServiceCardPayload[]>([]);
  const servicesHasInitialized = useRef(false);

  // Gallery form state
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryImage, setNewGalleryImage] = useState<File | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Card image upload states
  const [cardImageFiles, setCardImageFiles] = useState<Record<string, File | null>>({});
  const [uploadingCardImage, setUploadingCardImage] = useState<string | null>(null);

  const supabase = createClient();

  // Simple user check - since middleware already handles auth
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase]);

  const fetchContactInfo = useCallback(async () => {
    setContactLoading(true);
    try {
      const res = await fetch("/api/admin/contact-info");
      const json = await res.json();
      if (!res.ok || json.error) {
        setContactInfo([]);
        return;
      }
      setContactInfo((json.data ?? []) as ContactInfoEntry[]);
    } catch {
      setContactInfo([]);
    } finally {
      setContactLoading(false);
    }
  }, []);

  const fetchHeroBackgroundImages = useCallback(async () => {
    setHeroBgLoading(true);
    try {
      const res = await fetch("/api/admin/hero-background-images");
      const json = await res.json();
      if (!res.ok || json.error) {
        setHeroBackgroundImages([]);
        return;
      }
      setHeroBackgroundImages((json.data ?? []) as HeroBackgroundImage[]);
    } catch {
      setHeroBackgroundImages([]);
    } finally {
      setHeroBgLoading(false);
    }
  }, []);

  const fetchContent = useCallback(async () => {
    // Only fetch from DB if we haven't initialized yet
    if (contentHasInitialized.current) return;
    contentHasInitialized.current = true;

    try {
      // 1. Check for draft in localStorage first
      const draftData = localStorage.getItem("admin_content_draft");
      if (draftData) {
        const draft = JSON.parse(draftData) as ContentMap;
        setContent(draft);
        setSaveMessage("Loaded unsaved draft from local storage.");
        setTimeout(() => setSaveMessage(null), 3000);
        skipDraftSave.current = false;
        return; // Use draft instead of fetching from DB
      }
    } catch {
      // Ignore parse errors, just fall back to getting clean data from DB
    }

    // 2. No draft, fetch from DB
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value");

    if (!error && data) {
      const map: ContentMap = {};
      data.forEach((item: { key: string; value: string | null }) => {
        map[item.key as keyof ContentMap] = item.value ?? undefined;
      });
      setContent(map);

      if (!servicesHasInitialized.current && map.services_cards) {
        try {
          setServices(JSON.parse(map.services_cards) as ServiceCardPayload[]);
          servicesHasInitialized.current = true;
        } catch {
          // fallback to empty if parse fails
        }
      } else if (!servicesHasInitialized.current) {
        // If no JSON array exists, attempt to pull the legacy 6 cards as the starting point
        const legacyCards: ServiceCardPayload[] = [];
        for (let i = 1; i <= 6; i++) {
          const ti = map[`card_${i}_title` as SiteContentKey] as string;
          const de = map[`card_${i}_description` as SiteContentKey] as string;
          const img = map[`card_${i}_image_url` as SiteContentKey] as string;
          if (ti || de || img) {
            legacyCards.push({ id: crypto.randomUUID(), title: ti || "", description: de || "", image_url: img || "" });
          }
        }
        setServices(legacyCards);
        servicesHasInitialized.current = true;
      }
    }

    // Allow saving drafts after initial load finishes
    setTimeout(() => { skipDraftSave.current = false; }, 0);
  }, [supabase]);

  const fetchGallery = useCallback(async () => {
    if (galleryHasInitialized.current) return;
    galleryHasInitialized.current = true;

    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("title", { ascending: true });

    if (!error && data) {
      setGalleryItems(data as GalleryItem[]);
    }
  }, [supabase]);

  // Save to localStorage whenever content changes (after initial load)
  useEffect(() => {
    if (skipDraftSave.current) return;

    // Don't save empty states right as the component mounts
    if (Object.keys(content).length > 0) {
      localStorage.setItem("admin_content_draft", JSON.stringify(content));
    }
  }, [content]);

  useEffect(() => {
    if (!loading && user) {
      fetchContent();
      fetchGallery();
      fetchContactInfo();
      fetchHeroBackgroundImages();
    }
  }, [user, loading, fetchContent, fetchGallery, fetchContactInfo, fetchHeroBackgroundImages]);

  const handleAddHeroBackgroundImage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newHeroBgFile) return;

    setUploadingHeroBg(true);
    setSaveMessage(null);

    try {
      const fileExt = newHeroBgFile.name.split(".").pop();
      const fileName = `hero-bg/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(fileName, newHeroBgFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("assets")
        .getPublicUrl(fileName);

      const rotation = Number(newHeroBgRotation || "0");

      const res = await fetch("/api/admin/hero-background-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: urlData.publicUrl, rotation_deg: rotation }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setSaveMessage(json.error || "Failed to add hero background image");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      setNewHeroBgFile(null);
      setNewHeroBgRotation("0");
      await fetchHeroBackgroundImages();
      setSaveMessage("Hero background image added!");
    } catch {
      setSaveMessage("Failed to add hero background image");
    } finally {
      setUploadingHeroBg(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleDeleteHeroBackgroundImage = async (id: string) => {
    if (!confirm("Delete this hero background image?")) return;

    setHeroBgLoading(true);
    try {
      const res = await fetch("/api/admin/hero-background-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setSaveMessage(json.error || "Failed to delete hero background image");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }
      await fetchHeroBackgroundImages();
      setSaveMessage("Hero background image deleted.");
    } catch {
      setSaveMessage("Failed to delete hero background image");
    } finally {
      setHeroBgLoading(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleUpdateHeroBackgroundImage = async (id: string, update: { rotation_deg?: number; sort_order?: number }) => {
    try {
      const res = await fetch("/api/admin/hero-background-images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...update }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setSaveMessage(json.error || "Failed to update hero background image");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }
      await fetchHeroBackgroundImages();
    } catch {
      setSaveMessage("Failed to update hero background image");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleAddContactInfo = async () => {
    if (!newContactValue.trim()) return;

    setContactLoading(true);
    try {
      const res = await fetch("/api/admin/contact-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newContactType,
          value: newContactType === "phone" ? `${newContactPhoneCode} ${newContactValue.trim()}` : newContactValue.trim(),
          label: newContactLabel.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setSaveMessage(json.error || "Failed to add contact info");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      setNewContactValue("");
      setNewContactLabel("");
      await fetchContactInfo();
      setSaveMessage("Contact info added!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage("Failed to add contact info");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteContactInfo = async (id: string) => {
    if (!confirm("Delete this contact info?")) return;

    setContactLoading(true);
    try {
      const res = await fetch("/api/admin/contact-info", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setSaveMessage(json.error || "Failed to delete contact info");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }
      await fetchContactInfo();
      setSaveMessage("Contact info deleted.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage("Failed to delete contact info");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setContactLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  const handleContentChange = (key: SiteContentKey, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      // Inject the current dynamic services into the payload
      const payloadToSave = { ...content, services_cards: JSON.stringify(services) };

      for (const [key, value] of Object.entries(payloadToSave)) {
        await supabase
          .from("site_content")
          .upsert(
            { key, value, updated_at: new Date().toISOString() },
            { onConflict: "key" }
          );
      }
      setSaveMessage("Content saved successfully!");
      // Clear the draft after successful database save
      localStorage.removeItem("admin_content_draft");
    } catch {
      setSaveMessage("Failed to save content. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleLogoUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;

    setUploadingLogo(true);
    try {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("assets")
        .getPublicUrl(fileName);

      await supabase
        .from("site_content")
        .upsert(
          { key: "logo_url", value: urlData.publicUrl, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );

      setContent((prev) => ({ ...prev, logo_url: urlData.publicUrl }));
      setLogoFile(null);
      setSaveMessage("Logo uploaded successfully!");
    } catch {
      setSaveMessage("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm("Are you sure you want to delete the company logo?")) return;

    try {
      setSaveMessage("Deleting logo...");

      const { error: dbError } = await supabase
        .from("site_content")
        .delete()
        .eq("key", "logo_url");

      if (dbError) throw dbError;

      // Also try to extract and delete the actual file from storage if we can parse it
      if (content.logo_url) {
        try {
          // Basic extraction of filename from our Supabase public URL structure
          const parts = content.logo_url.split("/");
          const filename = parts[parts.length - 1];
          if (filename && filename.startsWith("logo.")) {
            await supabase.storage.from("assets").remove([filename]);
          }
        } catch { /* ignore storage cleanup errors */ }
      }

      const newContent = { ...content };
      delete newContent.logo_url;
      setContent(newContent);

      setSaveMessage("Logo deleted successfully!");
    } catch {
      setSaveMessage("Failed to delete logo.");
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCardImageUpload = async (cardKey: SiteContentKey) => {
    const file = cardImageFiles[cardKey];
    if (!file) return;

    setUploadingCardImage(cardKey);
    try {
      const fileExt = file.name.split(".").pop();
      const folder = cardKey === "hero_background_url" ? "hero-base" : "cards";
      const fileName = `${folder}/${cardKey}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("assets")
        .getPublicUrl(fileName);

      await supabase
        .from("site_content")
        .upsert(
          { key: cardKey, value: urlData.publicUrl, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );

      if (cardKey === "hero_background_url") {
        await supabase
          .from("hero_base_background")
          .insert({ image_url: urlData.publicUrl });
      }

      setContent((prev) => ({ ...prev, [cardKey]: urlData.publicUrl }));
      setCardImageFiles((prev) => ({ ...prev, [cardKey]: null }));
      setSaveMessage("Image uploaded!");
    } catch {
      setSaveMessage("Failed to upload image.");
    } finally {
      setUploadingCardImage(null);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleServiceCardImageUpload = async (serviceId: string, file: File) => {
    setUploadingCardImage(serviceId);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `services/${serviceId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("assets")
        .getPublicUrl(fileName);

      setServices((prev) => prev.map(s => s.id === serviceId ? { ...s, image_url: urlData.publicUrl } : s));
      setSaveMessage("Service image uploaded! (Click Save All Content to finalize)");
    } catch {
      setSaveMessage("Failed to upload service image.");
    } finally {
      setUploadingCardImage(null);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleAddGalleryItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle || !newGalleryImage) return;

    setUploadingGallery(true);
    try {
      const fileExt = newGalleryImage.name.split(".").pop();
      const fileName = `gallery/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(fileName, newGalleryImage);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("assets")
        .getPublicUrl(fileName);

      const { data: newItem, error: insertError } = await supabase
        .from("gallery_items")
        .insert({ title: newGalleryTitle, image_url: urlData.publicUrl })
        .select()
        .single();

      if (insertError) throw insertError;

      setGalleryItems((prev) =>
        [...prev, newItem as GalleryItem].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      );
      setNewGalleryTitle("");
      setNewGalleryImage(null);
      setSaveMessage("Gallery item added!");
    } catch {
      setSaveMessage("Failed to add gallery item.");
    } finally {
      setUploadingGallery(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      // Optimistic update
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));

      const { error } = await supabase
        .from("gallery_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSaveMessage("Gallery item deleted.");
    } catch {
      // Revert on failure
      fetchGallery();
      setSaveMessage("Failed to delete gallery item.");
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (loading) {
    console.log("AdminDashboard: Still loading user...");
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    console.log("AdminDashboard: No user found");
    return null;
  }

  console.log("AdminDashboard: Rendering dashboard", { user: user.email });

  return (
    <div className="min-h-screen bg-background-off">
      {/* Top Bar */}
      <div className="bg-secondary text-primary">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Admin Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Save Toast */}
      {saveMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-secondary text-primary px-6 py-3 shadow-elevated text-sm font-medium animate-pulse">
          {saveMessage}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {(["content", "hero", "contact", "services", "gallery", "logo", "theme", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize rounded-t-lg transition-colors ${activeTab === tab
                ? "bg-primary text-secondary border border-border border-b-primary -mb-px"
                : "text-foreground-muted hover:text-secondary"
                }`}
            >
              {tab === "content"
                ? "Site Content"
                : tab === "hero"
                  ? "Hero Background"
                  : tab === "contact"
                    ? "Contact Info"
                    : tab === "services"
                      ? "Services"
                      : tab === "gallery"
                        ? "Gallery"
                        : tab === "logo"
                          ? "Logo"
                          : tab === "theme"
                            ? "Theme"
                            : "Settings"}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-8">
            {CONTENT_SECTIONS.map((section) => (
              <div
                key={section.label}
                className="rounded-2xl bg-primary border border-border p-6 shadow-card"
              >
                <h2 className="text-lg font-heading font-bold text-secondary mb-4">
                  {section.label}
                </h2>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={`field-${field.key}`}
                        className="block text-sm font-medium text-foreground mb-1.5"
                      >
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          id={`field-${field.key}`}
                          rows={3}
                          value={content[field.key] || ""}
                          onChange={(e) =>
                            handleContentChange(field.key, e.target.value)
                          }
                          className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-y"
                        />
                      ) : (
                        <div className="flex gap-2">
                          <input
                            id={`field-${field.key}`}
                            type="text"
                            value={content[field.key] || ""}
                            onChange={(e) =>
                              handleContentChange(field.key, e.target.value)
                            }
                            className="flex-1 rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                          />
                          {/* Card image upload button */}
                          {(field.key.endsWith("_image_url") || field.key === "hero_background_url") && (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  const file = e.target.files?.[0] || null;
                                  setCardImageFiles((prev) => ({ ...prev, [field.key]: file }));
                                }}
                                className="text-sm text-foreground-muted file:mr-2 file:rounded-lg file:border-0 file:bg-secondary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
                              />
                              {cardImageFiles[field.key] && (
                                <button
                                  onClick={() => handleCardImageUpload(field.key)}
                                  disabled={uploadingCardImage === field.key}
                                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors whitespace-nowrap"
                                >
                                  {uploadingCardImage === field.key ? "Uploading…" : "Upload"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveContent}
              disabled={saving}
              className="w-full rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save All Content"}
            </button>
          </div>
        )}

        {/* Hero Background Tab */}
        {activeTab === "hero" && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-heading font-bold text-secondary">Hero Background Images</h2>
                  <p className="text-sm text-foreground-muted">Upload background images and set rotation degrees. These appear behind the hero headline.</p>
                </div>
              </div>

              <form onSubmit={handleAddHeroBackgroundImage} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewHeroBgFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-foreground-muted file:mr-2 file:rounded-lg file:border-0 file:bg-secondary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Rotation (deg)</label>
                  <input
                    type="number"
                    value={newHeroBgRotation}
                    onChange={(e) => setNewHeroBgRotation(e.target.value)}
                    className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploadingHeroBg || !newHeroBgFile}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary-light transition-colors disabled:opacity-50"
                >
                  {uploadingHeroBg ? "Uploading…" : "+ Add Image"}
                </button>
              </form>
            </div>

            <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
              <h3 className="text-lg font-heading font-bold text-secondary mb-4">Images ({heroBackgroundImages.length})</h3>

              {heroBgLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-secondary border-t-transparent rounded-full" />
                </div>
              ) : heroBackgroundImages.length === 0 ? (
                <p className="text-foreground-muted text-sm">No hero background images yet.</p>
              ) : (
                <div className="space-y-4">
                  {heroBackgroundImages
                    .slice()
                    .sort((a, b) => (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at))
                    .map((img, idx) => (
                      <div key={img.id} className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border border-border p-4">
                        <div className="relative w-full md:w-64 h-36 rounded-lg overflow-hidden border border-border bg-background-off">
                          <Image
                            src={img.image_url}
                            alt="Hero background"
                            fill
                            className="object-cover"
                            style={{ transform: `rotate(${img.rotation_deg}deg)` }}
                          />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1.5">Rotation (deg)</label>
                              <input
                                type="number"
                                defaultValue={img.rotation_deg}
                                onBlur={(e) => handleUpdateHeroBackgroundImage(img.id, { rotation_deg: Number(e.target.value) })}
                                className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1.5">Order</label>
                              <input
                                type="number"
                                defaultValue={img.sort_order}
                                onBlur={(e) => handleUpdateHeroBackgroundImage(img.id, { sort_order: Number(e.target.value) })}
                                className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const sorted = heroBackgroundImages.slice().sort((a, b) => (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at));
                                const current = sorted[idx];
                                const prev = sorted[idx - 1];
                                void handleUpdateHeroBackgroundImage(current.id, { sort_order: prev.sort_order });
                                void handleUpdateHeroBackgroundImage(prev.id, { sort_order: current.sort_order });
                              }}
                              className="rounded-lg bg-background-off px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Move Up
                            </button>
                            <button
                              type="button"
                              disabled={idx === heroBackgroundImages.length - 1}
                              onClick={() => {
                                const sorted = heroBackgroundImages.slice().sort((a, b) => (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at));
                                const current = sorted[idx];
                                const next = sorted[idx + 1];
                                void handleUpdateHeroBackgroundImage(current.id, { sort_order: next.sort_order });
                                void handleUpdateHeroBackgroundImage(next.id, { sort_order: current.sort_order });
                              }}
                              className="rounded-lg bg-background-off px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Move Down
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHeroBackgroundImage(img.id)}
                              className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-heading font-bold text-secondary">Contact Info</h2>
                  <p className="text-sm text-foreground-muted">Add and manage phone numbers, emails, and locations.</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value as ContactInfoEntry["type"])}
                  className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="location">Location</option>
                </select>
                {newContactType === "phone" ? (
                  <div className="w-full md:col-span-2 flex gap-2">
                    <select
                      value={newContactPhoneCode}
                      onChange={(e) => setNewContactPhoneCode(e.target.value)}
                      className="w-[110px] shrink-0 rounded-lg border border-border bg-primary px-2 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                    >
                      <option value="+62">+62 (ID)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+65">+65 (SG)</option>
                      <option value="+60">+60 (MY)</option>
                    </select>
                    <input
                      type="text"
                      value={newContactValue}
                      onChange={(e) => setNewContactValue(e.target.value)}
                      className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                      placeholder="812-..."
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newContactValue}
                    onChange={(e) => setNewContactValue(e.target.value)}
                    className="w-full md:col-span-2 rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                    placeholder={newContactType === "email" ? "info@..." : "Jl. ..."}
                  />
                )}
                <input
                  type="text"
                  value={newContactLabel}
                  onChange={(e) => setNewContactLabel(e.target.value)}
                  className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                  placeholder="Label (optional)"
                />
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddContactInfo}
                  disabled={contactLoading || !newContactValue.trim()}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary-light transition-colors disabled:opacity-50"
                >
                  + Contact info
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
              <h3 className="text-lg font-heading font-bold text-secondary mb-4">Entries ({contactInfo.length})</h3>

              {contactLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-secondary border-t-transparent rounded-full" />
                </div>
              ) : contactInfo.length === 0 ? (
                <p className="text-foreground-muted text-sm">No contact info yet.</p>
              ) : (
                <div className="space-y-3">
                  {contactInfo.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-border p-4 hover:bg-background-off transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          <span className="capitalize">{entry.type}</span>
                          {entry.label ? <span className="text-foreground-muted"> · {entry.label}</span> : null}
                        </div>
                        <div className="text-sm text-foreground-muted break-words">{entry.value}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteContactInfo(entry.id)}
                        className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-heading font-bold text-secondary">Our Services</h2>
                <p className="text-sm text-foreground-muted">Manage the dynamic cards shown on the home page (Max 3 col PC, 2 col mobile).</p>
              </div>
              <button
                onClick={() => setServices(prev => [...prev, { id: crypto.randomUUID(), title: "", description: "", image_url: "" }])}
                className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary-light transition-colors"
              >
                + Add Service Card
              </button>
            </div>

            <div className="space-y-6">
              {services.length === 0 ? (
                <div className="text-center py-10 bg-primary border border-border rounded-xl">
                  <p className="text-foreground-muted text-sm">No service cards exist yet. Add one above.</p>
                </div>
              ) : (
                services.map((svc, idx) => (
                  <div key={svc.id} className="rounded-2xl bg-primary border border-border p-6 shadow-card relative group">
                    {/* Top Right Controls */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        disabled={idx === 0}
                        onClick={() => {
                          const newArr = [...services];
                          const tmp = newArr[idx];
                          newArr[idx] = newArr[idx - 1];
                          newArr[idx - 1] = tmp;
                          setServices(newArr);
                        }}
                        className="rounded-lg bg-background-off p-2 text-foreground-muted hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        disabled={idx === services.length - 1}
                        onClick={() => {
                          const newArr = [...services];
                          const tmp = newArr[idx];
                          newArr[idx] = newArr[idx + 1];
                          newArr[idx + 1] = tmp;
                          setServices(newArr);
                        }}
                        className="rounded-lg bg-background-off p-2 text-foreground-muted hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this card?")) {
                            setServices(prev => prev.filter(s => s.id !== svc.id));
                          }
                        }}
                        className="rounded-lg bg-accent/10 p-2 text-accent hover:bg-accent/20 transition-colors"
                        title="Delete Service"
                      >
                        Delete
                      </button>
                    </div>

                    <h3 className="text-md font-heading font-bold text-secondary mb-4">Card {idx + 1}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                          <input
                            type="text"
                            value={svc.title}
                            onChange={(e) => setServices(prev => prev.map(s => s.id === svc.id ? { ...s, title: e.target.value } : s))}
                            className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                          <textarea
                            rows={3}
                            value={svc.description}
                            onChange={(e) => setServices(prev => prev.map(s => s.id === svc.id ? { ...s, description: e.target.value } : s))}
                            className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-y"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Image URL</label>
                          <input
                            type="text"
                            value={svc.image_url}
                            onChange={(e) => setServices(prev => prev.map(s => s.id === svc.id ? { ...s, image_url: e.target.value } : s))}
                            className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Upload New Image</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0] || null;
                                if (file) handleServiceCardImageUpload(svc.id, file);
                              }}
                              className="text-sm text-foreground-muted file:mr-2 file:rounded-lg file:border-0 file:bg-secondary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
                            />
                            {uploadingCardImage === svc.id && <span className="text-xs text-secondary animate-pulse">Uploading...</span>}
                          </div>
                        </div>
                        {svc.image_url && (
                          <div className="mt-2 text-xs">
                            <div className="relative h-24 w-40 overflow-hidden rounded-lg border border-border bg-background-off">
                              <Image src={svc.image_url} alt="Preview" fill className="object-cover" sizes="160px" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              // Saving dynamic tab utilizes the exact same save routine 
              // (the object gets injected in handleSaveContent)
              onClick={handleSaveContent}
              disabled={saving}
              className="w-full mt-8 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save All Content"}
            </button>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="space-y-8">
            {/* Add Gallery Item Form */}
            <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
              <h2 className="text-lg font-heading font-bold text-secondary mb-4">
                Add Gallery Item
              </h2>
              <form onSubmit={handleAddGalleryItem} className="space-y-4">
                <div>
                  <label
                    htmlFor="gallery-title"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Title
                  </label>
                  <input
                    id="gallery-title"
                    type="text"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                    placeholder="Enter a title for this gallery item"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gallery-image"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Image
                  </label>
                  <input
                    id="gallery-image"
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewGalleryImage(e.target.files?.[0] || null)
                    }
                    required
                    className="w-full text-sm text-foreground-muted file:mr-4 file:rounded-lg file:border-0 file:bg-secondary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadingGallery}
                  className="rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors"
                >
                  {uploadingGallery ? "Uploading…" : "Add Item"}
                </button>
              </form>
            </div>

            {/* Gallery Items List */}
            <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
              <h2 className="text-lg font-heading font-bold text-secondary mb-4">
                Gallery Items ({galleryItems.length})
              </h2>
              {galleryItems.length === 0 ? (
                <p className="text-foreground-muted text-sm">
                  No gallery items yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-background-off transition-colors"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-background-off">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground truncate">
                        {item.title}
                      </span>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logo Tab */}
        {activeTab === "logo" && (
          <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
            <h2 className="text-lg font-heading font-bold text-secondary mb-4">
              Company Logo
            </h2>

            {content.logo_url && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-foreground-muted">Current logo:</p>
                  <button
                    type="button"
                    onClick={handleLogoDelete}
                    className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    Delete Logo
                  </button>
                </div>
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-background-off">
                  <Image
                    src={content.logo_url}
                    alt="Current logo"
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleLogoUpload} className="space-y-4">
              <div>
                <label
                  htmlFor="logo-upload"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Upload New Logo
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLogoFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-sm text-foreground-muted file:mr-4 file:rounded-lg file:border-0 file:bg-secondary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary hover:file:bg-secondary/20"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingLogo || !logoFile}
                className="rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors"
              >
                {uploadingLogo ? "Uploading…" : "Upload Logo"}
              </button>
            </form>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-heading font-bold text-secondary">Theme Colors</h2>
                  <p className="text-sm text-foreground-muted">Change the site colors. Click “Save All Content” to apply.</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {([
                  { key: "theme_color_primary" as SiteContentKey, label: "Primary" },
                  { key: "theme_color_secondary" as SiteContentKey, label: "Secondary" },
                  { key: "theme_color_secondary_light" as SiteContentKey, label: "Secondary Light" },
                  { key: "theme_color_secondary_dark" as SiteContentKey, label: "Secondary Dark" },
                  { key: "theme_color_accent" as SiteContentKey, label: "Accent" },
                  { key: "theme_color_accent_light" as SiteContentKey, label: "Accent Light" },
                  { key: "theme_color_accent_dark" as SiteContentKey, label: "Accent Dark" },
                  { key: "theme_color_background" as SiteContentKey, label: "Background" },
                  { key: "theme_color_background_off" as SiteContentKey, label: "Background Off" },
                  { key: "theme_color_foreground" as SiteContentKey, label: "Foreground" },
                  { key: "theme_color_foreground_muted" as SiteContentKey, label: "Foreground Muted" },
                  { key: "theme_color_border" as SiteContentKey, label: "Border" },
                ] as const).map((item) => {
                  const current = content[item.key] || "";
                  const safeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(current) ? current : "#000000";

                  return (
                    <div key={item.key} className="rounded-xl border border-border p-4">
                      <label className="block text-sm font-medium text-foreground mb-2">{item.label}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={safeColor}
                          onChange={(e) => handleContentChange(item.key, e.target.value)}
                          className="h-10 w-12 rounded-md border border-border bg-primary"
                        />
                        <input
                          type="text"
                          value={current}
                          onChange={(e) => handleContentChange(item.key, e.target.value)}
                          placeholder="#000000"
                          className="flex-1 rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSaveContent}
                disabled={saving}
                className="mt-8 w-full rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save Theme Colors"}
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-heading font-bold text-secondary mb-2">Admin Settings</h2>
              <p className="text-sm text-foreground-muted">Manage your admin account and create new admin users.</p>
            </div>

            <AdminPasswordReset />
            <AdminUserManagement />
          </div>
        )}
      </div>
    </div>
  );
}
